import React, { useState, useEffect, useContext, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Tabs,
  Tab,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ReceiptIcon from "@material-ui/icons/Receipt";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";
import KitchenIcon from "@material-ui/icons/Kitchen";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import LiberarMesaModal from "../../components/LiberarMesaModal";
import useCompanyModules from "../../hooks/useCompanyModules";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const SIDEBAR_WIDTH = 320;
const BOTTOM_BAR_HEIGHT = 72;
const TOP_BAR_HEIGHT = 52;

const useStyles = makeStyles((theme) => {
  const primaryMain = theme.palette.primary?.main || "#0EA5E9";
  const secondaryMain = theme.palette.secondary?.main || "#22C55E";
  return {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    background: theme.palette.type === "dark"
      ? `linear-gradient(160deg, ${theme.palette.background?.default || "#0f172a"} 0%, ${theme.palette.background?.paper || "#1e293b"} 50%, ${theme.palette.background?.default || "#0f172a"} 100%)`
      : `linear-gradient(160deg, ${primaryMain}08 0%, ${theme.palette.background?.paper || "#fff"} 40%, ${secondaryMain}12 100%)`,
  },
  topBar: {
    height: TOP_BAR_HEIGHT,
    minHeight: TOP_BAR_HEIGHT,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    background: theme.palette.barraSuperior || `linear-gradient(90deg, ${primaryMain} 0%, ${primaryMain}dd 100%)`,
    color: theme.palette.primary?.contrastText || "#fff",
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
  },
  topBarTitle: {
    fontWeight: 800,
    fontSize: "1.35rem",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    letterSpacing: "0.02em",
  },
  body: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "row",
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    overflow: "hidden",
  },
  tabs: {
    flexShrink: 0,
    minHeight: 48,
    marginBottom: theme.spacing(1.5),
    "& .MuiTab-root": { minHeight: 44, fontWeight: 600, textTransform: "none", fontSize: "0.95rem" },
    "& .Mui-selected": { color: theme.palette.primary.main },
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
    borderRadius: 12,
    padding: 4,
  },
  tabPanel: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  searchRow: {
    flexShrink: 0,
    marginBottom: theme.spacing(1.5),
    "& .MuiOutlinedInput-root": {
      backgroundColor: theme.palette.background.paper,
      borderRadius: 10,
    },
  },
  gridScroll: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
  },
  mesaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: theme.spacing(1.5),
    padding: theme.spacing(0, 0, 2, 0),
  },
  mesaCard: {
    cursor: "pointer",
    borderRadius: 14,
    padding: theme.spacing(1.5),
    border: "3px solid transparent",
    transition: "all 0.2s ease",
    boxShadow: theme.shadows[2],
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[6],
    },
  },
  mesaCardMesa: {
    backgroundColor: theme.palette.type === "dark" ? `${primaryMain}20` : `${primaryMain}12`,
    borderColor: `${primaryMain}60`,
    "&:hover": { borderColor: primaryMain },
  },
  mesaCardComanda: {
    backgroundColor: theme.palette.type === "dark" ? `${secondaryMain}20` : `${secondaryMain}12`,
    borderColor: `${secondaryMain}60`,
    "&:hover": { borderColor: secondaryMain },
  },
  mesaCardSelected: {
    boxShadow: `0 0 0 3px ${primaryMain}50`,
    transform: "scale(1.02)",
  },
  mesaCardIcon: {
    width: 40,
    height: 40,
    marginBottom: theme.spacing(1),
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mesaCardIconMesa: {
    backgroundColor: `${primaryMain}25`,
    color: primaryMain,
  },
  mesaCardIconComanda: {
    backgroundColor: `${secondaryMain}25`,
    color: secondaryMain,
  },
  mesaCardNumber: {
    fontWeight: 800,
    fontSize: "1.35rem",
    marginBottom: theme.spacing(0.5),
  },
  mesaCardMeta: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  typeBadge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 8,
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: theme.spacing(0.5),
    letterSpacing: "0.03em",
  },
  badgeMesa: {
    backgroundColor: `${primaryMain}20`,
    color: primaryMain,
  },
  badgeComanda: {
    backgroundColor: `${secondaryMain}20`,
    color: secondaryMain,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_WIDTH,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    borderLeft: `1px solid ${theme.palette.divider}`,
    background: theme.palette.type === "dark"
      ? "linear-gradient(180deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,0.98) 100%)"
      : "linear-gradient(180deg, #fff 0%, #f8fafc 100%)",
    boxShadow: "-4px 0 20px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: theme.spacing(2),
    borderBottom: `2px solid ${theme.palette.divider}`,
    flexShrink: 0,
    background: theme.palette.type === "dark" ? `${primaryMain}15` : `${primaryMain}0a`,
  },
  sidebarContent: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    padding: theme.spacing(2),
  },
  sidebarTotal: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 12,
    background: theme.palette.type === "dark" ? `${primaryMain}18` : `${primaryMain}12`,
    border: `2px solid ${primaryMain}`,
  },
  sidebarTotalValue: {
    fontWeight: 800,
    fontSize: "1.6rem",
    color: primaryMain,
  },
  bottomBar: {
    height: BOTTOM_BAR_HEIGHT,
    minHeight: BOTTOM_BAR_HEIGHT,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0, 2),
    background: theme.palette.type === "dark"
      ? "linear-gradient(90deg, #1e293b 0%, #334155 100%)"
      : "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)",
    borderTop: `2px solid ${theme.palette.divider}`,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
  },
  bottomBarQuick: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  bottomBarTotalizer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1, 2),
    borderRadius: 12,
    background: theme.palette.type === "dark" ? `${primaryMain}20` : `${primaryMain}15`,
    border: `2px solid ${primaryMain}`,
    minHeight: 48,
  },
  bottomBarTotalLabel: {
    fontWeight: 700,
    fontSize: "0.9rem",
    color: theme.palette.text.secondary,
  },
  bottomBarTotalValue: {
    fontWeight: 800,
    fontSize: "1.4rem",
    color: primaryMain,
  },
  quickBtn: {
    minWidth: 124,
    padding: theme.spacing(1.25, 2),
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 10,
    boxShadow: theme.shadows[1],
  },
  quickBtnPrimary: {
    background: primaryMain,
    color: theme.palette.primary?.contrastText || "#fff",
    "&:hover": { backgroundColor: primaryMain, opacity: 0.9 },
  },
  emptySidebar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  pendingTabRoot: {
    padding: theme.spacing(2),
    overflow: "auto",
    flex: 1,
    minHeight: 0,
  },
  pendingCard: {
    padding: theme.spacing(2),
    borderRadius: 14,
    marginBottom: theme.spacing(2),
    border: "2px solid",
    transition: "all 0.2s ease",
    cursor: "pointer",
    "&:hover": { transform: "translateY(-2px)", boxShadow: theme.shadows[4] },
  },
  pendingCardMesa: {
    borderColor: `${primaryMain}80`,
    background: theme.palette.type === "dark" ? `${primaryMain}18` : `${primaryMain}12`,
  },
  pendingCardDelivery: {
    borderColor: `${secondaryMain}80`,
    background: theme.palette.type === "dark" ? `${secondaryMain}18` : `${secondaryMain}12`,
  },
  pendingCount: {
    fontWeight: 800,
    fontSize: "2rem",
    lineHeight: 1.2,
  },
}; });

