import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ReceiptIcon from "@material-ui/icons/Receipt";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";
import KitchenIcon from "@material-ui/icons/Kitchen";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ViewListIcon from "@material-ui/icons/ViewList";
import AppsIcon from "@material-ui/icons/Apps";
import SearchIcon from "@material-ui/icons/Search";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import LiberarMesaModal from "../../components/LiberarMesaModal";
import ReciboPdvModal from "../../components/ReciboPdvModal";
import useCompanyModules from "../../hooks/useCompanyModules";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  normalizeMesaSearch,
  getOcupanteNome,
  mesaMatchesSearch,
} from "../../helpers/mesaSearch";

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
    gridTemplateColumns: "repeat(auto-fill, minmax(156px, 1fr))",
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
  mesaCardOcupanteWrap: {
    marginTop: theme.spacing(0.75),
    padding: theme.spacing(0.75, 1),
    borderRadius: 8,
    backgroundColor: theme.palette.type === "dark"
      ? "rgba(255,255,255,0.1)"
      : "rgba(15,23,42,0.06)",
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)"}`,
  },
  mesaCardOcupanteLabel: {
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  mesaCardOcupante: {
    fontSize: "0.95rem",
    fontWeight: 800,
    lineHeight: 1.25,
    color: theme.palette.type === "dark" ? "#f8fafc" : theme.palette.text.primary,
  },
  sidebarClienteBox: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 10,
    background: theme.palette.type === "dark"
      ? "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(14,165,233,0.15) 100%)"
      : "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(14,165,233,0.08) 100%)",
    border: `2px solid ${secondaryMain}55`,
  },
  sidebarClienteLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.25),
  },
  sidebarClienteName: {
    fontWeight: 800,
    fontSize: "1.15rem",
    lineHeight: 1.3,
    color: theme.palette.type === "dark" ? "#f8fafc" : theme.palette.text.primary,
  },
  searchHint: {
    marginTop: theme.spacing(0.5),
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
  quickBtnSecondary: {
    background: secondaryMain,
    color: theme.palette.primary?.contrastText || "#fff",
    "&:hover": { backgroundColor: secondaryMain, opacity: 0.9 },
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
  // Venda direta
  vendaDiretaLayout: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
  },
  vendaDiretaProducts: {
    flex: 1,
    minWidth: 0,
    overflow: "auto",
    padding: theme.spacing(2),
  },
  vendaDiretaProductGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: theme.spacing(1.5),
  },
  vendaDiretaProductCard: {
    cursor: "pointer",
    padding: theme.spacing(1.5),
    borderRadius: 12,
    border: `2px solid ${theme.palette.divider}`,
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: primaryMain,
      boxShadow: theme.shadows[2],
    },
  },
  vendaDiretaProductListItem: {
    cursor: "pointer",
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(0.5),
    padding: theme.spacing(1, 1.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.15s ease",
    "&:hover": {
      borderColor: primaryMain,
      background: theme.palette.type === "dark" ? "rgba(255,255,255,0.04)" : `${primaryMain}08`,
    },
  },
  productVariationBadge: {
    fontSize: "0.68rem",
    padding: "1px 5px",
    borderRadius: 4,
    background: theme.palette.type === "dark" ? "rgba(255,255,255,0.12)" : `${primaryMain}18`,
    color: primaryMain,
    fontWeight: 700,
    marginLeft: theme.spacing(0.5),
    whiteSpace: "nowrap",
  },
  productGroupHeader: {
    fontWeight: 800,
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: theme.palette.text.secondary,
    padding: theme.spacing(1.5, 0, 0.5, 0),
  },
  vendaDiretaToolbar: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    flexWrap: "wrap",
  },
  vendaDiretaCart: {
    width: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_WIDTH,
    display: "flex",
    flexDirection: "column",
    borderLeft: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    overflow: "hidden",
  },
  vendaDiretaCartTitle: {
    padding: theme.spacing(2),
    borderBottom: `2px solid ${theme.palette.divider}`,
    fontWeight: 700,
  },
  vendaDiretaCartList: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    padding: theme.spacing(1),
  },
  vendaDiretaCartFooter: {
    padding: theme.spacing(2),
    borderTop: `2px solid ${theme.palette.divider}`,
  },
  vendaDiretaCartRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [liberarModalOpen, setLiberarModalOpen] = useState(false);
  const [novosMesaCount, setNovosMesaCount] = useState(0);
  const [novosDeliveryCount, setNovosDeliveryCount] = useState(0);
  const [mainTab, setMainTab] = useState(0);
  // Venda direta PDV
  const [modoVendaDireta, setModoVendaDireta] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState([]);
  // Listagem de produtos: "grid" | "list"
  const [productViewMode, setProductViewMode] = useState("list");
  // Pesquisa de produtos
  const [productSearch, setProductSearch] = useState("");
  // Variações: produto aguardando seleção
  const [variationDialogProduct, setVariationDialogProduct] = useState(null);
  const [selectedVariationOptionId, setSelectedVariationOptionId] = useState(null);
  const [reciboPdvOpen, setReciboPdvOpen] = useState(false);
  const [reciboPdvData, setReciboPdvData] = useState(null);
  const [finalizando, setFinalizando] = useState(false);
  const [pagamentoHibrido, setPagamentoHibrido] = useState(false);
  const [pagamentos, setPagamentos] = useState([]);
  const [valorAtual, setValorAtual] = useState("");
  const [meioPagamento, setMeioPagamento] = useState("dinheiro");
  const [divisaoPartes, setDivisaoPartes] = useState(2);

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

  const searchNormalized = useMemo(
    () => normalizeMesaSearch(searchQuery),
    [searchQuery]
  );

  const filteredMesas = useMemo(() => {
    if (!searchNormalized) return mesas;
    return mesas.filter((mesa) => mesaMatchesSearch(mesa, searchNormalized));
  }, [mesas, searchNormalized]);

  const handleBuscar = (e) => {
    if (e?.key && e.key !== "Enter") return;
    const raw = searchQuery?.trim();
    if (!raw) return;

    if (filteredMesas.length === 1) {
      setSelectedMesa(filteredMesas[0]);
      setSearchQuery("");
      return;
    }

    if (filteredMesas.length > 1) {
      toast.info(`${filteredMesas.length} contas encontradas. Refine a busca ou clique na conta desejada.`);
      return;
    }

    const num = raw;
    setLoading(true);
    const tryType = (type) =>
      api.get("/mesas/by-identifier", { params: { number: num, type } });
    tryType("comanda")
      .then(({ data }) => {
        if (data?.status !== "ocupada") {
          toast.error("Mesa/comanda não está ocupada.");
          return;
        }
        setSelectedMesa(data);
        setSearchQuery("");
      })
      .catch(() =>
        tryType("mesa")
          .then(({ data }) => {
            if (data?.status !== "ocupada") {
              toast.error("Mesa/comanda não está ocupada.");
              return;
            }
            setSelectedMesa(data);
            setSearchQuery("");
          })
          .catch(() => toast.error("Nenhuma conta encontrada para essa busca."))
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

  // Venda direta: carregar produtos ao entrar no modo
  useEffect(() => {
    if (!modoVendaDireta || !hasLanchonetes) return;
    setLoadingProducts(true);
    api
      .get("/products", { params: { pageNumber: 1, isMenuProduct: true } })
      .then(({ data }) => setProducts(data.products || []))
      .catch((err) => {
        toastError(err);
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  }, [modoVendaDireta, hasLanchonetes]);

  const addToCart = (product, optionId = null) => {
    const hasVariations = product.variations && product.variations.length > 0;
    // Se tem variações e nenhuma foi passada, abrir diálogo de seleção
    if (hasVariations && !optionId) {
      const firstOptionId = product.variations[0]?.options?.[0]?.id ?? null;
      setSelectedVariationOptionId(firstOptionId);
      setVariationDialogProduct(product);
      return;
    }
    let value = Number(product.value) || 0;
    let displayName = product.name || "";
    if (hasVariations && optionId) {
      const variation = product.variations[0];
      const option = variation?.options?.find((o) => o.id === optionId);
      if (option) {
        value = Number(option.value) || 0;
        displayName = `${product.name} - ${option.label}`;
      }
    }
    // Chave única considera productId + optionId para variações
    const cartKey = optionId ? `${product.id}_${optionId}` : String(product.id);
    setCart((prev) => {
      const found = prev.find((c) => c.cartKey === cartKey);
      if (found) {
        return prev.map((c) =>
          c.cartKey === cartKey ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          cartKey,
          productId: product.id,
          optionId: optionId || null,
          productName: displayName,
          productValue: value,
          quantity: 1,
        },
      ];
    });
  };

  const handleConfirmVariation = () => {
    if (variationDialogProduct) {
      addToCart(variationDialogProduct, selectedVariationOptionId);
    }
    setVariationDialogProduct(null);
    setSelectedVariationOptionId(null);
  };

  const updateCartQty = (cartKey, delta) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.cartKey === cartKey ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, c) => sum + (Number(c.productValue) || 0) * (c.quantity || 0), 0),
    [cart]
  );

  const totalPagoPdv = (pagamentos || []).reduce((s, p) => s + Number(p.valor || 0), 0);
  const restantePdv = cartTotal - totalPagoPdv;

  const handlePagarPdv = () => {
    const v = Number(String(valorAtual || "").replace(",", ".")) || 0;
    if (v <= 0) {
      toast.error("Informe o valor a pagar.");
      return;
    }
    if (v > restantePdv + 0.01) {
      toast.error("Valor maior que o restante.");
      return;
    }
    setPagamentos((prev) => [...prev, { metodo: meioPagamento, valor: v }]);
    setValorAtual("");
  };

  const handleRemoverPagamentoPdv = (index) => {
    setPagamentos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalizarVendaDireta = async () => {
    if (cart.length === 0) return;
    if (pagamentoHibrido) {
      if (pagamentos.length === 0) {
        toast.error("Adicione ao menos um pagamento.");
        return;
      }
      if (restantePdv > 0.01) {
        toast.error("Total pago deve ser igual ou maior que o total. Restante: R$ " + restantePdv.toFixed(2));
        return;
      }
    }
    setFinalizando(true);
    try {
      const itens = cart.map((c) => ({
        productName: c.productName,
        quantity: c.quantity,
        productValue: Number(c.productValue) || 0,
      }));
      let meiosPagamento = null;
      if (pagamentoHibrido) {
        meiosPagamento = pagamentos.map((p) => ({ metodo: p.metodo, valor: Number(p.valor) }));
      } else {
        meiosPagamento = [{ metodo: meioPagamento, valor: cartTotal }];
      }
      const { data } = await api.post("/pdv/venda", { itens, total: cartTotal, meiosPagamento });
      setReciboPdvData({
        mesa: null,
        cliente: null,
        pedidos: [
          {
            id: data.id,
            protocol: "PDV",
            menuItems: data.itens || itens,
            total: data.total,
          },
        ],
        total: data.total,
        meiosPagamento: data.meiosPagamento || meiosPagamento,
      });
      setReciboPdvOpen(true);
      setCart([]);
      setPagamentos([]);
      setValorAtual("");
    } catch (err) {
      toastError(err);
    } finally {
      setFinalizando(false);
    }
  };

  const handleCloseReciboPdv = () => {
    setReciboPdvOpen(false);
    setReciboPdvData(null);
  };

  const handleSairVendaDireta = () => {
    setCart([]);
    setModoVendaDireta(false);
    setPagamentoHibrido(false);
    setPagamentos([]);
    setValorAtual("");
    setMeioPagamento("dinheiro");
    setProductSearch("");
  };

  // Produtos filtrados pela pesquisa
  const filteredProducts = useMemo(() => {
    const q = (productSearch || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) => {
      const name = (p.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const group = (p.grupo || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return name.includes(q) || group.includes(q);
    });
  }, [products, productSearch]);

  // Produtos agrupados por grupo
  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((p) => {
      const g = p.grupo || "Outros";
      if (!groups[g]) groups[g] = [];
      groups[g].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredProducts]);

  const tipoLabel = selectedMesa?.type === "comanda" ? "Comanda" : "Mesa";
  const numeroLabel = selectedMesa?.name || selectedMesa?.number || selectedMesa?.id;
  const ocupanteSelecionado =
    resumo?.cliente?.name?.trim() ||
    getOcupanteNome(selectedMesa) ||
    "";

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <div className={classes.root}>
      {/* Top bar mínima: título + sair */}
      <header className={classes.topBar}>
        <Typography className={classes.topBarTitle}>
          <ReceiptIcon style={{ fontSize: 28 }} />
          PDV {modoVendaDireta ? "— Nova venda" : ""}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {modoVendaDireta && (
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={handleSairVendaDireta}
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.7)" }}
              variant="outlined"
            >
              Fechar venda
            </Button>
          )}
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
        </Box>
      </header>

      {modoVendaDireta ? (
        <div className={classes.vendaDiretaLayout}>
          <div className={classes.vendaDiretaProducts}>
            {/* Toolbar: pesquisa + toggle de vista */}
            <div className={classes.vendaDiretaToolbar}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Pesquisar produto ou grupo…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ flex: 1, minWidth: 180 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="disabled" />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton
                size="small"
                title="Vista em lista"
                onClick={() => setProductViewMode("list")}
                color={productViewMode === "list" ? "primary" : "default"}
              >
                <ViewListIcon />
              </IconButton>
              <IconButton
                size="small"
                title="Vista em grade"
                onClick={() => setProductViewMode("grid")}
                color={productViewMode === "grid" ? "primary" : "default"}
              >
                <AppsIcon />
              </IconButton>
            </div>

            {loadingProducts ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Typography color="textSecondary" style={{ padding: 16 }}>
                {productSearch ? `Nenhum produto encontrado para "${productSearch}".` : "Nenhum produto no cardápio."}
              </Typography>
            ) : productViewMode === "grid" ? (
              /* ── Vista grade ──────────────────────────────── */
              <>
                {groupedProducts.map(([group, items]) => (
                  <div key={group}>
                    <Typography className={classes.productGroupHeader}>{group}</Typography>
                    <div className={classes.vendaDiretaProductGrid}>
                      {items.map((product) => {
                        const hasVariations = product.variations && product.variations.length > 0;
                        const displayPrice = hasVariations
                          ? (() => {
                              const opts = product.variations[0]?.options || [];
                              if (opts.length === 0) return null;
                              const min = Math.min(...opts.map((o) => Number(o.value) || 0));
                              const max = Math.max(...opts.map((o) => Number(o.value) || 0));
                              return min === max
                                ? `R$ ${min.toFixed(2)}`
                                : `R$ ${min.toFixed(2)} – ${max.toFixed(2)}`;
                            })()
                          : `R$ ${Number(product.value ?? 0).toFixed(2)}`;
                        return (
                          <Paper
                            key={product.id}
                            className={classes.vendaDiretaProductCard}
                            elevation={0}
                            onClick={() => addToCart(product)}
                          >
                            <Typography variant="subtitle2" style={{ fontWeight: 700 }} noWrap>
                              {product.name || "Produto"}
                              {hasVariations && (
                                <span className={classes.productVariationBadge}>var.</span>
                              )}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {displayPrice}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              /* ── Vista lista (padrão) ─────────────────────── */
              <>
                {groupedProducts.map(([group, items]) => (
                  <div key={group}>
                    <Typography className={classes.productGroupHeader}>{group}</Typography>
                    {items.map((product) => {
                      const hasVariations = product.variations && product.variations.length > 0;
                      const displayPrice = hasVariations
                        ? (() => {
                            const opts = product.variations[0]?.options || [];
                            if (opts.length === 0) return "—";
                            const min = Math.min(...opts.map((o) => Number(o.value) || 0));
                            const max = Math.max(...opts.map((o) => Number(o.value) || 0));
                            return min === max
                              ? `R$ ${min.toFixed(2)}`
                              : `R$ ${min.toFixed(2)} – ${max.toFixed(2)}`;
                          })()
                        : `R$ ${Number(product.value ?? 0).toFixed(2)}`;
                      return (
                        <div
                          key={product.id}
                          className={classes.vendaDiretaProductListItem}
                          onClick={() => addToCart(product)}
                        >
                          <Box flex={1} minWidth={0} display="flex" alignItems="center">
                            <Typography variant="body2" style={{ fontWeight: 600 }} noWrap>
                              {product.name || "Produto"}
                            </Typography>
                            {hasVariations && (
                              <span className={classes.productVariationBadge}>variações</span>
                            )}
                          </Box>
                          <Typography variant="body2" color="primary" style={{ fontWeight: 700, whiteSpace: "nowrap", marginLeft: 12 }}>
                            {displayPrice}
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>
          <aside className={classes.vendaDiretaCart}>
            <Typography className={classes.vendaDiretaCartTitle}>
              Carrinho {cart.length > 0 && `(${cart.reduce((s, c) => s + c.quantity, 0)} itens)`}
            </Typography>
            <div className={classes.vendaDiretaCartList}>
              {cart.length === 0 ? (
                <Typography variant="body2" color="textSecondary" style={{ padding: 16 }}>
                  Adicione produtos ao carrinho.
                </Typography>
              ) : (
                cart.map((item) => (
                  <div key={item.cartKey} className={classes.vendaDiretaCartRow}>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" noWrap>{item.productName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        R$ {Number(item.productValue || 0).toFixed(2)} × {item.quantity}
                        {" = "}
                        <strong>R$ {(Number(item.productValue || 0) * item.quantity).toFixed(2)}</strong>
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Button
                        size="small"
                        onClick={() => updateCartQty(item.cartKey, -1)}
                        style={{ minWidth: 32, padding: 4 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </Button>
                      <Typography variant="body2" style={{ minWidth: 24, textAlign: "center" }}>
                        {item.quantity}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => updateCartQty(item.cartKey, 1)}
                        style={{ minWidth: 32, padding: 4 }}
                      >
                        <AddIcon fontSize="small" />
                      </Button>
                      <Button
                        size="small"
                        onClick={() => removeFromCart(item.cartKey)}
                        style={{ minWidth: 32, padding: 4 }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </Button>
                    </Box>
                  </div>
                ))
              )}
            </div>
            <div className={classes.vendaDiretaCartFooter}>
              <Typography variant="h6" style={{ marginBottom: 8 }}>
                Total: R$ {cartTotal.toFixed(2)}
              </Typography>
              <Box mb={1}>
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <FormControl variant="outlined" size="small" style={{ minWidth: 120 }} disabled={pagamentoHibrido && restantePdv <= 0}>
                    <InputLabel>Meio</InputLabel>
                    <Select value={meioPagamento} onChange={(e) => setMeioPagamento(e.target.value)} label="Meio" disabled={finalizando}>
                      <MenuItem value="dinheiro">Dinheiro</MenuItem>
                      <MenuItem value="cartao">Cartão</MenuItem>
                      <MenuItem value="pix">Pix</MenuItem>
                      <MenuItem value="outro">Outro</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    size="small"
                    color="primary"
                    variant={pagamentoHibrido ? "contained" : "outlined"}
                    onClick={() => setPagamentoHibrido((v) => !v)}
                    disabled={finalizando}
                  >
                    {pagamentoHibrido ? "Híbrido" : "Híbrido?"}
                  </Button>
                </Box>

                {pagamentoHibrido && cart.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="body2" color="textSecondary">
                      Restante: R$ {restantePdv.toFixed(2)}
                    </Typography>
                    {pagamentos.length > 0 && (
                      <Box mt={0.5}>
                        {pagamentos.map((p, idx) => (
                          <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 2 }}>
                            <Typography variant="caption">{p.metodo}: R$ {Number(p.valor).toFixed(2)}</Typography>
                            <Button size="small" style={{ minWidth: 0, padding: "0 6px" }} onClick={() => handleRemoverPagamentoPdv(idx)}>
                              Remover
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {restantePdv > 0.01 && (
                      <Box mt={0.5} display="flex" flexWrap="wrap" alignItems="center" style={{ gap: 6 }}>
                        <TextField
                          label="Valor"
                          variant="outlined"
                          size="small"
                          type="number"
                          inputProps={{ min: 0, step: 0.01 }}
                          value={valorAtual}
                          onChange={(e) => setValorAtual(e.target.value)}
                          style={{ width: 90 }}
                        />
                        <Button size="small" variant="contained" color="primary" onClick={handlePagarPdv}>
                          Pagar
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => setValorAtual(restantePdv.toFixed(2))}>
                          Restante
                        </Button>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 1, style: { width: 36 } }}
                          value={divisaoPartes}
                          onChange={(e) => setDivisaoPartes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          style={{ width: 52 }}
                        />
                        <Button size="small" variant="outlined" onClick={() => setValorAtual((restantePdv / divisaoPartes).toFixed(2))}>
                          Dividir
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}

                {!pagamentoHibrido && (
                  <Box mt={0.5} />
                )}
              </Box>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                disabled={
                  cart.length === 0 ||
                  finalizando ||
                  (pagamentoHibrido && cart.length > 0 && restantePdv > 0.01)
                }
                startIcon={<ReceiptIcon />}
                onClick={handleFinalizarVendaDireta}
                style={{ fontWeight: 700 }}
              >
                {finalizando ? "Finalizando…" : "Finalizar venda"}
              </Button>
            </div>
          </aside>
        </div>
      ) : (
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
                label="Mesa, comanda ou cliente"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleBuscar}
                placeholder="Número ou nome do ocupante"
                inputProps={{ style: { fontSize: "1rem" } }}
              />
              {searchNormalized && (
                <Typography className={classes.searchHint}>
                  {filteredMesas.length === 0
                    ? "Nenhuma conta ocupada corresponde. Enter tenta buscar pelo número."
                    : `${filteredMesas.length} conta(s) encontrada(s)`}
                </Typography>
              )}
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
                    ) : filteredMesas.length === 0 ? (
                      <Box gridColumn="1 / -1" textAlign="center" py={4}>
                        <Typography color="textSecondary">
                          Nenhum resultado para &quot;{searchQuery.trim()}&quot;.
                        </Typography>
                      </Box>
                    ) : (
                      filteredMesas.map((mesa) => {
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
                            {getOcupanteNome(mesa) ? (
                              <Box className={classes.mesaCardOcupanteWrap}>
                                <Typography className={classes.mesaCardOcupanteLabel}>
                                  Cliente
                                </Typography>
                                <Typography
                                  className={classes.mesaCardOcupante}
                                  noWrap
                                  title={getOcupanteNome(mesa)}
                                >
                                  {getOcupanteNome(mesa)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography className={classes.mesaCardMeta} style={{ marginTop: 4 }}>
                                Sem cliente vinculado
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
              <>
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
                {ocupanteSelecionado && (
                  <Box className={classes.sidebarClienteBox}>
                    <Typography className={classes.sidebarClienteLabel}>
                      Cliente na conta
                    </Typography>
                    <Typography className={classes.sidebarClienteName}>
                      {ocupanteSelecionado}
                    </Typography>
                  </Box>
                )}
              </>
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
      )}

      {/* Barra inferior: acessos rápidos + totalizador fixo */}
      <footer className={classes.bottomBar}>
        <div className={classes.bottomBarQuick}>
          {!modoVendaDireta && (
            <Button
              className={`${classes.quickBtn} ${classes.quickBtnSecondary}`}
              variant="contained"
              startIcon={<AddShoppingCartIcon />}
              onClick={() => setModoVendaDireta(true)}
            >
              Nova venda
            </Button>
          )}
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
              {ocupanteSelecionado && (
                <Typography
                  variant="body2"
                  style={{ fontWeight: 700, maxWidth: 180 }}
                  noWrap
                  title={ocupanteSelecionado}
                >
                  {ocupanteSelecionado}
                </Typography>
              )}
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
      <ReciboPdvModal
        open={reciboPdvOpen}
        onClose={handleCloseReciboPdv}
        data={reciboPdvData}
        mesa={null}
      />

      {/* Diálogo de seleção de variação */}
      <Dialog
        open={Boolean(variationDialogProduct)}
        onClose={() => { setVariationDialogProduct(null); setSelectedVariationOptionId(null); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {variationDialogProduct?.name} — Selecione a variação
        </DialogTitle>
        <DialogContent>
          {variationDialogProduct?.variations?.[0]?.options?.map((opt) => {
            const selected = selectedVariationOptionId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedVariationOptionId(opt.id)}
                style={{
                  cursor: "pointer",
                  padding: "10px 14px",
                  marginBottom: 6,
                  borderRadius: 8,
                  border: `2px solid ${selected ? "#0EA5E9" : "#e2e8f0"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: selected ? "rgba(14,165,233,0.07)" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <Typography variant="body2" style={{ fontWeight: selected ? 700 : 400 }}>
                  {opt.label}
                </Typography>
                <Typography variant="body2" style={{ fontWeight: 700, color: "#0EA5E9" }}>
                  R$ {Number(opt.value || 0).toFixed(2)}
                </Typography>
              </div>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setVariationDialogProduct(null); setSelectedVariationOptionId(null); }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedVariationOptionId}
            onClick={handleConfirmVariation}
          >
            Adicionar ao carrinho
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Pdv;
