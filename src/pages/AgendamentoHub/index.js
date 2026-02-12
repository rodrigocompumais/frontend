import React, { useState, useEffect, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@material-ui/core";
import {
  Event as EventIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarTodayIcon,
  Dashboard as DashboardIcon,
  Link as LinkIcon,
} from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import { i18n } from "../../translate/i18n";
import AgendamentoServicos from "./AgendamentoServicos";
import AgendamentoAgenda from "./AgendamentoAgenda";
import AgendamentoDashboard from "./AgendamentoDashboard";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#0d0d0d",
    color: "#e8e8e8",
    padding: theme.spacing(2),
    borderRadius: 8,
  },
  tabs: {
    borderBottom: "1px solid #333",
    marginBottom: theme.spacing(2),
    overflowX: "auto",
    flexShrink: 0,
    "& .MuiTab-root": { color: "#b0b0b0" },
    "& .Mui-selected": { color: "#fff" },
    "& .MuiTabs-indicator": { backgroundColor: "#fff" },
  },
  tabPanel: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
  },
  welcomeCard: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 100%)",
    borderLeft: "4px solid #22c55e",
    color: "#e8e8e8",
  },
  statCard: {
    height: "100%",
    backgroundColor: "#1a1a1a",
    color: "#e8e8e8",
    border: "1px solid #333",
    "& .MuiTypography-colorTextSecondary": { color: "#9e9e9e" },
  },
}));

