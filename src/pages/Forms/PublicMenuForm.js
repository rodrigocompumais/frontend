import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  makeStyles,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormGroup,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  InputAdornment,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import SearchIcon from "@material-ui/icons/Search";
import ShareIcon from "@material-ui/icons/Share";
import CloseIcon from "@material-ui/icons/Close";

import InputMask from "react-input-mask";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { isFieldVisible } from "../../utils/formUtils";
import { getFormAppearanceStyles, FONT_IMPORTS } from "../../utils/formAppearanceStyles";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "#f5f5f5",
    paddingBottom: 72,
  },
  heroBanner: {
    width: "100%",
    height: "34vh",
    minHeight: 200,
    maxHeight: 320,
    objectFit: "cover",
    backgroundColor: "#eee",
    [theme.breakpoints.down("xs")]: {
      height: "30vh",
      minHeight: 180,
      maxHeight: 260,
    },
  },
  carouselRow: {
    width: "100%",
    display: "flex",
    overflowX: "auto",
    gap: 2,
    backgroundColor: "#fff",
    borderBottom: "1px solid #eee",
    "&::-webkit-scrollbar": { height: 0 },
  },
  carouselImg: {
    height: 110,
    width: 160,
    objectFit: "cover",
    flex: "0 0 auto",
    backgroundColor: "#eee",
  },
  container: {
    maxWidth: "100%",
    width: "100%",
    margin: 0,
    flex: 1,
    padding: 0,
  },
  formPaper: {
    padding: theme.spacing(2, 3),
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    backgroundColor: "#fff",
  },
  storeBar: {
    backgroundColor: "#fff",
    padding: theme.spacing(1.5, 2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  storeLogo: {
    height: 28,
    maxWidth: 180,
    objectFit: "contain",
  },
  searchBar: {
    backgroundColor: "#fff",
    padding: theme.spacing(0, 2, 1.5),
    borderBottom: "1px solid #eee",
  },
  storeSubInfo: {
    backgroundColor: "#fff",
    padding: theme.spacing(0, 2, 1.5),
    color: "#666",
    fontSize: "0.875rem",
    borderBottom: "1px solid #eee",
  },
  promoBanner: {
    margin: theme.spacing(1.5, 2, 0),
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: theme.spacing(1.5, 2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    color: "#1b5e20",
    fontWeight: 700,
  },
  contentSection: {
    backgroundColor: "#fff",
    padding: theme.spacing(2),
    marginTop: theme.spacing(1.5),
  },
  stickyTabs: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backgroundColor: "#fff",
    borderBottom: "1px solid #eee",
  },
  header: {
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
  logo: {
    maxWidth: 120,
    maxHeight: 56,
    marginBottom: theme.spacing(1),
  },
  tabsContainer: {
    marginBottom: 0,
    borderBottom: "none",
    minHeight: 48,
  },
  tab: {
    minWidth: "auto",
    padding: theme.spacing(1, 2),
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  productCard: {
    marginBottom: theme.spacing(2),
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    borderRadius: 12,
    overflow: "hidden",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
  },
  productImage: {
    width: 88,
    height: 88,
    objectFit: "cover",
    borderRadius: 10,
    marginRight: theme.spacing(2),
  },
  productCardContent: {
    display: "flex",
    alignItems: "flex-start",
  },
  productName: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#1a1a1a",
    marginBottom: theme.spacing(0.5),
  },
  productDescription: {
    color: "#666",
    fontSize: "0.8125rem",
    marginBottom: theme.spacing(1),
  },
  productValue: {
    fontWeight: 700,
    fontSize: "1rem",
    color: "#1a1a1a",
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  quantityInput: {
    width: 72,
  },
  fieldContainer: {
    marginBottom: theme.spacing(2),
  },
  summaryCard: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  submitButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: 10,
  },
  successMessage: {
    padding: theme.spacing(3),
    textAlign: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "#fff",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 1100,
    paddingBottom: "env(safe-area-inset-bottom, 0)",
  },
  bottomNavItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: theme.spacing(1),
    cursor: "pointer",
    color: "#666",
    "&.active": {
      color: "#1a1a1a",
      fontWeight: 600,
    },
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: theme.spacing(1.5),
  },
  mostOrderedScroll: {
    display: "flex",
    gap: theme.spacing(2),
    overflowX: "auto",
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(2),
    "&::-webkit-scrollbar": { height: 6 },
    "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: 3 },
  },
  mostOrderedCard: {
    flex: "0 0 150px",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
  },
  mostOrderedImage: {
    width: "100%",
    height: 110,
    objectFit: "cover",
    backgroundColor: "#eee",
  },
  mostOrderedCardBody: {
    padding: theme.spacing(1),
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  mostOrderedName: {
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: 4,
    lineHeight: 1.2,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  mostOrderedPrice: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#1a1a1a",
    marginTop: "auto",
  },
}));

