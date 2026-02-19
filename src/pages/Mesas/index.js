import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  TextField,
  Checkbox,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import TableChartIcon from "@material-ui/icons/TableChart";
import DeleteIcon from "@material-ui/icons/Delete";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import { QrCode2 as QrCodeIcon } from "@mui/icons-material";
import QRCode from "qrcode.react";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import MesaCard from "../../components/MesaCard";
import MesaModal from "../../components/MesaModal";
import MesaOcuparModal from "../../components/MesaOcuparModal";
import MesaBulkCreateModal from "../../components/MesaBulkCreateModal";
import MesaPrintQRModal from "../../components/MesaPrintQRModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import LiberarMesaModal from "../../components/LiberarMesaModal";
import OrderNotificationPopup from "../../components/OrderNotificationPopup";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import { i18n } from "../../translate/i18n";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

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
    padding: theme.spacing(2),
    backgroundColor: theme.palette.fancyBackground || theme.palette.background.default,
    overflow: "auto",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  filterControl: {
    minWidth: 160,
  },
  grid: {
    marginTop: theme.spacing(2),
    flex: 1,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
  cardapioBanner: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    background: theme.palette.type === "dark" ? "rgba(34, 197, 94, 0.12)" : "rgba(34, 197, 94, 0.08)",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
  },
  mesaCardHighlight: {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
    borderRadius: 14,
  },
  orderDialogContent: {
    maxHeight: "60vh",
    overflowY: "auto",
    paddingTop: 8,
  },
  orderTabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    minHeight: 40,
  },
  orderTabPanel: { paddingTop: theme.spacing(1) },
  orderProductCard: { marginBottom: theme.spacing(1) },
  orderQuantityControl: { display: "flex", alignItems: "center", gap: theme.spacing(0.5) },
  orderDialogFooter: {
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  orderSearchField: {
    marginBottom: theme.spacing(1.5),
  },
  orderLineRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const Mesas = ({ cardapioSlugFromHub }) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();
  const socketManager = useContext(SocketContext);
  const mesaIdFromUrl = new URLSearchParams(location.search).get("mesaId");
  const highlightedMesaRef = useRef(null);

  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [mesaModalOpen, setMesaModalOpen] = useState(false);
  const [mesaModalInitialType, setMesaModalInitialType] = useState("mesa");
  const [mesaBulkModalOpen, setMesaBulkModalOpen] = useState(false);
  const [ocuparModalOpen, setOcuparModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [mesaToDelete, setMesaToDelete] = useState(null);
  const [cardapioQRModalOpen, setCardapioQRModalOpen] = useState(false);
  const [printAllQRModalOpen, setPrintAllQRModalOpen] = useState(false);
  const cardapioQRRef = useRef(null);
  const [liberarModalOpen, setLiberarModalOpen] = useState(false);
  const [mesaParaLiberar, setMesaParaLiberar] = useState(null);
  const [cardapioSlugFetched, setCardapioSlugFetched] = useState(null); // agora armazena publicId
  const [selectedMesas, setSelectedMesas] = useState(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkLiberarModalOpen, setBulkLiberarModalOpen] = useState(false);

  const [mesaParaPedido, setMesaParaPedido] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderLines, setOrderLines] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);
  const [orderForm, setOrderForm] = useState(null);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderDialogTab, setOrderDialogTab] = useState(0);
  const [variablePriceDialogOpen, setVariablePriceDialogOpen] = useState(false);
  const [variablePriceProduct, setVariablePriceProduct] = useState(null);
  const [variablePriceQty, setVariablePriceQty] = useState(1);
  const [variablePriceUnit, setVariablePriceUnit] = useState("");
  const [variationDialogOpen, setVariationDialogOpen] = useState(false);
  const [variationProduct, setVariationProduct] = useState(null);
  const [selectedVariationOptionId, setSelectedVariationOptionId] = useState(null);
  /** Variações selecionadas por produto (productId -> variationOptionId) - similar ao PublicMenuForm */
  const [selectedVariationOption, setSelectedVariationOption] = useState({});
  const [halfAndHalfDialogOpen, setHalfAndHalfDialogOpen] = useState(false);
  const [halfAndHalfProduct, setHalfAndHalfProduct] = useState(null);
  const [halfAndHalfHalf1, setHalfAndHalfHalf1] = useState("");
  const [halfAndHalfHalf2, setHalfAndHalfHalf2] = useState("");
  const [halfAndHalfHalf1Variation, setHalfAndHalfHalf1Variation] = useState(null);
  const [halfAndHalfHalf2Variation, setHalfAndHalfHalf2Variation] = useState(null);
  const [halfAndHalfQty, setHalfAndHalfQty] = useState(1);
  const [halfAndHalfBaseVariation, setHalfAndHalfBaseVariation] = useState(null);
  const [halfAndHalfItems, setHalfAndHalfItems] = useState([]);
  const [orderProductSearch, setOrderProductSearch] = useState("");
  const [pendingOrders, setPendingOrders] = useState([]); // Pedidos pendentes (orderStatus: "novo")
  const [notificationOrder, setNotificationOrder] = useState(null); // Pedido para mostrar no popup
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [pendingOrdersModalOpen, setPendingOrdersModalOpen] = useState(false); // Modal de lista de pedidos pendentes
  const [selectedPendingOrder, setSelectedPendingOrder] = useState(null); // Pedido selecionado para ver detalhes
  const [pendingOrderDetailsModalOpen, setPendingOrderDetailsModalOpen] = useState(false); // Modal de detalhes do pedido

  // Função para contar pedidos pendentes por mesa
  const getPendingOrdersCountForMesa = useCallback((mesaId) => {
    if (!mesaId || pendingOrders.length === 0) return 0;
    
    const mesa = mesas.find((m) => m.id === mesaId);
    
    return pendingOrders.filter((order) => {
      const metadata = order.metadata || {};
      const tableId = metadata.tableId;
      const mesaSessionId = order.mesaSessionId;
      
      // Comparar por tableId (quando pedido é feito via cardápio público)
      if (tableId != null) {
        const tableIdMatch = String(tableId) === String(mesaId) || Number(tableId) === Number(mesaId);
        if (tableIdMatch) return true;
      }
      
      // Comparar por mesaSessionId (quando mesa está ocupada)
      if (mesaSessionId && mesa?.sessionId) {
        return mesaSessionId === mesa.sessionId;
      }
      
      return false;
    }).length;
  }, [pendingOrders, mesas]);

  // Função para obter o primeiro pedido pendente de uma mesa
  const getFirstPendingOrderForMesa = useCallback((mesaId) => {
    if (!mesaId || pendingOrders.length === 0) return null;
    
    const mesa = mesas.find((m) => m.id === mesaId);
    
    const mesaPendingOrders = pendingOrders.filter((order) => {
      const metadata = order.metadata || {};
      const tableId = metadata.tableId;
      const mesaSessionId = order.mesaSessionId;
      
      // Comparar por tableId (quando pedido é feito via cardápio público)
      if (tableId != null) {
        const tableIdMatch = String(tableId) === String(mesaId) || Number(tableId) === Number(mesaId);
        if (tableIdMatch) return true;
      }
      
      // Comparar por mesaSessionId (quando mesa está ocupada)
      if (mesaSessionId && mesa?.sessionId) {
        return mesaSessionId === mesa.sessionId;
      }
      
      return false;
    });
    
    return mesaPendingOrders.length > 0 ? mesaPendingOrders[0] : null;
  }, [pendingOrders, mesas]);

  const cardapioSlug = cardapioSlugFromHub ?? cardapioSlugFetched; // publicId do cardápio padrão

  useEffect(() => {
    if (cardapioSlugFromHub) return;
    api.get("/forms?formType=cardapio").then(({ data }) => {
      const forms = data.forms || [];
      const publicId = forms.length ? (forms.sort((a, b) => (a.id || 0) - (b.id || 0))[0]?.publicId) : null;
      if (publicId) setCardapioSlugFetched(publicId);
    }).catch(() => {});
  }, [cardapioSlugFromHub]);

  const fetchMesas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (sectionFilter) params.section = sectionFilter;
      const { data } = await api.get("/mesas", { params });
      setMesas(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
      setMesas([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sectionFilter]);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
    }
  }, [hasLanchonetes, modulesLoading, history]);

  useEffect(() => {
    if (hasLanchonetes) {
      fetchMesas();
    }
  }, [hasLanchonetes, fetchMesas]);

  // Carregar pedidos pendentes existentes ao montar o componente
  useEffect(() => {
    if (!hasLanchonetes) return;
    
    const fetchPendingOrders = async () => {
      try {
        // Buscar pedidos pendentes do formulário de cardápio
        const { data: formsData } = await api.get("/forms?formType=cardapio");
        const forms = formsData.forms || [];
        if (forms.length === 0) return;
        
        // Buscar pedidos com orderStatus "novo" para cada formulário usando listOrders
        const allPendingOrders = [];
        for (const form of forms) {
          try {
            const { data: ordersData } = await api.get(`/forms/${form.id}/orders`, {
              params: {
                orderStatus: "novo",
              },
            });
            const orders = ordersData.orders || [];
            allPendingOrders.push(...orders);
          } catch (err) {
            // Ignorar erros de formulários específicos
            console.warn("Erro ao buscar pedidos pendentes do formulário:", form.id, err);
          }
        }
        
        setPendingOrders(allPendingOrders);
      } catch (err) {
        console.warn("Erro ao buscar pedidos pendentes:", err);
      }
    };
    
    fetchPendingOrders();
  }, [hasLanchonetes]);

  useEffect(() => {
    const socket = user?.companyId ? socketManager?.getSocket?.(user.companyId) : null;
    if (!socket) return;
    socket.on(`company-${user.companyId}-mesa`, (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "ocupar" || data.action === "liberar") {
        const mesa = data.mesa;
        setMesas((prev) => {
          const idx = prev.findIndex((m) => m.id === mesa.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = mesa;
            return updated;
          }
          return [mesa, ...prev];
        });
      }
      if (data.action === "delete") {
        setMesas((prev) => prev.filter((m) => m.id !== data.mesaId));
      }
      if (data.action === "bulkCreate") {
        setMesas((prev) => [...(data.mesas || []), ...prev]);
      }
    });
    return () => {
      socket.off(`company-${user.companyId}-mesa`);
    };
  }, [socketManager, user?.companyId]);

  // Listener para novos pedidos pendentes
  useEffect(() => {
    const socket = user?.companyId ? socketManager?.getSocket?.(user.companyId) : null;
    if (!socket) return;
    
    const handleFormResponse = (data) => {
      if (data.action === "create" && data.response) {
        const response = data.response;
        const formType = response.form?.settings?.formType || response.metadata?.formType;
        const orderStatus = response.orderStatus || response.metadata?.orderStatus;
        
        // Filtrar apenas pedidos de cardápio com status "novo"
        if (formType === "cardapio" && orderStatus === "novo") {
          setPendingOrders((prev) => {
            // Evitar duplicatas
            const exists = prev.some((o) => o.id === response.id);
            if (exists) return prev;
            return [...prev, response];
          });
          
          // Mostrar popup de notificação
          setNotificationOrder(response);
          setNotificationOpen(true);
        }
      } else if (data.action === "update" && data.response) {
        const response = data.response;
        const orderStatus = response.orderStatus || response.metadata?.orderStatus;
        
        // Se pedido foi atualizado e não está mais pendente, remover da lista
        if (orderStatus !== "novo") {
          setPendingOrders((prev) => prev.filter((o) => o.id !== response.id));
        }
      }
    };
    
    socket.on(`company-${user.companyId}-formResponse`, handleFormResponse);
    
    return () => {
      socket.off(`company-${user.companyId}-formResponse`, handleFormResponse);
    };
  }, [socketManager, user?.companyId]);

  useEffect(() => {
    if (!orderDialogOpen || !mesaParaPedido) {
      if (!orderDialogOpen) {
        setOrderForm(null);
        setOrderProducts([]);
        setOrderLines([]);
        setOrderDialogTab(0);
      }
      return;
    }

    let cancelled = false;
    setOrderLoading(true);

    const resolveSlugAndLoad = async () => {
      let slugToUse = mesaParaPedido?.form?.publicId || cardapioSlug;
      if (!slugToUse) {
        try {
          const { data } = await api.get("/mesas/default-cardapio-form");
          if (cancelled || !data?.publicId) return;
          slugToUse = data.publicId;
        } catch (err) {
          if (!cancelled) toast.error("Nenhum formulário de cardápio encontrado para esta mesa.");
          return;
        }
      }
      if (cancelled) return;
      try {
        const [{ data: formsData }, { data: productsData }] = await Promise.all([
          api.get("/forms?formType=cardapio"),
          api.get(`/public/forms/${slugToUse}/products`).catch(() => ({ data: { products: [] } })),
        ]);
        if (cancelled) return;
        const forms = formsData?.forms || [];
        const form = forms.find((f) => f.publicId === slugToUse) || forms.find((f) => f.publicId === cardapioSlug) || forms[0] || null;
        if (!form) {
          toast.error("Formulário de cardápio não encontrado.");
          return;
        }
        setOrderForm(form);
        setOrderProducts(productsData?.products || []);
      } catch (err) {
        if (!cancelled) toastError(err);
      } finally {
        if (!cancelled) setOrderLoading(false);
      }
    };

    resolveSlugAndLoad();
    return () => { cancelled = true; };
  }, [orderDialogOpen, mesaParaPedido?.id, mesaParaPedido?.form?.publicId, cardapioSlug]);

  const handleOpenOrderDialog = (mesa) => {
    if (mesa.status !== "ocupada" || !mesa.contact) {
      toast.error("Mesa ocupada sem cliente vinculado.");
      return;
    }
    setMesaParaPedido(mesa);
    setOrderLines([]);
    setOrderDialogTab(0);
    setOrderDialogOpen(true);
  };

  const handleCloseOrderDialog = () => {
    if (!orderSubmitting) {
      setOrderDialogOpen(false);
      setMesaParaPedido(null);
      setOrderLines([]);
      setHalfAndHalfItems([]);
      setOrderProductSearch("");
      setSelectedVariationOption({});
    }
  };

  // Funções auxiliares para exibir detalhes do pedido (similar ao Kanban)
  const getOrderStatus = (order) => {
    return order?.orderStatus || order?.metadata?.orderStatus || "novo";
  };

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

  const handleOpenPendingOrderDetails = async (order) => {
    // Carregar detalhes completos do pedido incluindo answers
    try {
      const orderFormId = order.formId || order.form?.id;
      if (orderFormId && order.id) {
        const { data } = await api.get(`/forms/${orderFormId}/responses/${order.id}`);
        setSelectedPendingOrder(data);
      } else {
        setSelectedPendingOrder(order);
      }
    } catch (err) {
      console.warn("Erro ao carregar detalhes do pedido:", err);
      setSelectedPendingOrder(order);
    }
    setPendingOrderDetailsModalOpen(true);
  };

  const handleClosePendingOrderDetails = () => {
    setPendingOrderDetailsModalOpen(false);
    setSelectedPendingOrder(null);
  };

  const handleProximaEtapaPendingOrder = async () => {
    if (!selectedPendingOrder) return;
    const next = getNextStage(selectedPendingOrder);
    if (!next) return;
    const orderFormId = selectedPendingOrder.formId || selectedPendingOrder.form?.id;
    if (!orderFormId) {
      toast.error("Formulário do pedido não identificado.");
      return;
    }
    try {
      await api.put(`/forms/${orderFormId}/responses/${selectedPendingOrder.id}/order-status`, {
        orderStatus: next.id,
      });
      toast.success(`Pedido atualizado para: ${next.label}`);
      // Atualizar lista de pedidos pendentes
      setPendingOrders((prev) => prev.filter((o) => o.id !== selectedPendingOrder.id));
      handleClosePendingOrderDetails();
      fetchMesas();
    } catch (err) {
      toastError(err);
    }
  };

  const getOrderLineCount = (productId) =>
    orderLines
      .filter((l) => l.productId === productId)
      .reduce((a, l) => a + l.quantity, 0);

  const handleOrderQuantityChange = (productId, delta, product) => {
    const p = product || orderProducts.find((x) => x.id === productId);
    if (delta === 1) {
      // Verificar se tem variações
      if (p?.variations && p.variations.length > 0) {
        const selectedOptionId = selectedVariationOption[p.id];
        if (!selectedOptionId) {
          // Não tem variação selecionada, precisa selecionar primeiro
          const firstVariation = p.variations[0];
          if (firstVariation?.options && firstVariation.options.length > 0) {
            setVariationProduct(p);
            setSelectedVariationOptionId(firstVariation.options[0].id);
            setVariationDialogOpen(true);
            return;
          }
        } else {
          // Já tem variação selecionada
          // Se permite meio a meio, abrir modal de meio a meio
          if (p?.allowsHalfAndHalf === true) {
            openHalfAndHalfModal(p);
            return;
          }
          // Se não permite meio a meio, adiciona normalmente com a variação selecionada
          const firstVariation = p.variations[0];
          const selectedOption = firstVariation?.options?.find((o) => o.id === selectedOptionId);
          if (selectedOption) {
            setOrderLines((prev) => [
              ...prev,
              {
                productId: p.id,
                quantity: 1,
                productValue: selectedOption.value || Number(p.value) || 0,
                variationOptionId: selectedOptionId,
              },
            ]);
            return;
          }
        }
      }
      // Verificar se permite meio a meio (sem variações)
      if (p?.allowsHalfAndHalf === true) {
        openHalfAndHalfModal(p);
        return;
      }
      // Verificar se tem preço variável
      if (p?.variablePrice) {
        setVariablePriceProduct(p);
        setVariablePriceQty(1);
        setVariablePriceUnit(Number(p?.value) ?? 0);
        setVariablePriceDialogOpen(true);
        return;
      }
    }
    setOrderLines((prev) => {
      if (delta === 1) {
        // Já foi tratado acima para variações, meio a meio e preço variável
        // Para produtos normais sem variações, adicionar normalmente
        const idx = prev.findIndex((l) => l.productId === productId && l.productValue == null && !l.variationOptionId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          return next;
        }
        return [...prev, { productId, quantity: 1 }];
      }
      // Decremento: remover do último item do produto
      const rev = prev.map((l, i) => ({ l, i })).filter((x) => x.l.productId === productId);
      const last = rev[rev.length - 1];
      if (!last) return prev;
      const idx = last.i;
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
      if (next[idx].quantity <= 0) next.splice(idx, 1);
      return next;
    });
  };

  const handleAddVariablePriceLine = () => {
    const qty = Math.max(1, parseInt(variablePriceQty, 10) || 1);
    const unit = parseFloat(String(variablePriceUnit).replace(",", "."));
    if (isNaN(unit) || unit < 0) {
      toast.error("Informe um valor unitário válido (maior ou igual a zero).");
      return;
    }
    setOrderLines((prev) => [
      ...prev,
      {
        productId: variablePriceProduct.id,
        quantity: qty,
        productValue: unit,
      },
    ]);
    setVariablePriceDialogOpen(false);
    setVariablePriceProduct(null);
  };

  const handleAddVariationLine = () => {
    if (!variationProduct || !selectedVariationOptionId) {
      toast.error("Selecione uma variação.");
      return;
    }
    const firstVariation = variationProduct.variations?.[0];
    const selectedOption = firstVariation?.options?.find((o) => o.id === selectedVariationOptionId);
    if (!selectedOption) {
      toast.error("Variação selecionada não encontrada.");
      return;
    }
    // Salvar a variação selecionada no estado (similar ao PublicMenuForm)
    setSelectedVariationOption((prev) => ({ ...prev, [variationProduct.id]: selectedVariationOptionId }));
    
    // Se o produto permite meio a meio, abrir modal de meio a meio automaticamente
    if (variationProduct.allowsHalfAndHalf === true) {
      setVariationDialogOpen(false);
      // Abrir modal de meio a meio com a variação já selecionada
      openHalfAndHalfModal(variationProduct);
      setVariationProduct(null);
      setSelectedVariationOptionId(null);
      return;
    }
    
    // Se não permite meio a meio, adiciona normalmente
    setOrderLines((prev) => [
      ...prev,
      {
        productId: variationProduct.id,
        quantity: 1,
        productValue: selectedOption.value || Number(variationProduct.value) || 0,
        variationOptionId: selectedVariationOptionId,
      },
    ]);
    setVariationDialogOpen(false);
    setVariationProduct(null);
    setSelectedVariationOptionId(null);
  };

  const getFlavorProductsForHalfAndHalf = (baseProduct, baseVariationLabel = null) => {
    if (!baseProduct) return [];
    const grupoFilter = baseProduct.halfAndHalfGrupo || baseProduct.grupo || null;
    let filtered = orderProducts.filter((p) => {
      if (grupoFilter) return (p.grupo || "") === grupoFilter;
      return true;
    });

    // Se há uma variação base selecionada, filtrar apenas produtos com variação da mesma sigla
    // Mas se o produto não tem variações, ainda deve aparecer na lista
    if (baseVariationLabel && baseProduct.variations && baseProduct.variations.length > 0) {
      filtered = filtered.filter((p) => {
        // Se o produto não tem variações, incluir na lista (compatível com qualquer variação)
        if (!p.variations || p.variations.length === 0) return true;
        const firstVariation = p.variations[0];
        if (!firstVariation || !firstVariation.options) return true;
        // Incluir se tiver a mesma variação OU se não tiver variações (produto simples)
        return firstVariation.options.some((opt) => opt.label === baseVariationLabel);
      });
    }

    // NÃO excluir o produto base - ele deve aparecer na lista e ser pré-selecionado na metade 1
    return filtered;
  };

  const computeHalfAndHalfUnitValue = (base, half1, half2, half1OptionId = null, half2OptionId = null, baseVariationLabel = null) => {
    if (!base || !half1 || !half2) return 0;
    const rule = base.halfAndHalfPriceRule || "max";
    
    let v1 = parseFloat(half1.value) || 0;
    let v2 = parseFloat(half2.value) || 0;
    
    if (half1OptionId && half1.variations && half1.variations.length > 0) {
      const firstVariation = half1.variations[0];
      const option = firstVariation?.options?.find((o) => o.id === half1OptionId);
      if (option) v1 = parseFloat(option.value) || 0;
    }
    
    if (half2OptionId && half2.variations && half2.variations.length > 0) {
      const firstVariation = half2.variations[0];
      const option = firstVariation?.options?.find((o) => o.id === half2OptionId);
      if (option) v2 = parseFloat(option.value) || 0;
    }
    
    if (rule === "max") return Math.max(v1, v2);
    if (rule === "fixed") {
      if (base.variations && base.variations.length > 0 && baseVariationLabel) {
        const firstVariation = base.variations[0];
        const option = firstVariation?.options?.find((o) => o.label === baseVariationLabel);
        if (option) return parseFloat(option.value) || 0;
      }
      return parseFloat(base.value) || 0;
    }
    if (rule === "average") return (v1 + v2) / 2;
    return Math.max(v1, v2);
  };

  const openHalfAndHalfModal = (product) => {
    // Se o produto tem variações mas não tem variação selecionada, abrir diálogo de seleção primeiro
    if (product.variations && product.variations.length > 0 && !selectedVariationOption[product.id]) {
      const firstVariation = product.variations[0];
      if (firstVariation?.options && firstVariation.options.length > 0) {
        setVariationProduct(product);
        setSelectedVariationOptionId(firstVariation.options[0].id);
        setVariationDialogOpen(true);
        return;
      }
    }
    
    setHalfAndHalfProduct(product);
    setHalfAndHalfQty(1);
    
    // Capturar a variação selecionada do produto base (como no PublicMenuForm)
    let baseVariationLabel = null;
    let baseOptionId = null;
    if (product.variations && product.variations.length > 0) {
      const selectedOptionId = selectedVariationOption[product.id];
      if (selectedOptionId) {
        baseOptionId = selectedOptionId;
        const firstVariation = product.variations[0];
        const option = firstVariation?.options?.find((o) => o.id === selectedOptionId);
        if (option) {
          baseVariationLabel = option.label;
        }
      } else {
        // Se não há variação selecionada, usar a primeira variação disponível
        const firstVariation = product.variations[0];
        if (firstVariation?.options && firstVariation.options.length > 0) {
          const firstOption = firstVariation.options[0];
          baseOptionId = firstOption.id;
          baseVariationLabel = firstOption.label;
        }
      }
    }
    setHalfAndHalfBaseVariation(baseVariationLabel);
    
    const availableProducts = getFlavorProductsForHalfAndHalf(product, baseVariationLabel);
    // Pré-selecionar o produto base na metade 1 (como no PublicMenuForm)
    setHalfAndHalfHalf1(String(product.id));
    // Se o produto base tem variações, usar a variação selecionada (baseOptionId)
    if (baseOptionId) {
      setHalfAndHalfHalf1Variation(baseOptionId);
    } else {
      setHalfAndHalfHalf1Variation(null);
    }
    
    // Pré-selecionar a primeira metade 2 disponível (diferente do produto base) com a variação correspondente
    if (availableProducts.length > 0) {
      const firstAvailable = availableProducts.find((p) => p.id !== product.id) || availableProducts[0];
      setHalfAndHalfHalf2(String(firstAvailable.id));
      // Pré-selecionar a variação correspondente ao baseVariationLabel
      if (firstAvailable.variations && firstAvailable.variations.length > 0 && baseVariationLabel) {
        const firstVariation = firstAvailable.variations[0];
        const matchingOption = firstVariation?.options?.find((o) => o.label === baseVariationLabel);
        if (matchingOption) {
          setHalfAndHalfHalf2Variation(matchingOption.id);
        } else if (firstVariation?.options && firstVariation.options.length > 0) {
          setHalfAndHalfHalf2Variation(firstVariation.options[0].id);
        } else {
          setHalfAndHalfHalf2Variation(null);
        }
      } else {
        setHalfAndHalfHalf2Variation(null);
      }
    } else {
      setHalfAndHalfHalf2("");
      setHalfAndHalfHalf2Variation(null);
    }
    
    setHalfAndHalfDialogOpen(true);
  };

  const handleAddHalfAndHalfLine = () => {
    if (!halfAndHalfProduct || !halfAndHalfHalf1 || !halfAndHalfHalf2 || halfAndHalfHalf1 === halfAndHalfHalf2) {
      toast.error("Selecione dois sabores diferentes");
      return;
    }
    
    const half1ProductId = parseInt(halfAndHalfHalf1, 10);
    const half2ProductId = parseInt(halfAndHalfHalf2, 10);
    
    const half1Product = orderProducts.find((p) => p.id === half1ProductId);
    const half2Product = orderProducts.find((p) => p.id === half2ProductId);
    
    // Usar as variações selecionadas individualmente para cada metade
    const half1OptionId = halfAndHalfHalf1Variation || null;
    const half2OptionId = halfAndHalfHalf2Variation || null;
    
    const qty = Math.max(1, parseInt(halfAndHalfQty, 10) || 1);
    setHalfAndHalfItems((prev) => [
      ...prev,
      {
        baseProductId: halfAndHalfProduct.id,
        half1ProductId,
        half2ProductId,
        half1OptionId,
        half2OptionId,
        quantity: qty,
      },
    ]);
    setHalfAndHalfDialogOpen(false);
    setHalfAndHalfProduct(null);
    setHalfAndHalfBaseVariation(null);
    setHalfAndHalfHalf1Variation(null);
    setHalfAndHalfHalf2Variation(null);
  };

  const handleRemoveHalfAndHalfItem = (index) => {
    setHalfAndHalfItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveOrderLine = (lineIndex) => {
    setOrderLines((prev) => prev.filter((_, i) => i !== lineIndex));
  };

  const getOrderTotalItems = () =>
    orderLines.reduce((a, l) => a + l.quantity, 0) + halfAndHalfItems.reduce((a, i) => a + i.quantity, 0);

  const calculateOrderTotal = () => {
    const linesTotal = orderLines.reduce((acc, line) => {
      const p = orderProducts.find((x) => x.id === line.productId);
      const unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
      return acc + line.quantity * unit;
    }, 0);
    
    const halfAndHalfTotal = halfAndHalfItems.reduce((acc, item) => {
      const base = orderProducts.find((p) => p.id === item.baseProductId);
      const half1 = orderProducts.find((p) => p.id === item.half1ProductId);
      const half2 = orderProducts.find((p) => p.id === item.half2ProductId);
      // Usar as variações selecionadas diretamente
      const unitVal = computeHalfAndHalfUnitValue(base, half1, half2, item.half1OptionId, item.half2OptionId, null);
      return acc + unitVal * item.quantity;
    }, 0);
    
    return linesTotal + halfAndHalfTotal;
  };

  const submitOrder = async () => {
    if (!orderForm?.publicId || !mesaParaPedido) return;
    if (getOrderTotalItems() === 0) {
      toast.error("Adicione itens ao pedido");
      return;
    }
    const contact = mesaParaPedido.contact || {};
    for (const line of orderLines) {
      const p = orderProducts.find((x) => x.id === line.productId);
      if (p?.variablePrice && (line.productValue == null || line.productValue < 0)) {
        toast.error(`Informe o valor para "${p.name}".`);
        return;
      }
    }
    setOrderSubmitting(true);
    try {
      const menuItems = orderLines.map((line) => {
        const p = orderProducts.find((x) => x.id === line.productId);
        const unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
        let productName = p?.name || "Produto";
        // Se tiver variação, adicionar o nome da variação ao nome do produto
        if (line.variationOptionId && p?.variations && p.variations.length > 0) {
          const firstVariation = p.variations[0];
          const selectedOption = firstVariation?.options?.find((o) => o.id === line.variationOptionId);
          if (selectedOption) {
            productName = `${productName} - ${selectedOption.label}`;
          }
        }
        return {
          productId: line.productId,
          quantity: line.quantity,
          productName: productName,
          productValue: unit,
          grupo: p?.grupo || "Outros",
          variationOptionId: line.variationOptionId || null,
        };
      });

      // Adicionar itens meio a meio
      const halfAndHalfMenuItems = halfAndHalfItems.map((item) => {
        const base = orderProducts.find((p) => p.id === item.baseProductId);
        const half1 = orderProducts.find((p) => p.id === item.half1ProductId);
        const half2 = orderProducts.find((p) => p.id === item.half2ProductId);
        // Usar as variações selecionadas diretamente
        const unitVal = computeHalfAndHalfUnitValue(base, half1, half2, item.half1OptionId, item.half2OptionId, null);
        const baseName = base?.name || "Produto";
        let half1Name = half1?.name || "Sabor 1";
        let half2Name = half2?.name || "Sabor 2";
        // Adicionar nome da variação se houver
        if (item.half1OptionId && half1?.variations && half1.variations.length > 0) {
          const firstVariation = half1.variations[0];
          const option = firstVariation?.options?.find((o) => o.id === item.half1OptionId);
          if (option) half1Name = `${half1Name} (${option.label})`;
        }
        if (item.half2OptionId && half2?.variations && half2.variations.length > 0) {
          const firstVariation = half2.variations[0];
          const option = firstVariation?.options?.find((o) => o.id === item.half2OptionId);
          if (option) half2Name = `${half2Name} (${option.label})`;
        }
        const productName = `${baseName} - Metade ${half1Name} / Metade ${half2Name}`;
        return {
          type: "halfAndHalf",
          productId: item.baseProductId,
          half1ProductId: item.half1ProductId,
          half2ProductId: item.half2ProductId,
          half1OptionId: item.half1OptionId,
          half2OptionId: item.half2OptionId,
          quantity: item.quantity,
          productName: productName,
          productValue: unitVal,
          grupo: base?.grupo || "Outros",
        };
      });

      const allMenuItems = [...menuItems, ...halfAndHalfMenuItems];
      const labelLower = (l) => (l || "").trim().toLowerCase();
      const fields = orderForm.fields || [];
      const autoFields = fields.filter(
        (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
      );
      let answers = autoFields.map((f) => ({
        fieldId: f.id,
        answer: f.metadata?.autoFieldType === "name" ? (contact?.name || "Cliente") : (contact?.number || ""),
      }));
      const nomeField = fields.find(
        (f) => f.isRequired && (f.metadata?.autoFieldType === "name" || (labelLower(f.label).includes("nome") && !labelLower(f.label).includes("sobrenome")))
      );
      if (nomeField && !answers.some((a) => a.fieldId === nomeField.id)) {
        answers = [...answers, { fieldId: nomeField.id, answer: contact?.name || "Cliente" }];
      }
      const tipoPedidoField = (orderForm.fields || []).find(
        (f) => f.isRequired && labelLower(f.label).includes("tipo") && labelLower(f.label).includes("pedido")
      );
      if (tipoPedidoField && !answers.some((a) => a.fieldId === tipoPedidoField.id)) {
        answers = [...answers, { fieldId: tipoPedidoField.id, answer: "Mesa" }];
      }
      const metadata = {
        tableId: mesaParaPedido.id,
        tableNumber: mesaParaPedido.number || mesaParaPedido.name,
        orderType: "mesa",
        garcomName: user?.name || "",
      };
      await api.post(`/public/forms/${orderForm.publicId}/submit`, {
        answers,
        menuItems: allMenuItems,
        metadata,
        responderName: contact?.name || "Cliente",
        responderPhone: contact?.number || "",
      });
      toast.success("Pedido enviado!");
      setOrderDialogOpen(false);
      setMesaParaPedido(null);
      setOrderLines([]);
      setHalfAndHalfItems([]);
      fetchMesas();
    } catch (err) {
      toastError(err);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const orderProductsFiltered = orderProductSearch.trim()
    ? orderProducts.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(orderProductSearch.trim().toLowerCase()) ||
          (p.grupo || "Outros").toLowerCase().includes(orderProductSearch.trim().toLowerCase()) ||
          (p.description || "").toLowerCase().includes(orderProductSearch.trim().toLowerCase())
      )
    : orderProducts;
  const orderGroups = [...new Set(orderProductsFiltered.map((p) => p.grupo || "Outros"))].sort();

  useEffect(() => {
    if (!mesaIdFromUrl || mesas.length === 0 || !highlightedMesaRef.current) return;
    highlightedMesaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mesaIdFromUrl, mesas]);

  const handleOpenMesaModal = (mesa = null, initialType = "mesa") => {
    setSelectedMesa(mesa);
    setMesaModalOpen(true);
    setMesaModalInitialType(initialType);
  };

  const handleCloseMesaModal = () => {
    setMesaModalOpen(false);
    setSelectedMesa(null);
    fetchMesas();
  };

  const handleOpenBulkModal = () => setMesaBulkModalOpen(true);
  const handleCloseBulkModal = () => {
    setMesaBulkModalOpen(false);
    fetchMesas();
  };

  const handleOcupar = (mesa) => {
    setSelectedMesa(mesa);
    setOcuparModalOpen(true);
  };

  const handleLiberar = (mesa) => {
    setMesaParaLiberar(mesa);
    setLiberarModalOpen(true);
  };

  const handleVerTicket = (mesa) => {
    if (mesa?.ticketId) {
      history.push(`/tickets/${mesa.ticketId}`);
    }
  };

  const handleEdit = (mesa) => handleOpenMesaModal(mesa);

  const handleDeleteClick = (mesa) => {
    setMesaToDelete(mesa);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mesaToDelete) return;
    try {
      await api.delete(`/mesas/${mesaToDelete.id}`);
      toast.success("Mesa removida");
      setConfirmModalOpen(false);
      setMesaToDelete(null);
      fetchMesas();
    } catch (err) {
      toastError(err);
    }
  };

  const handleToggleMesaSelection = (mesaId) => {
    setSelectedMesas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mesaId)) {
        newSet.delete(mesaId);
      } else {
        newSet.add(mesaId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedMesas.size === mesas.length) {
      setSelectedMesas(new Set());
    } else {
      setSelectedMesas(new Set(mesas.map((m) => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMesas.size === 0) return;
    try {
      const mesaIds = Array.from(selectedMesas);
      await Promise.all(mesaIds.map((id) => api.delete(`/mesas/${id}`)));
      toast.success(`${mesaIds.length} mesa(s) removida(s)`);
      setBulkDeleteModalOpen(false);
      setSelectedMesas(new Set());
      fetchMesas();
    } catch (err) {
      toastError(err);
    }
  };

  const handleBulkLiberar = async () => {
    if (selectedMesas.size === 0) return;
    try {
      const mesaIds = Array.from(selectedMesas);
      await Promise.all(
        mesaIds.map((id) => api.put(`/mesas/${id}/liberar`))
      );
      toast.success(`${mesaIds.length} mesa(s) liberada(s)`);
      setBulkLiberarModalOpen(false);
      setSelectedMesas(new Set());
      fetchMesas();
    } catch (err) {
      toastError(err);
    }
  };

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center" gap={1}>
          <Title>Mesas</Title>
          {pendingOrders.length > 0 && (
            <Badge badgeContent={pendingOrders.length} color="error">
              <IconButton
                size="small"
                onClick={() => setPendingOrdersModalOpen(true)}
                style={{ padding: 8 }}
              >
                <ShoppingCartIcon color="action" />
              </IconButton>
            </Badge>
          )}
        </Box>
        <MainHeaderButtonsWrapper>
          <div className={classes.headerActions}>
            {selectedMesas.size > 0 && (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<DeleteIcon />}
                  onClick={() => setBulkDeleteModalOpen(true)}
                >
                  Apagar ({selectedMesas.size})
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<EventSeatIcon />}
                  onClick={() => setBulkLiberarModalOpen(true)}
                >
                  Liberar ({selectedMesas.size})
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setSelectedMesas(new Set())}
                >
                  Cancelar seleção
                </Button>
              </>
            )}
            <FormControl size="small" className={classes.filterControl}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="livre">Livre</MenuItem>
                <MenuItem value="ocupada">Ocupada</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" className={classes.filterControl}>
              <InputLabel>Seção</InputLabel>
              <Select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                label="Seção"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="salao">Salão</MenuItem>
                <MenuItem value="varanda">Varanda</MenuItem>
                <MenuItem value="area_externa">Área externa</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenMesaModal(null, "mesa")}
            >
              Add mesa
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenMesaModal(null, "comanda")}
            >
              Add comanda
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenBulkModal}
            >
              Criar várias
            </Button>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Box className={classes.root}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : mesas.length === 0 ? (
          <Paper className={classes.emptyState}>
            <TableChartIcon style={{ fontSize: 64, marginBottom: 16 }} />
            <Typography variant="h6">Nenhuma mesa cadastrada</Typography>
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Crie mesas individuais ou em massa para começar.
            </Typography>
            <Box mt={2} display="flex" gap={1}>
              <Button variant="contained" color="primary" onClick={() => handleOpenMesaModal(null, "mesa")}>
                Nova mesa
              </Button>
              <Button variant="outlined" onClick={() => handleOpenMesaModal(null, "comanda")}>
                Nova comanda
              </Button>
              <Button variant="outlined" onClick={handleOpenBulkModal}>
                Criar várias
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            {(() => {
              const formSlug = cardapioSlug;
              if (!formSlug) return null;
              const cardapioUrl = `${window.location.origin}/f/${formSlug}`;
              return (
                <Paper className={classes.cardapioBanner}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    Cardápio para mesas
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(cardapioUrl).then(() => toast.success("Link copiado!"));
                        }
                      }}
                    >
                      Copiar link
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<QrCodeIcon fontSize="small" />}
                      onClick={() => setCardapioQRModalOpen(true)}
                    >
                      Ver QR geral
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<QrCodeIcon fontSize="small" />}
                      onClick={() => setPrintAllQRModalOpen(true)}
                    >
                      Imprimir todos os QR Codes
                    </Button>
                  </Box>
                </Paper>
              );
            })()}
          {mesas.length > 0 && (
            <Box mb={2} display="flex" alignItems="center" gap={1}>
              <Checkbox
                checked={selectedMesas.size === mesas.length && mesas.length > 0}
                indeterminate={selectedMesas.size > 0 && selectedMesas.size < mesas.length}
                onChange={handleSelectAll}
              />
              <Typography variant="body2">
                {selectedMesas.size > 0
                  ? `${selectedMesas.size} de ${mesas.length} selecionada(s)`
                  : `Selecionar todas (${mesas.length})`}
              </Typography>
            </Box>
          )}
          <Grid container spacing={2} className={classes.grid}>
            {mesas.map((mesa) => {
              const isHighlighted = mesaIdFromUrl && Number(mesaIdFromUrl) === mesa.id;
              const isSelected = selectedMesas.has(mesa.id);
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={mesa.id}
                  ref={isHighlighted ? highlightedMesaRef : undefined}
                  className={isHighlighted ? classes.mesaCardHighlight : undefined}
                >
                  <Box position="relative">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleMesaSelection(mesa.id)}
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        zIndex: 10,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        padding: 4,
                      }}
                    />
                    <MesaCard
                      mesa={mesa}
                      onOcupar={handleOcupar}
                      onLiberar={handleLiberar}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onVerTicket={handleVerTicket}
                      onAdicionarPedido={handleOpenOrderDialog}
                      onCopyLink={(url) => toast.success("Link copiado!")}
                      cardapioSlug={cardapioSlug}
                      pendingOrdersCount={getPendingOrdersCountForMesa(mesa.id)}
                      onVerPedido={getPendingOrdersCountForMesa(mesa.id) > 0 ? () => {
                        const firstOrder = getFirstPendingOrderForMesa(mesa.id);
                        if (firstOrder) {
                          handleOpenPendingOrderDetails(firstOrder);
                        }
                      } : undefined}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          </>
        )}
      </Box>

      <Dialog
        open={orderDialogOpen}
        onClose={handleCloseOrderDialog}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Adicionar pedido - Mesa {mesaParaPedido?.number || mesaParaPedido?.name}
          {mesaParaPedido?.contact && (
            <Typography variant="body2" color="textSecondary" display="block">
              Cliente: {mesaParaPedido.contact.name || mesaParaPedido.contact.number || "—"}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent className={classes.orderDialogContent}>
          {orderLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                className={classes.orderSearchField}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Buscar produtos..."
                value={orderProductSearch}
                onChange={(e) => setOrderProductSearch(e.target.value)}
                inputProps={{ "aria-label": "Buscar produtos" }}
              />
              <Tabs
                value={orderDialogTab}
                onChange={(_, v) => setOrderDialogTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                className={classes.orderTabs}
              >
                {orderGroups.map((grupo, idx) => (
                  <Tab key={grupo} label={grupo} id={`order-tab-${idx}`} aria-controls={`order-tabpanel-${idx}`} />
                ))}
              </Tabs>
              {orderGroups.map((grupo, idx) => (
                <div
                  key={grupo}
                  role="tabpanel"
                  hidden={orderDialogTab !== idx}
                  id={`order-tabpanel-${idx}`}
                  aria-labelledby={`order-tab-${idx}`}
                  className={classes.orderTabPanel}
                >
                  {orderDialogTab === idx && (
                    <Box>
                      {orderProductsFiltered
                        .filter((p) => (p.grupo || "Outros") === grupo)
                        .map((product) => {
                          const hasVariations = product.variations && product.variations.length > 0;
                          const firstVariation = hasVariations ? product.variations[0] : null;
                          const selectedOptionId = hasVariations ? (selectedVariationOption[product.id] ?? firstVariation?.options?.[0]?.id) : null;
                          const selectedOption = hasVariations && selectedOptionId ? firstVariation?.options?.find((o) => o.id === selectedOptionId) : null;
                          const displayPrice = hasVariations && selectedOption ? parseFloat(selectedOption.value || 0) : parseFloat(product.value || 0);
                          const isHalfAndHalf = product.allowsHalfAndHalf === true;
                          
                          return (
                            <Card key={product.id} className={classes.orderProductCard} variant="outlined">
                              <CardContent style={{ padding: "12px 16px" }}>
                                <Box>
                                  <Typography variant="body1">{product.name}</Typography>
                                  {hasVariations && firstVariation && (
                                    <FormControl variant="outlined" size="small" fullWidth style={{ marginTop: 8, marginBottom: 8 }}>
                                      <InputLabel>{firstVariation.name || firstVariation.label}</InputLabel>
                                      <Select
                                        value={selectedOptionId ?? ""}
                                        onChange={(e) => setSelectedVariationOption((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))}
                                        label={firstVariation.name || firstVariation.label}
                                      >
                                        {firstVariation.options.map((opt) => (
                                          <MenuItem key={opt.id} value={opt.id}>
                                            {opt.label} - R$ {parseFloat(opt.value || 0).toFixed(2).replace(".", ",")}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  )}
                                  <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginTop: hasVariations ? 0 : 8 }}>
                                    <Typography variant="body2" color="primary">
                                      {product.variablePrice
                                        ? "Preço variável"
                                        : `R$ ${displayPrice.toFixed(2).replace(".", ",")}`}
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      {isHalfAndHalf && (
                                        <Button
                                          variant="outlined"
                                          color="primary"
                                          size="small"
                                          onClick={() => openHalfAndHalfModal(product)}
                                          style={{ marginRight: 8 }}
                                        >
                                          Meio a meio
                                        </Button>
                                      )}
                                      <Box className={classes.orderQuantityControl}>
                                        <IconButton size="small" onClick={() => handleOrderQuantityChange(product.id, -1, product)}>
                                          <RemoveIcon fontSize="small" />
                                        </IconButton>
                                        <Typography style={{ minWidth: 28, textAlign: "center", fontWeight: 600 }}>
                                          {getOrderLineCount(product.id)}
                                        </Typography>
                                        <IconButton size="small" onClick={() => handleOrderQuantityChange(product.id, 1, product)}>
                                          <AddIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </Box>
                  )}
                </div>
              ))}
              {(orderLines.length > 0 || halfAndHalfItems.length > 0) && (
                <Box mt={2} mb={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Itens do pedido
                  </Typography>
                  {orderLines.map((line, idx) => {
                    const p = orderProducts.find((x) => x.id === line.productId);
                    const unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
                    const subtotal = line.quantity * unit;
                    let productDisplayName = p?.name || "Produto";
                    // Se tiver variação, adicionar o nome da variação
                    if (line.variationOptionId && p?.variations && p.variations.length > 0) {
                      const firstVariation = p.variations[0];
                      const selectedOption = firstVariation?.options?.find((o) => o.id === line.variationOptionId);
                      if (selectedOption) {
                        productDisplayName = `${productDisplayName} - ${selectedOption.label}`;
                      }
                    }
                    return (
                      <Box key={idx} className={classes.orderLineRow}>
                        <Box>
                          <Typography variant="body2">
                            {productDisplayName} • {line.quantity}x R$ {unit.toFixed(2).replace(".", ",")} = R$ {subtotal.toFixed(2).replace(".", ",")}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleRemoveOrderLine(idx)} aria-label="Remover item">
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                  {halfAndHalfItems.map((item, idx) => {
                    const base = orderProducts.find((p) => p.id === item.baseProductId);
                    const half1 = orderProducts.find((p) => p.id === item.half1ProductId);
                    const half2 = orderProducts.find((p) => p.id === item.half2ProductId);
                    // Usar as variações selecionadas diretamente (não precisa de baseVariationLabel)
                    const unitVal = computeHalfAndHalfUnitValue(base, half1, half2, item.half1OptionId, item.half2OptionId, null);
                    const subtotal = unitVal * item.quantity;
                    const baseName = base?.name || "Produto";
                    let half1Name = half1?.name || "Sabor 1";
                    let half2Name = half2?.name || "Sabor 2";
                    // Adicionar nome da variação se houver
                    if (item.half1OptionId && half1?.variations && half1.variations.length > 0) {
                      const firstVariation = half1.variations[0];
                      const option = firstVariation?.options?.find((o) => o.id === item.half1OptionId);
                      if (option) half1Name = `${half1Name} (${option.label})`;
                    }
                    if (item.half2OptionId && half2?.variations && half2.variations.length > 0) {
                      const firstVariation = half2.variations[0];
                      const option = firstVariation?.options?.find((o) => o.id === item.half2OptionId);
                      if (option) half2Name = `${half2Name} (${option.label})`;
                    }
                    const productDisplayName = `${baseName} - Metade ${half1Name} / Metade ${half2Name}`;
                    return (
                      <Box key={`half-${idx}`} className={classes.orderLineRow}>
                        <Box>
                          <Typography variant="body2">
                            {productDisplayName} • {item.quantity}x R$ {unitVal.toFixed(2).replace(".", ",")} = R$ {subtotal.toFixed(2).replace(".", ",")}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleRemoveHalfAndHalfItem(idx)} aria-label="Remover item">
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        {!orderLoading && (
          <Box component={DialogActions} className={classes.orderDialogFooter} disableSpacing>
            <Typography variant="h6" style={{ margin: 0 }}>
              Total: R$ {(Number(calculateOrderTotal()) || 0).toFixed(2).replace(".", ",")} • {getOrderTotalItems()} itens
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={submitOrder}
              disabled={getOrderTotalItems() === 0 || orderSubmitting}
            >
              {orderSubmitting ? <CircularProgress size={24} color="inherit" /> : "Enviar pedido"}
            </Button>
          </Box>
        )}
      </Dialog>

      <Dialog open={variablePriceDialogOpen} onClose={() => setVariablePriceDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Valor unitário</DialogTitle>
        <DialogContent>
          {variablePriceProduct && (
            <>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                {variablePriceProduct.name} — informe a quantidade e o valor unitário (ex.: refeição por kg).
              </Typography>
              <TextField
                label="Quantidade"
                type="number"
                inputProps={{ min: 1 }}
                value={variablePriceQty}
                onChange={(e) => setVariablePriceQty(e.target.value)}
                variant="outlined"
                margin="dense"
                fullWidth
                style={{ marginBottom: 12 }}
              />
              <TextField
                label="Valor unitário (R$)"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={variablePriceUnit}
                onChange={(e) => setVariablePriceUnit(e.target.value)}
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariablePriceDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleAddVariablePriceLine} color="primary" variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={variationDialogOpen} onClose={() => setVariationDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Selecionar variação</DialogTitle>
        <DialogContent>
          {variationProduct && (
            <>
              <Typography variant="body1" style={{ marginBottom: 16, fontWeight: 600 }}>
                {variationProduct.name}
              </Typography>
              {variationProduct.variations && variationProduct.variations.length > 0 && (
                <>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 12 }}>
                    {variationProduct.variations[0]?.label || variationProduct.variations[0]?.name || "Selecione a variação"}
                  </Typography>
                  <FormControl fullWidth variant="outlined" margin="dense">
                    <InputLabel>Variação</InputLabel>
                    <Select
                      value={selectedVariationOptionId || ""}
                      onChange={(e) => {
                        const optionId = Number(e.target.value);
                        setSelectedVariationOptionId(optionId);
                        // Salvar imediatamente no estado quando selecionar
                        setSelectedVariationOption((prev) => ({ ...prev, [variationProduct.id]: optionId }));
                      }}
                      label="Variação"
                    >
                      {variationProduct.variations[0]?.options?.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.label} - R$ {Number(option.value || 0).toFixed(2).replace(".", ",")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {variationProduct.allowsHalfAndHalf && (
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: 12 }}>
                      Após selecionar a variação, clique no botão "Meio a meio" para continuar.
                    </Typography>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariationDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button 
            onClick={handleAddVariationLine} 
            color="primary" 
            variant="contained" 
            disabled={!selectedVariationOptionId}
          >
            {variationProduct?.allowsHalfAndHalf ? "Confirmar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={halfAndHalfDialogOpen} onClose={() => setHalfAndHalfDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Meio a meio - {halfAndHalfProduct?.name}</DialogTitle>
        <DialogContent>
          {halfAndHalfProduct && (
            <>
              <FormControl fullWidth variant="outlined" margin="dense" style={{ marginTop: 8 }}>
                <InputLabel>Metade 1</InputLabel>
                <Select
                  value={halfAndHalfHalf1}
                  onChange={(e) => {
                    setHalfAndHalfHalf1(e.target.value);
                    // Pré-selecionar a variação que corresponde ao baseVariationLabel (como no PublicMenuForm)
                    const selectedProduct = orderProducts.find((p) => p.id === parseInt(e.target.value, 10));
                    if (selectedProduct?.variations && selectedProduct.variations.length > 0) {
                      const firstVariation = selectedProduct.variations[0];
                      // Buscar a opção que tem o mesmo label que halfAndHalfBaseVariation
                      let selectedOptionId = null;
                      if (halfAndHalfBaseVariation) {
                        const matchingOption = firstVariation?.options?.find((o) => o.label === halfAndHalfBaseVariation);
                        if (matchingOption) {
                          selectedOptionId = matchingOption.id;
                        }
                      }
                      // Se não encontrou, usar a primeira opção
                      if (!selectedOptionId && firstVariation?.options && firstVariation.options.length > 0) {
                        selectedOptionId = firstVariation.options[0].id;
                      }
                      setHalfAndHalfHalf1Variation(selectedOptionId);
                    } else {
                      setHalfAndHalfHalf1Variation(null);
                    }
                  }}
                  label="Metade 1"
                >
                  <MenuItem value=""><em>Selecione</em></MenuItem>
                  {getFlavorProductsForHalfAndHalf(halfAndHalfProduct, halfAndHalfBaseVariation).map((p) => {
                    let displayPrice = parseFloat(p.value || 0);
                    if (halfAndHalfBaseVariation && p.variations && p.variations.length > 0) {
                      const firstVariation = p.variations[0];
                      const option = firstVariation?.options?.find((o) => o.label === halfAndHalfBaseVariation);
                      if (option) displayPrice = parseFloat(option.value || 0);
                    }
                    return (
                      <MenuItem key={p.id} value={String(p.id)}>
                        {p.name} - R$ {displayPrice.toFixed(2).replace(".", ",")}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined" margin="dense" style={{ marginTop: 16 }}>
                <InputLabel>Metade 2</InputLabel>
                <Select
                  value={halfAndHalfHalf2}
                  onChange={(e) => {
                    setHalfAndHalfHalf2(e.target.value);
                    // Pré-selecionar a variação que corresponde ao baseVariationLabel (como no PublicMenuForm)
                    const selectedProduct = orderProducts.find((p) => p.id === parseInt(e.target.value, 10));
                    if (selectedProduct?.variations && selectedProduct.variations.length > 0) {
                      const firstVariation = selectedProduct.variations[0];
                      // Buscar a opção que tem o mesmo label que halfAndHalfBaseVariation
                      let selectedOptionId = null;
                      if (halfAndHalfBaseVariation) {
                        const matchingOption = firstVariation?.options?.find((o) => o.label === halfAndHalfBaseVariation);
                        if (matchingOption) {
                          selectedOptionId = matchingOption.id;
                        }
                      }
                      // Se não encontrou, usar a primeira opção
                      if (!selectedOptionId && firstVariation?.options && firstVariation.options.length > 0) {
                        selectedOptionId = firstVariation.options[0].id;
                      }
                      setHalfAndHalfHalf2Variation(selectedOptionId);
                    } else {
                      setHalfAndHalfHalf2Variation(null);
                    }
                  }}
                  label="Metade 2"
                >
                  <MenuItem value=""><em>Selecione</em></MenuItem>
                  {getFlavorProductsForHalfAndHalf(halfAndHalfProduct, halfAndHalfBaseVariation).map((p) => {
                    let displayPrice = parseFloat(p.value || 0);
                    if (halfAndHalfBaseVariation && p.variations && p.variations.length > 0) {
                      const firstVariation = p.variations[0];
                      const option = firstVariation?.options?.find((o) => o.label === halfAndHalfBaseVariation);
                      if (option) displayPrice = parseFloat(option.value || 0);
                    }
                    return (
                      <MenuItem key={p.id} value={String(p.id)}>
                        {p.name} - R$ {displayPrice.toFixed(2).replace(".", ",")}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                label="Quantidade"
                type="number"
                value={halfAndHalfQty}
                onChange={(e) => setHalfAndHalfQty(e.target.value)}
                inputProps={{ min: 1 }}
                variant="outlined"
                margin="dense"
                fullWidth
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHalfAndHalfDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleAddHalfAndHalfLine} color="primary" variant="contained" disabled={!halfAndHalfHalf1 || !halfAndHalfHalf2 || halfAndHalfHalf1 === halfAndHalfHalf2}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <MesaModal
        open={mesaModalOpen}
        onClose={handleCloseMesaModal}
        mesa={selectedMesa}
        onSuccess={fetchMesas}
        initialType={mesaModalInitialType}
      />
      <MesaOcuparModal
        open={ocuparModalOpen}
        onClose={() => {
          setOcuparModalOpen(false);
          setSelectedMesa(null);
        }}
        mesa={selectedMesa}
        onSuccess={fetchMesas}
      />
      <MesaBulkCreateModal
        open={mesaBulkModalOpen}
        onClose={handleCloseBulkModal}
        onSuccess={fetchMesas}
      />
      <MesaPrintQRModal
        open={printAllQRModalOpen}
        onClose={() => setPrintAllQRModalOpen(false)}
      />
      <ConfirmationModal
        title="Excluir mesa"
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setMesaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      >
        Tem certeza que deseja excluir a mesa {mesaToDelete?.number || mesaToDelete?.name}?
      </ConfirmationModal>

      <LiberarMesaModal
        open={liberarModalOpen}
        mesa={mesaParaLiberar}
        onClose={() => {
          setLiberarModalOpen(false);
          setMesaParaLiberar(null);
        }}
        onSuccess={fetchMesas}
      />

      <ConfirmationModal
        title="Apagar mesas selecionadas"
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
      >
        Tem certeza que deseja apagar {selectedMesas.size} mesa(s)? Esta ação não pode ser desfeita.
      </ConfirmationModal>

      <ConfirmationModal
        title="Liberar mesas selecionadas"
        open={bulkLiberarModalOpen}
        onClose={() => setBulkLiberarModalOpen(false)}
        onConfirm={handleBulkLiberar}
      >
        Tem certeza que deseja liberar {selectedMesas.size} mesa(s)?
      </ConfirmationModal>

      {(() => {
        const formSlug = cardapioSlug;
        if (!formSlug) return null;
        const cardapioUrl = `${window.location.origin}/f/${formSlug}`;
        return (
          <Dialog open={cardapioQRModalOpen} onClose={() => setCardapioQRModalOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle>QR Code - Cardápio</DialogTitle>
            <DialogContent>
              <Box ref={cardapioQRRef} display="flex" flexDirection="column" alignItems="center">
                <QRCode value={cardapioUrl} size={220} level="M" renderAs="canvas" />
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 16, wordBreak: "break-all", textAlign: "center" }}>
                  {cardapioUrl}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(cardapioUrl).then(() => toast.success("Link copiado!"));
                  }
                }}
                color="primary"
              >
                Copiar link
              </Button>
              <Button
                onClick={() => {
                  const canvas = cardapioQRRef.current?.querySelector("canvas");
                  if (canvas) {
                    const link = document.createElement("a");
                    link.download = "qr-cardapio.png";
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }
                }}
                color="primary"
                variant="contained"
              >
                Baixar QR
              </Button>
              <Button onClick={() => setCardapioQRModalOpen(false)}>Fechar</Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      <OrderNotificationPopup
        open={notificationOpen}
        order={notificationOrder}
        onView={() => {
          setNotificationOpen(false);
          if (notificationOrder) {
            handleOpenPendingOrderDetails(notificationOrder);
          }
        }}
        onClose={() => {
          setNotificationOpen(false);
          setNotificationOrder(null);
        }}
      />

      {/* Modal de lista de pedidos pendentes */}
      <Dialog
        open={pendingOrdersModalOpen}
        onClose={() => setPendingOrdersModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Pedidos Pendentes ({pendingOrders.length})</DialogTitle>
        <DialogContent dividers>
          {pendingOrders.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center" style={{ padding: 16 }}>
              Nenhum pedido pendente
            </Typography>
          ) : (
            <List>
              {pendingOrders.map((order) => {
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
                const total = getOrderTotal(order);
                const mesaNumber = order.metadata?.tableNumber || order.metadata?.tableId || "N/A";
                return (
                  <ListItem
                    key={order.id}
                    button
                    onClick={() => {
                      setPendingOrdersModalOpen(false);
                      handleOpenPendingOrderDetails(order);
                    }}
                  >
                    <ListItemText
                      primary={`Pedido ${order.protocol || `#${order.id}`}`}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            Mesa: {mesaNumber} • Total: R$ {total.toFixed(2).replace(".", ",")}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            {order.responderName || "Cliente"} • {order.responderPhone || "Sem telefone"}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingOrdersModalOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de detalhes do pedido pendente (similar ao Kanban) */}
      <Dialog
        open={pendingOrderDetailsModalOpen}
        onClose={handleClosePendingOrderDetails}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Pedido {selectedPendingOrder?.protocol || (selectedPendingOrder?.id ? `#${selectedPendingOrder.id}` : "")}
        </DialogTitle>
        <DialogContent dividers>
          {selectedPendingOrder && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Cliente
              </Typography>
              <Typography variant="body1" style={{ fontWeight: 600 }}>
                {selectedPendingOrder.responderName || "Sem nome"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedPendingOrder.responderPhone || "Sem número"}
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Tipo
                </Typography>
                <Typography variant="body2">
                  {selectedPendingOrder.metadata?.orderType === "delivery" ? "Delivery" : "Mesa"}
                  {selectedPendingOrder.metadata?.tableNumber != null && (() => {
                    const tableNumber = String(selectedPendingOrder.metadata.tableNumber).trim();
                    const tableNumberLower = tableNumber.toLowerCase();
                    const cleanTableNumber = tableNumberLower.startsWith("mesa ") 
                      ? tableNumber.substring(5) 
                      : tableNumberLower.startsWith("comanda ")
                      ? tableNumber.substring(8)
                      : tableNumber;
                    return ` • ${cleanTableNumber}`;
                  })()}
                </Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Itens
                </Typography>
                <List dense disablePadding>
                  {(selectedPendingOrder.metadata?.menuItems || []).map((item, idx) => {
                    const observations = item.observations || item.observation || item.obs || "";
                    return (
                      <ListItem key={idx} disableGutters style={{ paddingTop: 0, paddingBottom: observations ? 8 : 4 }}>
                        <ListItemText
                          primary={`${item.quantity}x ${item.productName || "Item"}`}
                          secondary={observations ? (
                            <Typography variant="caption" color="textSecondary" style={{ fontStyle: "italic", marginTop: 4 }}>
                              Obs: {observations}
                            </Typography>
                          ) : null}
                        />
                        <Typography variant="body2">
                          R$ {((Number(item.quantity) || 0) * (Number(item.productValue) || 0)).toFixed(2).replace(".", ",")}
                        </Typography>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
              {/* Campos adicionais do formulário (observações) */}
              {selectedPendingOrder.answers && selectedPendingOrder.answers.length > 0 && (() => {
                const excludedAutoFieldTypes = ["name", "phone"];
                const additionalAnswers = selectedPendingOrder.answers.filter((answer) => {
                  const field = answer.field;
                  if (!field) return false;
                  if (field.metadata?.autoFieldType && excludedAutoFieldTypes.includes(field.metadata.autoFieldType)) {
                    return false;
                  }
                  const labelLower = (field.label || "").toLowerCase();
                  if (labelLower.includes("tipo") && labelLower.includes("pedido")) {
                    return false;
                  }
                  if (!answer.answer || String(answer.answer).trim() === "") {
                    return false;
                  }
                  return true;
                });
                
                if (additionalAnswers.length === 0) return null;
                
                return (
                  <>
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Observações / Informações Adicionais
                      </Typography>
                      <List dense disablePadding>
                        {additionalAnswers.map((answer, idx) => {
                          const field = answer.field;
                          const fieldLabel = field?.label || `Campo ${idx + 1}`;
                          const answerValue = answer.answer || "";
                          return (
                            <ListItem key={idx} disableGutters style={{ paddingTop: 0, paddingBottom: 4 }}>
                              <ListItemText
                                primary={fieldLabel}
                                secondary={
                                  <Typography variant="body2" color="textSecondary" style={{ fontStyle: "italic" }}>
                                    {answerValue}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Box>
                    <Divider style={{ margin: "12px 0" }} />
                  </>
                );
              })()}
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Status atual:{" "}
                  <strong style={{ color: (getStagesForOrder(selectedPendingOrder).find((s) => s.id === getOrderStatus(selectedPendingOrder)) || {}).color }}>
                    {getStagesForOrder(selectedPendingOrder).find((s) => s.id === getOrderStatus(selectedPendingOrder))?.label || getOrderStatus(selectedPendingOrder)}
                  </strong>
                </Typography>
                <Typography variant="h6" color="primary">
                  R$ {(() => {
                    const metadata = selectedPendingOrder.metadata || {};
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
          <Button onClick={handleClosePendingOrderDetails}>Fechar</Button>
          {selectedPendingOrder && getNextStage(selectedPendingOrder) && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleProximaEtapaPendingOrder}
            >
              Próxima etapa ({getNextStage(selectedPendingOrder)?.label})
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default Mesas;