const AgendamentoHub = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { hasAgendamento, loading: modulesLoading } = useCompanyModules();
  const params = new URLSearchParams(location.search);
  const tabFromUrl = parseInt(params.get("tab"), 10);
  const [tabValue, setTabValue] = useState(
    !isNaN(tabFromUrl) && tabFromUrl >= 0 && tabFromUrl <= 4 ? tabFromUrl : 0
  );
  const [agendamentoForms, setAgendamentoForms] = useState([]);
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    agendamentosSemana: 0,
    pendentesConfirmacao: 0,
    concluidosHoje: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!hasAgendamento && !modulesLoading) {
      history.push("/dashboard");
    }
  }, [hasAgendamento, modulesLoading, history]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const t = parseInt(p.get("tab"), 10);
    if (!isNaN(t) && t >= 0 && t <= 4) setTabValue(t);
  }, [location.search]);

  const handleTabChange = (_, v) => {
    setTabValue(v);
    const newSearch = v > 0 ? `?tab=${v}` : "";
    history.replace(`/agendamento${newSearch}`);
  };

  useEffect(() => {
    if (!hasAgendamento) return;
    const fetchData = async () => {
      setLoadingStats(true);
      try {
        const [formsRes, statsRes] = await Promise.all([
          api.get("/forms?formType=agendamento").catch(() => ({ data: { forms: [] } })),
          api.get("/dashboard/agendamento-stats").catch(() => ({ data: {} })),
        ]);
        setAgendamentoForms(formsRes.data.forms || []);
        setStats(statsRes.data || stats);
      } catch (err) {
        toastError(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, [hasAgendamento]);

  const handleCopyLink = (link) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  if (!hasAgendamento && !modulesLoading) return null;

  return (
    <MainContainer>
      <Box className={classes.root}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ marginBottom: 16 }}>
          <Typography variant="h5" style={{ fontWeight: 600, color: "#fff" }}>
            {i18n.t("agendamento.hubName")}
          </Typography>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          className={classes.tabs}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Início" icon={<EventIcon />} />
          <Tab label={i18n.t("agendamento.servicos")} icon={<BuildIcon />} />
          <Tab label={i18n.t("agendamento.formularioAgendamento")} icon={<DescriptionIcon />} />
          <Tab label={i18n.t("agendamento.agenda")} icon={<CalendarTodayIcon />} />
          <Tab label="Dashboard" icon={<DashboardIcon />} />
        </Tabs>

        <Box className={classes.tabPanel}>
          {tabValue === 0 && (
            <>
              <Paper className={classes.welcomeCard}>
                <Typography variant="h6" gutterBottom>
                  {i18n.t("agendamento.hubWelcome")}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("agendamento.hubWelcomeSubtitle")}
                </Typography>
              </Paper>

              <Typography variant="h6" style={{ marginBottom: 16, marginTop: 8 }}>
                Acesso rápido
              </Typography>
              <Grid container spacing={2} style={{ marginBottom: 24 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.statCard} style={{ cursor: "pointer" }} onClick={() => handleTabChange(null, 3)}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {i18n.t("agendamento.agendamentosHoje")}
                      </Typography>
                      <Typography variant="h4">{loadingStats ? "—" : stats.agendamentosHoje}</Typography>
                      <Button size="small" color="primary" style={{ marginTop: 8 }}>
                        Ver agenda
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.statCard} style={{ cursor: "pointer" }} onClick={() => handleTabChange(null, 3)}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {i18n.t("agendamento.pendentesConfirmacao")}
                      </Typography>
                      <Typography variant="h4">{loadingStats ? "—" : stats.pendentesConfirmacao}</Typography>
                      <Button size="small" color="primary" style={{ marginTop: 8 }}>
                        Ver agenda
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.statCard} style={{ cursor: "pointer" }} onClick={() => handleTabChange(null, 1)}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {i18n.t("agendamento.servicos")}
                      </Typography>
                      <Typography variant="body2">Cadastre serviços e profissionais</Typography>
                      <Button size="small" color="primary" style={{ marginTop: 8 }}>
                        Gerenciar
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.statCard} style={{ cursor: "pointer" }} onClick={() => handleTabChange(null, 4)}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Dashboard
                      </Typography>
                      <Typography variant="body2">Resumo e estatísticas</Typography>
                      <Button size="small" color="primary" style={{ marginTop: 8 }}>
                        Ver
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {agendamentoForms.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Links do formulário de agendamento
                  </Typography>
                  {agendamentoForms.map((form) => {
                    const link = `${window.location.origin}/f/${form.slug}`;
                    return (
                      <Paper
                        key={form.id}
                        style={{ padding: 16, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}
                      >
                        <Box>
                          <Typography variant="subtitle2">{form.name}</Typography>
                          <Typography variant="caption" color="textSecondary" noWrap style={{ maxWidth: 280, display: "block" }}>
                            {link}
                          </Typography>
                        </Box>
                        <Box>
                          <Button size="small" startIcon={<LinkIcon />} onClick={() => handleCopyLink(link)}>
                            Copiar link
                          </Button>
                          <Button size="small" onClick={() => history.push(`/forms/${form.id}`)}>
                            Editar
                          </Button>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </>
          )}

          {tabValue === 1 && <AgendamentoServicos />}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {i18n.t("agendamento.formularioAgendamento")}
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                Formulários do tipo Agendamento para os clientes escolherem serviço, profissional e horário.
              </Typography>
              {agendamentoForms.length === 0 ? (
                <Paper style={{ padding: 32, textAlign: "center" }}>
                  <Typography color="textSecondary">Nenhum formulário de agendamento. Crie um e defina o tipo como &quot;Agendamento&quot;.</Typography>
                  <Button variant="contained" color="primary" style={{ marginTop: 16 }} onClick={() => history.push("/forms/new")}>
                    Criar formulário
                  </Button>
                </Paper>
              ) : (
                agendamentoForms.map((form) => {
                  const link = `${window.location.origin}/f/${form.slug}`;
                  return (
                    <Paper key={form.id} style={{ padding: 20, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <Box>
                        <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                          {form.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {link}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button size="small" variant="outlined" startIcon={<LinkIcon />} onClick={() => handleCopyLink(link)}>
                          Copiar link
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => history.push(`/forms/${form.id}`)}>
                          Editar
                        </Button>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          )}
          {tabValue === 3 && <AgendamentoAgenda />}
          {tabValue === 4 && <AgendamentoDashboard />}
        </Box>
      </Box>
    </MainContainer>
  );
};

export default AgendamentoHub;
