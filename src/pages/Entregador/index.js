import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import { toast } from "react-toastify";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import useAuth from "../../hooks/useAuth.js";
import EntregadorScanModal from "../../components/EntregadorScanModal";

const STORAGE_ORDERS_KEY = "entregador_scannedOrders";
const STORAGE_ROUTE_KEY = "entregador_routeStarted";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: 480,
    margin: "0 auto",
    paddingBottom: 24,
  },
  title: {
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  listCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  list: {
    maxHeight: 280,
    overflowY: "auto",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

/** Extrai token do conteúdo escaneado (URL com ?t= ou token puro). */
function extractDeliveryToken(decodedText) {
  const raw = (decodedText || "").trim();
  if (!raw) return null;
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const url = new URL(raw);
      return url.searchParams.get("t") || url.searchParams.get("token") || null;
    }
    return raw;
  } catch {
    return raw;
  }
}

/** Lê o estado persistido do localStorage com fallback seguro. */
function loadPersistedOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadPersistedRouteStarted() {
  return localStorage.getItem(STORAGE_ROUTE_KEY) === "true";
}

const Entregador = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useAuth();
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();

  // Inicializa a partir do localStorage para sobreviver a recarregamentos
  const [scannedOrders, setScannedOrders] = useState(loadPersistedOrders);
  const [routeStarted, setRouteStarted] = useState(loadPersistedRouteStarted);
  const [scanOpen, setScanOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [iniciarLoading, setIniciarLoading] = useState(false);
  const [finalizarLoading, setFinalizarLoading] = useState(false);

  // Conjunto de tokens já consultados na API nesta sessão — evita chamadas duplicadas
  // entre reaperturas do modal (complementa o seenTexts interno do modal)
  const scannedTokensRef = useRef(new Set(
    // Pre-popula com os tokens já persistidos para não re-escanear pedidos da sessão anterior
    loadPersistedOrders().map((o) => o._token).filter(Boolean)
  ));

  // Persiste pedidos no localStorage sempre que mudam
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(scannedOrders));
    } catch {}
  }, [scannedOrders]);

  // Persiste routeStarted no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ROUTE_KEY, String(routeStarted));
    } catch {}
  }, [routeStarted]);

  const handleScan = useCallback(async (decodedText) => {
    const token = extractDeliveryToken(decodedText);
    if (!token) {
      toast.error("QR Code inválido.");
      return;
    }

    // Ignora silenciosamente se este token já foi adicionado nesta sessão
    if (scannedTokensRef.current.has(token)) {
      return;
    }
    scannedTokensRef.current.add(token);

    setLoading(true);
    try {
      const { data } = await api.get("/delivery/order-by-token", {
        params: { t: token },
      });
      if (!data || !data.id) return;
      setScannedOrders((prev) => {
        if (prev.some((o) => o.id === data.id)) {
          toast.info("Pedido já está na lista.");
          return prev;
        }
        toast.success(`Pedido ${data.protocol || data.id} adicionado.`);
        // Guarda o token junto ao pedido para restauração entre sessões
        return [...prev, { ...data, _token: token }];
      });
    } catch (err) {
      // Remove o token do conjunto em caso de erro para permitir nova tentativa
      scannedTokensRef.current.delete(token);
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeOrder = (id) => {
    setScannedOrders((prev) => {
      const removed = prev.find((o) => o.id === id);
      if (removed?._token) scannedTokensRef.current.delete(removed._token);
      return prev.filter((o) => o.id !== id);
    });
  };

  const handleIniciarRota = async () => {
    if (scannedOrders.length === 0) return;
    setIniciarLoading(true);
    try {
      await api.post("/delivery/iniciar-rota", {
        formResponseIds: scannedOrders.map((o) => o.id),
      });
      toast.success("Rota iniciada! Os clientes foram notificados.");
      setRouteStarted(true);
    } catch (err) {
      toastError(err);
    } finally {
      setIniciarLoading(false);
    }
  };

  const handleFinalizarRota = async () => {
    if (scannedOrders.length === 0) return;
    setFinalizarLoading(true);
    try {
      await api.post("/delivery/finalizar-rota", {
        formResponseIds: scannedOrders.map((o) => o.id),
      });
      toast.success("Rota finalizada! Pedidos marcados como entregues.");
      // Limpa estado e localStorage ao finalizar com sucesso
      localStorage.removeItem(STORAGE_ORDERS_KEY);
      localStorage.removeItem(STORAGE_ROUTE_KEY);
      scannedTokensRef.current = new Set();
      setScannedOrders([]);
      setRouteStarted(false);
    } catch (err) {
      toastError(err);
    } finally {
      setFinalizarLoading(false);
    }
  };

  if (!hasLanchonetes && !modulesLoading) {
    history.push("/dashboard");
    return null;
  }

  return (
    <MainContainer>
      <Box className={classes.root}>
        <Typography variant="h5" className={classes.title}>
          <LocalShippingIcon /> Entregador
        </Typography>

        <Paper className={classes.listCard} elevation={0}>
          <Typography variant="subtitle1" gutterBottom>
            Pedidos na rota
          </Typography>
          {scannedOrders.length === 0 ? (
            <Typography color="textSecondary" variant="body2">
              Nenhum pedido. Clique em &quot;Escanear pedidos&quot; e leia os QR Codes impressos nos pedidos.
            </Typography>
          ) : (
            <List className={classes.list} dense>
              {scannedOrders.map((order) => (
                <ListItem
                  key={order.id}
                  secondaryAction={
                    !routeStarted && (
                      <IconButton edge="end" size="small" onClick={() => removeOrder(order.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={order.protocol || `#${order.id}`}
                    secondary={order.responderName || order.responderPhone}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Box className={classes.actions}>
            {!routeStarted && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setScanOpen(true)}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : "Escanear pedidos"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleIniciarRota}
                  disabled={scannedOrders.length === 0 || iniciarLoading}
                  fullWidth
                  className={classes.button}
                >
                  {iniciarLoading ? <CircularProgress size={24} /> : "Iniciar rota"}
                </Button>
              </>
            )}
            {routeStarted && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<StopIcon />}
                onClick={handleFinalizarRota}
                disabled={scannedOrders.length === 0 || finalizarLoading}
                fullWidth
                className={classes.button}
              >
                {finalizarLoading ? <CircularProgress size={24} /> : "Finalizar rota"}
              </Button>
            )}
          </Box>
        </Paper>
      </Box>

      <EntregadorScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={handleScan}
      />
    </MainContainer>
  );
};

export default Entregador;
