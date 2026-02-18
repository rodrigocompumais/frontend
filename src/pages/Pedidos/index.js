import React, { useState, useEffect, useCallback, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  LinearProgress,
  IconButton,
  InputAdornment,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Restaurant as RestaurantIcon,
  Queue as QueueIcon,
} from "@material-ui/icons";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import { i18n } from "../../translate/i18n";
import PedidoKanbanCard from "../../components/PedidoKanbanCard";

// Pedidos mesa: Novo, Confirmado, Em preparo, Pronto, Entregue, Cancelado
const MESA_ORDER_STAGES = [
  { id: "novo", label: "Novo", color: "#6366F1" },
  { id: "confirmado", label: "Confirmado", color: "#3B82F6" },
  { id: "em_preparo", label: "Em preparo", color: "#F59E0B" },
  { id: "pronto", label: "Pronto", color: "#22C55E" },
  { id: "entregue", label: "Entregue", color: "#10B981" },
  { id: "cancelado", label: "Cancelado", color: "#6B7280" },
];
// Delivery: inclui "Saiu para entrega" entre Pronto e Entregue
const DELIVERY_ORDER_STAGES = [
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
  rootMinimal: {
    maxHeight: "none",
    height: "100%",
    padding: 0,
  },
  boardContainerMinimal: {
    marginTop: 0,
    flex: 1,
    minHeight: 0,
    alignSelf: "stretch",
    // Tablet-friendly: scroll horizontal suave e colunas “snap”
    display: "flex",
    gap: theme.spacing(2),
    padding: theme.spacing(1.5),
    overflowX: "auto",
    overflowY: "hidden",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
    overscrollBehaviorX: "contain",
  },
  columnMinimal: {
    minHeight: 0,
    maxHeight: "100%",
    height: "100%",
    flex: "0 0 84vw",
    maxWidth: 460,
    scrollSnapAlign: "start",
    [theme.breakpoints.up("sm")]: {
      flexBasis: 360,
    },
    [theme.breakpoints.up("md")]: {
      flexBasis: 420,
    },
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
    [theme.breakpoints.up("sm")]: {
      fontSize: "1.05rem",
      padding: theme.spacing(2),
    },
  },
  cardsContainer: {
    flex: 1,
    minHeight: 0,
    padding: theme.spacing(1.5),
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(2),
    },
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

const Pedidos = ({ orderTypeFilter, minimal = false }) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();

  const params = new URLSearchParams(location.search);
  const [formIdFilter, setFormIdFilter] = useState(params.get("formId") || "");
  const [tableIdFilter, setTableIdFilter] = useState(params.get("tableId") || "");
  const [forms, setForms] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pendingStatusByOrderId, setPendingStatusByOrderId] = useState({});

  const fetchOrders = useCallback(async (opts = {}) => {
    const silent = !!opts.silent;
    if (!silent) setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (formIdFilter) queryParams.set("formId", formIdFilter);
      if (orderTypeFilter) queryParams.set("orderType", orderTypeFilter);
      if (tableIdFilter) queryParams.set("tableId", tableIdFilter);
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
          const suffixParams = new URLSearchParams();
          if (orderTypeFilter) suffixParams.set("orderType", orderTypeFilter);
          if (tableIdFilter) suffixParams.set("tableId", tableIdFilter);
          const suffix = suffixParams.toString() ? `?${suffixParams.toString()}` : "";
          const results = await Promise.all(
            idsToFetch.map((id) => api.get(`/forms/${id}/orders${suffix}`))
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
      try {
        const { data: mesasData } = await api.get("/mesas");
        setMesas(Array.isArray(mesasData) ? mesasData : []);
      } catch {
        setMesas([]);
      }
    } catch (err) {
      toastError(err);
      setOrders([]);
      setForms([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [formIdFilter, orderTypeFilter, tableIdFilter]);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
      return;
    }
    fetchOrders();
  }, [hasLanchonetes, modulesLoading, fetchOrders]);

  // Atualizar lista em tempo real quando chegar novo pedido ou atualização (mesa/delivery)
  useEffect(() => {
    const companyId = user?.companyId;
    const socket = companyId ? socketManager?.getSocket?.(companyId) : null;
    if (!socket) return;

    const onFormResponse = (payload) => {
      const { action, response } = payload || {};
      if (!response) return;
      const orderType = response.metadata?.orderType === "delivery" ? "delivery" : "mesa";
      if (orderTypeFilter && orderType !== orderTypeFilter) return;
      if (action === "create" || action === "update" || action === "delete") {
        fetchOrders({ silent: true });
      }
    };

    socket.on(`company-${companyId}-formResponse`, onFormResponse);
    return () => socket.off(`company-${companyId}-formResponse`, onFormResponse);
  }, [user?.companyId, socketManager, orderTypeFilter, fetchOrders]);

  useEffect(() => {
    const fid = params.get("formId") || "";
    if (fid !== formIdFilter) setFormIdFilter(fid);
    const tid = params.get("tableId") || "";
    if (tid !== tableIdFilter) setTableIdFilter(tid);
  }, [location.search]);

  useEffect(() => {
    const prev = new URLSearchParams(location.search);
    if (formIdFilter) prev.set("formId", formIdFilter);
    else prev.delete("formId");
    if (tableIdFilter) prev.set("tableId", tableIdFilter);
    else prev.delete("tableId");
    const search = prev.toString() ? `?${prev.toString()}` : "";
    if (search !== location.search) history.replace({ search });
  }, [formIdFilter, tableIdFilter, history, location.search]);

  const getOrderStatus = (order) => {
    return order?.orderStatus || order?.metadata?.orderStatus || "novo";
  };

  const orderStages = orderTypeFilter === "mesa" ? MESA_ORDER_STAGES : DELIVERY_ORDER_STAGES;

  const getStagesForOrder = (order) => {
    return order?.metadata?.orderType === "delivery" ? DELIVERY_ORDER_STAGES : MESA_ORDER_STAGES;
  };

  const getNextStage = (order) => {
    const stages = getStagesForOrder(order);
    const current = getOrderStatus(order);
    const idx = stages.findIndex((s) => s.id === current);
    if (idx < 0 || idx >= stages.length - 1) return null;
    const next = stages[idx + 1];
    return next.id === "cancelado" ? null : next;
  };

  const getPrevStage = (order) => {
    const stages = getStagesForOrder(order);
    const current = getOrderStatus(order);
    const idx = stages.findIndex((s) => s.id === current);
    if (idx <= 0) return null;
    const prev = stages[idx - 1];
    return prev.id === "cancelado" ? null : prev;
  };

  const handleOpenOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleProximaEtapa = async () => {
    if (!selectedOrder) return;
    const next = getNextStage(selectedOrder);
    if (!next) return;
    const orderFormId = selectedOrder.formId || selectedOrder.form?.id;
    if (!orderFormId) {
      toast.error("Formulário do pedido não identificado.");
      return;
    }
    setUpdatingStatus(true);
    try {
      await api.put(`/forms/${orderFormId}/responses/${selectedOrder.id}/order-status`, {
        orderStatus: next.id,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, orderStatus: next.id, metadata: { ...(o.metadata || {}), orderStatus: next.id } }
            : o
        )
      );
      toast.success(`Pedido avançado para "${next.label}"`);
      handleCloseOrderModal();
    } catch (err) {
      toastError(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Pedidos cancelados somem da lista (mesa e delivery)
  const ordersToShow = orders.filter((o) => getOrderStatus(o) !== "cancelado");

  const columnsWithOrders = orderStages.map((stage) => ({
    ...stage,
    orders: ordersToShow.filter((o) => getOrderStatus(o) === stage.id),
  }));

  const commitOrderStatusChange = ({
    order,
    orderId,
    orderFormId,
    newStatus,
    oldStatus,
    setOptimisticOrders,
    toastSuccess = false,
  }) => {
    if (!orderId || !orderFormId) return;
    if (pendingStatusByOrderId[orderId]) return;
    if (!newStatus || newStatus === oldStatus) return;

    setPendingStatusByOrderId((prev) => ({ ...prev, [orderId]: true }));

    // Update otimista (UI primeiro)
    setOrders(setOptimisticOrders);

    api
      .put(`/forms/${orderFormId}/responses/${orderId}/order-status`, { orderStatus: newStatus })
      .then(() => {
        if (toastSuccess) toast.success("Status atualizado!");
      })
      .catch((err) => {
        toastError(err);
        // Reverter e sincronizar em background para evitar inconsistência
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, orderStatus: oldStatus, metadata: { ...(o.metadata || {}), orderStatus: oldStatus } }
              : o
          )
        );
        fetchOrders({ silent: true });
      })
      .finally(() => {
        setPendingStatusByOrderId((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      });
  };

  const applyOptimisticDndMove = (prevOrders, orderId, sourceStatus, destStatus, destIndex) => {
    const stageIds = orderStages.map((s) => s.id);
    const cancelled = prevOrders.filter((o) => getOrderStatus(o) === "cancelado");
    const active = prevOrders.filter((o) => getOrderStatus(o) !== "cancelado");

    // Construir listas por status respeitando a ordem atual (para bater com índices do DnD)
    const byStatus = {};
    stageIds.forEach((id) => { byStatus[id] = []; });
    active.forEach((o) => {
      const s = getOrderStatus(o);
      if (!byStatus[s]) byStatus[s] = [];
      byStatus[s].push(o);
    });

    const srcList = [...(byStatus[sourceStatus] || [])];
    const dstList = sourceStatus === destStatus ? srcList : [...(byStatus[destStatus] || [])];

    // Remover item (preferir por id para evitar mismatch de índice)
    const removeIdx = srcList.findIndex((o) => o.id === orderId);
    const [removed] = removeIdx >= 0 ? srcList.splice(removeIdx, 1) : [null];
    if (!removed) return prevOrders;

    const moved = {
      ...removed,
      orderStatus: destStatus,
      metadata: { ...(removed.metadata || {}), orderStatus: destStatus },
    };

    const insertAt = Math.max(0, Math.min(destIndex, dstList.length));
    dstList.splice(insertAt, 0, moved);

    byStatus[sourceStatus] = srcList;
    byStatus[destStatus] = dstList;

    // Rebuild mantendo a ordem por colunas
    const rebuilt = [];
    stageIds.forEach((id) => {
      (byStatus[id] || []).forEach((o) => rebuilt.push(o));
    });
    // Qualquer status fora do pipeline atual (fallback)
    Object.keys(byStatus).forEach((id) => {
      if (!stageIds.includes(id)) {
        byStatus[id].forEach((o) => rebuilt.push(o));
      }
    });

    return [...rebuilt, ...cancelled];
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const orderId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    if (pendingStatusByOrderId[orderId]) return;
    const orderFormId = order.formId || order.form?.id;
    if (!orderFormId) {
      toast.error("Formulário do pedido não identificado.");
      return;
    }

    const oldStatus = getOrderStatus(order);
    commitOrderStatusChange({
      order,
      orderId,
      orderFormId,
      newStatus,
      oldStatus,
      setOptimisticOrders: (prev) => applyOptimisticDndMove(prev, orderId, source.droppableId, newStatus, destination.index),
      toastSuccess: false,
    });
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

  const wrap = (content) =>
    minimal ? content : <MainContainer>{content}</MainContainer>;

  if (modulesLoading) {
    return wrap(
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  const activeFormId = formIdFilter || (forms[0]?.id ? String(forms[0].id) : null);

  if (forms.length === 0 && !loading) {
    return wrap(
      minimal ? (
        <Box p={3} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <Typography color="textSecondary">Nenhum formulário de cardápio encontrado.</Typography>
        </Box>
      ) : (
        <>
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
              {i18n.t("lanchonetes.goToCardapios")}
            </Button>
          </Paper>
        </>
      )
    );
  }

  const kanban = (
    <>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1} minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {Object.keys(pendingStatusByOrderId).length > 0 && (
            <Box mb={1}>
              <LinearProgress />
            </Box>
          )}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box
              className={`${classes.boardContainer} ${minimal ? classes.boardContainerMinimal : ""}`}
              style={{ gridTemplateColumns: `repeat(${orderStages.length}, minmax(180px, 1fr))` }}
            >
              {columnsWithOrders.map((column) => (
                <Paper key={column.id} elevation={0} className={`${classes.column} ${minimal ? classes.columnMinimal : ""}`}>
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
                            isDragDisabled={!!pendingStatusByOrderId[order.id]}
                          >
                            {(provided, snapshot) => (
                            (() => {
                              const nextStage = getNextStage(order);
                              const prevStage = getPrevStage(order);
                              const card = (
                                <PedidoKanbanCard
                                  order={order}
                                  onCardClick={handleOpenOrderModal}
                                  onViewDetails={handleViewDetails}
                                  onWhatsApp={handleWhatsApp}
                                  showStageButtons={minimal}
                                  canBack={!!prevStage}
                                  canAdvance={!!nextStage}
                                  onBack={() => {
                                    if (!prevStage) return;
                                    const orderFormId = order.formId || order.form?.id;
                                    if (!orderFormId) {
                                      toast.error("Formulário do pedido não identificado.");
                                      return;
                                    }
                                    const oldStatus = getOrderStatus(order);
                                    commitOrderStatusChange({
                                      order,
                                      orderId: order.id,
                                      orderFormId,
                                      newStatus: prevStage.id,
                                      oldStatus,
                                      setOptimisticOrders: (prev) =>
                                        prev.map((o) =>
                                          o.id === order.id
                                            ? { ...o, orderStatus: prevStage.id, metadata: { ...(o.metadata || {}), orderStatus: prevStage.id } }
                                            : o
                                        ),
                                      toastSuccess: true,
                                    });
                                  }}
                                  onAdvance={() => {
                                    if (!nextStage) return;
                                    const orderFormId = order.formId || order.form?.id;
                                    if (!orderFormId) {
                                      toast.error("Formulário do pedido não identificado.");
                                      return;
                                    }
                                    const oldStatus = getOrderStatus(order);
                                    commitOrderStatusChange({
                                      order,
                                      orderId: order.id,
                                      orderFormId,
                                      newStatus: nextStage.id,
                                      oldStatus,
                                      setOptimisticOrders: (prev) =>
                                        prev.map((o) =>
                                          o.id === order.id
                                            ? { ...o, orderStatus: nextStage.id, metadata: { ...(o.metadata || {}), orderStatus: nextStage.id } }
                                            : o
                                        ),
                                      toastSuccess: true,
                                    });
                                  }}
                                  isDragging={snapshot.isDragging}
                                  isUpdating={!!pendingStatusByOrderId[order.id]}
                                  provided={provided}
                                />
                              );

                              // Renderiza em "camada acima" para não cortar por overflow e dar sensação de miniatura flutuante
                              return snapshot.isDragging
                                ? ReactDOM.createPortal(card, document.body)
                                : card;
                            })()
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
        </>
      )}
    </>
  );

  if (minimal) {
    return (
      <Box className={`${classes.root} ${classes.rootMinimal}`} padding={0}>
        {kanban}
        <Dialog
          open={orderModalOpen}
          onClose={handleCloseOrderModal}
          maxWidth="sm"
          fullWidth
          scroll="paper"
        >
          <DialogTitle>
            Pedido {selectedOrder?.protocol || (selectedOrder?.id ? `#${selectedOrder.id}` : "")}
          </DialogTitle>
          <DialogContent dividers>
            {selectedOrder && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Cliente</Typography>
                <Typography variant="body1" style={{ fontWeight: 600 }}>{selectedOrder.responderName || "Sem nome"}</Typography>
                <Typography variant="body2" color="textSecondary">{selectedOrder.responderPhone || "Sem número"}</Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Tipo</Typography>
                  <Typography variant="body2">
                    {selectedOrder.metadata?.orderType === "delivery" ? "Delivery" : "Mesa"}
                    {selectedOrder.metadata?.tableNumber != null && ` • Mesa ${selectedOrder.metadata.tableNumber}`}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Itens</Typography>
                  <List dense disablePadding>
                    {(selectedOrder.metadata?.menuItems || []).map((item, idx) => (
                      <ListItem key={idx} disableGutters style={{ paddingTop: 0, paddingBottom: 4 }}>
                        <ListItemText
                          primary={`${item.quantity}x ${item.productName || "Item"}`}
                          secondary={item.observations ? `Obs: ${item.observations}` : null}
                        />
                        <Typography variant="body2">
                          R$ {((Number(item.quantity) || 0) * (Number(item.productValue) || 0)).toFixed(2).replace(".", ",")}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Divider style={{ margin: "12px 0" }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary">
                    Status: <strong style={{ color: (getStagesForOrder(selectedOrder).find((s) => s.id === getOrderStatus(selectedOrder)) || {}).color }}>
                      {getStagesForOrder(selectedOrder).find((s) => s.id === getOrderStatus(selectedOrder))?.label || getOrderStatus(selectedOrder)}
                    </strong>
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {(() => {
                      const metadata = selectedOrder.metadata || {};
                      if (metadata.total != null) return Number(metadata.total);
                      const itemsTotal = (metadata.menuItems || []).reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.productValue) || 0), 0);
                      const deliveryFee = Number(metadata.deliveryFee) || 0;
                      return itemsTotal + deliveryFee;
                    })().toFixed(2).replace(".", ",")}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOrderModal}>Fechar</Button>
            {selectedOrder && getNextStage(selectedOrder) && (
              <Button variant="contained" color="primary" onClick={handleProximaEtapa} disabled={updatingStatus}>
                {updatingStatus ? "Atualizando..." : `Próxima etapa (${getNextStage(selectedOrder)?.label})`}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
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
          <FormControl variant="outlined" size="small" className={classes.formSelect}>
            <Select
              value={tableIdFilter || ""}
              onChange={(e) => setTableIdFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Todas as mesas</MenuItem>
              {mesas.map((m) => (
                <MenuItem key={m.id} value={String(m.id)}>
                  {m.number || m.name || `Mesa ${m.id}`}
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
      {kanban}

      <Dialog
        open={orderModalOpen}
        onClose={handleCloseOrderModal}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Pedido {selectedOrder?.protocol || (selectedOrder?.id ? `#${selectedOrder.id}` : "")}
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Cliente
              </Typography>
              <Typography variant="body1" style={{ fontWeight: 600 }}>
                {selectedOrder.responderName || "Sem nome"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedOrder.responderPhone || "Sem número"}
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Tipo
                </Typography>
                <Typography variant="body2">
                  {selectedOrder.metadata?.orderType === "delivery" ? "Delivery" : "Mesa"}
                  {selectedOrder.metadata?.tableNumber != null && ` • Mesa ${selectedOrder.metadata.tableNumber}`}
                </Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Itens
                </Typography>
                <List dense disablePadding>
                  {(selectedOrder.metadata?.menuItems || []).map((item, idx) => (
                    <ListItem key={idx} disableGutters style={{ paddingTop: 0, paddingBottom: 4 }}>
                      <ListItemText
                        primary={`${item.quantity}x ${item.productName || "Item"}`}
                        secondary={item.observations ? `Obs: ${item.observations}` : null}
                      />
                      <Typography variant="body2">
                        R$ {((Number(item.quantity) || 0) * (Number(item.productValue) || 0)).toFixed(2).replace(".", ",")}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Divider style={{ margin: "12px 0" }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  Status atual:{" "}
                  <strong style={{ color: (getStagesForOrder(selectedOrder).find((s) => s.id === getOrderStatus(selectedOrder)) || {}).color }}>
                    {getStagesForOrder(selectedOrder).find((s) => s.id === getOrderStatus(selectedOrder))?.label || getOrderStatus(selectedOrder)}
                  </strong>
                </Typography>
                <Typography variant="h6" color="primary">
                  R$ {(() => {
                    const metadata = selectedOrder.metadata || {};
                    if (metadata.total != null) return Number(metadata.total);
                    const itemsTotal = (metadata.menuItems || []).reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.productValue) || 0), 0);
                    const deliveryFee = Number(metadata.deliveryFee) || 0;
                    return itemsTotal + deliveryFee;
                  })().toFixed(2).replace(".", ",")}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderModal}>Fechar</Button>
          {selectedOrder && getNextStage(selectedOrder) && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleProximaEtapa}
              disabled={updatingStatus}
            >
              {updatingStatus ? "Atualizando..." : `Próxima etapa (${getNextStage(selectedOrder)?.label})`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default Pedidos;
