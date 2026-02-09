import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import PersonIcon from "@material-ui/icons/Person";
import { toast } from "react-toastify";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import useAuth from "../../hooks/useAuth.js";
import { useContext } from "react";
import { SocketContext } from "../../context/Socket/SocketContext";
import ContactModal from "../../components/ContactModal";
import LiberarMesaModal from "../../components/LiberarMesaModal";

const filter = createFilterOptions({ trim: true });

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: 960,
    margin: "0 auto",
    paddingBottom: 24,
  },
  mesaGrid: {
    marginTop: theme.spacing(2),
  },
  mesaCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
    border: `2px solid ${theme.palette.divider}`,
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  mesaCardLivre: {
    borderLeftColor: "#22C55E",
    borderLeftWidth: 4,
  },
  mesaCardOcupada: {
    borderLeftColor: "#F59E0B",
    borderLeftWidth: 4,
  },
  mesaCardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
  mesaNumber: {
    fontWeight: 700,
    fontSize: "1.25rem",
    marginBottom: theme.spacing(0.5),
  },
  mesaStatus: {
    fontSize: "0.8rem",
    marginBottom: theme.spacing(1),
  },
  mesaCliente: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: theme.spacing(2),
  },
  productCard: {
    marginBottom: theme.spacing(1),
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
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
  orderTabPanel: {
    paddingTop: theme.spacing(1),
  },
  summaryRow: {
    marginTop: 0,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  orderLineRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const Garcom = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useAuth();
  const socketManager = useContext(SocketContext);
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();
  const [mesas, setMesas] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [mesaParaPedido, setMesaParaPedido] = useState(null);
  const [contactParaPedido, setContactParaPedido] = useState(null);
  const [orderLines, setOrderLines] = useState([]);
  const [orderDialogTab, setOrderDialogTab] = useState(0);
  const [variablePriceDialogOpen, setVariablePriceDialogOpen] = useState(false);
  const [variablePriceProduct, setVariablePriceProduct] = useState(null);
  const [variablePriceQty, setVariablePriceQty] = useState(1);
  const [variablePriceUnit, setVariablePriceUnit] = useState("");

  const [clienteDialogOpen, setClienteDialogOpen] = useState(false);
  const [mesaParaOcupar, setMesaParaOcupar] = useState(null);
  const [liberarModalOpen, setLiberarModalOpen] = useState(false);
  const [mesaParaLiberar, setMesaParaLiberar] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchContact, setSearchContact] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newContactInitial, setNewContactInitial] = useState({});

  const [halfAndHalfItems, setHalfAndHalfItems] = useState([]);
  const [halfAndHalfModalOpen, setHalfAndHalfModalOpen] = useState(false);
  const [halfAndHalfModalProduct, setHalfAndHalfModalProduct] = useState(null);
  const [halfAndHalfModalHalf1, setHalfAndHalfModalHalf1] = useState("");
  const [halfAndHalfModalHalf2, setHalfAndHalfModalHalf2] = useState("");
  const [halfAndHalfModalQty, setHalfAndHalfModalQty] = useState(1);
  /** Para produtos com variações: productId -> variationOptionId selecionado */
  const [selectedVariationOption, setSelectedVariationOption] = useState({});
  /** Variação selecionada do produto base quando abre o modal meio a meio */
  const [halfAndHalfModalBaseVariation, setHalfAndHalfModalBaseVariation] = useState(null);

  const [mesaStatusFilter, setMesaStatusFilter] = useState("");
  const [orderProductSearch, setOrderProductSearch] = useState("");

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
    }
  }, [hasLanchonetes, modulesLoading, history]);

  useEffect(() => {
    if (!hasLanchonetes) return;
    const load = async () => {
      setLoading(true);
      try {
        const [mesasRes, formsRes] = await Promise.all([
          api.get("/mesas"),
          api.get("/forms?formType=cardapio"),
        ]);
        setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
        const forms = formsRes.data?.forms || [];
        const firstForm = forms[0];
        setForm(firstForm || null);
        if (firstForm?.slug) {
          const { data } = await api.get(`/public/forms/${firstForm.slug}/products`);
          setProducts(data.products || []);
        }
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hasLanchonetes]);

  useEffect(() => {
    const companyId = user?.companyId;
    const socket = companyId ? socketManager?.getSocket?.(companyId) : null;
    if (!socket) return;
    const handler = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "ocupar" || data.action === "liberar") {
        const mesa = data.mesa;
        setMesas((prev) => {
          const idx = prev.findIndex((m) => m.id === mesa.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = mesa;
            return next;
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
    };
    socket.on(`company-${companyId}-mesa`, handler);
    return () => socket.off(`company-${companyId}-mesa`, handler);
  }, [socketManager, user?.companyId]);

  useEffect(() => {
    if (!clienteDialogOpen || searchContact.length < 2) {
      setContacts([]);
      return;
    }
    setLoadingContacts(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/contacts", { params: { searchParam: searchContact } });
        setContacts(data.contacts || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoadingContacts(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [clienteDialogOpen, searchContact]);

  const getOrderLineCount = (productId) => {
    const product = products.find((p) => p.id === productId);
    const selectedOptionId = product?.variations && product.variations.length > 0 
      ? selectedVariationOption[productId] 
      : null;
    
    return orderLines
      .filter((l) => {
        if (selectedOptionId) {
          return l.productId === productId && l.optionId === selectedOptionId;
        }
        return l.productId === productId && l.optionId == null;
      })
      .reduce((a, l) => a + l.quantity, 0);
  };

  const handleQuantityChange = (productId, delta, product) => {
    const p = product || products.find((x) => x.id === productId);
    
    // Se o produto tem variações, verificar se uma variação foi selecionada
    if (delta === 1 && p?.variations && p.variations.length > 0) {
      const selectedOptionId = selectedVariationOption[productId];
      if (!selectedOptionId) {
        toast.error("Selecione uma variação de preço primeiro");
        return;
      }
    }
    
    if (delta === 1 && p?.variablePrice && (!p?.variations || p.variations.length === 0)) {
      setVariablePriceProduct(p);
      setVariablePriceQty(1);
      setVariablePriceUnit(Number(p?.value) ?? 0);
      setVariablePriceDialogOpen(true);
      return;
    }
    
    // Obter optionId se houver variação selecionada
    const optionId = p?.variations && p.variations.length > 0 ? selectedVariationOption[productId] : null;
    
    setOrderLines((prev) => {
      if (delta === 1) {
        // Para produtos com variações, usar optionId na chave
        const key = optionId ? `${productId}_${optionId}` : productId;
        const idx = prev.findIndex((l) => {
          if (optionId) {
            return l.productId === productId && l.optionId === optionId;
          }
          return l.productId === productId && l.productValue == null && l.optionId == null;
        });
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          return next;
        }
        return [...prev, { productId, quantity: 1, optionId }];
      }
      const rev = prev.map((l, i) => ({ l, i })).filter((x) => {
        if (optionId) {
          return x.l.productId === productId && x.l.optionId === optionId;
        }
        return x.l.productId === productId && x.l.optionId == null;
      });
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

  const handleRemoveOrderLine = (lineIndex) => {
    setOrderLines((prev) => prev.filter((_, i) => i !== lineIndex));
  };

  const getFlavorProductsForHalfAndHalf = (baseProduct, baseVariationLabel = null) => {
    if (!baseProduct) return [];
    const grupoFilter = baseProduct.halfAndHalfGrupo || baseProduct.grupo || null;
    let filtered = products.filter((p) => {
      if (grupoFilter) return (p.grupo || "Outros") === grupoFilter;
      return true;
    });

    // Se há uma variação base selecionada, filtrar apenas produtos com variação da mesma sigla
    if (baseVariationLabel && baseProduct.variations && baseProduct.variations.length > 0) {
      filtered = filtered.filter((p) => {
        // Se o produto não tem variações, não incluir
        if (!p.variations || p.variations.length === 0) return false;
        
        // Verificar se alguma opção da variação tem a mesma sigla (label)
        const firstVariation = p.variations[0];
        if (!firstVariation || !firstVariation.options) return false;
        
        return firstVariation.options.some((opt) => opt.label === baseVariationLabel);
      });
    }

    return filtered;
  };

  const computeHalfAndHalfUnitValue = (base, half1, half2, half1OptionId = null, half2OptionId = null) => {
    if (!base || !half1 || !half2) return 0;
    const rule = base.halfAndHalfPriceRule || "max";
    
    // Obter valores das variações se disponíveis, senão usar valor base
    let v1 = parseFloat(half1.value) || 0;
    let v2 = parseFloat(half2.value) || 0;
    
    // Se há optionIds, usar os valores das variações
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
      // Para fixed, usar a variação selecionada do produto base se disponível
      if (base.variations && base.variations.length > 0) {
        const baseOptionId = selectedVariationOption[base.id];
        if (baseOptionId) {
          const firstVariation = base.variations[0];
          const option = firstVariation?.options?.find((o) => o.id === baseOptionId);
          if (option) return parseFloat(option.value) || 0;
        }
      }
      return parseFloat(base.value) || 0;
    }
    if (rule === "average") return (v1 + v2) / 2;
    return Math.max(v1, v2);
  };

  const openHalfAndHalfModal = (product) => {
    setHalfAndHalfModalProduct(product);
    setHalfAndHalfModalHalf1(String(product.id));
    setHalfAndHalfModalHalf2("");
    setHalfAndHalfModalQty(1);
    
    // Capturar a variação selecionada do produto base
    let baseVariationLabel = null;
    if (product.variations && product.variations.length > 0) {
      const selectedOptionId = selectedVariationOption[product.id];
      if (selectedOptionId) {
        const firstVariation = product.variations[0];
        const option = firstVariation?.options?.find((o) => o.id === selectedOptionId);
        if (option) {
          baseVariationLabel = option.label;
        }
      }
    }
    setHalfAndHalfModalBaseVariation(baseVariationLabel);
    
    setHalfAndHalfModalOpen(true);
  };

  const addHalfAndHalfToCart = () => {
    if (!halfAndHalfModalProduct || !halfAndHalfModalHalf1 || !halfAndHalfModalHalf2 || halfAndHalfModalHalf1 === halfAndHalfModalHalf2) {
      toast.error("Selecione dois sabores diferentes");
      return;
    }
    
    const half1ProductId = parseInt(halfAndHalfModalHalf1, 10);
    const half2ProductId = parseInt(halfAndHalfModalHalf2, 10);
    
    // Encontrar os produtos selecionados
    const half1Product = products.find((p) => p.id === half1ProductId);
    const half2Product = products.find((p) => p.id === half2ProductId);
    
    // Obter os optionIds das variações selecionadas (se houver)
    let half1OptionId = null;
    let half2OptionId = null;
    
    if (half1Product?.variations && half1Product.variations.length > 0 && halfAndHalfModalBaseVariation) {
      const firstVariation = half1Product.variations[0];
      const option = firstVariation?.options?.find((o) => o.label === halfAndHalfModalBaseVariation);
      if (option) half1OptionId = option.id;
    }
    
    if (half2Product?.variations && half2Product.variations.length > 0 && halfAndHalfModalBaseVariation) {
      const firstVariation = half2Product.variations[0];
      const option = firstVariation?.options?.find((o) => o.label === halfAndHalfModalBaseVariation);
      if (option) half2OptionId = option.id;
    }
    
    const qty = Math.max(1, parseInt(halfAndHalfModalQty, 10) || 1);
    setHalfAndHalfItems((prev) => [
      ...prev,
      {
        baseProductId: halfAndHalfModalProduct.id,
        half1ProductId,
        half2ProductId,
        half1OptionId,
        half2OptionId,
        quantity: qty,
      },
    ]);
    setHalfAndHalfModalOpen(false);
    setHalfAndHalfModalProduct(null);
    setHalfAndHalfModalBaseVariation(null);
  };

  const removeHalfAndHalfItem = (index) => {
    setHalfAndHalfItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotalItems = () =>
    orderLines.reduce((a, l) => a + l.quantity, 0) + halfAndHalfItems.reduce((a, i) => a + i.quantity, 0);

  const calculateTotal = () => {
    let total = orderLines.reduce((acc, line) => {
      const p = products.find((x) => x.id === line.productId);
      let unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
      
      // Se há optionId, usar o valor da variação
      if (line.optionId && p?.variations && p.variations.length > 0) {
        const firstVariation = p.variations[0];
        const option = firstVariation?.options?.find((o) => o.id === line.optionId);
        if (option) {
          unit = parseFloat(option.value) || 0;
        }
      }
      
      return acc + line.quantity * unit;
    }, 0);
    halfAndHalfItems.forEach((item) => {
      const base = products.find((p) => p.id === item.baseProductId);
      const half1 = products.find((p) => p.id === item.half1ProductId);
      const half2 = products.find((p) => p.id === item.half2ProductId);
      total += computeHalfAndHalfUnitValue(base, half1, half2, item.half1OptionId, item.half2OptionId) * item.quantity;
    });
    return total;
  };

  const handleContactCreated = (contact) => {
    setSelectedContact(contact);
    setContactModalOpen(false);
    setNewContactInitial({});
  };

  const handleLiberar = (mesa) => {
    setMesaParaLiberar(mesa);
    setLiberarModalOpen(true);
  };

  const fetchMesasForLiberar = async () => {
    try {
      const mesasRes = await api.get("/mesas");
      setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
    } catch (err) {
      toastError(err);
    }
  };

  const abrirPedido = (mesa) => {
    if (mesa.status === "ocupada") {
      const contact = mesa.contact || (mesa.contactId ? { id: mesa.contactId, name: "Cliente", number: "" } : null);
      if (!contact) {
        toast.error("Mesa ocupada sem contato vinculado. Libere e ocupe novamente.");
        return;
      }
      setMesaParaPedido(mesa);
      setContactParaPedido(contact);
      setOrderLines([]);
      setHalfAndHalfItems([]);
      setOrderDialogTab(0);
      setOrderDialogOpen(true);
    } else {
      setMesaParaOcupar(mesa);
      setSelectedContact(null);
      setSearchContact("");
      setClienteDialogOpen(true);
    }
  };

  const handleConfirmarCliente = async () => {
    if (!selectedContact) {
      toast.error("Selecione ou crie o cliente");
      return;
    }
    if (!mesaParaOcupar) return;
    setSubmitting(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: selectedContact.id,
        status: "open",
        reuseOpenTicket: true,
      });
      await api.put(`/mesas/${mesaParaOcupar.id}/ocupar`, {
        contactId: selectedContact.id,
        ticketId: ticket?.id,
        transferir: true,
      });
      toast.success("Mesa ocupada");
      setClienteDialogOpen(false);
      const mesasRes = await api.get("/mesas");
      setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
      const mesaAtualizada = (mesasRes.data || []).find((m) => m.id === mesaParaOcupar.id) || {
        ...mesaParaOcupar,
        status: "ocupada",
        contactId: selectedContact.id,
        contact: selectedContact,
        ticketId: ticket?.id,
      };
      setMesaParaPedido(mesaAtualizada);
      setContactParaPedido(selectedContact);
      setOrderLines([]);
      setHalfAndHalfItems([]);
      setOrderDialogTab(0);
      setOrderDialogOpen(true);
      setMesaParaOcupar(null);
      setSelectedContact(null);
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitOrder = async () => {
    if (!form?.slug || !mesaParaPedido || !contactParaPedido) return;
    if (getTotalItems() === 0) {
      toast.error("Adicione itens ao pedido");
      return;
    }
    for (const line of orderLines) {
      const p = products.find((x) => x.id === line.productId);
      // Se tem variações, verificar se uma foi selecionada
      if (p?.variations && p.variations.length > 0) {
        if (!line.optionId) {
          toast.error(`Selecione uma variação para "${p.name}".`);
          return;
        }
      } else if (p?.variablePrice && (line.productValue == null || line.productValue < 0)) {
        toast.error(`Informe o valor para "${p.name}".`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const normalMenuItems = orderLines.map((line) => {
        const p = products.find((x) => x.id === line.productId);
        let unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
        
        // Se há optionId, usar o valor da variação
        if (line.optionId && p?.variations && p.variations.length > 0) {
          const firstVariation = p.variations[0];
          const option = firstVariation?.options?.find((o) => o.id === line.optionId);
          if (option) {
            unit = parseFloat(option.value) || 0;
          }
        }
        
        const productName = line.optionId && p?.variations && p.variations.length > 0
          ? (() => {
              const firstVariation = p.variations[0];
              const option = firstVariation?.options?.find((o) => o.id === line.optionId);
              return option ? `${p?.name} - ${option.label}` : p?.name;
            })()
          : p?.name;
        
        return {
          productId: line.productId,
          quantity: line.quantity,
          productName: productName || p?.name,
          productValue: unit,
          optionId: line.optionId || null,
          grupo: p?.grupo || "Outros",
        };
      });
      const halfMenuItems = halfAndHalfItems.map((item) => {
        const baseProduct = products.find((p) => p.id === item.baseProductId);
        const baseOptionId = baseProduct?.variations && baseProduct.variations.length > 0
          ? (selectedVariationOption[item.baseProductId] ?? null)
          : null;
        return {
          type: "halfAndHalf",
          productId: item.baseProductId,
          quantity: item.quantity,
          half1ProductId: item.half1ProductId,
          half2ProductId: item.half2ProductId,
          half1OptionId: item.half1OptionId || null,
          half2OptionId: item.half2OptionId || null,
          baseOptionId: baseOptionId,
          grupo: baseProduct?.grupo || "Outros",
        };
      });
      const menuItems = [...normalMenuItems, ...halfMenuItems];
      const labelLower = (l) => (l || "").trim().toLowerCase();
      const fields = form.fields || [];
      const autoFields = fields.filter(
        (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
      ) || [];
      const answers = [];
      autoFields.forEach((f) => {
        const val = f.metadata?.autoFieldType === "name"
          ? (contactParaPedido?.name || "Cliente")
          : f.metadata?.autoFieldType === "phone"
          ? (contactParaPedido?.number || "")
          : "";
        answers.push({ fieldId: f.id, answer: f.metadata?.autoFieldType === "name" ? val : (contactParaPedido?.number || "") });
      });
      const nomeField = fields.find(
        (f) => f.isRequired && (f.metadata?.autoFieldType === "name" || (labelLower(f.label).includes("nome") && !labelLower(f.label).includes("sobrenome")))
      );
      if (nomeField && !answers.some((a) => a.fieldId === nomeField.id)) {
        answers.push({ fieldId: nomeField.id, answer: contactParaPedido?.name || "Cliente" });
      }
      const tipoPedidoField = (form.fields || []).find(
        (f) => f.isRequired && labelLower(f.label).includes("tipo") && labelLower(f.label).includes("pedido")
      );
      if (tipoPedidoField && !answers.some((a) => a.fieldId === tipoPedidoField.id)) {
        answers.push({ fieldId: tipoPedidoField.id, answer: "Mesa" });
      }
      const metadata = {
        tableId: mesaParaPedido.id,
        tableNumber: mesaParaPedido.number || mesaParaPedido.name,
        orderType: "mesa",
        garcomName: user?.name || "",
      };
      await api.post(`/public/forms/${form.slug}/submit`, {
        answers,
        menuItems,
        metadata,
        responderName: contactParaPedido?.name || "Cliente",
        responderPhone: contactParaPedido?.number || "",
      });
      toast.success("Pedido enviado!");
      setOrderLines([]);
      setHalfAndHalfItems([]);
      setOrderDialogOpen(false);
      setMesaParaPedido(null);
      setContactParaPedido(null);
      const mesasRes = await api.get("/mesas");
      setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const groups = [...new Set(products.map((p) => p.grupo || "Outros"))].sort();

  const filteredMesas = mesas.filter((m) => {
    if (!mesaStatusFilter) return true;
    if (mesaStatusFilter === "ocupada") return m.status === "ocupada";
    if (mesaStatusFilter === "livre") return m.status === "livre";
    return true;
  });

  const filterProductsBySearch = (list) => {
    if (!orderProductSearch.trim()) return list;
    const q = orderProductSearch.trim().toLowerCase();
    return list.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
  };

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <MainContainer>
      <Box className={classes.root}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : mesas.length === 0 ? (
          <Paper style={{ padding: 24, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Nenhuma mesa cadastrada.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/lanchonetes?tab=3")}
            >
              Ir para Mesas
            </Button>
          </Paper>
        ) : (
          <>
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={8} marginBottom={2}>
              <Typography variant="body2" color="textSecondary">
                Clique em &quot;Fazer pedido&quot; na mesa. Se estiver livre, informe o cliente primeiro.
              </Typography>
              <FormControl size="small" style={{ minWidth: 140 }}>
                <InputLabel>Exibir mesas</InputLabel>
                <Select
                  value={mesaStatusFilter}
                  onChange={(e) => setMesaStatusFilter(e.target.value)}
                  label="Exibir mesas"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="ocupada">Ocupadas</MenuItem>
                  <MenuItem value="livre">Livres</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Grid container spacing={2} className={classes.mesaGrid}>
            {filteredMesas.length === 0 ? (
              <Grid item xs={12}>
                <Paper style={{ padding: 24, textAlign: "center" }}>
                  <Typography color="textSecondary">
                    {mesas.length === 0 ? "Nenhuma mesa cadastrada." : "Nenhuma mesa encontrada com o filtro selecionado."}
                  </Typography>
                </Paper>
              </Grid>
            ) : filteredMesas.map((mesa) => (
              <Grid item xs={12} sm={6} md={4} key={mesa.id}>
                <Card
                  className={`${classes.mesaCard} ${
                    mesa.status === "ocupada" ? classes.mesaCardOcupada : classes.mesaCardLivre
                  }`}
                  variant="outlined"
                >
                  <CardContent className={classes.mesaCardContent}>
                    <Typography className={classes.mesaNumber}>
                      <EventSeatIcon style={{ fontSize: "1.2rem", verticalAlign: "middle", marginRight: 4 }} />
                      {mesa.type === "comanda" ? "Comanda" : "Mesa"} {mesa.number || mesa.name || mesa.id}
                    </Typography>
                    <Typography
                      className={classes.mesaStatus}
                      color={mesa.status === "ocupada" ? "secondary" : "primary"}
                    >
                      {mesa.status === "ocupada" ? "Ocupada" : "Livre"}
                    </Typography>
                    {mesa.status === "ocupada" && (mesa.contact?.name || mesa.contact?.number) && (
                      <Typography className={classes.mesaCliente}>
                        <PersonIcon style={{ fontSize: "1rem" }} />
                        {mesa.contact?.name || mesa.contact?.number || "Cliente"}
                      </Typography>
                    )}
                    <Box flex={1} />
                    <Box display="flex" flexDirection="column" style={{ marginTop: 8 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => abrirPedido(mesa)}
                      >
                        Fazer pedido
                      </Button>
                      {mesa.status === "ocupada" && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={(e) => { e.stopPropagation(); handleLiberar(mesa); }}
                          style={{ marginTop: 8 }}
                        >
                          Liberar mesa
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            </Grid>
          </>
        )}
      </Box>

      <Dialog
        open={orderDialogOpen}
        onClose={() => {
          if (!submitting) {
            setOrderDialogOpen(false);
            setMesaParaPedido(null);
            setContactParaPedido(null);
            setOrderLines([]);
            setHalfAndHalfItems([]);
            setOrderProductSearch("");
          }
        }}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Pedido - Mesa {mesaParaPedido?.number || mesaParaPedido?.name}
          {contactParaPedido?.name && (
            <Typography variant="body2" color="textSecondary">
              Cliente: {contactParaPedido.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent className={classes.orderDialogContent}>
          <TextField
            size="small"
            placeholder="Buscar produto..."
            value={orderProductSearch}
            onChange={(e) => setOrderProductSearch(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            style={{ marginBottom: 12 }}
          />
          <Tabs
            value={orderDialogTab}
            onChange={(_, v) => setOrderDialogTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.orderTabs}
          >
            {groups.map((grupo, idx) => (
              <Tab key={grupo} label={grupo} id={`order-tab-${idx}`} aria-controls={`order-tabpanel-${idx}`} />
            ))}
          </Tabs>
          {groups.map((grupo, idx) => (
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
                  {filterProductsBySearch(products.filter((p) => (p.grupo || "Outros") === grupo))
                    .map((product) => {
                      const isHalfAndHalf = product.allowsHalfAndHalf === true;
                    const hasVariations = product.variations && product.variations.length > 0;
                    const firstVariation = hasVariations ? product.variations[0] : null;
                    const selectedOptionId = hasVariations ? (selectedVariationOption[product.id] ?? firstVariation?.options?.[0]?.id) : null;
                    const displayPrice = hasVariations 
                      ? (() => {
                          const option = firstVariation?.options?.find((o) => o.id === selectedOptionId);
                          return option ? parseFloat(option.value || 0) : parseFloat(product.value || 0);
                        })()
                      : (product.variablePrice ? null : parseFloat(product.value || 0));
                      return (
                        <Card key={product.id} className={classes.productCard} variant="outlined">
                          <CardContent style={{ display: "flex", flexDirection: "column", padding: "12px 16px" }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom={hasVariations ? 1 : 0}>
                              <Box>
                                <Typography variant="body1">{product.name}</Typography>
                                <Typography variant="body2" color="primary">
                                  {product.variablePrice && !hasVariations
                                    ? "Preço variável"
                                    : displayPrice != null
                                    ? `R$ ${displayPrice.toFixed(2).replace(".", ",")}`
                                    : "Preço variável"}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" flexWrap="wrap">
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
                                <Box className={classes.quantityControl}>
                                  <IconButton size="small" onClick={() => handleQuantityChange(product.id, -1, product)}>
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <Typography style={{ minWidth: 28, textAlign: "center", fontWeight: 600 }}>
                                    {getOrderLineCount(product.id)}
                                  </Typography>
                                  <IconButton size="small" onClick={() => handleQuantityChange(product.id, 1, product)}>
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                            {hasVariations && firstVariation && (
                              <FormControl variant="outlined" size="small" fullWidth style={{ marginTop: 8 }}>
                                <InputLabel>{firstVariation.name}</InputLabel>
                                <Select
                                  value={selectedOptionId ?? ""}
                                  onChange={(e) => setSelectedVariationOption((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))}
                                  label={firstVariation.name}
                                >
                                  {firstVariation.options.map((opt) => (
                                    <MenuItem key={opt.id} value={opt.id}>
                                      {opt.label} - R$ {parseFloat(opt.value || 0).toFixed(2).replace(".", ",")}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </Box>
              )}
            </div>
          ))}
          {(orderLines.length > 0 || halfAndHalfItems.length > 0) && (
            <Box px={2} pt={1} pb={0}>
              <Typography variant="subtitle2" gutterBottom>
                Itens do pedido
              </Typography>
              {orderLines.map((line, idx) => {
                const p = products.find((x) => x.id === line.productId);
                let unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
                
                // Se há optionId, usar o valor da variação
                if (line.optionId && p?.variations && p.variations.length > 0) {
                  const firstVariation = p.variations[0];
                  const option = firstVariation?.options?.find((o) => o.id === line.optionId);
                  if (option) {
                    unit = parseFloat(option.value) || 0;
                  }
                }
                
                const productName = line.optionId && p?.variations && p.variations.length > 0
                  ? (() => {
                      const firstVariation = p.variations[0];
                      const option = firstVariation?.options?.find((o) => o.id === line.optionId);
                      return option ? `${p?.name || "Produto"} - ${option.label}` : (p?.name || "Produto");
                    })()
                  : (p?.name || "Produto");
                
                const subtotal = line.quantity * unit;
                return (
                  <Box key={`n-${idx}`} className={classes.orderLineRow}>
                    <Box>
                      <Typography variant="body2">
                        {productName} • {line.quantity}x R$ {unit.toFixed(2).replace(".", ",")} = R$ {subtotal.toFixed(2).replace(".", ",")}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoveOrderLine(idx)} aria-label="Remover item">
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
              {halfAndHalfItems.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                    Itens meio a meio
                  </Typography>
                  {halfAndHalfItems.map((item, idx) => {
                    const base = products.find((p) => p.id === item.baseProductId);
                    const h1 = products.find((p) => p.id === item.half1ProductId);
                    const h2 = products.find((p) => p.id === item.half2ProductId);
                    const unitVal = computeHalfAndHalfUnitValue(base, h1, h2, item.half1OptionId, item.half2OptionId);
                    const label = base && h1 && h2 ? `${base.name}: ${h1.name} / ${h2.name}` : "Meio a meio";
                    return (
                      <Box key={`h-${idx}`} className={classes.orderLineRow} display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">
                          {item.quantity}x {label} — R$ {(unitVal * item.quantity).toFixed(2).replace(".", ",")}
                        </Typography>
                        <IconButton size="small" onClick={() => removeHalfAndHalfItem(idx)} aria-label="Remover meio a meio">
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions className={classes.summaryRow}>
          <Typography variant="h6">
            Total: R$ {(Number(calculateTotal()) || 0).toFixed(2).replace(".", ",")} • {getTotalItems()} itens
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={submitOrder}
            disabled={getTotalItems() === 0 || submitting}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : "Enviar pedido"}
          </Button>
        </DialogActions>
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

      <Dialog open={halfAndHalfModalOpen} onClose={() => setHalfAndHalfModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Meio a meio - {halfAndHalfModalProduct?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" size="small" style={{ marginTop: 8 }}>
            <InputLabel>Metade 1</InputLabel>
            <Select
              value={halfAndHalfModalHalf1}
              onChange={(e) => setHalfAndHalfModalHalf1(e.target.value)}
              label="Metade 1"
            >
              <MenuItem value=""><em>Selecione</em></MenuItem>
              {halfAndHalfModalProduct && getFlavorProductsForHalfAndHalf(halfAndHalfModalProduct, halfAndHalfModalBaseVariation).map((p) => {
                // Obter o preço da variação se disponível, senão usar valor base
                let displayPrice = parseFloat(p.value || 0);
                if (halfAndHalfModalBaseVariation && p.variations && p.variations.length > 0) {
                  const firstVariation = p.variations[0];
                  const option = firstVariation?.options?.find((o) => o.label === halfAndHalfModalBaseVariation);
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
          <FormControl fullWidth variant="outlined" size="small" style={{ marginTop: 16 }}>
            <InputLabel>Metade 2</InputLabel>
            <Select
              value={halfAndHalfModalHalf2}
              onChange={(e) => setHalfAndHalfModalHalf2(e.target.value)}
              label="Metade 2"
            >
              <MenuItem value=""><em>Selecione</em></MenuItem>
              {halfAndHalfModalProduct && getFlavorProductsForHalfAndHalf(halfAndHalfModalProduct, halfAndHalfModalBaseVariation).map((p) => {
                // Obter o preço da variação se disponível, senão usar valor base
                let displayPrice = parseFloat(p.value || 0);
                if (halfAndHalfModalBaseVariation && p.variations && p.variations.length > 0) {
                  const firstVariation = p.variations[0];
                  const option = firstVariation?.options?.find((o) => o.label === halfAndHalfModalBaseVariation);
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
            value={halfAndHalfModalQty}
            onChange={(e) => setHalfAndHalfModalQty(e.target.value)}
            inputProps={{ min: 1 }}
            variant="outlined"
            size="small"
            fullWidth
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHalfAndHalfModalOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={addHalfAndHalfToCart} color="primary" variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={clienteDialogOpen}
        onClose={() => {
          if (!submitting) {
            setClienteDialogOpen(false);
            setMesaParaOcupar(null);
            setSelectedContact(null);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ocupar mesa {mesaParaOcupar?.number || mesaParaOcupar?.name} - Informe o cliente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Selecione ou crie o cliente para ocupar a mesa e em seguida fazer o pedido.
          </Typography>
          <Autocomplete
            options={contacts}
            getOptionLabel={(opt) =>
              opt.isNew ? `Criar: ${opt.name}` : (opt.name ? `${opt.name} (${opt.number})` : opt.number || "")
            }
            value={selectedContact}
            onChange={(_, val) => {
              if (val?.isNew) {
                setNewContactInitial({ name: val.name });
                setContactModalOpen(true);
              } else setSelectedContact(val);
            }}
            onInputChange={(_, v) => setSearchContact(v)}
            loading={loadingContacts}
            filterOptions={(opts, params) => {
              const f = filter(opts, params);
              if (params.inputValue?.trim() && searchContact.length >= 2) {
                f.push({ name: params.inputValue.trim(), number: "", isNew: true });
              }
              return f;
            }}
            renderInput={(params) => (
              <TextField {...params} label="Buscar ou criar contato" variant="outlined" fullWidth />
            )}
          />
          <Button
            size="small"
            startIcon={<AddCircleIcon />}
            onClick={() => {
              setNewContactInitial({});
              setContactModalOpen(true);
            }}
            style={{ marginTop: 8 }}
          >
            Novo contato
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setClienteDialogOpen(false); setMesaParaOcupar(null); setSelectedContact(null); }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmarCliente}
            disabled={!selectedContact || submitting}
          >
            {submitting ? <CircularProgress size={24} /> : "Ocupar mesa e fazer pedido"}
          </Button>
        </DialogActions>
      </Dialog>

      <ContactModal
        open={contactModalOpen}
        onClose={() => { setContactModalOpen(false); setNewContactInitial({}); }}
        onSave={handleContactCreated}
        initialValues={newContactInitial}
      />

      <LiberarMesaModal
        open={liberarModalOpen}
        mesa={mesaParaLiberar}
        onClose={() => {
          setLiberarModalOpen(false);
          setMesaParaLiberar(null);
        }}
        onSuccess={fetchMesasForLiberar}
      />
    </MainContainer>
  );
};

export default Garcom;
