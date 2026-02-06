import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  makeStyles,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import useCompanyModules from "../../hooks/useCompanyModules";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import SearchIcon from "@material-ui/icons/Search";
import HistoryIcon from "@material-ui/icons/History";
import VisibilityIcon from "@material-ui/icons/Visibility";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";

import { format, startOfDay, subDays, startOfWeek, startOfMonth, endOfDay } from "date-fns";

const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
  statusChip: {
    fontWeight: 600,
  },
  filtersRow: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    marginBottom: theme.spacing(2),
    alignItems: "flex-end",
  },
  filterField: {
    minWidth: 180,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    color: "white",
    "&:hover": {
      backgroundColor: "#20BA5A",
    },
  },
}));

const DEFAULT_ORDER_STATUS_LABELS = {
  novo: "Novo",
  confirmado: "Confirmado",
  em_preparo: "Em preparo",
  pronto: "Pronto",
  saiu_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const PERIOD_OPTIONS = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "custom", label: "Personalizado" },
];

const getDateRange = (period) => {
  const now = new Date();
  switch (period) {
    case "today":
      return {
        dateFrom: startOfDay(now).toISOString(),
        dateTo: endOfDay(now).toISOString(),
      };
    case "week":
      return {
        dateFrom: startOfWeek(now, { weekStartsOn: 0 }).toISOString(),
        dateTo: endOfDay(now).toISOString(),
      };
    case "month":
      return {
        dateFrom: startOfMonth(now).toISOString(),
        dateTo: endOfDay(now).toISOString(),
      };
    default:
      return { dateFrom: null, dateTo: null };
  }
};

const getOrderStatusLabels = (form) => {
  const stages = form?.settings?.orderStages;
  if (stages?.length > 0) {
    return stages.reduce((acc, s) => ({ ...acc, [s.id]: s.label }), {});
  }
  return DEFAULT_ORDER_STATUS_LABELS;
};

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

const getOrderStatus = (order) => {
  return order?.orderStatus || order?.metadata?.orderStatus || null;
};

const formatItemsSummary = (order) => {
  const items = order?.metadata?.menuItems || [];
  if (items.length === 0) return "-";
  const parts = items.slice(0, 3).map((i) => `${i.quantity}x ${i.productName || "Item"}`);
  return items.length > 3 ? `${parts.join(", ")} +${items.length - 3}` : parts.join(", ");
};

const OrderHistory = () => {
  const classes = useStyles();
  const { formId } = useParams();
  const history = useHistory();
  const { hasLanchonetes } = useCompanyModules();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [searchCliente, setSearchCliente] = useState("");

  useEffect(() => {
    loadForm();
  }, [formId]);

  useEffect(() => {
    loadOrders();
  }, [formId, period, customFrom, customTo, orderStatusFilter, searchCliente]);

  const loadForm = async () => {
    try {
      const { data } = await api.get(`/forms/${formId}`);
      setForm(data);
    } catch (err) {
      toastError(err);
      history.push("/forms");
    }
  };

  const loadOrders = async () => {
    if (!formId) return;
    setLoading(true);
    try {
      let dateFrom, dateTo;
      if (period === "custom" && customFrom && customTo) {
        dateFrom = new Date(customFrom).toISOString();
        dateTo = new Date(customTo).toISOString();
      } else {
        const range = getDateRange(period);
        dateFrom = range.dateFrom;
        dateTo = range.dateTo;
      }

      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (orderStatusFilter) params.orderStatus = orderStatusFilter;
      if (searchCliente.trim()) params.search = searchCliente.trim();

      const { data } = await api.get(`/forms/${formId}/orders`, { params });
      setOrders(data.orders || []);
    } catch (err) {
      toastError(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (order) => {
    if (!order?.responderPhone) return;
    const num = order.responderPhone.replace(/\D/g, "");
    window.open(`https://wa.me/55${num}`, "_blank");
  };

  if (!hasLanchonetes) {
    history.push("/dashboard");
    return null;
  }

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => history.push(`/forms/${formId}/responses`)}>
            <ArrowBackIcon />
          </IconButton>
          <Title>
            {form?.name || "Formulário"} - Histórico de Pedidos
          </Title>
        </Box>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            onClick={() => history.push(`/forms/${formId}/fila-pedidos`)}
            style={{ marginRight: 8 }}
          >
            Fila
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => history.push(`/forms/${formId}/responses`)}
            style={{ marginRight: 8 }}
          >
            Ver Respostas
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push(`/pedidos?formId=${formId}`)}
          >
            Ver Kanban
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper style={{ padding: 16 }}>
        <Box className={classes.filtersRow}>
          <FormControl variant="outlined" size="small" className={classes.filterField}>
            <InputLabel>Período</InputLabel>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              label="Período"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {period === "custom" && (
            <>
              <TextField
                type="date"
                label="De"
                size="small"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className={classes.filterField}
              />
              <TextField
                type="date"
                label="Até"
                size="small"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className={classes.filterField}
              />
            </>
          )}
          <FormControl variant="outlined" size="small" className={classes.filterField}>
            <InputLabel>Status</InputLabel>
            <Select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(getOrderStatusLabels(form)).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar cliente..."
            value={searchCliente}
            onChange={(e) => setSearchCliente(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            className={classes.filterField}
          />
        </Box>

        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Protocolo</TableCell>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Itens</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <>
                <TableRowSkeleton columns={7} />
                <TableRowSkeleton columns={7} />
                <TableRowSkeleton columns={7} />
              </>
            )}
            {!loading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Nenhum pedido encontrado no período
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" style={{ fontWeight: 600, fontFamily: "monospace" }}>
                      {order.protocol || `#${order.id}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(order.submittedAt), "dd/MM/yyyy HH:mm")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                      {order.responderName || "Sem nome"}
                    </Typography>
                    {order.responderPhone && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        {order.responderPhone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {formatItemsSummary(order)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      R$ {getOrderTotal(order).toFixed(2).replace(".", ",")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {getOrderStatus(order) ? (
                      <Chip
                        label={getOrderStatusLabels(form)[getOrderStatus(order)] || getOrderStatus(order)}
                        size="small"
                        className={classes.statusChip}
                        color={getOrderStatus(order) === "entregue" || getOrderStatus(order) === "cancelado" ? "default" : "primary"}
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() => history.push(`/forms/${formId}/responses`)}
                        title="Ver detalhes"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {order.responderPhone && (
                        <IconButton
                          size="small"
                          className={classes.whatsappButton}
                          onClick={() => handleWhatsApp(order)}
                          title="WhatsApp"
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default OrderHistory;
