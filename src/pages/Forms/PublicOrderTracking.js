import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";
import RefreshIcon from "@material-ui/icons/Refresh";
import api from "../../services/api";

const POLL_INTERVAL_MS = 20000;

// Etapas exibidas ao cliente (sem "cancelado", tratado à parte)
const DELIVERY_STAGES = [
  { id: "novo", label: "Pedido recebido" },
  { id: "confirmado", label: "Confirmado" },
  { id: "em_preparo", label: "Em preparo" },
  { id: "pronto", label: "Pronto" },
  { id: "saiu_entrega", label: "Saiu para entrega" },
  { id: "entregue", label: "Entregue" },
];

const PICKUP_STAGES = [
  { id: "novo", label: "Pedido recebido" },
  { id: "confirmado", label: "Confirmado" },
  { id: "em_preparo", label: "Em preparo" },
  { id: "pronto", label: "Pronto" },
  { id: "entregue", label: "Entregue" },
];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 480,
  },
  card: {
    padding: theme.spacing(2),
    borderRadius: 12,
    marginBottom: theme.spacing(2),
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    objectFit: "cover",
  },
  stageRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    position: "relative",
    paddingBottom: theme.spacing(2.5),
    "&:last-child": {
      paddingBottom: 0,
    },
  },
  stageLine: {
    position: "absolute",
    left: 11,
    top: 24,
    bottom: 0,
    width: 2,
    backgroundColor: "#e0e0e0",
  },
  itemRow: {
    marginBottom: theme.spacing(1),
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  },
}));

const formatMoney = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

const PublicOrderTracking = () => {
  const classes = useStyles();
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/public/orders/${token}`);
      setOrder(data);
      setError(false);
    } catch (err) {
      if (!order) setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) {
    return (
      <Box className={classes.root} alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box className={classes.root}>
        <Box className={classes.container}>
          <Paper className={classes.card} style={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Pedido não encontrado
            </Typography>
            <Typography variant="body2" color="textSecondary">
              O link de acompanhamento é inválido ou expirou.
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  }

  const brandPrimary = order.primaryColor || "#1a1a1a";
  const isDelivery = order.orderType === "delivery";
  const stages = isDelivery ? DELIVERY_STAGES : PICKUP_STAGES;
  const isCancelled = order.orderStatus === "cancelado";
  const currentIdx = stages.findIndex((s) => s.id === order.orderStatus);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        {/* Loja */}
        <Paper className={classes.card}>
          <Box display="flex" alignItems="center" style={{ gap: 12 }}>
            {order.logoUrl && (
              <img src={order.logoUrl} alt={order.storeName} className={classes.logo} />
            )}
            <Box flex={1}>
              <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                {order.storeName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Pedido {order.protocol}
                {order.tableNumber ? ` • Mesa ${order.tableNumber}` : ""}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={refreshing ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={() => {
                setRefreshing(true);
                fetchOrder();
              }}
              disabled={refreshing}
              style={{ textTransform: "none", color: brandPrimary }}
            >
              Atualizar
            </Button>
          </Box>
        </Paper>

        {/* Status */}
        <Paper className={classes.card}>
          <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 16 }}>
            Acompanhe seu pedido
          </Typography>
          {isCancelled ? (
            <Box textAlign="center" py={2}>
              <Typography variant="h6" style={{ color: "#c62828", fontWeight: 700 }}>
                Pedido cancelado
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Em caso de dúvidas, entre em contato com a loja.
              </Typography>
            </Box>
          ) : (
            stages.map((stage, idx) => {
              const done = idx < activeIdx;
              const current = idx === activeIdx;
              return (
                <Box key={stage.id} className={classes.stageRow}>
                  {idx < stages.length - 1 && (
                    <span
                      className={classes.stageLine}
                      style={done ? { backgroundColor: brandPrimary } : undefined}
                    />
                  )}
                  {done || current ? (
                    <CheckCircleIcon style={{ color: brandPrimary, fontSize: 24, zIndex: 1 }} />
                  ) : (
                    <RadioButtonUncheckedIcon style={{ color: "#bdbdbd", fontSize: 24, zIndex: 1 }} />
                  )}
                  <Box>
                    <Typography
                      variant="body2"
                      style={{
                        fontWeight: current ? 700 : 500,
                        color: done || current ? "#1a1a1a" : "#9e9e9e",
                      }}
                    >
                      {stage.label}
                    </Typography>
                    {current && isDelivery && order.averageDeliveryTime && (
                      <Typography variant="caption" color="textSecondary">
                        Tempo médio de entrega: {order.averageDeliveryTime}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Paper>

        {/* Itens */}
        {Array.isArray(order.items) && order.items.length > 0 && (
          <Paper className={classes.card}>
            <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 12 }}>
              Itens do pedido
            </Typography>
            {order.items.map((item, idx) => (
              <Box key={idx} className={classes.itemRow}>
                <Typography variant="body2">
                  {item.quantity}x {item.productName}
                </Typography>
                {Array.isArray(item.addons) && item.addons.length > 0 && (
                  <Typography variant="caption" color="textSecondary" display="block">
                    + {item.addons.map((a) => `${a.label} (${formatMoney(a.value)})`).join(", ")}
                  </Typography>
                )}
                {item.observation && (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                    style={{ fontStyle: "italic" }}
                  >
                    Obs: {item.observation}
                  </Typography>
                )}
              </Box>
            ))}
            <Divider style={{ margin: "12px 0" }} />
            {order.subtotal != null && (order.deliveryFee > 0 || order.couponDiscount > 0) && (
              <Box className={classes.summaryRow}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">{formatMoney(order.subtotal)}</Typography>
              </Box>
            )}
            {order.deliveryFee > 0 && (
              <Box className={classes.summaryRow}>
                <Typography variant="body2">Taxa de entrega</Typography>
                <Typography variant="body2">{formatMoney(order.deliveryFee)}</Typography>
              </Box>
            )}
            {order.couponDiscount > 0 && (
              <Box className={classes.summaryRow}>
                <Typography variant="body2" style={{ color: "#2e7d32" }}>
                  Cupom {order.couponCode ? `(${order.couponCode})` : ""}
                </Typography>
                <Typography variant="body2" style={{ color: "#2e7d32" }}>
                  - {formatMoney(order.couponDiscount)}
                </Typography>
              </Box>
            )}
            {order.total != null && (
              <Box className={classes.summaryRow}>
                <Typography variant="body1" style={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography variant="body1" style={{ fontWeight: 700, color: brandPrimary }}>
                  {formatMoney(order.total)}
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        <Typography
          variant="caption"
          color="textSecondary"
          style={{ display: "block", textAlign: "center" }}
        >
          Esta página atualiza automaticamente a cada 20 segundos.
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicOrderTracking;
