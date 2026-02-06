import React, { useState, useEffect, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton,
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Check as CheckIcon,
  Queue as QueueIcon,
} from "@material-ui/icons";
import { format, differenceInMinutes } from "date-fns";
import { toast } from "react-toastify";

import MainContainer from "../MainContainer";
import MainHeader from "../MainHeader";
import Title from "../Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";

const QUEUE_STATUSES = ["novo", "confirmado", "em_preparo"];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.fancyBackground,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  queueList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    maxHeight: "calc(100vh - 220px)",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  queueCard: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
  },
  positionBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1rem",
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const getOrderTotal = (order) => {
  const metadata = order?.metadata || {};
  if (metadata.total != null) return Number(metadata.total);
  const items = metadata.menuItems || [];
  return items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const val = Number(item.productValue) || 0;
    return sum + qty * val;
  }, 0);
};

const getOrderStatus = (order) => order?.orderStatus || order?.metadata?.orderStatus || "novo";

const formatItemsSummary = (order) => {
  const items = order?.metadata?.menuItems || [];
  if (items.length === 0) return "-";
  return items.slice(0, 3).map((i) => `${i.quantity}x ${i.productName || "Item"}`).join(", ") +
    (items.length > 3 ? ` +${items.length - 3}` : "");
};

const OrderQueue = () => {
  const classes = useStyles();
  const { formId } = useParams();
  const history = useHistory();
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchData = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const [formRes, ordersRes] = await Promise.all([
        api.get(`/forms/${formId}`),
        api.get(`/forms/${formId}/orders`),
      ]);
      setForm(formRes.data);
      const allOrders = ordersRes.data.orders || [];
      const queueOrders = allOrders
        .filter((o) => QUEUE_STATUSES.includes(getOrderStatus(o)))
        .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      setOrders(queueOrders);
    } catch (err) {
      toastError(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
      return;
    }
    fetchData();
  }, [hasLanchonetes, modulesLoading, history, fetchData]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/forms/${formId}/responses/${orderId}/order-status`, {
        orderStatus: newStatus,
      });
      toast.success("Status atualizado!");
      fetchData();
    } catch (err) {
      toastError(err);
    }
  };

  const handleIniciar = (order) => {
    handleUpdateStatus(order.id, "em_preparo");
  };

  const handleConcluir = (order) => {
    handleUpdateStatus(order.id, "pronto");
  };

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => history.push(`/pedidos?formId=${formId}`)}>
            <ArrowBackIcon />
          </IconButton>
          <Title>{form?.name || "Pedidos"} - Fila</Title>
        </Box>
        <Box className={classes.headerActions}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Atualizar
          </Button>
          <Button
            variant="outlined"
            onClick={() => history.push(`/pedidos?formId=${formId}`)}
          >
            Kanban
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push(`/forms/${formId}/historico-pedidos`)}
          >
            Histórico
          </Button>
        </Box>
      </MainHeader>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper className={classes.emptyState}>
          <QueueIcon style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }} />
          <Typography variant="h6">Fila vazia</Typography>
          <Typography variant="body2" color="textSecondary">
            Nenhum pedido pendente ou em preparo no momento
          </Typography>
        </Paper>
      ) : (
        <Box className={classes.queueList}>
          {orders.map((order, index) => {
            const status = getOrderStatus(order);
            const waitMins = differenceInMinutes(new Date(), new Date(order.submittedAt));

            return (
              <Paper key={order.id} className={classes.queueCard} elevation={0}>
                <Box display="flex" alignItems="center" gap={2} flex={1} minWidth={0}>
                  <div className={classes.positionBadge}>{index + 1}</div>
                  <Box flex={1} minWidth={0}>
                    <Box>
                      <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                        {order.responderName || "Sem nome"}
                      </Typography>
                      {(order.protocol || order.id) && (
                        <Typography variant="caption" color="textSecondary" style={{ fontFamily: "monospace" }}>
                          {order.protocol || `#${order.id}`}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {formatItemsSummary(order)} • R$ {getOrderTotal(order).toFixed(2).replace(".", ",")}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(order.submittedAt), "dd/MM HH:mm")} • ~{waitMins} min na fila
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  {(status === "novo" || status === "confirmado") && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleIniciar(order)}
                    >
                      Iniciar
                    </Button>
                  )}
                  {status === "em_preparo" && (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleConcluir(order)}
                    >
                      Concluir
                    </Button>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </MainContainer>
  );
};

export default OrderQueue;
