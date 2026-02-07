import React, { useState, useEffect, useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Button,
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Restaurant as RestaurantIcon,
  Queue as QueueIcon,
} from "@material-ui/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import PedidoKanbanCard from "../../components/PedidoKanbanCard";

const DEFAULT_ORDER_STAGES = [
  { id: "novo", label: "Novo", color: "#6366F1" },
  { id: "confirmado", label: "Confirmado", color: "#3B82F6" },
  { id: "em_preparo", label: "Em preparo", color: "#F59E0B" },
  { id: "pronto", label: "Pronto", color: "#22C55E" },
  { id: "saiu_entrega", label: "Saiu para entrega", color: "#8B5CF6" },
  { id: "entregue", label: "Entregue", color: "#10B981" },
  { id: "cancelado", label: "Cancelado", color: "#6B7280" },
];

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxHeight: "calc(100vh - 64px)",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.fancyBackground,
    overflow: "hidden",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  formSelect: {
    minWidth: 250,
  },
  boardContainer: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    overflow: "hidden",
    minHeight: 0,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    minHeight: 280,
    maxHeight: "calc(50vh - 80px)",
    borderRadius: 16,
    background: theme.palette.type === "dark"
      ? "rgba(30, 41, 59, 0.6)"
      : "rgba(241, 245, 249, 0.8)",
    border: `1px solid ${theme.palette.divider}`,
    overflow: "hidden",
  },
  columnHeader: {
    flexShrink: 0,
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  cardsContainer: {
    flex: 1,
    minHeight: 0,
    padding: theme.spacing(1.5),
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
  },
  cardsContainerDraggingOver: {
    background: theme.palette.type === "dark"
      ? "rgba(14, 165, 233, 0.1)"
      : "rgba(14, 165, 233, 0.05)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
  selectFormPaper: {
    padding: theme.spacing(4),
    textAlign: "center",
    maxWidth: 400,
    margin: "auto",
  },
}));

