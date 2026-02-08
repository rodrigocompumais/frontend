import React, { useState, useEffect, useContext, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
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
  Badge,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import {
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  Description as DescriptionIcon,
  EventSeat as EventSeatIcon,
  Assignment as AssignmentIcon,
  Link as LinkIcon,
  LocalShipping as LocalShippingIcon,
  People as PeopleIcon,
} from "@material-ui/icons";
import { QrCode2 as QrCodeScannerIcon } from "@mui/icons-material";
import useSound from "use-sound";
import alertSound from "../../assets/sound.mp3";
import QRCode from "qrcode.react";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import useCompanyModules from "../../hooks/useCompanyModules";
import { i18n } from "../../translate/i18n";
import Products from "../Products";
import Mesas from "../Mesas";
import Pedidos from "../Pedidos";
import QuickScanModal from "../../components/QuickScanModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  tabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    overflowX: "auto",
    flexShrink: 0,
    "& .MuiTabs-flexContainer": {
      flexWrap: "nowrap",
    },
  },
  tabPanel: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
  },
  welcomeCard: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    background: theme.palette.type === "dark"
      ? "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.05) 100%)"
      : "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(251,191,36,0.03) 100%)",
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  statCard: {
    height: "100%",
  },
  quickLink: {
    textDecoration: "none",
    color: "inherit",
  },
}));