const Pdv = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();

  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNumber, setSearchNumber] = useState("");
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [liberarModalOpen, setLiberarModalOpen] = useState(false);
  const [novosMesaCount, setNovosMesaCount] = useState(0);
  const [novosDeliveryCount, setNovosDeliveryCount] = useState(0);
  const [mainTab, setMainTab] = useState(0);

  // Fullscreen ao abrir o PDV
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const fetchMesas = useCallback(() => {
    setLoading(true);
    api
      .get("/mesas", { params: { status: "ocupada" } })
      .then(({ data }) => setMesas(Array.isArray(data) ? data : []))
      .catch((err) => {
        toastError(err);
        setMesas([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
      return;
    }
    fetchMesas();
  }, [hasLanchonetes, modulesLoading, fetchMesas, history]);

  const fetchOrdersCounts = useCallback(() => {
    api.get("/orders/unconfirmed-counts")
      .then(({ data }) => {
        setNovosMesaCount(data.mesa ?? 0);
        setNovosDeliveryCount(data.delivery ?? 0);
      })
      .catch(() => {
        setNovosMesaCount(0);
        setNovosDeliveryCount(0);
      });
  }, []);

  useEffect(() => {
    fetchOrdersCounts();
    const companyId = user?.companyId;
    const socket = companyId ? socketManager?.getSocket?.(companyId) : null;
    if (!socket) return;
    const onFormResponse = () => {
      fetchMesas();
      fetchOrdersCounts();
    };
    socket.on(`company-${companyId}-formResponse`, onFormResponse);
    return () => socket.off(`company-${companyId}-formResponse`, onFormResponse);
  }, [user?.companyId, socketManager, fetchMesas, fetchOrdersCounts]);

  const handleBuscarPorNumero = (e) => {
    if (e?.key && e.key !== "Enter") return;
    const num = searchNumber?.trim();
    if (!num) return;
    setLoading(true);
    const tryType = (type) =>
      api.get("/mesas/by-identifier", { params: { number: num, type } });
    tryType("comanda")
      .then(({ data }) => {
        setSelectedMesa(data);
        setSearchNumber("");
      })
      .catch(() =>
        tryType("mesa")
          .then(({ data }) => {
            setSelectedMesa(data);
            setSearchNumber("");
          })
          .catch(() => toast.error("Mesa/comanda não encontrada ou não está ocupada."))
      )
      .finally(() => setLoading(false));
  };

  const handleSelectMesa = (mesa) => {
    setSelectedMesa((prev) => (prev?.id === mesa.id ? null : mesa));
  };

  useEffect(() => {
    if (!selectedMesa?.id) {
      setResumo(null);
      return;
    }
    setLoadingResumo(true);
    api
      .get(`/mesas/${selectedMesa.id}/resumo-conta`)
      .then(({ data }) => setResumo(data))
      .catch((err) => {
        toastError(err);
        setResumo({ pedidos: [], total: 0, mesa: selectedMesa, cliente: null });
      })
      .finally(() => setLoadingResumo(false));
  }, [selectedMesa?.id]);

  const handleVoltar = () => {
    setSelectedMesa(null);
    setResumo(null);
    fetchMesas();
  };

  const handleFechamentoSuccess = () => {
    setLiberarModalOpen(false);
    handleVoltar();
  };

  const tipoLabel = selectedMesa?.type === "comanda" ? "Comanda" : "Mesa";
  const numeroLabel = selectedMesa?.name || selectedMesa?.number || selectedMesa?.id;

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <div className={classes.root}>
      {/* Top bar mínima: título + sair */}
      <header className={classes.topBar}>
        <Typography className={classes.topBarTitle}>
          <ReceiptIcon style={{ fontSize: 28 }} />
          PDV
        </Typography>
        <Button
          size="small"
          startIcon={<ExitToAppIcon />}
          onClick={() => {
            if (document.fullscreenElement && document.exitFullscreen) {
              document.exitFullscreen().then(() => history.push("/dashboard")).catch(() => history.push("/dashboard"));
            } else {
              history.push("/dashboard");
            }
          }}
          className={classes.quickBtn}
          style={{ color: "#fff", borderColor: "rgba(255,255,255,0.7)" }}
          variant="outlined"
        >
          Voltar ao sistema
        </Button>
      </header>

      <div className={classes.body}>
        {/* Área central: busca + grid de mesas/comandas */}
        <main className={classes.main}>
          <Tabs
            value={mainTab}
            onChange={(_, v) => setMainTab(v)}
            className={classes.tabs}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label={
                <Badge badgeContent={mesas.length} color="primary" max={99}>
                  <span style={{ marginRight: 8 }}>Mesas e comandas</span>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={novosMesaCount + novosDeliveryCount} color="secondary" max={99}>
                  <span style={{ marginRight: 8 }}>Pedidos pendentes</span>
                </Badge>
              }
            />
          </Tabs>

          {mainTab === 0 && (
            <div className={classes.tabPanel}>
              <TextField
                className={classes.searchRow}
                fullWidth
                size="small"
                variant="outlined"
                label="Número da mesa ou comanda"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                onKeyDown={handleBuscarPorNumero}
                placeholder="Digite e pressione Enter"
                inputProps={{ style: { fontSize: "1rem" } }}
              />
              <div className={classes.gridScroll}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <div className={classes.mesaGrid}>
                    {mesas.length === 0 ? (
                      <Box gridColumn="1 / -1" textAlign="center" py={4}>
                        <Typography color="textSecondary">
                          Nenhuma mesa ou comanda ocupada.
                        </Typography>
                      </Box>
                    ) : (
                      mesas.map((mesa) => {
                        const isComanda = mesa.type === "comanda";
                        const selected = selectedMesa?.id === mesa.id;
                        return (
                          <Paper
                            key={mesa.id}
                            className={`${classes.mesaCard} ${
                              isComanda ? classes.mesaCardComanda : classes.mesaCardMesa
                            } ${selected ? classes.mesaCardSelected : ""}`}
                            onClick={() => handleSelectMesa(mesa)}
                            elevation={selected ? 2 : 1}
                          >
                            <div
                              className={`${classes.mesaCardIcon} ${
                                isComanda ? classes.mesaCardIconComanda : classes.mesaCardIconMesa
                              }`}
                            >
                              {isComanda ? (
                                <ReceiptIcon style={{ fontSize: 24 }} />
                              ) : (
                                <EventSeatIcon style={{ fontSize: 24 }} />
                              )}
                            </div>
                            <span
                              className={`${classes.typeBadge} ${
                                isComanda ? classes.badgeComanda : classes.badgeMesa
                              }`}
                            >
                              {isComanda ? "Comanda" : "Mesa"}
                            </span>
                            <Typography className={classes.mesaCardNumber}>
                              #{mesa.number}
                            </Typography>
                            {mesa.name && (
                              <Typography className={classes.mesaCardMeta} noWrap>
                                {mesa.name}
                              </Typography>
                            )}
                            {mesa.contact?.name && (
                              <Typography className={classes.mesaCardMeta} noWrap>
                                {mesa.contact.name}
                              </Typography>
                            )}
                          </Paper>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {mainTab === 1 && (
            <div className={`${classes.tabPanel} ${classes.pendingTabRoot}`}>
              <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 700 }}>
                Novos pedidos aguardando
              </Typography>
              <Paper
                className={`${classes.pendingCard} ${classes.pendingCardMesa}`}
                elevation={1}
                onClick={() => history.push("/pedidos")}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Box>
                    <Typography color="textSecondary" variant="body2">Pedidos mesa</Typography>
<Typography className={classes.pendingCount} color="primary">
                                      {novosMesaCount}
                                    </Typography>
                    <Typography variant="caption" color="textSecondary">novos</Typography>
                  </Box>
                  <Badge badgeContent={novosMesaCount} color="primary" max={99}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AssignmentIcon />}
                      onClick={(e) => { e.stopPropagation(); history.push("/pedidos"); }}
                      color="primary"
                    >
                      Ver pedidos
                    </Button>
                  </Badge>
                </Box>
              </Paper>
              <Paper
                className={`${classes.pendingCard} ${classes.pendingCardDelivery}`}
                elevation={1}
                onClick={() => history.push("/cozinha")}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Box>
                    <Typography color="textSecondary" variant="body2">Pedidos delivery</Typography>
<Typography className={classes.pendingCount} color="secondary">
                                      {novosDeliveryCount}
                                    </Typography>
                    <Typography variant="caption" color="textSecondary">novos</Typography>
                  </Box>
                  <Badge badgeContent={novosDeliveryCount} color="secondary" max={99}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<LocalShippingIcon />}
                      onClick={(e) => { e.stopPropagation(); history.push("/cozinha"); }}
                      color="secondary"
                    >
                      Ver cozinha
                    </Button>
                  </Badge>
                </Box>
              </Paper>
              {(novosMesaCount === 0 && novosDeliveryCount === 0) && (
                <Box textAlign="center" py={4}>
                  <Typography color="textSecondary">
                    Nenhum pedido pendente no momento.
                  </Typography>
                </Box>
              )}
            </div>
          )}
        </main>

        {/* Sidebar: totalizar pedidos e consumos */}
        <aside className={classes.sidebar}>
          <div className={classes.sidebarHeader}>
            <Typography variant="subtitle2" color="textSecondary">
              Conta selecionada
            </Typography>
            {selectedMesa && (
              <Typography variant="h6" style={{ marginTop: 4 }}>
                <span
                  className={`${classes.typeBadge} ${
                    selectedMesa.type === "comanda" ? classes.badgeComanda : classes.badgeMesa
                  }`}
                >
                  {tipoLabel}
                </span>{" "}
                #{numeroLabel}
              </Typography>
            )}
          </div>
          <div className={classes.sidebarContent}>
            {!selectedMesa ? (
              <div className={classes.emptySidebar}>
                <EventSeatIcon style={{ fontSize: 56, marginBottom: 12, opacity: 0.6 }} color="primary" />
                <Typography variant="body2">
                  Selecione uma mesa ou comanda para ver o resumo e totalizar.
                </Typography>
              </div>
            ) : loadingResumo ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : resumo ? (
              <>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Consumos
                </Typography>
                <List disablePadding dense>
                  {(resumo.pedidos || []).map((pedido) => {
                    const itens = pedido.menuItems || pedido.metadata?.menuItems || [];
                    const protocolo = pedido.protocol || pedido.protocolo || pedido.id;
                    const totalPedido = Number(pedido.total ?? 0);
                    return (
                      <React.Fragment key={pedido.id}>
                        <ListItem style={{ paddingLeft: 0, paddingRight: 0, alignItems: "flex-start", flexDirection: "column" }}>
                          <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" marginBottom={0.5}>
                            <Typography variant="body2" fontWeight={700}>
                              #{protocolo}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              R$ {totalPedido.toFixed(2)}
                            </Typography>
                          </Box>
                          {Array.isArray(itens) && itens.length > 0 ? (
                            <List disablePadding dense style={{ width: "100%", paddingLeft: 8 }}>
                              {itens.map((item, idx) => {
                                const nome = item.productName || item.name || item.title || "Item";
                                const qtd = Number(item.quantity) || 1;
                                const valor = Number(item.productValue) ?? 0;
                                const subtotal = (qtd * valor).toFixed(2);
                                return (
                                  <ListItem key={idx} disableGutters style={{ padding: 0, minHeight: 28 }}>
                                    <ListItemText
                                      primary={`${qtd}x ${nome}`}
                                      secondary={valor > 0 ? `R$ ${subtotal}` : null}
                                      primaryTypographyProps={{ variant: "caption" }}
                                      secondaryTypographyProps={{ variant: "caption" }}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              Itens do pedido
                            </Typography>
                          )}
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    );
                  })}
                </List>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Barra inferior: acessos rápidos + totalizador fixo */}
      <footer className={classes.bottomBar}>
        <div className={classes.bottomBarQuick}>
          <Badge badgeContent={mesas.length} color="primary" max={99}>
            <Button
              className={`${classes.quickBtn} ${classes.quickBtnPrimary}`}
              variant="contained"
              startIcon={<EventSeatIcon />}
              onClick={() => { fetchMesas(); fetchOrdersCounts(); }}
            >
              Mesas ativas
            </Button>
          </Badge>
          <Badge badgeContent={novosMesaCount} color="secondary" max={99}>
            <Button
              className={classes.quickBtn}
              variant="outlined"
              color="primary"
              startIcon={<AssignmentIcon />}
              onClick={() => history.push("/pedidos")}
            >
              Pedidos mesa
            </Button>
          </Badge>
          <Badge badgeContent={novosDeliveryCount} color="secondary" max={99}>
            <Button
              className={classes.quickBtn}
              variant="outlined"
              color="primary"
              startIcon={<LocalShippingIcon />}
              onClick={() => history.push("/cozinha")}
            >
              Delivery
            </Button>
          </Badge>
          <Button
            className={classes.quickBtn}
            variant="outlined"
            color="primary"
            startIcon={<KitchenIcon />}
            onClick={() => history.push("/cozinha")}
          >
            Cozinha
          </Button>
        </div>
        <div className={classes.bottomBarTotalizer}>
          {selectedMesa && resumo ? (
            <>
              <Typography className={classes.bottomBarTotalLabel}>Total</Typography>
              <Typography className={classes.bottomBarTotalValue}>
                R$ {Number(resumo.total ?? 0).toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<ReceiptIcon />}
                onClick={() => setLiberarModalOpen(true)}
                style={{ fontWeight: 700, padding: "8px 20px" }}
              >
                Fechamento
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Selecione uma conta
            </Typography>
          )}
        </div>
      </footer>

      <LiberarMesaModal
        open={liberarModalOpen}
        mesa={selectedMesa}
        onClose={() => setLiberarModalOpen(false)}
        onSuccess={handleFechamentoSuccess}
      />
    </div>
  );
};

export default Pdv;