const Pedidos = ({ orderTypeFilter }) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();

  const params = new URLSearchParams(location.search);
  const [formIdFilter, setFormIdFilter] = useState(params.get("formId") || "");
  const [forms, setForms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (formIdFilter) queryParams.set("formId", formIdFilter);
      if (orderTypeFilter) queryParams.set("orderType", orderTypeFilter);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const { data } = await api.get(`/orders${query}`);
      let ordersList = data.orders || [];
      let formsList = data.forms || [];

      if (formsList.length === 0) {
        const { data: formsData } = await api.get("/forms?formType=cardapio");
        const cardapioForms = formsData.forms || [];
        if (cardapioForms.length > 0) {
          formsList = cardapioForms.map((f) => ({ id: f.id, name: f.name }));
          const filterId = formIdFilter ? Number(formIdFilter) : null;
          const idsToFetch = filterId && cardapioForms.some((f) => f.id === filterId)
            ? [filterId]
            : cardapioForms.map((f) => f.id);
          const orderTypeSuffix = orderTypeFilter ? `?orderType=${orderTypeFilter}` : "";
          const results = await Promise.all(
            idsToFetch.map((id) => api.get(`/forms/${id}/orders${orderTypeSuffix}`))
          );
          ordersList = results.flatMap((r) => r.data.orders || []);
          ordersList.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
          ordersList = ordersList.map((o) => ({
            ...o,
            form: o.form || (o.formId ? { id: o.formId, name: formsList.find((f) => f.id === o.formId)?.name } : null),
          }));
        }
      }

      setOrders(ordersList);
      setForms(formsList);
    } catch (err) {
      toastError(err);
      setOrders([]);
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [formIdFilter, orderTypeFilter]);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
      return;
    }
    fetchOrders();
  }, [hasLanchonetes, modulesLoading, fetchOrders]);

  useEffect(() => {
    const fid = params.get("formId") || "";
    if (fid !== formIdFilter) setFormIdFilter(fid);
  }, [location.search]);

  useEffect(() => {
    const prev = new URLSearchParams(location.search);
    if (formIdFilter) prev.set("formId", formIdFilter);
    else prev.delete("formId");
    const search = prev.toString() ? `?${prev.toString()}` : "";
    if (search !== location.search) history.replace({ search });
  }, [formIdFilter, history, location.search]);

  const getOrderStatus = (order) => {
    return order?.orderStatus || order?.metadata?.orderStatus || "novo";
  };

  const orderStages = DEFAULT_ORDER_STAGES;

  const columnsWithOrders = orderStages.map((stage) => ({
    ...stage,
    orders: orders.filter((o) => getOrderStatus(o) === stage.id),
  }));

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const orderId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const orderFormId = order.formId || order.form?.id;
    if (!orderFormId) {
      toast.error("Formulário do pedido não identificado.");
      return;
    }

    try {
      await api.put(`/forms/${orderFormId}/responses/${orderId}/order-status`, {
        orderStatus: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success("Status atualizado!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleViewDetails = (order) => {
    const orderFormId = order.formId || order.form?.id;
    if (orderFormId) {
      history.push(`/forms/${orderFormId}/responses`);
    }
  };

  const handleWhatsApp = (order) => {
    if (order?.responderPhone) {
      const num = order.responderPhone.replace(/\D/g, "");
      window.open(`https://wa.me/55${num}`, "_blank");
    }
  };

  if (!hasLanchonetes && !modulesLoading) return null;

  if (modulesLoading) {
    return (
      <MainContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  const activeFormId = formIdFilter || (forms[0]?.id ? String(forms[0].id) : null);

  if (forms.length === 0 && !loading) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>Pedidos</Title>
        </MainHeader>
        <Paper className={classes.selectFormPaper}>
          <Typography>Nenhum formulário de cardápio encontrado.</Typography>
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: 16 }}
            onClick={() => history.push("/forms")}
          >
            Ir para Formulários
          </Button>
        </Paper>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => history.push("/forms")}>
            <ArrowBackIcon />
          </IconButton>
          <Title>Pedidos - Kanban</Title>
        </Box>
        <Box className={classes.headerActions}>
          <FormControl variant="outlined" size="small" className={classes.formSelect}>
            <Select
              value={formIdFilter || ""}
              onChange={(e) => setFormIdFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Todos os cardápios</MenuItem>
              {forms.map((f) => (
                <MenuItem key={f.id} value={String(f.id)}>
                  {f.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
          >
            Atualizar
          </Button>
          {activeFormId && (
            <>
              <Button
                variant="outlined"
                startIcon={<QueueIcon />}
                onClick={() => history.push(`/forms/${activeFormId}/fila-pedidos`)}
              >
                Fila
              </Button>
              <Button
                variant="outlined"
                onClick={() => history.push(`/forms/${activeFormId}/responses`)}
              >
                Ver Respostas
              </Button>
            </>
          )}
        </Box>
      </MainHeader>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box className={classes.boardContainer}>
            {columnsWithOrders.map((column) => (
              <Paper key={column.id} elevation={0} className={classes.column}>
                <Box
                  className={classes.columnHeader}
                  style={{ backgroundColor: column.color }}
                >
                  {column.label} ({column.orders.length})
                </Box>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${classes.cardsContainer} ${
                        snapshot.isDraggingOver ? classes.cardsContainerDraggingOver : ""
                      }`}
                    >
                      {column.orders.map((order, index) => (
                        <Draggable
                          key={order.id}
                          draggableId={String(order.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <PedidoKanbanCard
                              order={order}
                              onViewDetails={handleViewDetails}
                              onWhatsApp={handleWhatsApp}
                              isDragging={snapshot.isDragging}
                              provided={provided}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            ))}
          </Box>
        </DragDropContext>
      )}
    </MainContainer>
  );
};

export default Pedidos;
