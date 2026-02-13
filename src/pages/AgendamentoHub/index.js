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
  FileCopy as FileCopyIcon,
  Edit as EditIcon,
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
    width: "100%",
    maxWidth: "100%",
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    padding: theme.spacing(3),
    borderRadius: 8,
    overflowX: "hidden",
    boxSizing: "border-box",
  },
  tabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
    flexShrink: 0,
    "& .MuiTab-root": { 
      color: theme.palette.text.secondary,
      minHeight: 64,
      textTransform: "none",
      fontSize: "0.95rem",
      fontWeight: 500,
    },
    "& .Mui-selected": { 
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
    "& .MuiTabs-indicator": { 
      backgroundColor: theme.palette.primary.main,
      height: 3,
    },
  },
  tabPanel: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    overflowX: "hidden",
    padding: theme.spacing(2, 0),
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  welcomeCard: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.light}08 100%)`,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[2],
  },
  welcomeTitle: {
    fontWeight: 700,
    fontSize: "1.5rem",
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  welcomeSubtitle: {
    color: theme.palette.text.secondary,
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: "1.25rem",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    color: theme.palette.text.primary,
  },
  statCard: {
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[1],
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: theme.shadows[4],
      transform: "translateY(-2px)",
    },
    "& .MuiTypography-colorTextSecondary": { 
      color: theme.palette.text.secondary,
      fontSize: "0.875rem",
      fontWeight: 500,
      marginBottom: theme.spacing(1),
    },
  },
  statValue: {
    fontWeight: 700,
    fontSize: "2rem",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  statButton: {
    marginTop: theme.spacing(1),
    textTransform: "none",
    fontWeight: 500,
  },
  formLinkCard: {
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[1],
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    transition: "all 0.2s ease",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    "&:hover": {
      boxShadow: theme.shadows[3],
    },
  },
  formLinkTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  formLinkUrl: {
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  linkButtons: {
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    maxWidth: "100%",
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
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ marginBottom: 24 }}>
          <Typography variant="h4" style={{ fontWeight: 700 }}>
            {i18n.t("agendamento.hubName")}
          </Typography>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          className={classes.tabs}
          variant="fullWidth"
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
              <Paper className={classes.welcomeCard} elevation={0}>
                <Typography className={classes.welcomeTitle}>
                  {i18n.t("agendamento.hubWelcome")}
                </Typography>
                <Typography className={classes.welcomeSubtitle}>
                  {i18n.t("agendamento.hubWelcomeSubtitle")}
                </Typography>
              </Paper>

              <Typography className={classes.sectionTitle}>
                Acesso rápido
              </Typography>
              <Grid container spacing={3} style={{ marginBottom: 32 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    className={classes.statCard} 
                    style={{ cursor: "pointer" }} 
                    onClick={() => handleTabChange(null, 3)}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {i18n.t("agendamento.agendamentosHoje")}
                      </Typography>
                      <Typography className={classes.statValue}>
                        {loadingStats ? "—" : stats.agendamentosHoje}
                      </Typography>
                      <Button 
                        size="small" 
                        color="primary" 
                        className={classes.statButton}
                        variant="text"
                      >
                        Ver agenda
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    className={classes.statCard} 
                    style={{ cursor: "pointer" }} 
                    onClick={() => handleTabChange(null, 3)}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {i18n.t("agendamento.pendentesConfirmacao")}
                      </Typography>
                      <Typography className={classes.statValue}>
                        {loadingStats ? "—" : stats.pendentesConfirmacao}
                      </Typography>
                      <Button 
                        size="small" 
                        color="primary" 
                        className={classes.statButton}
                        variant="text"
                      >
                        Ver agenda
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    className={classes.statCard} 
                    style={{ cursor: "pointer" }} 
                    onClick={() => handleTabChange(null, 1)}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {i18n.t("agendamento.servicos")}
                      </Typography>
                      <Typography variant="body2" style={{ marginBottom: 8, color: "#666" }}>
                        Cadastre serviços e profissionais
                      </Typography>
                      <Button 
                        size="small" 
                        color="primary" 
                        className={classes.statButton}
                        variant="text"
                      >
                        Gerenciar
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    className={classes.statCard} 
                    style={{ cursor: "pointer" }} 
                    onClick={() => handleTabChange(null, 4)}
                    elevation={0}
                  >
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Dashboard
                      </Typography>
                      <Typography variant="body2" style={{ marginBottom: 8, color: "#666" }}>
                        Resumo e estatísticas
                      </Typography>
                      <Button 
                        size="small" 
                        color="primary" 
                        className={classes.statButton}
                        variant="text"
                      >
                        Ver
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {agendamentoForms.length > 0 && (
                <Box>
                  <Typography className={classes.sectionTitle}>
                    Links do formulário de agendamento
                  </Typography>
                  {agendamentoForms.map((form) => {
                    const link = `${window.location.origin}/f/${form.slug}`;
                    return (
                      <Paper
                        key={form.id}
                        className={classes.formLinkCard}
                        elevation={0}
                      >
                        <Box style={{ flex: 1, minWidth: 200 }}>
                          <Typography className={classes.formLinkTitle}>
                            {form.name}
                          </Typography>
                          <Typography className={classes.formLinkUrl}>
                            {link}
                          </Typography>
                        </Box>
                        <Box className={classes.linkButtons}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            startIcon={<FileCopyIcon />} 
                            onClick={() => handleCopyLink(link)}
                          >
                            COPIAR LINK
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => history.push(`/forms/${form.id}`)}
                          >
                            EDITAR
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