const LanchonetesHub = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();
  const params = new URLSearchParams(location.search);
  const tabFromUrl = parseInt(params.get("tab"), 10);
  const [tabValue, setTabValue] = useState(
    !isNaN(tabFromUrl) && tabFromUrl >= 0 && tabFromUrl <= 7 ? tabFromUrl : 0
  );
  const [cardapioForms, setCardapioForms] = useState([]);
  const [ordersStats, setOrdersStats] = useState({ pedidosHoje: 0, mesasOcupadas: 0 });
  const [unconfirmedCounts, setUnconfirmedCounts] = useState({ mesa: 0, delivery: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [quickScanOpen, setQuickScanOpen] = useState(false);
  const pendingOrderIdsRef = useRef(new Set());
  const soundIntervalRef = useRef(null);
  const [playOrderAlert] = useSound(alertSound, { volume: 0.6 });

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
    }
  }, [hasLanchonetes, modulesLoading, history]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const t = parseInt(p.get("tab"), 10);
    if (!isNaN(t) && t >= 0 && t <= 7) setTabValue(t);
  }, [location.search]);

  const handleTabChange = (_, v, formIdOverride) => {
    setTabValue(v);
    const formId = formIdOverride ?? params.get("formId");
    const newSearch = formId ? `?tab=${v}&formId=${formId}` : (v > 0 ? `?tab=${v}` : "");
    history.replace(`/lanchonetes${newSearch}`);
  };

  const fetchUnconfirmedCounts = React.useCallback(async () => {
    try {
      const { data } = await api.get("/orders/unconfirmed-counts");
      setUnconfirmedCounts({ mesa: data.mesa ?? 0, delivery: data.delivery ?? 0 });
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!hasLanchonetes) return;
    const fetchData = async () => {
      setLoadingStats(true);
      try {
        const [formsRes, ordersRes, mesasRes, countsRes] = await Promise.all([
          api.get("/forms?formType=cardapio"),
          api.get("/orders"),
          api.get("/mesas").catch(() => ({ data: [] })),
          api.get("/orders/unconfirmed-counts").catch(() => ({ data: { mesa: 0, delivery: 0 } })),
        ]);
        setCardapioForms(formsRes.data.forms || []);
        const orders = ordersRes.data.orders || [];
        const today = new Date().toDateString();
        const pedidosHoje = orders.filter(
          (o) => new Date(o.submittedAt).toDateString() === today
        ).length;
        const mesas = Array.isArray(mesasRes.data) ? mesasRes.data : [];
        const mesasOcupadas = mesas.filter((m) => m.status === "ocupada").length;
        setOrdersStats({ pedidosHoje, mesasOcupadas });
        setUnconfirmedCounts({ mesa: countsRes.data?.mesa ?? 0, delivery: countsRes.data?.delivery ?? 0 });
      } catch (err) {
        toastError(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, [hasLanchonetes]);

  useEffect(() => {
    const companyId = user?.companyId;
    const socket = companyId ? socketManager?.getSocket?.(companyId) : null;
    if (!socket) return;
    const refreshStats = async () => {
      try {
        const [ordersRes, mesasRes] = await Promise.all([
          api.get("/orders"),
          api.get("/mesas").catch(() => ({ data: [] })),
        ]);
        const orders = ordersRes.data?.orders || [];
        const today = new Date().toDateString();
        const pedidosHoje = orders.filter(
          (o) => new Date(o.submittedAt).toDateString() === today
        ).length;
        const mesas = Array.isArray(mesasRes.data) ? mesasRes.data : [];
        const mesasOcupadas = mesas.filter((m) => m.status === "ocupada").length;
        setOrdersStats((prev) => ({ ...prev, pedidosHoje, mesasOcupadas }));
      } catch (_) {}
    };
    socket.on(`company-${companyId}-mesa`, refreshStats);
    return () => socket.off(`company-${companyId}-mesa`, refreshStats);
  }, [socketManager, user?.companyId]);

  // Notificações de pedidos: badges + som persistente até confirmado
  useEffect(() => {
    const companyId = user?.companyId;
    const socket = companyId ? socketManager?.getSocket?.(companyId) : null;
    if (!socket) return;

    const stopSoundLoop = () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
    };

    const startSoundLoop = () => {
      if (soundIntervalRef.current) return;
      playOrderAlert();
      soundIntervalRef.current = setInterval(() => {
        if (pendingOrderIdsRef.current.size === 0) {
          stopSoundLoop();
          return;
        }
        playOrderAlert();
      }, 30000);
    };

    const onFormResponse = (payload) => {
      const { action, response } = payload || {};
      if (!response || !response.id) return;
      const status = response.orderStatus || response.metadata?.orderStatus || "novo";
      const orderType = response.metadata?.orderType === "delivery" ? "delivery" : "mesa";

      if (action === "create" && status === "novo") {
        pendingOrderIdsRef.current.add(response.id);
        setUnconfirmedCounts((prev) => ({
          ...prev,
          [orderType]: prev[orderType] + 1,
        }));
        startSoundLoop();
      } else if (action === "update") {
        // Badge atualiza quando o pedido sai de "novo" (confirmado, preparando, saiu_entrega, entregue, etc.)
        if (status !== "novo" && status != null) {
          pendingOrderIdsRef.current.delete(response.id);
          setUnconfirmedCounts((prev) => ({
            ...prev,
            [orderType]: Math.max(0, prev[orderType] - 1),
          }));
          if (pendingOrderIdsRef.current.size === 0) stopSoundLoop();
        }
      }
      fetchUnconfirmedCounts();
    };

    socket.on(`company-${companyId}-formResponse`, onFormResponse);
    return () => {
      socket.off(`company-${companyId}-formResponse`, onFormResponse);
      stopSoundLoop();
    };
  }, [socketManager, user?.companyId, fetchUnconfirmedCounts, playOrderAlert]);

  const handleCopyLink = (link) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <MainContainer>
      <Box className={classes.root}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ marginBottom: 16 }}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>
            {i18n.t("lanchonetes.hubName")}
          </Typography>
          <Tooltip title="Escanear QR Code (garçom, cozinha, etc.)">
            <IconButton
              color="primary"
              onClick={() => setQuickScanOpen(true)}
              aria-label="Ação rápida - escanear QR"
            >
              <QrCodeScannerIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          className={classes.tabs}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Início" icon={<RestaurantIcon />} />
          <Tab label="Produtos" icon={<ShoppingCartIcon />} />
          <Tab label="Cardápio" icon={<DescriptionIcon />} />
          <Tab label="Mesas" icon={<EventSeatIcon />} />
          <Tab
            label={
              <Badge badgeContent={unconfirmedCounts.mesa} color="error">
                <span style={{ marginRight: unconfirmedCounts.mesa ? 8 : 0 }}>Pedidos (Mesa)</span>
              </Badge>
            }
            icon={<EventSeatIcon />}
          />
          <Tab
            label={
              <Badge badgeContent={unconfirmedCounts.delivery} color="error">
                <span style={{ marginRight: unconfirmedCounts.delivery ? 8 : 0 }}>Delivery</span>
              </Badge>
            }
            icon={<LocalShippingIcon />}
          />
          <Tab label="Garçons" icon={<PeopleIcon />} />
          <Tab label="Entregador" icon={<LocalShippingIcon />} />
        </Tabs>

        <Box className={classes.tabPanel}>
          {tabValue === 0 && (
            <>
              <Paper className={classes.welcomeCard}>
                <Typography variant="h6" gutterBottom>
                  {i18n.t("lanchonetes.hubWelcome")}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {i18n.t("lanchonetes.hubWelcomeSubtitle")}
                </Typography>
              </Paper>

              {loadingStats ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      className={classes.statCard}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTabChange(null, 4)}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Pedidos mesa
                        </Typography>
                        <Typography variant="h4">{ordersStats.pedidosHoje}</Typography>
                        <Button size="small" color="primary" style={{ marginTop: 8 }}>
                          Ver pedidos mesa
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      className={classes.statCard}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTabChange(null, 3)}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Mesas ocupadas
                        </Typography>
                        <Typography variant="h4">{ordersStats.mesasOcupadas}</Typography>
                        <Button size="small" color="primary" style={{ marginTop: 8 }}>
                          Ver mesas
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      className={classes.statCard}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTabChange(null, 1)}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Produtos
                        </Typography>
                        <Typography variant="body2">
                          Cadastre itens do cardápio
                        </Typography>
                        <Button size="small" color="primary" style={{ marginTop: 8 }}>
                          Gerenciar
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      className={classes.statCard}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTabChange(null, 5)}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Delivery
                        </Typography>
                        <Typography variant="body2">
                          Pedidos para entrega
                        </Typography>
                        <Button size="small" color="primary" style={{ marginTop: 8 }}>
                          Ver pedidos
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      className={classes.statCard}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTabChange(null, 6)}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Garçons
                        </Typography>
                        <Typography variant="body2">
                          Tela de pedidos para garçons
                        </Typography>
                        <Button size="small" color="primary" style={{ marginTop: 8 }}>
                          Ver QR Code
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      className={classes.statCard}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleTabChange(null, 2)}
                    >
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Cardápio
                        </Typography>
                        <Typography variant="body2">
                          Link para clientes pedirem
                        </Typography>
                        <Button size="small" color="primary" style={{ marginTop: 8 }}>
                          Ver links
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {cardapioForms.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Links do cardápio
                  </Typography>
                  {cardapioForms.map((form) => {
                    const link = `${window.location.origin}/f/${form.slug}`;
                    return (
                      <Paper
                        key={form.id}
                        style={{
                          padding: 16,
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2">{form.name}</Typography>
                          <Typography variant="caption" color="textSecondary" noWrap style={{ maxWidth: 280, display: "block" }}>
                            {link}
                          </Typography>
                        </Box>
                        <Box>
                          <Button
                            size="small"
                            startIcon={<LinkIcon />}
                            onClick={() => handleCopyLink(link)}
                          >
                            Copiar link
                          </Button>
                          <Button
                            size="small"
                            onClick={() => history.push(`/forms/${form.id}`)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleTabChange(null, 4, form.id)}
                          >
                            Mesa
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleTabChange(null, 5, form.id)}
                          >
                            Delivery
                          </Button>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </>
          )}

          {tabValue === 1 && <Products />}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {i18n.t("lanchonetes.cardapiosSection")}
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                {i18n.t("lanchonetes.cardapiosDescription")}
              </Typography>
              {cardapioForms.length === 0 ? (
                <Paper style={{ padding: 32, textAlign: "center" }}>
                  <Typography color="textSecondary">
                    {i18n.t("lanchonetes.cardapiosEmpty")}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: 16 }}
                    onClick={() => history.push("/forms/new")}
                  >
                    {i18n.t("lanchonetes.createCardapio")}
                  </Button>
                </Paper>
              ) : (
                cardapioForms.map((form) => {
                  const link = `${window.location.origin}/f/${form.slug}`;
                  return (
                    <Paper
                      key={form.id}
                      style={{
                        padding: 20,
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                          {form.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {link}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LinkIcon />}
                          onClick={() => handleCopyLink(link)}
                        >
                          Copiar link
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => history.push(`/forms/${form.id}`)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleTabChange(null, 4, form.id)}
                        >
                          Mesa
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleTabChange(null, 5, form.id)}
                        >
                          Delivery
                        </Button>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          )}
          {tabValue === 3 && (
            <Mesas
              cardapioSlugFromHub={
                params.get("formId")
                  ? (cardapioForms.find((f) => String(f.id) === params.get("formId"))?.slug)
                  : cardapioForms[0]?.slug
              }
            />
          )}
          {tabValue === 4 && <Pedidos orderTypeFilter="mesa" />}
          {tabValue === 5 && <Pedidos orderTypeFilter="delivery" />}
          {tabValue === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Área do garçom
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 24 }}>
                Os garçons podem escanear o QR Code abaixo para abrir a tela simplificada de pedidos no celular.
              </Typography>
              <Paper style={{ padding: 24, maxWidth: 400 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <QRCode
                    value={`${window.location.origin}/garcom`}
                    size={220}
                    level="M"
                    includeMargin
                  />
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: 16, textAlign: "center" }}>
                    Escaneie para abrir a tela de pedidos
                  </Typography>
                  <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, wordBreak: "break-all" }}>
                    {window.location.origin}/garcom
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: 16 }}
                    onClick={() => history.push("/garcom")}
                  >
                    Abrir tela do garçom
                  </Button>
                </Box>
              </Paper>
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  O que o garçom pode fazer:
                </Typography>
                <ul style={{ paddingLeft: 20, color: "var(--color-text-secondary, #666)" }}>
                  <li>Selecionar a mesa</li>
                  <li>Se a mesa estiver livre: criar ou escolher o cliente e ocupar a mesa</li>
                  <li>Se a mesa estiver ocupada: adicionar itens direto à conta</li>
                  <li>Montar o pedido e enviar para a cozinha</li>
                </ul>
              </Box>
            </Box>
          )}
          {tabValue === 7 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Área do entregador
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 24 }}>
                O entregador pode escanear o QR Code abaixo para abrir a tela de coleta no celular, escanear os QRs dos pedidos e iniciar/finalizar a rota.
              </Typography>
              <Paper style={{ padding: 24, maxWidth: 400 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <QRCode
                    value={`${window.location.origin}/entregador`}
                    size={220}
                    level="M"
                    includeMargin
                  />
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: 16, textAlign: "center" }}>
                    Escaneie para abrir a tela do entregador
                  </Typography>
                  <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, wordBreak: "break-all" }}>
                    {window.location.origin}/entregador
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: 16 }}
                    onClick={() => history.push("/entregador")}
                  >
                    Abrir tela do entregador
                  </Button>
                </Box>
              </Paper>
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Fluxo do entregador:
                </Typography>
                <ul style={{ paddingLeft: 20, color: "var(--color-text-secondary, #666)" }}>
                  <li>Escanear os QR Codes impressos nos pedidos delivery para adicionar à rota</li>
                  <li>Clicar em &quot;Iniciar rota&quot; (atualiza status e notifica clientes)</li>
                  <li>Após as entregas, clicar em &quot;Finalizar rota&quot; (marca como entregue e envia avaliação)</li>
                </ul>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <QuickScanModal open={quickScanOpen} onClose={() => setQuickScanOpen(false)} />
    </MainContainer>
  );
};

export default LanchonetesHub;