const PublicMenuForm = ({
  form,
  slug: formSlug,
  initialProducts,
  initialMesaFromQR,
  initialOrderToken,
  initialMesaValue,
}) => {
  const classes = useStyles();
  const location = useLocation();
  const { slug: urlSlug } = useParams();
  // Atenção: para rotas públicas, o identificador agora é o publicId (não o slug "legível").
  const slug = form?.publicId || formSlug || urlSlug;

  const pieceAgainEnabled = form?.settings?.enablePieceAgain === true;

  const [loading, setLoading] = useState(!initialProducts);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState(initialProducts || []);
  const [selectedItems, setSelectedItems] = useState({});
  const [activeGroup, setActiveGroup] = useState(0);
  const [view, setView] = useState("menu"); // "menu" | "checkout"
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [groups, setGroups] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [mesaValue, setMesaValue] = useState(initialMesaValue ?? "");
  const [mesaFromQR, setMesaFromQR] = useState(initialMesaFromQR ?? null);
  const [loadingMesa, setLoadingMesa] = useState(false);
  const [orderToken, setOrderToken] = useState(initialOrderToken ?? null);
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
  /** IDs dos produtos mais pedidos (ordem de popularidade) */
  const [mostOrderedProductIds, setMostOrderedProductIds] = useState([]);

  /** Peça de novo (por telefone) */
  const [pieceAgainProductIds, setPieceAgainProductIds] = useState([]);
  const [pieceAgainLoading, setPieceAgainLoading] = useState(false);
  const [pieceAgainPhone, setPieceAgainPhone] = useState("");
  const [pieceAgainModalOpen, setPieceAgainModalOpen] = useState(false);
  const [pieceAgainPhoneInput, setPieceAgainPhoneInput] = useState("");

  // Busca (cardápio)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // Âncora para rolar até o começo dos itens ao trocar grupo
  const itemsStartRef = useRef(null);

  const appStyles = form ? getFormAppearanceStyles(form) : null;
  const fieldVariant = appStyles?.fieldVariant || "outlined";

  const PIECE_AGAIN_COOKIE_DAYS = 30;
  const getPieceAgainCookieKey = () => `compuchat_piece_again_${slug || "unknown"}`;
  const setCookie = (name, value, days) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
  };
  const getCookie = (name) => {
    const cookieName = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie || "");
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1);
      if (c.indexOf(cookieName) === 0) return c.substring(cookieName.length, c.length);
    }
    return "";
  };
  const normalizePhone = (input) => {
    const digits = String(input || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("55")) {
      if (digits.length === 12) {
        const local8 = digits.slice(4);
        const first = local8[0];
        if (first === "9") return digits;
        if (first === "6" || first === "7" || first === "8") return digits.slice(0, 4) + "9" + digits.slice(4);
        return digits;
      }
      if (digits.length === 14 && digits[4] === "9" && digits[5] === "9") return digits.slice(0, 4) + digits.slice(5);
      return digits;
    }
    if (digits.length === 10) {
      const local8 = digits.slice(2);
      const first = local8[0];
      if (first === "9") return `55${digits}`;
      if (first === "6" || first === "7" || first === "8") return `55${digits.slice(0, 2)}9${digits.slice(2)}`;
      return `55${digits}`;
    }
    if (digits.length === 11) return `55${digits}`;
    return digits;
  };
  const normalizeLabelKey = (label) => String(label || "").trim().toLowerCase();
  const isSensitiveLabel = (label) =>
    /cpf|cart[aã]o|card|senha|password|cvv|cvc|token|c[oó]digo|pin/i.test(String(label || ""));

  const decodeMaybeJson = (val) => {
    if (val == null) return "";
    if (typeof val === "string" && val.startsWith("__json__:")) {
      try {
        return JSON.parse(val.replace("__json__:", ""));
      } catch {
        return val;
      }
    }
    return val;
  };

  const getFinalizeFieldsFromForm = () => {
    const all = form?.fields || [];
    return all.filter((f) => !f.metadata?.isAutoField && f.order >= 2);
  };

  const applyPrefillByLabel = (prefillByLabel) => {
    const entries = prefillByLabel && typeof prefillByLabel === "object" ? prefillByLabel : {};
    const normalizedMap = {};
    Object.keys(entries).forEach((k) => {
      normalizedMap[normalizeLabelKey(k)] = entries[k];
    });
    const finalize = getFinalizeFieldsFromForm();
    if (!finalize || finalize.length === 0) return;
    setAnswers((prev) => {
      const next = { ...prev };
      finalize.forEach((field) => {
        const key = normalizeLabelKey(field.label);
        if (!key) return;
        const val = normalizedMap[key];
        if (val === undefined || val === null || val === "") return;
        const current = next[field.id];
        const isEmpty =
          current === undefined ||
          current === null ||
          current === "" ||
          (Array.isArray(current) && current.length === 0);
        if (isEmpty) {
          next[field.id] = decodeMaybeJson(val);
        }
      });
      return next;
    });
  };

  const setAutoPhoneAnswer = (phoneValue) => {
    const phoneField = (form?.fields || []).find((f) => f.metadata?.autoFieldType === "phone");
    if (!phoneField) return;
    setAnswers((prev) => ({ ...prev, [phoneField.id]: phoneValue }));
  };
  const setAutoNameAnswer = (nameValue) => {
    const nameField = (form?.fields || []).find((f) => f.metadata?.autoFieldType === "name");
    if (!nameField) return;
    setAnswers((prev) => ({ ...prev, [nameField.id]: nameValue }));
  };

  const fetchPieceAgainData = async (phoneNormalized) => {
    if (!slug || !phoneNormalized) return;
    setPieceAgainLoading(true);
    try {
      const { data } = await api.get(`/public/forms/${slug}/repeat-data`, {
        params: { phone: phoneNormalized },
      });
      const ids = data?.productIds || [];
      setPieceAgainProductIds(Array.isArray(ids) ? ids : []);
      if (data?.prefillByLabel) {
        applyPrefillByLabel(data.prefillByLabel);
      }
      if (data?.contactName) {
        setAutoNameAnswer(String(data.contactName));
      }
    } catch (err) {
      // Não bloquear o usuário: apenas seguir sem histórico
      setPieceAgainProductIds([]);
    } finally {
      setPieceAgainLoading(false);
    }
  };

  const confirmPieceAgainPhone = async () => {
    const phoneNorm = normalizePhone(pieceAgainPhoneInput);
    if (!phoneNorm || phoneNorm.length < 10) {
      toast.error("Informe um telefone válido com DDD.");
      return;
    }
    setPieceAgainPhone(phoneNorm);
    setAutoPhoneAnswer(phoneNorm);
    try {
      const cookieKey = getPieceAgainCookieKey();
      const currentPrefill = {};
      setCookie(
        cookieKey,
        JSON.stringify({
          phone: phoneNorm,
          prefillByLabel: currentPrefill,
          savedAt: new Date().toISOString(),
        }),
        PIECE_AGAIN_COOKIE_DAYS
      );
    } catch {
      // ignore
    }
    setPieceAgainModalOpen(false);
    await fetchPieceAgainData(phoneNorm);
  };

  useEffect(() => {
    const app = form?.settings?.appearance || {};
    const fontFamily = app.fontFamily;
    if (!fontFamily || fontFamily === "inherit") return;
    const fontImport = FONT_IMPORTS[fontFamily];
    if (!fontImport) return;
    const link = document.createElement("link");
    link.href = fontImport;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, [form?.settings?.appearance?.fontFamily]);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      const filtered = initialProducts.filter((p) => !p.variablePrice || (p.variations && p.variations.length > 0));
      setProducts(filtered);
      const groupsMap = {};
      filtered.forEach((p) => {
        const g = p.grupo || "Outros";
        if (!groupsMap[g]) groupsMap[g] = [];
        groupsMap[g].push(p);
      });
      setGroups(Object.keys(groupsMap).sort());
      setLoading(false);
      return;
    }
    if (form && slug) {
      loadProducts();
    }
  }, [form, slug, initialProducts]);

  useEffect(() => {
    if (form?.settings?.showMesaField && (form.settings?.mesaFieldMode || "select") === "select" && slug) {
      api.get(`/public/forms/${slug}/mesas`).then(({ data }) => {
        setMesas(data.mesas || []);
      }).catch(() => setMesas([]));
    }
  }, [form?.settings?.showMesaField, form?.settings?.mesaFieldMode, slug]);

  useEffect(() => {
    if (!form || !slug) return;
    api.get(`/public/forms/${slug}/most-ordered`)
      .then(({ data }) => setMostOrderedProductIds(data.productIds || []))
      .catch(() => setMostOrderedProductIds([]));
  }, [form?.id, slug]);

  // Peça de novo: ler cookie e/ou solicitar telefone
  useEffect(() => {
    if (!pieceAgainEnabled || !form || !slug) return;
    const key = getPieceAgainCookieKey();
    const raw = getCookie(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const phone = normalizePhone(parsed?.phone || "");
        const name = parsed?.name || "";
        const prefill = parsed?.prefillByLabel || {};
        if (phone) {
          setPieceAgainPhone(phone);
          setPieceAgainPhoneInput(phone);
          setAutoPhoneAnswer(phone);
          if (name) setAutoNameAnswer(String(name));
          applyPrefillByLabel(prefill);
          fetchPieceAgainData(phone);
          return;
        }
      } catch {
        // ignore
      }
    }
    setPieceAgainModalOpen(true);
  }, [pieceAgainEnabled, form?.id, slug]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlMesa = searchParams.get("mesa");
    if (urlMesa) setMesaValue(urlMesa);
  }, [location.search]);

  // QR da mesa: buscar status da mesa (ocupada = não pedir nome/telefone). Passar t= para link assinado.
  // Quando initialOrderToken/initialMesaFromQR vêm do link da mesa (/mesa/:id/cardapio), não refetch.
  useEffect(() => {
    if (initialOrderToken != null && initialMesaFromQR != null) {
      if (initialMesaFromQR.status === "ocupada" && initialMesaFromQR.contact && form?.fields) {
        setAnswers((prev) => {
          const next = { ...prev };
          form.fields.forEach((field) => {
            if (field.metadata?.autoFieldType === "name" && initialMesaFromQR.contact?.name) {
              next[field.id] = initialMesaFromQR.contact.name;
            } else if (field.metadata?.autoFieldType === "phone" && initialMesaFromQR.contact?.number) {
              next[field.id] = initialMesaFromQR.contact.number;
            }
          });
          return next;
        });
      }
      return;
    }
    const searchParams = new URLSearchParams(location.search);
    const mesaId = searchParams.get("mesa");
    const t = searchParams.get("t");
    if (!form || !slug || !mesaId) {
      setMesaFromQR(null);
      setOrderToken(null);
      return;
    }
    setLoadingMesa(true);
    const params = t ? { t } : {};
    api.get(`/public/forms/${slug}/mesas/${mesaId}`, { params })
      .then(({ data }) => {
        setMesaFromQR(data);
        setMesaValue(String(data.id));
        if (data.orderToken) setOrderToken(data.orderToken);
        else setOrderToken(null);
        if (data.status === "ocupada" && data.contact && form?.fields) {
          setAnswers((prev) => {
            const next = { ...prev };
            form.fields.forEach((field) => {
              if (field.metadata?.autoFieldType === "name" && data.contact?.name) {
                next[field.id] = data.contact.name;
              } else if (field.metadata?.autoFieldType === "phone" && data.contact?.number) {
                next[field.id] = data.contact.number;
              }
            });
            return next;
          });
        }
      })
      .catch(() => {
        setMesaFromQR(null);
        setOrderToken(null);
      })
      .finally(() => setLoadingMesa(false));
  }, [form?.id, slug, location.search, initialOrderToken, initialMesaFromQR]);

  useEffect(() => {
    // Ler parâmetros da URL
    const searchParams = new URLSearchParams(location.search);
    const urlName = searchParams.get("name") || searchParams.get("nome");
    const urlPhone = searchParams.get("phone") || searchParams.get("telefone");
    
    // Preencher campos automáticos se vierem na URL
    if (form?.fields) {
      setAnswers((prev) => {
        const next = { ...prev };
        form.fields.forEach((field) => {
          if (field.metadata?.autoFieldType === "name") {
            if (urlName && (next[field.id] == null || next[field.id] === "")) {
              next[field.id] = urlName;
            }
          } else if (field.metadata?.autoFieldType === "phone") {
            if (urlPhone) {
              next[field.id] = urlPhone;
            } else if (next[field.id] == null || next[field.id] === "") {
              // Se Peça de novo estiver ativo, deixar em branco e solicitar no gate
              next[field.id] = pieceAgainEnabled ? "" : "55";
            }
          }
        });
        return next;
      });
    }
  }, [form, location.search, pieceAgainEnabled]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Buscar produtos de cardápio via rota pública usando o slug do formulário
      const { data } = await api.get(`/public/forms/${slug}/products`);

      const allProducts = data.products || [];
      const filtered = allProducts.filter((p) => !p.variablePrice || (p.variations && p.variations.length > 0));
      setProducts(filtered);

      // Agrupar produtos por grupo (apenas os exibidos, sem preço variável)
      const groupsMap = {};
      filtered.forEach((product) => {
        const grupo = product.grupo || "Outros";
        if (!groupsMap[grupo]) {
          groupsMap[grupo] = [];
        }
        groupsMap[grupo].push(product);
      });

      const groupsList = Object.keys(groupsMap).sort();
      setGroups(groupsList);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  /** Chave no carrinho: productId (sem variação) ou "productId_optionId" (com variação) */
  const getItemKey = (product) => {
    if (!product) return "";
    if (!product.variations || product.variations.length === 0) return String(product.id);
    const optionId = selectedVariationOption[product.id] ?? product.variations[0]?.options?.[0]?.id;
    return optionId != null ? `${product.id}_${optionId}` : String(product.id);
  };

  /** Resolve key para { product, productValue, productName, optionLabel } */
  const getItemDetailsByKey = (key) => {
    const product = products.find((p) => p.id === parseInt(key, 10));
    if (!product) return { product: null, productValue: 0, productName: "", optionLabel: "" };
    if (key.includes("_")) {
      const [, optionIdStr] = key.split("_");
      const optionId = parseInt(optionIdStr, 10);
      const variation = product.variations?.[0];
      const option = variation?.options?.find((o) => o.id === optionId);
      const productValue = option ? parseFloat(option.value) : parseFloat(product.value) || 0;
      const productName = option ? `${product.name} - ${option.label}` : product.name;
      return { product, productValue, productName, optionLabel: option?.label || "" };
    }
    return {
      product,
      productValue: parseFloat(product.value) || 0,
      productName: product.name || "",
      optionLabel: "",
    };
  };

  const handleQuantityChange = (key, delta) => {
    setSelectedItems((prev) => {
      const current = prev[key] || 0;
      const newQuantity = Math.max(0, current + delta);
      if (newQuantity === 0) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: newQuantity };
    });
  };

  const handleQuantityInput = (key, value) => {
    const quantity = parseInt(value) || 0;
    if (quantity <= 0) {
      setSelectedItems((prev) => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setSelectedItems((prev) => ({ ...prev, [key]: quantity }));
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Limpar erro do campo
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validar que pelo menos um produto foi selecionado (normal ou meio a meio)
    if (Object.keys(selectedItems).length === 0 && halfAndHalfItems.length === 0) {
      toast.error("Selecione pelo menos um produto");
      isValid = false;
    }

    // Obter campos de finalizar da mesma forma que são renderizados
    const allFormFields = form.fields || [];
    const finalizeFields = allFormFields.filter(
      (f) => !f.metadata?.isAutoField && f.order >= 2
    );

    // Validar campos obrigatórios de finalizar (apenas os visíveis)
    const allFormFieldsSorted = [...allFormFields].sort((a, b) => a.order - b.order);
    finalizeFields.forEach((field) => {
      if (!isFieldVisible(field, answers, allFormFieldsSorted)) return;
      if (field.isRequired) {
        const answer = answers[field.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === "string" && answer.trim() === "")) {
          newErrors[field.id] = `${field.label} é obrigatório`;
          isValid = false;
        }
      }
    });

    // Validar campos automáticos obrigatórios (nome e telefone) — dispensar se mesa ocupada (QR)
    const mesaOcupadaFromQR = mesaFromQR?.status === "ocupada";
    const autoFields = form.fields?.filter(
      (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
    ) || [];
    if (!mesaOcupadaFromQR) {
      autoFields.forEach((field) => {
        if (field.isRequired) {
          const answer = answers[field.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === "string" && answer.trim() === "")) {
            newErrors[field.id] = `${field.label} é obrigatório`;
            isValid = false;
          }
        }
      });
    }

    // Se houver erros, mostrar toast
    if (!isValid && Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("[PublicMenuForm] handleSubmit chamado", { 
      selectedItems: Object.keys(selectedItems).length, 
      totalItems: getTotalItems(),
      formId: form?.id 
    });

    const isValid = validateForm();
    if (!isValid) {
      console.log("[PublicMenuForm] Validação falhou");
      return;
    }

    console.log("[PublicMenuForm] Validação passou, iniciando envio");

    setSubmitting(true);

    try {
      // Se "Peça de novo" está ativo, garantir que temos telefone para histórico/cookies
      if (pieceAgainEnabled) {
        const phoneField = (form?.fields || []).find((f) => f.metadata?.autoFieldType === "phone");
        const rawPhone = phoneField ? (answers[phoneField.id] || pieceAgainPhone) : pieceAgainPhone;
        const phoneNorm = normalizePhone(rawPhone);
        if (!phoneNorm || phoneNorm.length < 10) {
          setPieceAgainModalOpen(true);
          setPieceAgainPhoneInput((prev) => (String(prev || "").trim() ? prev : "55"));
          toast.info("Informe seu telefone para continuar.");
          setSubmitting(false);
          return;
        }
        setPieceAgainPhone(phoneNorm);
        setAutoPhoneAnswer(phoneNorm);
      }

      // Preparar menuItems (normais + com variação + meio a meio)
      const normalMenuItems = Object.keys(selectedItems).map((key) => {
        const productId = key.includes("_") ? parseInt(key.split("_")[0], 10) : parseInt(key, 10);
        const { product, productValue, productName } = getItemDetailsByKey(key);
        return {
          productId,
          quantity: selectedItems[key],
          productName: productName || product?.name,
          productValue,
          grupo: product?.grupo || "Outros",
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

      // Atualizar cookie (30 dias): telefone + respostas por label (não sensíveis)
      if (pieceAgainEnabled) {
        const phoneField = (form?.fields || []).find((f) => f.metadata?.autoFieldType === "phone");
        const nameField = (form?.fields || []).find((f) => f.metadata?.autoFieldType === "name");
        const rawPhone = phoneField ? (answers[phoneField.id] || pieceAgainPhone) : pieceAgainPhone;
        const phoneNorm = normalizePhone(rawPhone);
        const nameVal = nameField ? (answers[nameField.id] || "") : "";
        const prefillByLabel = {};
        const finalize = getFinalizeFieldsFromForm();
        finalize.forEach((field) => {
          const label = String(field.label || "").trim();
          if (!label || isSensitiveLabel(label)) return;
          const val = answers[field.id];
          if (val === undefined || val === null || val === "") return;
          if (Array.isArray(val)) {
            if (val.length === 0) return;
            prefillByLabel[label] = "__json__:" + JSON.stringify(val);
          } else {
            const s = String(val);
            if (!s.trim()) return;
            prefillByLabel[label] = s;
          }
        });
        try {
          setCookie(
            getPieceAgainCookieKey(),
            JSON.stringify({
              phone: phoneNorm,
              name: nameVal ? String(nameVal) : "",
              prefillByLabel,
              savedAt: new Date().toISOString(),
            }),
            PIECE_AGAIN_COOKIE_DAYS
          );
        } catch {
          // ignore
        }
      }

      // Preparar answers - incluir TODOS os campos do formulário (automáticos + customizados)
      const allFormFields = form.fields || [];
      const answersArray = [];
      
      // Adicionar TODAS as respostas (automáticas e customizadas)
      allFormFields.forEach((field) => {
        const answer = answers[field.id];
        if (answer !== undefined && answer !== null && answer !== "") {
          answersArray.push({
            fieldId: field.id,
            answer: answer,
          });
        }
      });

      // Mesa ocupada (QR): preencher Nome/Telefone/Tipo de pedido obrigatórios com dados do contato da mesa
      const mesaOcupadaFromQR = mesaFromQR?.status === "ocupada" && mesaFromQR?.contact;
      if (mesaOcupadaFromQR) {
        const contact = mesaFromQR.contact;
        const labelLower = (l) => (l || "").trim().toLowerCase();
        const hasAnswer = (fieldId) => answersArray.some((a) => a.fieldId === fieldId);
        allFormFields.forEach((field) => {
          if (hasAnswer(field.id)) return;
          if (field.metadata?.autoFieldType === "name" || (field.isRequired && labelLower(field.label).includes("nome") && !labelLower(field.label).includes("sobrenome"))) {
            answersArray.push({ fieldId: field.id, answer: contact.name || "Cliente" });
          } else if (field.metadata?.autoFieldType === "phone" || (field.isRequired && (field.fieldType === "phone" || labelLower(field.label).includes("telefone")))) {
            answersArray.push({ fieldId: field.id, answer: contact.number || "Não informado" });
          }
        });
        const tipoPedidoField = allFormFields.find(
          (f) => f.isRequired && labelLower(f.label).includes("tipo") && labelLower(f.label).includes("pedido")
        );
        if (tipoPedidoField && !hasAnswer(tipoPedidoField.id)) {
          answersArray.push({ fieldId: tipoPedidoField.id, answer: "Mesa" });
        }
      }

      // Metadata com mesa e orderType (QR da mesa ou campo mesa configurado)
      const orderMetadata = getOrderMetadata();

      // Enviar formulário (orderToken garante que o pedido vá para a mesa do link assinado)
      const response = await api.post(`/public/forms/${slug}/submit`, {
        answers: answersArray,
        menuItems,
        ...(Object.keys(orderMetadata).length > 0 && { metadata: orderMetadata }),
        ...(orderToken && { orderToken }),
      });

      const customerName = answers[autoFields.find((f) => f.metadata?.autoFieldType === "name")?.id] || "";
      const mesaNumberDisplay = mesaFromQR
        ? (mesaFromQR.number || mesaFromQR.name || String(mesaFromQR.id))
        : (form.settings?.showMesaField && mesaValue
          ? ((form.settings?.mesaFieldMode || "select") === "select" ? (mesas.find((m) => m.id === parseInt(mesaValue, 10))?.number || mesaValue) : mesaValue)
          : "");
      // Preparar dados do pedido para exibição (com responsável da mesa para confirmação)
      const displayMenuItems = menuItems.map((item) => {
        if (item.type === "halfAndHalf") {
          const base = products.find((p) => p.id === item.productId);
          const half1 = products.find((p) => p.id === item.half1ProductId);
          const half2 = products.find((p) => p.id === item.half2ProductId);
          const unitVal = computeHalfAndHalfUnitValue(base, half1, half2, item.half1OptionId, item.half2OptionId);
          const productName = base && half1 && half2
            ? `${base.name} - Metade ${half1.name} / Metade ${half2.name}`
            : "Meio a meio";
          return {
            ...item,
            productName,
            productValue: unitVal,
            total: unitVal * item.quantity,
          };
        }
        return {
          ...item,
          total: (item.productValue || 0) * item.quantity,
        };
      });
      const orderMetadataForDisplay = getOrderMetadata();
      const subtotal = calculateTotal() - (orderMetadataForDisplay?.orderType === "delivery" && form?.settings?.deliveryFee ? (parseFloat(form.settings.deliveryFee) || 0) : 0);
      const deliveryFee = orderMetadataForDisplay?.orderType === "delivery" && form?.settings?.deliveryFee ? (parseFloat(form.settings.deliveryFee) || 0) : 0;
      
      const orderInfo = {
        menuItems: displayMenuItems,
        total: calculateTotal(),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        totalItems: getTotalItems(),
        customerName,
        customerPhone: answers[autoFields.find((f) => f.metadata?.autoFieldType === "phone")?.id] || "",
        responsavelMesa: customerName,
        mesaNumber: mesaNumberDisplay,
        customFields: [
          ...(mesaNumberDisplay ? [{ label: "Mesa", value: mesaNumberDisplay }] : []),
          ...finalizeFields.map((field) => ({
            label: field.label,
            value: answers[field.id] || "",
          })),
        ],
        averageDeliveryTime: form.settings?.averageDeliveryTime || "",
        orderType: orderMetadataForDisplay?.orderType || "mesa",
      };
      setOrderData(orderInfo);

      // Pedido salvo; envio WhatsApp é em segundo plano — não bloqueia a tela
      setSubmitted(true);
      if (response.data?.whatsappSent === "pending") {
        toast.info("Pedido enviado! A confirmação por WhatsApp será enviada em instantes.");
      } else if (response.data?.whatsappSent === false && response.data?.whatsappError) {
        toast.warn("Pedido salvo. " + (response.data.whatsappError || ""));
      }
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = answers[field.id] || "";
    const error = errors[field.id];
    const hasError = !!error;

    switch (field.fieldType) {
      case "text":
      case "email":
        return (
          <TextField
            fullWidth
            variant={fieldVariant}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
            required={field.isRequired}
            label={field.label}
          />
        );
      case "phone": {
        const phoneValue = field.metadata?.autoFieldType === "phone"
          ? (value || "55")
          : value;
        const digits = String(phoneValue || "").replace(/\D/g, "");
        const phoneMask = digits.length > 12 ? "55(99)99999-9999" : "55(99)9999-9999";
        return (
          <InputMask
            mask={phoneMask}
            maskChar={null}
            value={phoneValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          >
            {(inputProps) => (
              <TextField
                {...inputProps}
                fullWidth
                variant={fieldVariant}
                type="text"
                placeholder="55(99)99999-9999"
                error={hasError}
                helperText={error || field.helpText}
                required={field.isRequired}
                label={field.label}
                InputProps={{
                  startAdornment: field.metadata?.autoFieldType === "phone" ? (
                    <InputAdornment position="start">+</InputAdornment>
                  ) : null,
                }}
              />
            )}
          </InputMask>
        );
      }
      case "number":
        return (
          <TextField
            fullWidth
            variant={fieldVariant}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
            required={field.isRequired}
            label={field.label}
          />
        );

      case "textarea":
        return (
          <TextField
            fullWidth
            variant={fieldVariant}
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
            required={field.isRequired}
            label={field.label}
          />
        );

      case "select":
        return (
          <FormControl fullWidth variant={fieldVariant} error={hasError} required={field.isRequired}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              label={field.label}
            >
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {(error || field.helpText) && (
              <FormHelperText>{error || field.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case "radio":
        return (
          <FormControl component="fieldset" fullWidth error={hasError} required={field.isRequired}>
            <Typography variant="subtitle2" style={{ marginBottom: 8 }}>
              {field.label}
            </Typography>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {(field.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio color="primary" />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {(error || field.helpText) && (
              <FormHelperText>{error || field.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case "checkbox": {
        // Se houver opções: tratar como múltipla seleção (array)
        const options = field.options || [];
        if (options.length > 0) {
          const current = Array.isArray(answers[field.id]) ? answers[field.id] : [];
          const toggle = (option) => {
            const normalized = (val) => String(val ?? "").trim();
            const exists = current.some((v) => normalized(v) === normalized(option));
            const next = exists
              ? current.filter((v) => normalized(v) !== normalized(option))
              : [...current, option];
            handleFieldChange(field.id, next);
          };
          return (
            <FormControl component="fieldset" fullWidth error={hasError} required={field.isRequired}>
              <Typography variant="subtitle2" style={{ marginBottom: 8 }}>
                {field.label}
              </Typography>
              <FormGroup>
                {options.map((option, index) => {
                  const checked = current.some((v) => String(v ?? "").trim() === String(option ?? "").trim());
                  return (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          color="primary"
                          checked={checked}
                          onChange={() => toggle(option)}
                        />
                      }
                      label={option}
                    />
                  );
                })}
              </FormGroup>
              {(error || field.helpText) && (
                <FormHelperText>{error || field.helpText}</FormHelperText>
              )}
            </FormControl>
          );
        }

        // Sem opções: tratar como booleano simples
        const checked = Boolean(answers[field.id]);
        return (
          <FormControl component="fieldset" fullWidth error={hasError} required={field.isRequired}>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={checked}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                />
              }
              label={field.label}
            />
            {(error || field.helpText) && (
              <FormHelperText>{error || field.helpText}</FormHelperText>
            )}
          </FormControl>
        );
      }

      default:
        return null;
    }
  };

  const getProductsByGroup = (grupo) => {
    const q = String(searchQuery || "").trim().toLowerCase();
    return products.filter((p) => {
      if ((p.grupo || "Outros") !== grupo) return false;
      if (!q) return true;
      const name = String(p.name || "").toLowerCase();
      const desc = String(p.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  };

  const getFlavorProductsForHalfAndHalf = (baseProduct, baseVariationLabel = null) => {
    if (!baseProduct) return [];
    const grupoFilter = baseProduct.halfAndHalfGrupo || baseProduct.grupo || null;
    let filtered = products.filter((p) => {
      if (grupoFilter) return (p.grupo || "") === grupoFilter;
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
    setHalfAndHalfModalQty(1);
    
    // Capturar a variação selecionada do produto base
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
    setHalfAndHalfModalBaseVariation(baseVariationLabel);
    
    // Filtrar produtos disponíveis com a mesma variação
    const availableProducts = getFlavorProductsForHalfAndHalf(product, baseVariationLabel);
    
    // Pré-selecionar o primeiro produto disponível (não o produto base) com a variação correta
    if (availableProducts.length > 0) {
      // Se há variação, encontrar o primeiro produto que tenha essa variação (excluindo o produto base)
      let firstProductId = null;
      if (baseVariationLabel) {
        const productWithVariation = availableProducts.find((p) => {
          if (p.id === product.id) return false; // Excluir o produto base
          if (!p.variations || p.variations.length === 0) return false;
          const firstVariation = p.variations[0];
          return firstVariation?.options?.some((opt) => opt.label === baseVariationLabel);
        });
        if (productWithVariation) {
          firstProductId = productWithVariation.id;
        }
      }
      // Se não encontrou com variação ou não há variação, usar o primeiro disponível (excluindo o produto base)
      if (!firstProductId && availableProducts.length > 0) {
        const firstAvailable = availableProducts.find((p) => p.id !== product.id) || availableProducts[0];
        firstProductId = firstAvailable.id;
      }
      setHalfAndHalfModalHalf1(String(firstProductId));
    } else {
      setHalfAndHalfModalHalf1("");
    }
    
    setHalfAndHalfModalHalf2("");
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

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selectedItems).forEach((key) => {
      const { productValue } = getItemDetailsByKey(key);
      total += productValue * selectedItems[key];
    });
    halfAndHalfItems.forEach((item) => {
      const base = products.find((p) => p.id === item.baseProductId);
      const half1 = products.find((p) => p.id === item.half1ProductId);
      const half2 = products.find((p) => p.id === item.half2ProductId);
      total += computeHalfAndHalfUnitValue(base, half1, half2, item.half1OptionId, item.half2OptionId) * item.quantity;
    });
    
    // Adicionar taxa de entrega se for pedido de delivery
    const orderMetadata = getOrderMetadata();
    if (orderMetadata?.orderType === "delivery" && form?.settings?.deliveryFee) {
      total += parseFloat(form.settings.deliveryFee) || 0;
    }
    
    return total;
  };
  
  const getOrderMetadata = () => {
    let orderMetadata = {};
    const mesasEnabled = form.settings?.mesas !== false;
    const deliveryEnabled = form.settings?.delivery !== false;
    const feeCond = form.settings?.deliveryFeeCondition;

    const getAnswerValue = (fieldId) => {
      if (fieldId == null || fieldId === "") return undefined;
      return answers[fieldId] ?? answers[String(fieldId)] ?? answers[Number(fieldId)];
    };

    const isConditionMet = (cond) => {
      if (!cond || cond.fieldId == null || cond.fieldId === "") return false;
      const operator = cond.operator || "equals";
      const expectedValue = cond.value;
      const answerValue = getAnswerValue(cond.fieldId);
      const normStr = (val) => String(val ?? "").trim().toLowerCase();

      const isEmpty = (val) => {
        if (val === undefined || val === null) return true;
        if (Array.isArray(val) && val.length === 0) return true;
        if (typeof val === "string" && val.trim() === "") return true;
        return false;
      };

      switch (operator) {
        case "equals":
          if (expectedValue === undefined || expectedValue === null) return false;
          if (Array.isArray(answerValue)) return answerValue.map(normStr).includes(normStr(expectedValue));
          return normStr(answerValue) === normStr(expectedValue);
        case "notEquals":
          if (expectedValue === undefined || expectedValue === null) return false;
          if (Array.isArray(answerValue)) return !answerValue.map(normStr).includes(normStr(expectedValue));
          return normStr(answerValue) !== normStr(expectedValue);
        case "contains":
          if (expectedValue === undefined || expectedValue === null) return false;
          return String(answerValue || "").toLowerCase().includes(String(expectedValue || "").toLowerCase());
        case "isEmpty":
          return isEmpty(answerValue);
        case "isNotEmpty":
          return !isEmpty(answerValue);
        case "isTrue": {
          if (Array.isArray(answerValue)) return answerValue.length > 0;
          const strVal = String(answerValue || "").toLowerCase();
          return strVal === "true" || strVal === "sim" || strVal === "yes" || strVal === "1" || answerValue === true;
        }
        case "isFalse": {
          if (Array.isArray(answerValue)) return answerValue.length === 0;
          const strVal2 = String(answerValue || "").toLowerCase();
          return strVal2 === "false" || strVal2 === "não" || strVal2 === "nao" || strVal2 === "no" || strVal2 === "0" || answerValue === false || isEmpty(answerValue);
        }
        default:
          return false;
      }
    };

    if (mesaFromQR && mesaValue) {
      orderMetadata.tableId = mesaFromQR.id;
      orderMetadata.tableNumber = mesaFromQR.number || mesaFromQR.name || String(mesaFromQR.id);
      orderMetadata.orderType = "mesa";
    } else if (form.settings?.showMesaField && mesaValue && mesasEnabled) {
      const isSelect = (form.settings?.mesaFieldMode || "select") === "select";
      const mesaId = isSelect ? parseInt(mesaValue, 10) : null;
      const mesa = mesas.find((m) => m.id === parseInt(mesaValue, 10));
      const mesaNumber = isSelect ? (mesa?.number || mesa?.name || mesaValue) : mesaValue;
      if (mesaId) orderMetadata.tableId = mesaId;
      orderMetadata.tableNumber = mesaNumber;
      orderMetadata.orderType = "mesa";
    }
    if (!orderMetadata.tableId && deliveryEnabled) {
      // Se existir condição vinculada a campo, só marcar como delivery quando a condição for verdadeira
      if (feeCond?.fieldId) {
        orderMetadata.orderType = isConditionMet(feeCond) ? "delivery" : (mesasEnabled ? "mesa" : "delivery");
      } else {
        orderMetadata.orderType = "delivery";
      }
    } else if (!orderMetadata.tableId) {
      orderMetadata.orderType = mesasEnabled ? "mesa" : "delivery";
    }
    return orderMetadata;
  };

  const getTotalItems = () => {
    const normal = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
    const half = halfAndHalfItems.reduce((sum, i) => sum + i.quantity, 0);
    return normal + half;
  };

  const scrollToItemsStart = () => {
    const el = itemsStartRef.current;
    if (!el) return;
    try {
      const top = el.getBoundingClientRect().top + (window.pageYOffset || 0);
      // compensar barra sticky (tabs)
      const offset = 72;
      window.scrollTo({ top: Math.max(0, top - offset), behavior: "smooth" });
    } catch {
      // ignore
    }
  };

  const getPieceAgainPhoneMask = () => {
    const digits = String(pieceAgainPhoneInput || "").replace(/\D/g, "");
    // 12 dígitos: 55 + DDD + 8 (fixo) | 13 dígitos: 55 + DDD + 9 (celular)
    return digits.length > 12 ? "55(99)99999-9999" : "55(99)9999-9999";
  };

  useEffect(() => {
    if (!pieceAgainEnabled) return;
    if (!pieceAgainModalOpen) return;
    setPieceAgainPhoneInput((prev) => (String(prev || "").trim() ? prev : "55"));
  }, [pieceAgainEnabled, pieceAgainModalOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => {
      try {
        if (searchInputRef.current && typeof searchInputRef.current.focus === "function") {
          searchInputRef.current.focus();
        }
      } catch {
        // ignore
      }
    }, 50);
    return () => clearTimeout(t);
  }, [searchOpen]);

  if (loading) {
    return (
      <Box className={classes.root} style={appStyles?.rootStyle}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (submitted && orderData) {
    return (
      <Box className={classes.root} style={appStyles?.rootStyle}>
        <Paper className={classes.formPaper} style={appStyles?.formPaperStyle}>
          <Box className={classes.successMessage}>
            {/* Título de Confirmação */}
            <Box style={{ textAlign: "center", marginBottom: 32 }}>
              <Typography variant="h4" gutterBottom style={{ color: form.primaryColor, fontWeight: 600 }}>
                ✅ Pedido Confirmado!
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {form.successMessage || "Seu pedido foi recebido e está sendo processado."}
              </Typography>
            </Box>

            {/* Tempo Médio de Entrega - Destaque */}
            {orderData.averageDeliveryTime && (
              <Box 
                style={{ 
                  backgroundColor: form.primaryColor + "20", 
                  padding: 24, 
                  borderRadius: 12,
                  textAlign: "center",
                  marginBottom: 32,
                  border: `2px solid ${form.primaryColor}40`
                }}
              >
                <Typography variant="h6" style={{ color: form.primaryColor, marginBottom: 8, fontWeight: 600 }}>
                  ⏱️ Tempo Médio de Entrega
                </Typography>
                <Typography variant="h4" style={{ color: form.primaryColor, fontWeight: 700 }}>
                  {orderData.averageDeliveryTime}
                </Typography>
              </Box>
            )}

            {/* Informações do Cliente */}
            <Box style={{ marginBottom: 24, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 16 }}>
                Dados do Cliente
              </Typography>
              
              {orderData.customerName && (
                <Typography variant="body1" style={{ marginBottom: 8 }}>
                  <strong>Nome:</strong> {orderData.customerName}
                </Typography>
              )}
              
              {orderData.customerPhone && (
                <Typography variant="body1">
                  <strong>Telefone:</strong> {orderData.customerPhone}
                </Typography>
              )}
            </Box>

            {/* Itens do Pedido */}
            <Box style={{ marginBottom: 24 }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 16 }}>
                Itens do Pedido
              </Typography>
              
              <Paper style={{ padding: 16, backgroundColor: "#fafafa" }}>
                {orderData.menuItems.map((item, index) => (
                  <Box 
                    key={index} 
                    style={{ 
                      marginBottom: index < orderData.menuItems.length - 1 ? 16 : 0,
                      paddingBottom: index < orderData.menuItems.length - 1 ? 16 : 0,
                      borderBottom: index < orderData.menuItems.length - 1 ? "1px solid #e0e0e0" : "none"
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="body1" style={{ fontWeight: 600, marginBottom: 4 }}>
                          {item.productName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Quantidade: {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
                        </Typography>
                      </Box>
                      <Typography variant="body1" style={{ fontWeight: 600, color: form.primaryColor, marginLeft: 16 }}>
                        R$ {item.total.toFixed(2).replace(".", ",")}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* Resumo Financeiro */}
            <Box style={{ marginBottom: 24, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
                <Typography variant="body1">
                  <strong>Total de itens:</strong>
                </Typography>
                <Typography variant="body1" style={{ fontWeight: 600 }}>
                  {orderData.totalItems} {orderData.totalItems === 1 ? "item" : "itens"}
                </Typography>
              </Box>
              
              <Divider style={{ marginBottom: 12 }} />
              
              {orderData.subtotal !== undefined && (
                <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 8 }}>
                  <Typography variant="body1">
                    <strong>Subtotal:</strong>
                  </Typography>
                  <Typography variant="body1" style={{ fontWeight: 600 }}>
                    R$ {orderData.subtotal.toFixed(2).replace(".", ",")}
                  </Typography>
                </Box>
              )}
              
              {orderData.deliveryFee > 0 && (
                <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
                  <Typography variant="body1">
                    <strong>Taxa de entrega:</strong>
                  </Typography>
                  <Typography variant="body1" style={{ fontWeight: 600 }}>
                    R$ {orderData.deliveryFee.toFixed(2).replace(".", ",")}
                  </Typography>
                </Box>
              )}
              
              <Divider style={{ marginBottom: 12 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" style={{ fontWeight: 600 }}>
                  Total do Pedido:
                </Typography>
                <Typography variant="h5" style={{ color: form.primaryColor, fontWeight: 700 }}>
                  R$ {orderData.total.toFixed(2).replace(".", ",")}
                </Typography>
              </Box>
            </Box>

            {/* Confirmação: responsável pela mesa */}
            {(orderData.mesaNumber || orderData.responsavelMesa) && (
              <Box style={{ marginBottom: 24, padding: 16, backgroundColor: "#e8f5e9", borderRadius: 8 }}>
                <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 12 }}>
                  Confirmação
                </Typography>
                {orderData.mesaNumber && (
                  <Typography variant="body1" style={{ marginBottom: 4 }}>
                    <strong>Mesa:</strong> {orderData.mesaNumber}
                  </Typography>
                )}
                {orderData.responsavelMesa && (
                  <Typography variant="body1">
                    <strong>Responsável pela mesa:</strong> {orderData.responsavelMesa}
                  </Typography>
                )}
              </Box>
            )}

            {/* Informações Adicionais */}
            {orderData.customFields && orderData.customFields.length > 0 && orderData.customFields.some(f => f.value) && (
              <Box style={{ marginBottom: 24, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
                <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 16 }}>
                  Informações Adicionais
                </Typography>
                {orderData.customFields.map((field, index) => (
                  field.value && (
                    <Box key={index} style={{ marginBottom: index < orderData.customFields.length - 1 ? 12 : 0 }}>
                      <Typography variant="body2" style={{ marginBottom: 4, fontWeight: 600 }}>
                        {field.label}:
                      </Typography>
                      <Typography variant="body1" style={{ paddingLeft: 8 }}>
                        {field.value}
                      </Typography>
                    </Box>
                  )
                ))}
              </Box>
            )}

            {form.successRedirectUrl && (
              <Box style={{ textAlign: "center", marginTop: 24 }}>
                <Typography variant="body2" color="textSecondary">
                  Você será redirecionado em instantes...
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box className={classes.root} style={appStyles?.rootStyle}>
        <Paper className={classes.formPaper} style={appStyles?.formPaperStyle}>
          <Box className={classes.successMessage}>
            <Typography variant="h5" gutterBottom>
              {form.successMessage || "Obrigado! Seu pedido foi enviado com sucesso."}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Campos automáticos (nome e telefone)
  const autoFields = form.fields?.filter(
    (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
  ) || [];
  
  // Campos da aba finalizar (campos customizados que não são automáticos, order >= 2)
  const allFormFields = form.fields || [];
  const finalizeFields = allFormFields.filter(
    (f) => !f.metadata?.isAutoField && f.order >= 2
  );

  const bannerUrl = form?.settings?.bannerUrl;
  const carouselImages = bannerUrl
    ? []
    : (products || []).map((p) => p.imageUrl).filter(Boolean).slice(0, 8);
  if (carouselImages.length === 0 && !bannerUrl && form?.logoUrl) {
    carouselImages.push(form.logoUrl);
  }

  const orderedIds = mostOrderedProductIds.filter((id) => products.some((p) => p.id === id));
  const mostOrderedProducts = orderedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);
  const pieceAgainOrderedIds = pieceAgainEnabled
    ? pieceAgainProductIds.filter((id) => products.some((p) => p.id === id))
    : [];
  const pieceAgainProducts = pieceAgainOrderedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <Box className={classes.root} style={appStyles?.rootStyle}>
      {/* Banner grande (hero) quando configurado */}
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt="Banner"
          className={classes.heroBanner}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}

      {/* Topo tipo Anota Aí: carrossel de imagens (itens do cardápio) */}
      {!bannerUrl && carouselImages.length > 0 && (
        <Box className={classes.carouselRow}>
          {carouselImages.map((src, idx) => (
            <img
              key={`${src}-${idx}`}
              src={src}
              alt="Banner"
              className={classes.carouselImg}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ))}
        </Box>
      )}

      {/* Barra da loja */}
      <Box className={classes.storeBar}>
        {form.logoUrl ? (
          <img src={form.logoUrl} alt="Logo" className={classes.storeLogo} />
        ) : (
          <Box flex={1} />
        )}
        <Box>
          <IconButton
            size="small"
            aria-label="Buscar"
            onClick={() => {
              setView("menu");
              setSearchOpen(true);
              // ajuda a levar o usuário para a lista quando ele busca
              setTimeout(() => scrollToItemsStart(), 50);
            }}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Compartilhar"
            onClick={() => {
              const url = window.location?.href || "";
              if (navigator.share) {
                navigator.share({ title: form.name, url }).catch(() => {});
              } else if (navigator.clipboard && url) {
                navigator.clipboard.writeText(url).then(() => toast.success("Link copiado!")).catch(() => {});
              }
            }}
          >
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>

      {searchOpen && (
        <Box className={classes.searchBar}>
          <TextField
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar no cardápio..."
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Limpar busca"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      {form.description && (
        <Box className={classes.storeSubInfo}>
          {form.description}
        </Box>
      )}

      {/* Promo opcional (se configurar em settings.promoText) */}
      {form.settings?.promoText && (
        <Box className={classes.promoBanner}>
          <span>{form.settings.promoText}</span>
          {form.settings?.promoCta ? <span>{form.settings.promoCta}</span> : null}
        </Box>
      )}

      {/* Categorias (sticky) */}
      <Box className={classes.stickyTabs}>
        <Tabs
            value={activeGroup}
            onChange={(e, newValue) => {
              setActiveGroup(newValue);
              setView("menu");
              // Ao tocar no grupo, levar para o começo dos itens
              setTimeout(() => scrollToItemsStart(), 50);
            }}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.tabsContainer}
            indicatorColor="primary"
            textColor="primary"
            TabIndicatorProps={{ style: { height: 3 } }}
          >
            {groups.map((grupo) => (
              <Tab key={grupo} label={grupo} className={classes.tab} />
            ))}
          </Tabs>
      </Box>

      <Box className={classes.container} style={appStyles?.containerStyle}>
        {/* Seções do topo (somente no menu) */}
        {view === "menu" && pieceAgainProducts.length > 0 && (
          <Box className={classes.contentSection}>
            <Typography className={classes.sectionTitle}>Peça de novo</Typography>
            <Box className={classes.mostOrderedScroll}>
              {pieceAgainProducts.map((product) => {
                const itemKey = getItemKey(product);
                const { productValue: displayPrice } = getItemDetailsByKey(itemKey);
                return (
                  <Card key={`again-${product.id}`} className={classes.mostOrderedCard} onClick={() => handleQuantityChange(itemKey, 1)}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className={classes.mostOrderedImage} />
                    ) : (
                      <Box className={classes.mostOrderedImage} />
                    )}
                    <Box className={classes.mostOrderedCardBody}>
                      <Typography className={classes.mostOrderedName}>{product.name}</Typography>
                      <Typography className={classes.mostOrderedPrice}>
                        R$ {displayPrice.toFixed(2).replace(".", ",")}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" style={{ marginTop: 6 }}>
                        Adicionar ao carrinho
                      </Typography>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {view === "menu" && mostOrderedProducts.length > 0 && (
          <Box className={classes.contentSection}>
            <Typography className={classes.sectionTitle}>Os mais pedidos</Typography>
            <Box className={classes.mostOrderedScroll}>
              {mostOrderedProducts.map((product) => {
                const itemKey = getItemKey(product);
                const quantity = selectedItems[itemKey] || 0;
                const { productValue: displayPrice } = getItemDetailsByKey(itemKey);
                return (
                  <Card key={`top-${product.id}`} className={classes.mostOrderedCard}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={classes.mostOrderedImage}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <Box className={classes.mostOrderedImage} />
                    )}
                    <Box className={classes.mostOrderedCardBody}>
                      <Typography className={classes.mostOrderedName}>{product.name}</Typography>
                      <Typography className={classes.mostOrderedPrice}>
                        R$ {displayPrice.toFixed(2).replace(".", ",")}
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 8 }}>
                        {quantity > 0 ? (
                          <Box className={classes.quantityControl}>
                            <IconButton size="small" onClick={() => handleQuantityChange(itemKey, -1)}>
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <TextField
                              className={classes.quantityInput}
                              type="number"
                              value={quantity}
                              onChange={(e) => handleQuantityInput(itemKey, e.target.value)}
                              inputProps={{ min: 0 }}
                              variant="outlined"
                              size="small"
                              style={{ width: 52 }}
                            />
                            <IconButton size="small" onClick={() => handleQuantityChange(itemKey, 1)}>
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            fullWidth
                            onClick={() => handleQuantityChange(itemKey, 1)}
                            style={{ fontSize: "0.75rem" }}
                          >
                            Adicionar
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        <Box className={classes.contentSection} ref={itemsStartRef}>

          {view === "menu" && groups[activeGroup] && (
            <Box style={{ marginTop: 8 }}>
              <Typography className={classes.sectionTitle} style={{ marginBottom: 12 }}>
                {groups[activeGroup]}
              </Typography>
              {getProductsByGroup(groups[activeGroup]).map((product) => {
                const itemKey = getItemKey(product);
                const quantity = selectedItems[itemKey] || 0;
                const isHalfAndHalf = product.allowsHalfAndHalf === true;
                const hasVariations = product.variations && product.variations.length > 0;
                const firstVariation = hasVariations ? product.variations[0] : null;
                const selectedOptionId = hasVariations ? (selectedVariationOption[product.id] ?? firstVariation?.options?.[0]?.id) : null;
                const displayPrice = hasVariations ? getItemDetailsByKey(itemKey).productValue : parseFloat(product.value || 0);
                return (
                  <Card key={product.id} className={classes.productCard}>
                    <CardContent>
                      <Box className={classes.productCardContent}>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={classes.productImage}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        )}
                        <Box flex={1}>
                      <Typography className={classes.productName}>
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography className={classes.productDescription}>
                          {product.description}
                        </Typography>
                      )}
                      {hasVariations && firstVariation && (
                        <FormControl variant={fieldVariant} size="small" fullWidth style={{ marginTop: 8, marginBottom: 4 }}>
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
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Typography className={classes.productValue}>
                          R$ {displayPrice.toFixed(2).replace(".", ",")}
                        </Typography>
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
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(itemKey, -1)}
                              disabled={quantity === 0}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <TextField
                              className={classes.quantityInput}
                              type="number"
                              value={quantity}
                              onChange={(e) => handleQuantityInput(itemKey, e.target.value)}
                              inputProps={{ min: 0 }}
                              variant={fieldVariant}
                              size="small"
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(itemKey, 1)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
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

          {/* Gate de telefone (Peça de novo) */}
          <Dialog
            open={pieceAgainEnabled && pieceAgainModalOpen}
            onClose={() => {}}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Digite seu telefone</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 12 }}>
                Isso permite buscar suas últimas compras e preencher seus dados automaticamente.
              </Typography>
              <InputMask
                mask={getPieceAgainPhoneMask()}
                maskChar={null}
                value={pieceAgainPhoneInput}
                onChange={(e) => setPieceAgainPhoneInput(e.target.value)}
              >
                {(inputProps) => (
                  <TextField
                    {...inputProps}
                    autoFocus
                    fullWidth
                    variant="outlined"
                    label="Telefone (com DDD)"
                    placeholder="Ex: +55(34)99999-9999"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">+</InputAdornment>,
                    }}
                  />
                )}
              </InputMask>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={confirmPieceAgainPhone}
                color="primary"
                variant="contained"
                disabled={pieceAgainLoading}
              >
                {pieceAgainLoading ? "Buscando..." : "Continuar"}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={halfAndHalfModalOpen} onClose={() => setHalfAndHalfModalOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Meio a meio - {halfAndHalfModalProduct?.name}</DialogTitle>
            <DialogContent>
              <FormControl fullWidth variant={fieldVariant} size="small" style={{ marginTop: 8 }}>
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
              <FormControl fullWidth variant={fieldVariant} size="small" style={{ marginTop: 16 }}>
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
                variant={fieldVariant}
                size="small"
                fullWidth
                style={{ marginTop: 16 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setHalfAndHalfModalOpen(false)} color="secondary">Cancelar</Button>
              <Button onClick={addHalfAndHalfToCart} color="primary" variant="contained">Adicionar</Button>
            </DialogActions>
          </Dialog>

          {view === "checkout" && (
            <form onSubmit={handleSubmit}>
              <Box style={{ marginTop: 24 }}>
                {/* Listar todos os itens normais */}
                {Object.keys(selectedItems).length > 0 && (
                  <Box marginBottom={2} padding={2} bgcolor="action.hover" borderRadius={8}>
                    <Typography variant="subtitle2" gutterBottom>Itens do pedido</Typography>
                    {Object.keys(selectedItems).map((key) => {
                      const { product, productValue, productName, optionLabel } = getItemDetailsByKey(key);
                      const quantity = selectedItems[key];
                      const subtotal = productValue * quantity;
                      return (
                        <Box key={key} display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 4 }}>
                          <Typography variant="body2">
                            {quantity}x {productName} — R$ {subtotal.toFixed(2).replace(".", ",")}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityInput(key, 0)} 
                            aria-label="Remover"
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                )}
                
                {/* Listar itens meio a meio */}
                {halfAndHalfItems.length > 0 && (
                  <Box marginBottom={2} padding={2} bgcolor="action.hover" borderRadius={8}>
                    <Typography variant="subtitle2" gutterBottom>Itens meio a meio</Typography>
                    {halfAndHalfItems.map((item, idx) => {
                      const base = products.find((p) => p.id === item.baseProductId);
                      const h1 = products.find((p) => p.id === item.half1ProductId);
                      const h2 = products.find((p) => p.id === item.half2ProductId);
                      const unitVal = computeHalfAndHalfUnitValue(base, h1, h2, item.half1OptionId, item.half2OptionId);
                      const label = base && h1 && h2
                        ? `${base.name}: ${h1.name} / ${h2.name}`
                        : "Meio a meio";
                      return (
                        <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 4 }}>
                          <Typography variant="body2">
                            {item.quantity}x {label} — R$ {(unitVal * item.quantity).toFixed(2).replace(".", ",")}
                          </Typography>
                          <IconButton size="small" onClick={() => removeHalfAndHalfItem(idx)} aria-label="Remover">
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                )}
                {/* Mesa fixa por QR: se ocupada, só mostrar "Mesa X - Cliente"; se livre, pedir nome/telefone */}
                {loadingMesa && (
                  <Box className={classes.fieldContainer} style={{ marginBottom: 16 }}>
                    <Typography variant="body2" color="textSecondary">Carregando informações da mesa...</Typography>
                  </Box>
                )}
                {mesaFromQR && !loadingMesa && (
                  <Box className={classes.fieldContainer} style={{ marginBottom: 24 * (appStyles?.spacingMultiplier || 1) }}>
                    <Typography variant="body1" style={{ fontWeight: 600 }}>
                      Mesa {mesaFromQR.number || mesaFromQR.name || mesaFromQR.id}
                    </Typography>
                    {mesaFromQR.status === "ocupada" && mesaFromQR.contact && (
                      <Typography variant="body2" color="textSecondary">
                        Cliente: {mesaFromQR.contact.name || mesaFromQR.contact.number || "—"}
                      </Typography>
                    )}
                  </Box>
                )}
                {/* Campos automáticos (nome e telefone) — ocultar se mesa ocupada (QR) */}
                {!(mesaFromQR?.status === "ocupada") && autoFields.map((field) => (
                  <Box key={field.id} className={classes.fieldContainer} style={{ marginBottom: 24 * (appStyles?.spacingMultiplier || 1) }}>
                    {renderField(field)}
                  </Box>
                ))}

                {/* Campo Mesa (se configurado e form aceita mesas; não mostrar quando mesa veio do QR) */}
                {form.settings?.showMesaField && form.settings?.mesas !== false && !mesaFromQR && (
                  <Box key="mesa-field" className={classes.fieldContainer} style={{ marginBottom: 24 * (appStyles?.spacingMultiplier || 1) }}>
                    {(form.settings?.mesaFieldMode || "select") === "select" ? (
                      <FormControl fullWidth variant={fieldVariant}>
                        <InputLabel>Número da mesa</InputLabel>
                        <Select
                          value={mesaValue}
                          onChange={(e) => setMesaValue(e.target.value)}
                          label="Número da mesa"
                        >
                          <MenuItem value="">
                            <em>Selecione</em>
                          </MenuItem>
                          {mesas.map((m) => (
                            <MenuItem key={m.id} value={String(m.id)}>
                              {m.name || m.number} {m.status === "ocupada" ? "(ocupada)" : ""}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        variant={fieldVariant}
                        label="Número da mesa"
                        value={mesaValue}
                        onChange={(e) => setMesaValue(e.target.value)}
                        placeholder="Ex: Mesa 5"
                      />
                    )}
                  </Box>
                )}

                {/* Campos customizados da aba finalizar */}
                {finalizeFields.map((field) => {
                  const allFormFieldsSorted = [...(form.fields || [])].sort((a, b) => a.order - b.order);
                  if (!isFieldVisible(field, answers, allFormFieldsSorted)) return null;
                  return (
                    <Box key={field.id} className={classes.fieldContainer} style={{ marginBottom: 24 * (appStyles?.spacingMultiplier || 1) }}>
                      {renderField(field)}
                    </Box>
                  );
                })}

                {/* Resumo do pedido */}
                {getTotalItems() > 0 && (
                  <Paper className={classes.summaryCard}>
                    <Typography variant="h6" gutterBottom>
                      Resumo do Pedido
                    </Typography>
                    {(() => {
                      const orderMetadataForDisplay = getOrderMetadata();
                      const fee = orderMetadataForDisplay?.orderType === "delivery" && form?.settings?.deliveryFee
                        ? (parseFloat(form.settings.deliveryFee) || 0)
                        : 0;
                      const total = calculateTotal();
                      const subtotal = Math.max(0, total - fee);
                      return (
                        <>
                    <Box className={classes.summaryRow}>
                      <Typography>Total de itens:</Typography>
                      <Typography fontWeight={600}>{getTotalItems()}</Typography>
                    </Box>
                    {fee > 0 && (
                      <>
                        <Box className={classes.summaryRow}>
                          <Typography>Subtotal:</Typography>
                          <Typography fontWeight={600}>
                            R$ {subtotal.toFixed(2).replace(".", ",")}
                          </Typography>
                        </Box>
                        <Box className={classes.summaryRow}>
                          <Typography>Taxa de entrega:</Typography>
                          <Typography fontWeight={600}>
                            R$ {fee.toFixed(2).replace(".", ",")}
                          </Typography>
                        </Box>
                      </>
                    )}
                    <Box className={classes.summaryRow}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" style={{ color: form.primaryColor }}>
                        R$ {total.toFixed(2).replace(".", ",")}
                      </Typography>
                    </Box>
                        </>
                      );
                    })()}
                  </Paper>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className={classes.submitButton}
                  disabled={submitting || getTotalItems() === 0}
                  style={appStyles?.submitButtonStyle}
                  onClick={(e) => {
                    // Fallback: garantir que handleSubmit seja chamado
                    if (!e.defaultPrevented) {
                      handleSubmit(e);
                    }
                  }}
                >
                  {submitting ? "Enviando..." : "Finalizar Pedido"}
                </Button>
              </Box>
            </form>
          )}
        </Box>
      </Box>

      {/* Barra inferior estilo Anota Aí: Início | Carrinho */}
      {!submitted && form && groups.length > 0 && (
        <nav className={classes.bottomNav}>
          <div
            className={`${classes.bottomNavItem} ${view === "menu" ? "active" : ""}`}
            onClick={() => setView("menu")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setView("menu")}
          >
            <span style={{ fontSize: "0.75rem" }}>Início</span>
          </div>
          <div
            className={`${classes.bottomNavItem} ${view === "checkout" ? "active" : ""}`}
            onClick={() => setView("checkout")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setView("checkout")}
          >
            <Badge badgeContent={getTotalItems()} color="primary" style={{ marginBottom: 2 }}>
              <ShoppingCartIcon style={{ fontSize: 24 }} />
            </Badge>
            <span style={{ fontSize: "0.75rem" }}>Carrinho</span>
          </div>
        </nav>
      )}
    </Box>
  );
};

export default PublicMenuForm;
