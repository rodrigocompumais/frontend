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
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import SearchIcon from "@material-ui/icons/Search";
import ShareIcon from "@material-ui/icons/Share";
import CloseIcon from "@material-ui/icons/Close";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";

import { QrCodePix } from "qrcode-pix";
import InputMask from "react-input-mask";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { formatMesaComandaTitle } from "../../helpers/mesaDisplayLabel";
import { isFieldVisible } from "../../utils/formUtils";
import { getFormAppearanceStyles, FONT_IMPORTS } from "../../utils/formAppearanceStyles";
import evaluateCardapioOrderHours, {
  getCardapioOrderHoursScheduleSummary,
} from "../../utils/cardapioOrderHours";

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
  groupPagination: {
    marginTop: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    flexWrap: "wrap",
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
  halfFixedCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
  },
  halfFixedImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    objectFit: "cover",
    backgroundColor: "#e5e7eb",
    flexShrink: 0,
  },
  halfFlavorList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
    maxHeight: 320,
    overflowY: "auto",
    paddingRight: 2,
  },
  halfFlavorCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    backgroundColor: "#fff",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    font: "inherit",
    color: "inherit",
    appearance: "none",
    WebkitAppearance: "none",
    transition: "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
    "&:hover": {
      borderColor: "#cbd5e1",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
  },
  halfFlavorCardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    boxShadow: "0 0 0 1px #2563eb",
  },
  halfFlavorImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    objectFit: "cover",
    backgroundColor: "#e5e7eb",
    flexShrink: 0,
  },
  halfFlavorName: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#1a1a1a",
    lineHeight: 1.25,
  },
  halfFlavorMeta: {
    fontSize: "0.8rem",
    color: "#64748b",
    marginTop: 2,
  },
  halfFlavorPrice: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#1a1a1a",
    marginTop: 4,
  },
  storeInfoRow: {
    backgroundColor: "#fff",
    padding: theme.spacing(0.5, 2, 1.25),
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    borderBottom: "1px solid #eee",
  },
  storeInfoChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#475569",
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    padding: "4px 10px",
    lineHeight: 1.4,
  },
  stickyCartBar: {
    position: "fixed",
    left: 12,
    right: 12,
    bottom: 64,
    zIndex: 1099,
    borderRadius: 12,
    padding: theme.spacing(1.25, 2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    marginBottom: "env(safe-area-inset-bottom, 0)",
  },
  detailHero: {
    width: "100%",
    height: 240,
    objectFit: "cover",
    backgroundColor: "#eee",
    display: "block",
    [theme.breakpoints.down("xs")]: {
      height: 220,
    },
  },
  detailClose: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    "&:hover": { backgroundColor: "#fff" },
    boxShadow: "0 1px 6px rgba(0,0,0,0.2)",
  },
  detailSectionTitle: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#1a1a1a",
  },
  addonsSectionBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: 12,
    marginBottom: 10,
    border: "1.5px solid",
    animation: "$attentionPulse 1.5s ease-in-out infinite",
  },
  addonsScrollHint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 78,
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 6,
  },
  addonsScrollHintBtn: {
    pointerEvents: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    padding: "9px 16px",
    borderRadius: 999,
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.82rem",
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(0,0,0,0.28)",
    animation: "$attentionPulse 1.25s ease-in-out infinite",
  },
  "@keyframes attentionPulse": {
    "0%, 100%": { transform: "scale(1)", opacity: 1 },
    "50%": { transform: "scale(1.06)", opacity: 0.88 },
  },
  requiredChip: {
    fontSize: "0.68rem",
    fontWeight: 700,
    borderRadius: 999,
    padding: "2px 8px",
    marginLeft: 8,
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  optionalChip: {
    fontSize: "0.68rem",
    fontWeight: 600,
    borderRadius: 999,
    padding: "2px 8px",
    marginLeft: 8,
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },
  detailFooter: {
    position: "sticky",
    bottom: 0,
    backgroundColor: "#fff",
    borderTop: "1px solid #eee",
    padding: theme.spacing(1.5, 2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
  },
  detailStepper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "2px 4px",
  },
  "@keyframes skeletonPulse": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.45 },
    "100%": { opacity: 1 },
  },
  skeletonBlock: {
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    animation: "$skeletonPulse 1.4s ease-in-out infinite",
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
  /** Por itemKey: array de { addOnItemId, label, value } selecionados */
  const [selectedAddons, setSelectedAddons] = useState({});
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
  /** Modal de adicionais: ao adicionar item com grupo de adicionais, abre para seleção */
  const [addOnModalOpen, setAddOnModalOpen] = useState(false);
  const [addOnModalProduct, setAddOnModalProduct] = useState(null);
  const [addOnModalItemKey, setAddOnModalItemKey] = useState("");
  const [addOnModalPendingQuantity, setAddOnModalPendingQuantity] = useState(1);
  const [addOnModalSelectedAddons, setAddOnModalSelectedAddons] = useState([]);
  /** null = fluxo normal; -1 = novo meio a meio pendente; >=0 = editar halfAndHalfItems[index] */
  const [addOnModalHalfIndex, setAddOnModalHalfIndex] = useState(null);
  const [addOnModalHalfPending, setAddOnModalHalfPending] = useState(null);
  /** Observação digitada dentro do modal de adicionais (fluxos meio a meio/edição) */
  const [addOnModalObservation, setAddOnModalObservation] = useState("");
  /** Sheet de detalhe do item (padrão iFood) */
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailAddons, setDetailAddons] = useState([]);
  const [detailObservation, setDetailObservation] = useState("");
  const [detailVariationOptionId, setDetailVariationOptionId] = useState(null);
  /** Meio a meio dentro do sheet: modo "2 sabores" e id do segundo sabor */
  const [detailHalfMode, setDetailHalfMode] = useState(false);
  const [detailHalfFlavorId, setDetailHalfFlavorId] = useState(null);
  /** Hint pulsante para rolar até "Monte do seu jeito" */
  const [showAddonsScrollHint, setShowAddonsScrollHint] = useState(false);
  const detailAddonsSectionRef = useRef(null);
  const detailContentRef = useRef(null);
  /** Observações por linha do carrinho: itemKey -> texto */
  const [selectedObservations, setSelectedObservations] = useState({});
  /** Cupom de desconto aplicado: { code, discount } */
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  /** PIX estático gerado na confirmação: { payload, base64 } */
  const [pixData, setPixData] = useState(null);
  /** Para produtos com variações: productId -> variationOptionId selecionado */
  const [selectedVariationOption, setSelectedVariationOption] = useState({});
  /** IDs dos produtos mais pedidos (ordem de popularidade) */
  const [mostOrderedProductIds, setMostOrderedProductIds] = useState([]);

  /** Peça de novo (por telefone) */
  const [pieceAgainProductIds, setPieceAgainProductIds] = useState([]);
  const [pieceAgainLoading, setPieceAgainLoading] = useState(false);
  const [pieceAgainPhone, setPieceAgainPhone] = useState("");
  const [pieceAgainModalOpen, setPieceAgainModalOpen] = useState(false);
  const [pieceAgainPhoneInput, setPieceAgainPhoneInput] = useState("");

  // Busca (cardápio)
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const [groupPage, setGroupPage] = useState(1);
  /** Atualiza a cada 1 min para reavaliar horário do cardápio */
  const [orderHoursTick, setOrderHoursTick] = useState(0);

  // Âncora para rolar até o começo dos itens ao trocar grupo
  const itemsStartRef = useRef(null);
  /** Contador para chaves únicas de linha (mesmo produto com adicionais diferentes) */
  const nextLineIdRef = useRef(0);
  /** Refs para avanço automático de estágios (sempre valores atuais no interval) */
  const viewRef = useRef(view);
  const activeGroupRef = useRef(activeGroup);
  viewRef.current = view;
  activeGroupRef.current = activeGroup;

  const appStyles = form ? getFormAppearanceStyles(form) : null;
  const fieldVariant = appStyles?.fieldVariant || "outlined";
  /** Cor da marca: deriva botões, destaques e seleções (substitui cores fixas) */
  const brandPrimary = form?.primaryColor || "#1a1a1a";
  const brandSoft = `${brandPrimary}14`;
  const muiTheme = useTheme();
  const detailFullScreen = useMediaQuery(muiTheme.breakpoints.down("xs"));
  const minOrderValue = Number(form?.settings?.minOrderValue) || 0;

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
    // Se tem 14 dígitos e começa com 55, remover o 5º dígito (índice 4)
    // Formato: 55 + DDD(2) + 9(duplicado) + número(9) = 14 dígitos
    if (digits.startsWith("55") && digits.length === 14) {
      return digits.slice(0, 4) + digits.slice(5);
    }
    // 55 + DDD(2) + 9(extra) + 8 = 13 dígitos: remover 5º dígito para formato de disparo
    // Ex.: 5534999999999 -> 553499999999
    if (digits.startsWith("55") && digits.length === 13 && digits[4] === "9") {
      return digits.slice(0, 4) + digits.slice(5);
    }
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
      
      // Restaurar variações selecionadas dos pedidos anteriores
      if (data?.productData && Array.isArray(data.productData)) {
        const variationsMap = {};
        data.productData.forEach((item) => {
          if (item.productId && item.variationOptionId) {
            variationsMap[item.productId] = item.variationOptionId;
          }
        });
        setSelectedVariationOption((prev) => ({ ...prev, ...variationsMap }));
      }
      
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

  /** Chave base no carrinho: productId (sem variação) ou "productId_optionId" (com variação) */
  const getItemKey = (product) => {
    if (!product) return "";
    if (!product.variations || product.variations.length === 0) return String(product.id);
    const optionId = selectedVariationOption[product.id] ?? product.variations[0]?.options?.[0]?.id;
    return optionId != null ? `${product.id}_${optionId}` : String(product.id);
  };

  /** Remove sufixo _L{n} da key para obter a base (productId ou productId_optionId) */
  const getBaseKey = (key) => (key || "").replace(/_L\d+$/, "");

  /** Todas as keys no carrinho que pertencem a este produto (baseKey ou baseKey_L0, baseKey_L1, ...) */
  const getKeysForProduct = (product) => {
    const baseKey = getItemKey(product);
    return Object.keys(selectedItems).filter((k) => k === baseKey || k.startsWith(baseKey + "_L"));
  };

  /** Keys ordenadas para decrementar: _L maior primeiro, depois baseKey (para remover da linha mais recente) */
  const getKeysForProductSorted = (product) => {
    const keys = getKeysForProduct(product);
    return keys.slice().sort((a, b) => {
      const aM = a.match(/_L(\d+)$/);
      const bM = b.match(/_L(\d+)$/);
      if (!aM && !bM) return 0;
      if (!aM) return 1;
      if (!bM) return -1;
      return Number(bM[1]) - Number(aM[1]);
    });
  };

  /** Quantidade total do produto no carrinho (soma de todas as linhas) */
  const getTotalQuantityForProduct = (product) =>
    getKeysForProduct(product).reduce((sum, k) => sum + (selectedItems[k] || 0), 0);

  /** Resolve key para { product, productValue, productName, optionLabel, addonsTotal } (key pode ser baseKey ou baseKey_Ln) */
  const getItemDetailsByKey = (key) => {
    const baseKey = getBaseKey(key);
    const product = products.find((p) => p.id === parseInt(baseKey, 10));
    if (!product) return { product: null, productValue: 0, productName: "", optionLabel: "", addonsTotal: 0 };
    let productValue = 0;
    let productName = "";
    let optionLabel = "";
    if (baseKey.includes("_") && !baseKey.match(/_L\d+$/)) {
      const [, optionIdStr] = baseKey.split("_");
      const optionId = parseInt(optionIdStr, 10);
      const variation = product.variations?.[0];
      const option = variation?.options?.find((o) => o.id === optionId);
      productValue = option ? parseFloat(option.value) : parseFloat(product.value) || 0;
      productName = option ? `${product.name} - ${option.label}` : product.name;
      optionLabel = option?.label || "";
    } else {
      productValue = parseFloat(product.value) || 0;
      productName = product.name || "";
    }
    const addonsList = selectedAddons[key] || [];
    const addonsTotal = addonsList.reduce((sum, a) => sum + (Number(a.value) || 0) * (a.quantity ?? 1), 0);
    return { product, productValue, productName, optionLabel, addonsTotal };
  };

  const handleQuantityChange = (key, delta) => {
    const baseKey = getBaseKey(key);
    const product = getItemDetailsByKey(baseKey).product;

    if (delta > 0 && product && hasAddonsToShow(product)) {
      // Centraliza no sheet de detalhe (variação, adicionais, observação)
      openProductDetail(product);
      return;
    }

    if (delta < 0 && product) {
      const keysSorted = getKeysForProductSorted(product);
      const keyToDecrease = keysSorted[0];
      if (!keyToDecrease) return;
      const current = selectedItems[keyToDecrease] || 0;
      const newQuantity = Math.max(0, current + delta);
      if (newQuantity === 0) {
        setSelectedItems((prev) => {
          const { [keyToDecrease]: removed, ...rest } = prev;
          return rest;
        });
        setSelectedAddons((a) => { const { [keyToDecrease]: rem, ...r } = a; return r; });
        setSelectedObservations((o) => { const { [keyToDecrease]: rem, ...r } = o; return r; });
        return;
      }
      setSelectedItems((prev) => ({ ...prev, [keyToDecrease]: newQuantity }));
      return;
    }

    const current = selectedItems[baseKey] || 0;
    const newQuantity = Math.max(0, current + delta);
    if (newQuantity === 0) {
      setSelectedItems((prev) => {
        const { [baseKey]: removed, ...rest } = prev;
        return rest;
      });
      setSelectedAddons((a) => { const { [baseKey]: rem, ...r } = a; return r; });
      setSelectedObservations((o) => { const { [baseKey]: rem, ...r } = o; return r; });
      return;
    }
    setSelectedItems((prev) => ({ ...prev, [baseKey]: newQuantity }));
  };

  const handleQuantityInput = (key, value) => {
    const quantity = parseInt(value) || 0;
    if (quantity <= 0) {
      setSelectedItems((prev) => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
      setSelectedAddons((a) => { const { [key]: rem, ...r } = a; return r; });
      setSelectedObservations((o) => { const { [key]: rem, ...r } = o; return r; });
    } else {
      setSelectedItems((prev) => ({ ...prev, [key]: quantity }));
    }
  };

  const toggleAddon = (key, item) => {
    const { addOnItemId, label, value } = item;
    setSelectedAddons((prev) => {
      const list = prev[key] || [];
      const idx = list.findIndex((a) => a.addOnItemId === addOnItemId);
      if (idx >= 0) {
        const next = [...list];
        next[idx] = { ...next[idx], quantity: (next[idx].quantity ?? 1) + 1 };
        return { ...prev, [key]: next };
      }
      return { ...prev, [key]: [...list, { addOnItemId, label, value: Number(value) || 0, quantity: 1 }] };
    });
  };

  const changeAddonQuantity = (key, addOnItemId, delta) => {
    setSelectedAddons((prev) => {
      const list = prev[key] || [];
      const idx = list.findIndex((a) => a.addOnItemId === addOnItemId);
      if (idx < 0) return prev;
      const qty = (list[idx].quantity ?? 1) + delta;
      if (qty <= 0) {
        const next = list.filter((_, i) => i !== idx);
        return next.length ? { ...prev, [key]: next } : (() => { const { [key]: _, ...r } = prev; return r; })();
      }
      const next = [...list];
      next[idx] = { ...next[idx], quantity: qty };
      return { ...prev, [key]: next };
    });
  };

  const isAddonSelected = (key, addOnItemId) => (selectedAddons[key] || []).some((a) => a.addOnItemId === addOnItemId);
  const getAddonQuantity = (key, addOnItemId) => (selectedAddons[key] || []).find((a) => a.addOnItemId === addOnItemId)?.quantity ?? 0;
  const isAddonSelectedInModal = (addOnItemId) => addOnModalSelectedAddons.some((a) => a.addOnItemId === addOnItemId && (a.quantity ?? 1) > 0);
  const getAddonQuantityInModal = (addOnItemId) => addOnModalSelectedAddons.find((a) => a.addOnItemId === addOnItemId)?.quantity ?? 0;
  const setAddonQuantityInModal = (item, quantity) => {
    const { addOnItemId, label, value } = item;
    if (quantity <= 0) {
      setAddOnModalSelectedAddons((prev) => prev.filter((a) => a.addOnItemId !== addOnItemId));
      return;
    }
    setAddOnModalSelectedAddons((prev) => {
      const idx = prev.findIndex((a) => a.addOnItemId === addOnItemId);
      const entry = { addOnItemId, label, value: Number(value) || 0, quantity };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  };
  const confirmAddOnModal = () => {
    const addonsWithQty = (addOnModalSelectedAddons || []).filter((a) => (a.quantity ?? 1) > 0);
    const obs = String(addOnModalObservation || "").trim();

    // Regras de adicionais obrigatórios (min/max)
    if (addOnModalProduct) {
      const violations = getAddonRuleViolations(addOnModalProduct, addonsWithQty);
      if (violations.length > 0) {
        toast.error(violations[0]);
        return;
      }
    }

    if (addOnModalHalfIndex === -1 && addOnModalHalfPending) {
      setHalfAndHalfItems((prev) => [
        ...prev,
        {
          ...addOnModalHalfPending,
          quantity: Math.max(1, parseInt(addOnModalPendingQuantity, 10) || 1),
          addons: addonsWithQty,
          observation: obs || addOnModalHalfPending.observation || "",
        },
      ]);
    } else if (addOnModalHalfIndex != null && addOnModalHalfIndex >= 0) {
      setHalfAndHalfItems((prev) =>
        prev.map((item, i) =>
          i === addOnModalHalfIndex
            ? {
                ...item,
                quantity: Math.max(1, parseInt(addOnModalPendingQuantity, 10) || item.quantity || 1),
                addons: addonsWithQty,
                observation: obs,
              }
            : item
        )
      );
    } else {
      if (!addOnModalItemKey) return;
      setSelectedItems((prev) => ({ ...prev, [addOnModalItemKey]: addOnModalPendingQuantity }));
      setSelectedAddons((prev) => ({ ...prev, [addOnModalItemKey]: addonsWithQty }));
      setSelectedObservations((prev) => {
        if (obs) return { ...prev, [addOnModalItemKey]: obs };
        const { [addOnModalItemKey]: removed, ...rest } = prev;
        return rest;
      });
    }

    setAddOnModalOpen(false);
    setAddOnModalProduct(null);
    setAddOnModalItemKey("");
    setAddOnModalPendingQuantity(1);
    setAddOnModalSelectedAddons([]);
    setAddOnModalHalfIndex(null);
    setAddOnModalHalfPending(null);
    setAddOnModalObservation("");
  };

  const closeAddOnModal = () => {
    setAddOnModalOpen(false);
    setAddOnModalProduct(null);
    setAddOnModalItemKey("");
    setAddOnModalPendingQuantity(1);
    setAddOnModalSelectedAddons([]);
    setAddOnModalHalfIndex(null);
    setAddOnModalHalfPending(null);
    setAddOnModalObservation("");
  };

  const openAddOnModalForEdit = (product, itemKey) => {
    if (!product || !hasAddonsToShow(product)) return;
    setAddOnModalProduct(product);
    setAddOnModalItemKey(itemKey);
    setAddOnModalHalfIndex(null);
    setAddOnModalHalfPending(null);
    setAddOnModalPendingQuantity(selectedItems[itemKey] || 1);
    setAddOnModalSelectedAddons(selectedAddons[itemKey] || []);
    setAddOnModalObservation(selectedObservations[itemKey] || "");
    setAddOnModalOpen(true);
  };

  const openAddOnModalForHalfEdit = (index) => {
    const item = halfAndHalfItems[index];
    if (!item) return;
    const base = products.find((p) => p.id === item.baseProductId);
    if (!base || !hasAddonsToShow(base)) return;
    setAddOnModalProduct(base);
    setAddOnModalItemKey("");
    setAddOnModalHalfIndex(index);
    setAddOnModalHalfPending(null);
    setAddOnModalPendingQuantity(item.quantity || 1);
    setAddOnModalSelectedAddons(item.addons || []);
    setAddOnModalObservation(item.observation || "");
    setAddOnModalOpen(true);
  };

  /**
   * Verifica se o produto tem grupo de adicionais atrelado e com itens.
   * Só exibimos adicionais quando o produto tem um grupo vinculado (no produto ou na categoria).
   */
  const hasAddonsToShow = (product) => {
    if (product?.isCombo) return false;
    const g = product?.addOnGroup;
    if (!g) return false;
    const subsWithItems = (g.subgroups || []).filter((sg) => (sg.items || []).length > 0);
    const rootItems = g.items || [];
    return subsWithItems.length > 0 || rootItems.length > 0;
  };

  /**
   * Valida regras de adicionais obrigatórios (min/max) por subgrupo e no grupo raiz.
   * `addons`: [{ addOnItemId, quantity }] — quantidades por unidade do item.
   * Retorna lista de mensagens de violação (vazia = ok).
   */
  const getAddonRuleViolations = (product, addons) => {
    const g = product?.addOnGroup;
    if (!g) return [];
    const violations = [];
    const list = addons || [];
    const countFor = (items) =>
      (items || []).reduce(
        (sum, it) => sum + (list.find((a) => a.addOnItemId === it.id)?.quantity ?? 0),
        0
      );
    const check = (label, count, required, min, max) => {
      const effMin = required ? Math.max(1, Number(min) || 0) : Number(min) || 0;
      if (effMin > 0 && count < effMin) {
        violations.push(`Escolha pelo menos ${effMin} em "${label}"`);
      }
      if (max != null && Number(max) > 0 && count > Number(max)) {
        violations.push(`Escolha no máximo ${Number(max)} em "${label}"`);
      }
    };
    (g.subgroups || []).forEach((sg) => {
      if (!(sg.required || Number(sg.minItems) > 0 || sg.maxItems != null)) return;
      check(sg.name, countFor(sg.items), sg.required === true, sg.minItems, sg.maxItems);
    });
    const rootItems = g.items || [];
    if (rootItems.length > 0 && (g.required || Number(g.minItems) > 0 || g.maxItems != null)) {
      check(g.name, countFor(rootItems), g.required === true, g.minItems, g.maxItems);
    }
    return violations;
  };

  /** Texto do chip de regra do subgrupo (ex.: "Obrigatório • escolha 1" / "até 3") */
  const getAddonRuleLabel = (rules) => {
    if (!rules) return null;
    const required = rules.required === true;
    const min = required ? Math.max(1, Number(rules.minItems) || 0) : Number(rules.minItems) || 0;
    const max = rules.maxItems != null ? Number(rules.maxItems) : null;
    if (!required && min <= 0 && max == null) return null;
    const parts = [];
    if (min > 0 && max != null && min === max) parts.push(`escolha ${min}`);
    else {
      if (min > 0) parts.push(`mín. ${min}`);
      if (max != null) parts.push(`máx. ${max}`);
    }
    return { required: required || min > 0, text: parts.join(" • ") };
  };

  // ---------- Sheet de detalhe do item ----------
  const openProductDetail = (product) => {
    if (!product) return;
    setDetailProduct(product);
    setDetailQty(1);
    setDetailAddons([]);
    setDetailObservation("");
    setDetailHalfMode(false);
    setDetailHalfFlavorId(null);
    const hasVars = product.variations && product.variations.length > 0;
    setDetailVariationOptionId(
      hasVars
        ? selectedVariationOption[product.id] ?? product.variations[0]?.options?.[0]?.id ?? null
        : null
    );
    setDetailOpen(true);
  };

  const closeProductDetail = () => {
    setDetailOpen(false);
    setDetailProduct(null);
    setDetailAddons([]);
    setDetailObservation("");
    setDetailHalfMode(false);
    setDetailHalfFlavorId(null);
    setShowAddonsScrollHint(false);
  };

  /** Abre o sheet já no modo "2 sabores" (botão Meio a meio do card) */
  const openProductDetailHalf = (product) => {
    openProductDetail(product);
    setDetailHalfMode(true);
  };

  // Hint pulsante: aparece enquanto a seção de adicionais estiver fora da tela
  useEffect(() => {
    if (!detailOpen || !detailProduct || !hasAddonsToShow(detailProduct)) {
      setShowAddonsScrollHint(false);
      return undefined;
    }

    let observer;
    let contentEl = null;

    const updateHint = () => {
      const el = detailAddonsSectionRef.current;
      if (!el || !contentEl) {
        setShowAddonsScrollHint(true);
        return;
      }
      const c = contentEl.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setShowAddonsScrollHint(r.top > c.bottom - 36);
    };

    const timer = window.setTimeout(() => {
      const el = detailAddonsSectionRef.current;
      if (!el) {
        setShowAddonsScrollHint(true);
        return;
      }
      contentEl =
        detailContentRef.current ||
        el.closest(".MuiDialogContent-root") ||
        null;
      updateHint();
      if (contentEl) {
        contentEl.addEventListener("scroll", updateHint, { passive: true });
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          setShowAddonsScrollHint(!entry.isIntersecting);
        },
        { root: contentEl || null, threshold: 0.12 }
      );
      observer.observe(el);
    }, 180);

    return () => {
      window.clearTimeout(timer);
      if (observer) observer.disconnect();
      if (contentEl) contentEl.removeEventListener("scroll", updateHint);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailOpen, detailProduct, detailHalfMode, detailVariationOptionId]);

  /** Rótulo da opção de variação selecionada no sheet (ex.: "G") */
  const getDetailVariationLabel = () => {
    if (!detailProduct || detailVariationOptionId == null) return null;
    const option = detailProduct.variations?.[0]?.options?.find(
      (o) => o.id === detailVariationOptionId
    );
    return option?.label || null;
  };

  /** Preço só do produto inteiro (sem meio a meio), usado como base do sheet */
  const getDetailBasePrice = () => {
    if (!detailProduct) return 0;
    if (detailVariationOptionId != null && detailProduct.variations?.length > 0) {
      const option = detailProduct.variations[0]?.options?.find(
        (o) => o.id === detailVariationOptionId
      );
      if (option) return parseFloat(option.value) || 0;
    }
    return parseFloat(detailProduct.value) || 0;
  };

  const getDetailUnitPrice = () => {
    if (!detailProduct) return 0;
    const basePrice = getDetailBasePrice();
    if (!detailHalfMode || detailHalfFlavorId == null) return basePrice;

    // Meio a meio: aplica a regra de preço do produto base (max | fixed | average)
    const half2 = products.find((p) => p.id === detailHalfFlavorId);
    if (!half2) return basePrice;
    const baseLabel = getDetailVariationLabel();
    const half2Option = findOptionByVariationLabel(half2, baseLabel);
    const v2 = half2Option
      ? parseFloat(half2Option.value) || 0
      : parseFloat(half2.value) || 0;

    const rule = detailProduct.halfAndHalfPriceRule || "max";
    if (rule === "fixed") return basePrice;
    if (rule === "average") return (basePrice + v2) / 2;
    return Math.max(basePrice, v2);
  };

  const getDetailAddonQuantity = (addOnItemId) =>
    detailAddons.find((a) => a.addOnItemId === addOnItemId)?.quantity ?? 0;

  const setDetailAddonQuantity = (item, quantity) => {
    const { addOnItemId, label, value } = item;
    if (quantity <= 0) {
      setDetailAddons((prev) => prev.filter((a) => a.addOnItemId !== addOnItemId));
      return;
    }
    setDetailAddons((prev) => {
      const idx = prev.findIndex((a) => a.addOnItemId === addOnItemId);
      const entry = { addOnItemId, label, value: Number(value) || 0, quantity };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  };

  const getDetailAddonsTotal = () =>
    detailAddons.reduce((sum, a) => sum + (Number(a.value) || 0) * (a.quantity ?? 1), 0);

  const confirmProductDetail = () => {
    if (!detailProduct) return;
    if (detailVariationOptionId != null) {
      setSelectedVariationOption((prev) => ({
        ...prev,
        [detailProduct.id]: detailVariationOptionId,
      }));
    }
    const qty = Math.max(1, parseInt(detailQty, 10) || 1);
    const addonsWithQty = detailAddons.filter((a) => (a.quantity ?? 1) > 0);
    const obs = String(detailObservation || "").trim();
    const productForAddons =
      products.find((p) => p.id === detailProduct.id) || detailProduct;

    // Meio a meio: se tem adicionais e o cliente não escolheu nenhum, abre o popup
    // (usuários costumam focar nos sabores e esquecer os adicionais)
    if (detailHalfMode) {
      if (detailHalfFlavorId == null) {
        toast.error("Escolha o segundo sabor");
        return;
      }
      const half2 = products.find((p) => p.id === detailHalfFlavorId);
      if (!half2) {
        toast.error("Segundo sabor indisponível");
        return;
      }
      const baseLabel = getDetailVariationLabel();
      const half2Option = findOptionByVariationLabel(half2, baseLabel);
      const newItem = {
        baseProductId: detailProduct.id,
        half1ProductId: detailProduct.id,
        half2ProductId: detailHalfFlavorId,
        half1OptionId: detailVariationOptionId || null,
        half2OptionId: half2Option?.id || null,
        quantity: qty,
        addons: [],
        observation: obs,
      };

      if (hasAddonsToShow(productForAddons) && addonsWithQty.length === 0) {
        closeProductDetail();
        setAddOnModalHalfPending(newItem);
        setAddOnModalHalfIndex(-1);
        setAddOnModalProduct(productForAddons);
        setAddOnModalItemKey("");
        setAddOnModalPendingQuantity(qty);
        setAddOnModalSelectedAddons([]);
        setAddOnModalObservation(obs);
        window.setTimeout(() => setAddOnModalOpen(true), 150);
        return;
      }

      const halfViolations = getAddonRuleViolations(productForAddons, addonsWithQty);
      if (halfViolations.length > 0) {
        toast.error(halfViolations[0]);
        return;
      }

      setHalfAndHalfItems((prev) => [
        ...prev,
        { ...newItem, addons: addonsWithQty },
      ]);
      closeProductDetail();
      return;
    }

    const violations = getAddonRuleViolations(detailProduct, detailAddons);
    if (violations.length > 0) {
      toast.error(violations[0]);
      return;
    }

    const baseKey =
      detailVariationOptionId != null
        ? `${detailProduct.id}_${detailVariationOptionId}`
        : String(detailProduct.id);
    const lineKey = `${baseKey}_L${nextLineIdRef.current++}`;
    setSelectedItems((prev) => ({ ...prev, [lineKey]: qty }));
    if (addonsWithQty.length > 0) {
      setSelectedAddons((prev) => ({ ...prev, [lineKey]: addonsWithQty }));
    }
    if (obs) {
      setSelectedObservations((prev) => ({ ...prev, [lineKey]: obs }));
    }
    closeProductDetail();
  };

  // ---------- Cupom de desconto ----------
  const getCartSubtotal = () => Math.max(0, calculateTotal() - getDeliveryFeeAmount());

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getCartSubtotal();
    let discount = 0;
    if (appliedCoupon.discountType === "percent") {
      discount = (subtotal * (Number(appliedCoupon.discountValue) || 0)) / 100;
    } else {
      discount = Number(appliedCoupon.discountValue) || 0;
    }
    return Math.min(Math.round(discount * 100) / 100, subtotal);
  };

  const getFinalTotal = () => Math.max(0, calculateTotal() - getCouponDiscount());

  const applyCoupon = async () => {
    const code = String(couponInput || "").trim().toUpperCase();
    if (!code) {
      toast.error("Informe o código do cupom.");
      return;
    }
    setCouponLoading(true);
    try {
      const { data } = await api.post(`/public/forms/${slug}/validate-coupon`, {
        code,
        subtotal: getCartSubtotal(),
      });
      if (!data?.valid) {
        setAppliedCoupon(null);
        toast.error(data?.reason || "Cupom inválido.");
        return;
      }
      setAppliedCoupon({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });
      toast.success("Cupom aplicado!");
    } catch (err) {
      toastError(err);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  /**
   * Bloco de adicionais do item: só aparece quando o produto tem grupo de adicionais atrelado.
   * Os adicionais são por linha do pedido (ex.: 1x Pizza + borda recheada).
   */
  const renderAddOnsSection = (product, itemKey) => {
    if (!hasAddonsToShow(product)) return null;
    const g = product.addOnGroup;
    const renderAddonRow = (it) => {
      const qty = getAddonQuantity(itemKey, it.id);
      return (
        <Box key={it.id} display="flex" alignItems="center" justifyContent="space-between" style={{ marginBottom: 4 }}>
          <Typography variant="body2">{it.label} + R$ {Number(it.value || 0).toFixed(2).replace(".", ",")}</Typography>
          <Box display="flex" alignItems="center">
            <IconButton size="small" onClick={() => changeAddonQuantity(itemKey, it.id, -1)} disabled={qty <= 0} aria-label="Menos">
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" style={{ minWidth: 24, textAlign: "center" }}>{qty}</Typography>
            <IconButton size="small" onClick={() => toggleAddon(itemKey, { addOnItemId: it.id, label: it.label, value: it.value })} aria-label="Mais">
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      );
    };
    return (
      <Box mt={1} pt={1} borderTop="1px solid #eee">
        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
          Adicionais deste item (opcional). Use + para adicionar mais de um (ex.: 2 ovos).
        </Typography>
        {(g.subgroups || []).filter((sg) => (sg.items || []).length > 0).map((sg) => (
          <Box key={sg.id} mb={0.5}>
            <Typography variant="caption" style={{ fontWeight: 600 }}>{sg.name}</Typography>
            {(sg.items || []).map((it) => renderAddonRow(it))}
          </Box>
        ))}
        {(g.items || []).length > 0 && (g.items || []).map((it) => renderAddonRow(it))}
      </Box>
    );
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

    // Pedido mínimo (delivery)
    if (
      minOrderValue > 0 &&
      getOrderMetadata()?.orderType === "delivery" &&
      getCartSubtotal() < minOrderValue
    ) {
      toast.error(
        `Pedido mínimo de R$ ${minOrderValue.toFixed(2).replace(".", ",")} para delivery.`
      );
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

    const ohCheck = evaluateCardapioOrderHours(form?.settings);
    if (!ohCheck.allowed) {
      toast.error(ohCheck.message);
      return;
    }

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
        const addons = selectedAddons[key] || [];
        const addonsExpanded = addons.length > 0
          ? addons.flatMap((a) =>
              Array((a.quantity ?? 1) * (selectedItems[key] || 1))
                .fill(null)
                .map(() => ({ addOnItemId: a.addOnItemId, label: a.label, value: a.value }))
            )
          : undefined;
        const observation = String(selectedObservations[key] || "").trim();
        return {
          ...(product?.isCombo ? { type: "combo" } : {}),
          productId,
          quantity: selectedItems[key],
          productName: productName || product?.name,
          productValue,
          grupo: product?.grupo || "Outros",
          ...(observation && { observation }),
          ...(!product?.isCombo && addonsExpanded && addonsExpanded.length > 0 && { addons: addonsExpanded }),
        };
      });
      const halfMenuItems = halfAndHalfItems.map((item) => {
        const baseProduct = products.find((p) => p.id === item.baseProductId);
        const baseOptionId = baseProduct?.variations && baseProduct.variations.length > 0
          ? (selectedVariationOption[item.baseProductId] ?? null)
          : null;
        const addons = item.addons || [];
        const addonsExpanded = addons.length > 0
          ? addons.flatMap((a) =>
              Array((a.quantity ?? 1) * (item.quantity || 1))
                .fill(null)
                .map(() => ({ addOnItemId: a.addOnItemId, label: a.label, value: a.value }))
            )
          : undefined;
        const halfObservation = String(item.observation || "").trim();
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
          ...(halfObservation && { observation: halfObservation }),
          ...(addonsExpanded && addonsExpanded.length > 0 && { addons: addonsExpanded }),
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
        let answer = answers[field.id];
        if (answer !== undefined && answer !== null && answer !== "") {
          // Normalizar telefone antes de enviar (remover 5º dígito quando 9 extra após DDD)
          const isPhoneField = field.fieldType === "phone" || field.metadata?.autoFieldType === "phone";
          if (isPhoneField && answer) {
            answer = normalizePhone(answer);
          }
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
      
      const totalWithDelivery = calculateTotal();
      const deliveryFee = getDeliveryFeeAmount();
      const couponDiscount = getCouponDiscount();
      const finalTotal = getFinalTotal();
      const metadataWithTotal = {
        ...orderMetadata,
        total: finalTotal,
        deliveryFee,
        subtotal: totalWithDelivery - deliveryFee,
        ...(appliedCoupon && couponDiscount > 0 && {
          couponCode: appliedCoupon.code,
          couponDiscount,
        }),
      };

      // Enviar formulário (orderToken garante que o pedido vá para a mesa do link assinado)
      const response = await api.post(`/public/forms/${slug}/submit`, {
        answers: answersArray,
        menuItems,
        ...(Object.keys(metadataWithTotal).length > 0 && { metadata: metadataWithTotal }),
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
          const addonsTotal = (item.addons || []).reduce((s, a) => s + (Number(a.value) || 0), 0);
          const productName = base && half1 && half2
            ? `Meio a meio: ${half1.name} / ${half2.name}`
            : "Meio a meio";
          return {
            ...item,
            productName,
            productValue: unitVal,
            addonsTotal,
            total: (unitVal + addonsTotal) * item.quantity,
          };
        }
        const addonsTotal = (item.addons || []).reduce((s, a) => s + (Number(a.value) || 0), 0);
        return {
          ...item,
          total: ((item.productValue || 0) + addonsTotal) * item.quantity,
        };
      });
      const deliveryFeeForDisplay = getDeliveryFeeAmount();
      const subtotal = calculateTotal() - deliveryFeeForDisplay;

      const orderInfo = {
        menuItems: displayMenuItems,
        total: finalTotal,
        subtotal: subtotal,
        deliveryFee: deliveryFeeForDisplay,
        couponCode: appliedCoupon?.code || "",
        couponDiscount,
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
        orderType: getOrderMetadata()?.orderType || "mesa",
        protocol: response.data?.protocol || "",
        trackingToken: response.data?.trackingToken || "",
      };
      setOrderData(orderInfo);

      // PIX estático: gerar QR quando forma de pagamento contém "pix" e a loja tem chave configurada
      let pixGenerated = false;
      const pixKey = String(form.settings?.pixKey || "").trim();
      if (pixKey) {
        const paymentIsPix = answersArray.some((a) => {
          const val = Array.isArray(a.answer) ? a.answer.join(", ") : String(a.answer || "");
          return /\bpix\b/i.test(val);
        });
        if (paymentIsPix && finalTotal > 0) {
          try {
            const txId = String(response.data?.protocol || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "***";
            const qrPix = QrCodePix({
              version: "01",
              key: pixKey,
              name: String(form.settings?.pixName || form.name || "Loja").slice(0, 25),
              city: String(form.settings?.pixCity || "BRASIL").slice(0, 15).toUpperCase(),
              transactionId: txId,
              value: Math.round(finalTotal * 100) / 100,
            });
            const base64 = await qrPix.base64();
            setPixData({ payload: qrPix.payload(), base64 });
            pixGenerated = true;
          } catch (pixErr) {
            console.warn("[PublicMenuForm] Falha ao gerar QR PIX:", pixErr);
          }
        }
      }

      // Pedido salvo; envio WhatsApp é em segundo plano — não bloqueia a tela
      setSubmitted(true);
      if (response.data?.whatsappSent === "pending") {
        toast.info("Pedido enviado! A confirmação por WhatsApp será enviada em instantes.");
      } else if (response.data?.whatsappSent === false && response.data?.whatsappError) {
        toast.warn("Pedido salvo. " + (response.data.whatsappError || ""));
      }

      // Redirect pós-sucesso (paridade com PublicForm) — não redireciona quando há PIX a pagar
      if (form.successRedirectUrl && !pixGenerated) {
        setTimeout(() => {
          window.location.href = form.successRedirectUrl;
        }, 5000);
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
        // Máscara que sempre aceita 9 dígitos após o DDD para permitir digitar o 9 após o DDD
        // O formato 55(DDD)99999-9999 permite digitar o 9 após o DDD, que será removido no envio
        // A normalização remove o 9 duplicado quando há 14 dígitos (55 + DDD + 9 + número)
        return (
          <InputMask
            mask="55(99)99999-9999"
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

  const GROUP_ITEMS_PER_PAGE = 12;
  const activeGroupName = groups[activeGroup] || null;
  const activeGroupProducts = activeGroupName ? getProductsByGroup(activeGroupName) : [];
  const totalGroupPages = Math.max(1, Math.ceil(activeGroupProducts.length / GROUP_ITEMS_PER_PAGE));
  const paginatedGroupProducts = activeGroupProducts.slice(
    (groupPage - 1) * GROUP_ITEMS_PER_PAGE,
    groupPage * GROUP_ITEMS_PER_PAGE
  );

  const normalizeVariationKey = (value) => String(value || "").trim().toLowerCase();

  const findOptionByVariationLabel = (product, variationLabel) => {
    if (!product?.variations?.length || !variationLabel) return null;
    const needle = normalizeVariationKey(variationLabel);
    for (const variation of product.variations) {
      const option = (variation.options || []).find(
        (opt) => normalizeVariationKey(opt.label) === needle
      );
      if (option) return option;
    }
    return null;
  };

  const productMatchesHalfAndHalfVariation = (product, baseVariationLabel, baseVariationName = null) => {
    if (!baseVariationLabel) return true;
    if (!product?.variations?.length) return false;
    const needleLabel = normalizeVariationKey(baseVariationLabel);
    const needleName = baseVariationName ? normalizeVariationKey(baseVariationName) : null;
    return product.variations.some((variation) => {
      if (needleName && normalizeVariationKey(variation.name) !== needleName) return false;
      return (variation.options || []).some(
        (opt) => normalizeVariationKey(opt.label) === needleLabel
      );
    });
  };

  const getFlavorProductsForHalfAndHalf = (
    baseProduct,
    baseVariationLabel = null,
    { excludeProductId = null } = {}
  ) => {
    if (!baseProduct) return [];
    const grupoFilter = baseProduct.halfAndHalfGrupo || baseProduct.grupo || null;
    const baseVariationName = baseProduct.variations?.[0]?.name || null;
    let filtered = products.filter((p) => {
      if (excludeProductId != null && p.id === excludeProductId) return false;
      if (grupoFilter) return (p.grupo || "") === grupoFilter;
      return true;
    });

    // Match string: mesma opção de variação (ex.: G) e, se houver, mesmo nome (ex.: Tamanho)
    if (baseVariationLabel && baseProduct.variations && baseProduct.variations.length > 0) {
      filtered = filtered.filter((p) =>
        productMatchesHalfAndHalfVariation(p, baseVariationLabel, baseVariationName)
      );
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

  const removeHalfAndHalfItem = (index) => {
    setHalfAndHalfItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selectedItems).forEach((key) => {
      const { productValue, addonsTotal } = getItemDetailsByKey(key);
      total += (productValue + (addonsTotal || 0)) * selectedItems[key];
    });
    halfAndHalfItems.forEach((item) => {
      const base = products.find((p) => p.id === item.baseProductId);
      const half1 = products.find((p) => p.id === item.half1ProductId);
      const half2 = products.find((p) => p.id === item.half2ProductId);
      const unit = computeHalfAndHalfUnitValue(base, half1, half2, item.half1OptionId, item.half2OptionId);
      const addonsTotal = (item.addons || []).reduce(
        (sum, a) => sum + (Number(a.value) || 0) * (a.quantity ?? 1),
        0
      );
      total += (unit + addonsTotal) * item.quantity;
    });
    
    total += getDeliveryFeeAmount();
    return total;
  };
  
  const getAnswerValue = (fieldId) => {
    if (fieldId == null || fieldId === "") return undefined;
    return answers[fieldId] ?? answers[String(fieldId)] ?? answers[Number(fieldId)];
  };

  const isDeliveryFeeConditionMet = (cond) => {
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

  const getOrderMetadata = () => {
    let orderMetadata = {};
    const mesasEnabled = form.settings?.mesas !== false;
    const deliveryEnabled = form.settings?.delivery !== false;
    const feeCond = form.settings?.deliveryFeeCondition;

    if (mesaFromQR && mesaValue) {
      orderMetadata.tableId = mesaFromQR.id;
      orderMetadata.tableNumber = mesaFromQR.number || mesaFromQR.name || String(mesaFromQR.id);
      orderMetadata.orderType = "mesa";
      orderMetadata.mesaType = mesaFromQR.type || "mesa";
    } else if (form.settings?.showMesaField && mesaValue && mesasEnabled) {
      const isSelect = (form.settings?.mesaFieldMode || "select") === "select";
      const mesaId = isSelect ? parseInt(mesaValue, 10) : null;
      const mesa = mesas.find((m) => m.id === parseInt(mesaValue, 10));
      const mesaNumber = isSelect ? (mesa?.number || mesa?.name || mesaValue) : mesaValue;
      if (mesaId) orderMetadata.tableId = mesaId;
      orderMetadata.tableNumber = mesaNumber;
      orderMetadata.orderType = "mesa";
      if (mesa) orderMetadata.mesaType = mesa.type || "mesa";
    }
    if (!orderMetadata.tableId && deliveryEnabled) {
      // Se existir condição vinculada a campo, só marcar como delivery quando a condição for verdadeira
      if (feeCond?.fieldId) {
        orderMetadata.orderType = isDeliveryFeeConditionMet(feeCond) ? "delivery" : (mesasEnabled ? "mesa" : "delivery");
      } else {
        orderMetadata.orderType = "delivery";
      }
    } else if (!orderMetadata.tableId) {
      orderMetadata.orderType = mesasEnabled ? "mesa" : "delivery";
    }
    return orderMetadata;
  };

  /** Taxa de entrega só quando: pedido é delivery, formulário tem valor de taxa e (não há condicional ou a condicional é atendida). */
  const getDeliveryFeeAmount = () => {
    const orderMetadata = getOrderMetadata();
    if (orderMetadata?.orderType !== "delivery") return 0;
    const feeVal = parseFloat(form?.settings?.deliveryFee) || 0;
    if (feeVal <= 0) return 0;
    const feeCond = form?.settings?.deliveryFeeCondition;
    if (feeCond?.fieldId != null && feeCond.fieldId !== "") {
      if (!isDeliveryFeeConditionMet(feeCond)) return 0;
    }
    return feeVal;
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

  // Avanço automático por estágios: ativado pela configuração do formulário (settings.autoAdvanceInterval em segundos, 0 = desativado)
  const rawInterval = Number(form?.settings?.autoAdvanceInterval) || 0;
  const autoAdvanceIntervalSec = rawInterval > 0 ? Math.max(1, rawInterval) : 0;
  const autoAdvanceEnabled = autoAdvanceIntervalSec > 0;

  useEffect(() => {
    if (!autoAdvanceEnabled || submitted || groups.length === 0) return;
    if (addOnModalOpen || detailOpen || pieceAgainModalOpen) return;

    const ms = autoAdvanceIntervalSec * 1000;
    const timer = setInterval(() => {
      const currentView = viewRef.current;
      const currentGroup = activeGroupRef.current;
      const totalGroups = groups.length;

      if (currentView === "menu") {
        if (currentGroup < totalGroups - 1) {
          setActiveGroup(currentGroup + 1);
          setTimeout(() => scrollToItemsStart(), 50);
        } else {
          setView("checkout");
        }
      } else {
        setView("menu");
        setActiveGroup(0);
        setTimeout(() => scrollToItemsStart(), 50);
      }
    }, ms);
    return () => clearInterval(timer);
  }, [
    autoAdvanceEnabled,
    autoAdvanceIntervalSec,
    groups.length,
    submitted,
    addOnModalOpen,
    detailOpen,
    pieceAgainModalOpen,
  ]);

  const getPieceAgainPhoneMask = () => {
    // Sempre usar máscara com 9 dígitos após o DDD para permitir digitar o 9 após o DDD
    // O formato 55(DDD)99999-9999 permite digitar o 9 após o DDD, que será removido na normalização
    return "55(99)99999-9999";
  };

  useEffect(() => {
    if (!pieceAgainEnabled) return;
    if (!pieceAgainModalOpen) return;
    setPieceAgainPhoneInput((prev) => (String(prev || "").trim() ? prev : "55"));
  }, [pieceAgainEnabled, pieceAgainModalOpen]);

  useEffect(() => {
    setGroupPage(1);
  }, [activeGroup, searchQuery, products.length]);

  useEffect(() => {
    const id = setInterval(() => setOrderHoursTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    // Skeleton loading: estrutura do cardápio enquanto os produtos carregam
    return (
      <Box className={classes.root} style={appStyles?.rootStyle}>
        <Box className={classes.skeletonBlock} style={{ width: "100%", height: 180, borderRadius: 0 }} />
        <Box style={{ backgroundColor: "#fff", padding: 16, display: "flex", gap: 12 }}>
          <Box className={classes.skeletonBlock} style={{ width: 140, height: 28 }} />
          <Box flex={1} />
          <Box className={classes.skeletonBlock} style={{ width: 64, height: 28 }} />
        </Box>
        <Box style={{ backgroundColor: "#fff", padding: "0 16px 12px", display: "flex", gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <Box key={i} className={classes.skeletonBlock} style={{ width: 80, height: 32, borderRadius: 999 }} />
          ))}
        </Box>
        <Box style={{ padding: 16 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              style={{
                display: "flex",
                gap: 16,
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Box className={classes.skeletonBlock} style={{ width: 88, height: 88, flexShrink: 0 }} />
              <Box flex={1}>
                <Box className={classes.skeletonBlock} style={{ width: "60%", height: 18, marginBottom: 10 }} />
                <Box className={classes.skeletonBlock} style={{ width: "90%", height: 12, marginBottom: 8 }} />
                <Box className={classes.skeletonBlock} style={{ width: "35%", height: 16 }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  void orderHoursTick;
  if (form) {
    const orderHoursState = evaluateCardapioOrderHours(form.settings);
    if (!orderHoursState.allowed) {
      const primary = form.primaryColor || "#1976d2";
      const schedule = getCardapioOrderHoursScheduleSummary(form.settings);
      return (
        <Box className={classes.root} style={appStyles?.rootStyle}>
          {form?.settings?.bannerUrl ? (
            <img
              src={form.settings.bannerUrl}
              alt=""
              className={classes.heroBanner}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}
          <Box className={classes.storeBar}>
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="Logo" className={classes.storeLogo} />
            ) : (
              <Typography variant="h6" style={{ fontWeight: 700 }}>
                {form.name}
              </Typography>
            )}
          </Box>
          <Box className={classes.container} style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
            <Paper
              className={classes.formPaper}
              style={{
                padding: 24,
                textAlign: "center",
                borderTop: `4px solid ${primary}`,
              }}
            >
              <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 16, color: primary }}>
                Cardápio indisponível no momento
              </Typography>
              <Typography variant="body1" color="textSecondary" style={{ whiteSpace: "pre-wrap", marginBottom: schedule.lines.length ? 20 : 0 }}>
                {orderHoursState.message}
              </Typography>
              {schedule.lines.length > 0 && (
                <>
                  <Divider style={{ margin: "16px 0" }} />
                  <Typography
                    variant="subtitle2"
                    style={{ fontWeight: 700, marginBottom: 12, color: primary, textAlign: "left" }}
                  >
                    {schedule.title}
                  </Typography>
                  <Box component="ul" style={{ margin: 0, paddingLeft: 20, textAlign: "left" }}>
                    {schedule.lines.map((line, idx) => (
                      <Typography
                        key={`oh-${idx}`}
                        component="li"
                        variant="body2"
                        color="textSecondary"
                        style={{ marginBottom: 6 }}
                      >
                        {line}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}
              {schedule.footnotes.length > 0 && (
                <Box style={{ marginTop: 16, textAlign: "left" }}>
                  {schedule.footnotes.map((fn) => (
                    <Typography key={fn} variant="caption" color="textSecondary" display="block" style={{ marginTop: 6 }}>
                      {fn}
                    </Typography>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      );
    }
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

            {/* PIX estático: QR + copia e cola */}
            {pixData && (
              <Box
                style={{
                  padding: 24,
                  borderRadius: 12,
                  textAlign: "center",
                  marginBottom: 32,
                  border: `2px solid ${brandPrimary}40`,
                  backgroundColor: brandSoft,
                }}
              >
                <Typography variant="h6" style={{ color: brandPrimary, fontWeight: 700, marginBottom: 8 }}>
                  Pague com PIX
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                  Escaneie o QR Code ou use o copia e cola. Valor: R$ {orderData.total.toFixed(2).replace(".", ",")}
                </Typography>
                <img
                  src={pixData.base64}
                  alt="QR Code PIX"
                  style={{ width: 220, maxWidth: "100%", borderRadius: 8, backgroundColor: "#fff" }}
                />
                <Box style={{ marginTop: 12 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<FileCopyIcon />}
                    style={{ backgroundColor: brandPrimary, color: "#fff", textTransform: "none" }}
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard
                          .writeText(pixData.payload)
                          .then(() => toast.success("Código PIX copiado!"))
                          .catch(() => {});
                      }
                    }}
                  >
                    Copiar código PIX
                  </Button>
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 12 }}>
                  Após o pagamento, o estabelecimento confirmará o recebimento.
                </Typography>
              </Box>
            )}

            {/* Acompanhamento do pedido */}
            {orderData.trackingToken && (
              <Box style={{ textAlign: "center", marginBottom: 32 }}>
                <Button
                  variant="outlined"
                  style={{ borderColor: brandPrimary, color: brandPrimary, textTransform: "none", fontWeight: 700 }}
                  href={`/pedido/${orderData.trackingToken}`}
                >
                  Acompanhar pedido{orderData.protocol ? ` • ${orderData.protocol}` : ""}
                </Button>
              </Box>
            )}

            {/* Tempo Médio de Entrega - só em pedidos delivery */}
            {orderData.orderType === "delivery" && orderData.averageDeliveryTime && (
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
                          {item.type === "combo" ? " (Combo)" : ""}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Quantidade: {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
                        </Typography>
                        {item.type === "combo" && Array.isArray(item.comboItems) && item.comboItems.length > 0 && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            {item.comboItems
                              .map((ci) => {
                                const q = Number(ci.quantity) || 1;
                                const name = ci.productName || "Item";
                                return q > 1 ? `${q}x ${name}` : name;
                              })
                              .join(" · ")}
                          </Typography>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Adicionais: {item.addons.map((a) => `${a.label} (+ R$ ${Number(a.value || 0).toFixed(2).replace(".", ",")})`).join(", ")}
                          </Typography>
                        )}
                        {item.observation && (
                          <Typography variant="caption" color="textSecondary" display="block" style={{ fontStyle: "italic" }}>
                            Obs: {item.observation}
                          </Typography>
                        )}
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

              {orderData.couponDiscount > 0 && (
                <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
                  <Typography variant="body1">
                    <strong>Cupom{orderData.couponCode ? ` (${orderData.couponCode})` : ""}:</strong>
                  </Typography>
                  <Typography variant="body1" style={{ fontWeight: 600, color: "#2e7d32" }}>
                    - R$ {orderData.couponDiscount.toFixed(2).replace(".", ",")}
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

            {/* Confirmação: responsável pela mesa — apenas para pedidos do tipo mesa */}
            {orderData.orderType === "mesa" && (orderData.mesaNumber || orderData.responsavelMesa) && (
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

            {/* Link para CompuChat na mensagem de sucesso */}
            <Box style={{ marginTop: 24, textAlign: "center", paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                Formulário criado com
              </Typography>
              <Button
                href="https://www.compuchat.cloud"
                target="_blank"
                rel="noopener noreferrer"
                variant="text"
                color="primary"
                size="small"
                style={{ textTransform: "none" }}
              >
                CompuChat
              </Button>
            </Box>
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
            {/* Link para CompuChat na mensagem de sucesso */}
            <Box style={{ marginTop: 24, textAlign: "center", paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                Formulário criado com
              </Typography>
              <Button
                href="https://www.compuchat.cloud"
                target="_blank"
                rel="noopener noreferrer"
                variant="text"
                color="primary"
                size="small"
                style={{ textTransform: "none" }}
              >
                CompuChat
              </Button>
            </Box>
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
              // ajuda a levar o usuário para a lista quando ele busca
              setTimeout(() => scrollToItemsStart(), 50);
              setTimeout(() => {
                if (searchInputRef.current && typeof searchInputRef.current.focus === "function") {
                  searchInputRef.current.focus();
                }
              }, 80);
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

      {/* Header de loja: status, tempo de entrega e pedido mínimo visíveis durante a navegação */}
      {(() => {
        const chips = [];
        if (form?.settings?.orderHoursEnabled) {
          const ohState = evaluateCardapioOrderHours(form.settings);
          chips.push(
            <span
              key="status"
              className={classes.storeInfoChip}
              style={
                ohState.allowed
                  ? { backgroundColor: "#e8f5e9", color: "#1b5e20" }
                  : { backgroundColor: "#fee2e2", color: "#b91c1c" }
              }
            >
              ● {ohState.allowed ? "Aberto" : "Fechado"}
            </span>
          );
        }
        if (form?.settings?.averageDeliveryTime) {
          chips.push(
            <span key="time" className={classes.storeInfoChip}>
              ⏱ {form.settings.averageDeliveryTime}
            </span>
          );
        }
        if (minOrderValue > 0) {
          chips.push(
            <span key="min" className={classes.storeInfoChip}>
              Pedido mín. R$ {minOrderValue.toFixed(2).replace(".", ",")}
            </span>
          );
        }
        const feeVal = parseFloat(form?.settings?.deliveryFee) || 0;
        if (feeVal > 0) {
          chips.push(
            <span key="fee" className={classes.storeInfoChip}>
              🛵 Entrega R$ {feeVal.toFixed(2).replace(".", ",")}
            </span>
          );
        }
        if (chips.length === 0) return null;
        return <Box className={classes.storeInfoRow}>{chips}</Box>;
      })()}

      {view === "menu" && (
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
                      if (searchInputRef.current && typeof searchInputRef.current.focus === "function") {
                        searchInputRef.current.focus();
                      }
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
            TabIndicatorProps={{ style: { height: 3, backgroundColor: brandPrimary } }}
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
                // Para "Peça de novo", usar a variação selecionada do pedido anterior se disponível
                const savedVariationOptionId = selectedVariationOption[product.id];
                let itemKey = getItemKey(product);
                // Se temos uma variação salva e o produto tem variações, garantir que o itemKey use essa variação
                if (savedVariationOptionId && product.variations && product.variations.length > 0) {
                  itemKey = `${product.id}_${savedVariationOptionId}`;
                }
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
                const keysForProduct = getKeysForProduct(product);
                const quantity = getTotalQuantityForProduct(product);
                const singleLineKey = keysForProduct.length === 1 ? keysForProduct[0] : null;
                const { productValue: displayPrice } = getItemDetailsByKey(itemKey);
                return (
                  <Card key={`top-${product.id}`} className={classes.mostOrderedCard}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={classes.mostOrderedImage}
                        onClick={() => openProductDetail(product)}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <Box className={classes.mostOrderedImage} onClick={() => openProductDetail(product)} />
                    )}
                    <Box className={classes.mostOrderedCardBody}>
                      <Typography
                        className={classes.mostOrderedName}
                        onClick={() => openProductDetail(product)}
                      >
                        {product.name}
                      </Typography>
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
                              onChange={(e) => singleLineKey && handleQuantityInput(singleLineKey, e.target.value)}
                              inputProps={{ min: 0, readOnly: !singleLineKey }}
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
                      {quantity > 0 && hasAddonsToShow(product) && singleLineKey && (
                        <Button
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => openAddOnModalForEdit(product, singleLineKey)}
                          style={{ marginTop: 8, fontSize: "0.7rem" }}
                        >
                          Adicionais
                        </Button>
                      )}
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
              {activeGroupProducts.length === 0 && (
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 12 }}>
                  Nenhum item encontrado para esta busca neste grupo.
                </Typography>
              )}
              {paginatedGroupProducts.map((product) => {
                const itemKey = getItemKey(product);
                const keysForProduct = getKeysForProduct(product);
                const quantity = getTotalQuantityForProduct(product);
                const singleLineKey = keysForProduct.length === 1 ? keysForProduct[0] : null;
                const isHalfAndHalf = !product.isCombo && product.allowsHalfAndHalf === true;
                const hasVariations = !product.isCombo && product.variations && product.variations.length > 0;
                const firstVariation = hasVariations ? product.variations[0] : null;
                const selectedOptionId = hasVariations ? (selectedVariationOption[product.id] ?? firstVariation?.options?.[0]?.id) : null;
                const displayPrice = hasVariations ? getItemDetailsByKey(itemKey).productValue : parseFloat(product.value || 0);
                const comboItemsList = product.isCombo
                  ? (product.comboItems || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  : [];
                return (
                  <Card key={product.id} className={classes.productCard}>
                    <CardContent>
                      <Box className={classes.productCardContent}>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={classes.productImage}
                            onClick={() => openProductDetail(product)}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        )}
                        <Box flex={1}>
                      <Typography
                        className={classes.productName}
                        onClick={() => openProductDetail(product)}
                      >
                        {product.name}
                        {product.isCombo ? " (Combo)" : ""}
                      </Typography>
                      {product.description && (
                        <Typography
                          className={classes.productDescription}
                          onClick={() => openProductDetail(product)}
                        >
                          {product.description}
                        </Typography>
                      )}
                      {comboItemsList.length > 0 && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                          style={{ marginTop: 4 }}
                          onClick={() => openProductDetail(product)}
                        >
                          {comboItemsList
                            .map((ci) => {
                              const q = Number(ci.quantity) || 1;
                              const name = ci.product?.name || `Produto #${ci.productId}`;
                              return q > 1 ? `${q}x ${name}` : name;
                            })
                            .join(" · ")}
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
                              size="small"
                              onClick={() => openProductDetailHalf(product)}
                              style={{ marginRight: 8, borderColor: brandPrimary, color: brandPrimary, textTransform: "none" }}
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
                              onChange={(e) => singleLineKey && handleQuantityInput(singleLineKey, e.target.value)}
                              inputProps={{ min: 0, readOnly: !singleLineKey }}
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
                      {quantity > 0 && hasAddonsToShow(product) && singleLineKey && (
                        <Button
                          size="small"
                          color="primary"
                          variant="outlined"
                          onClick={() => openAddOnModalForEdit(product, singleLineKey)}
                          style={{ marginTop: 8 }}
                        >
                          Adicionais
                        </Button>
                      )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
              {activeGroupProducts.length > GROUP_ITEMS_PER_PAGE && (
                <Box className={classes.groupPagination}>
                  <Typography variant="body2" color="textSecondary">
                    Página {groupPage} de {totalGroupPages} ({activeGroupProducts.length} itens)
                  </Typography>
                  <Box display="flex" alignItems="center" gridGap={8}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={groupPage <= 1}
                      onClick={() => {
                        setGroupPage((prev) => Math.max(1, prev - 1));
                        setTimeout(() => scrollToItemsStart(), 50);
                      }}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={groupPage >= totalGroupPages}
                      onClick={() => {
                        setGroupPage((prev) => Math.min(totalGroupPages, prev + 1));
                        setTimeout(() => scrollToItemsStart(), 50);
                      }}
                    >
                      Próxima
                    </Button>
                  </Box>
                </Box>
              )}
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

          <Dialog open={addOnModalOpen} onClose={closeAddOnModal} maxWidth="sm" fullWidth>
            <DialogTitle>
              {addOnModalHalfIndex === -1 && addOnModalHalfPending
                ? "Quer adicionar algo?"
                : `Adicionais — ${addOnModalProduct?.name || ""}`}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                {addOnModalHalfIndex === -1 && addOnModalHalfPending
                  ? (getAddonRuleViolations(addOnModalProduct, []).length > 0
                      ? "Seu meio a meio está quase pronto. Escolha os adicionais obrigatórios para continuar."
                      : "Seu meio a meio está quase pronto. Escolha os adicionais ou toque em Confirmar para seguir sem eles.")
                  : `Escolha os adicionais do item. Quantidade do item: ${addOnModalPendingQuantity}`}
              </Typography>
              {addOnModalProduct?.addOnGroup && (() => {
                const renderModalAddonRow = (it, isLast) => {
                  const qty = getAddonQuantityInModal(it.id);
                  const addonRef = { addOnItemId: it.id, label: it.label, value: it.value };
                  return (
                    <Box
                      key={it.id}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      style={{ padding: "10px 0", borderBottom: isLast ? "none" : "1px solid #f0f0f0" }}
                    >
                      <Box flex={1} pr={1}>
                        <Typography variant="body2" style={{ fontWeight: 500, lineHeight: 1.3 }}>
                          {it.label}
                        </Typography>
                        {Number(it.value) > 0 && (
                          <Typography variant="caption" style={{ color: brandPrimary, fontWeight: 700 }}>
                            + R$ {Number(it.value || 0).toFixed(2).replace(".", ",")}
                          </Typography>
                        )}
                      </Box>
                      {qty === 0 ? (
                        <IconButton
                          size="small"
                          onClick={() => setAddonQuantityInModal(addonRef, 1)}
                          aria-label={`Adicionar ${it.label}`}
                          style={{ border: `1.5px solid ${brandPrimary}`, color: brandPrimary, borderRadius: 8, padding: 5 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <Box
                          display="flex"
                          alignItems="center"
                          style={{ border: `1.5px solid ${brandPrimary}`, borderRadius: 8, backgroundColor: brandSoft }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => setAddonQuantityInModal(addonRef, qty - 1)}
                            aria-label="Menos"
                            style={{ color: brandPrimary, padding: 5 }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" style={{ minWidth: 22, textAlign: "center", fontWeight: 700 }}>
                            {qty}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setAddonQuantityInModal(addonRef, qty + 1)}
                            aria-label="Mais"
                            style={{ color: brandPrimary, padding: 5 }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  );
                };

                const renderModalAddonSection = (title, rules, items, keyPrefix) => {
                  if (!items || items.length === 0) return null;
                  const rule = getAddonRuleLabel(rules);
                  return (
                    <Box key={keyPrefix} mb={1.5} style={{ border: "1px solid #ececec", borderRadius: 12, overflow: "hidden" }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        style={{ backgroundColor: "#fafafa", padding: "10px 12px" }}
                      >
                        <Typography variant="body2" style={{ fontWeight: 700 }}>{title}</Typography>
                        {rule ? (
                          <span className={rule.required ? classes.requiredChip : classes.optionalChip} style={{ marginLeft: 8 }}>
                            {rule.required ? "Obrigatório" : ""}
                            {rule.text ? `${rule.required ? " • " : ""}${rule.text}` : ""}
                          </span>
                        ) : (
                          <span className={classes.optionalChip} style={{ marginLeft: 8 }}>Opcional</span>
                        )}
                      </Box>
                      <Box style={{ padding: "0 12px" }}>
                        {items.map((it, idx) => renderModalAddonRow(it, idx === items.length - 1))}
                      </Box>
                    </Box>
                  );
                };

                const modalGroup = addOnModalProduct.addOnGroup;
                return (
                  <>
                    {(modalGroup.subgroups || [])
                      .filter((sg) => (sg.items || []).length > 0)
                      .map((sg) => renderModalAddonSection(sg.name, sg, sg.items, `msg-${sg.id}`))}
                    {renderModalAddonSection("Adicionais", modalGroup, modalGroup.items || [], "mroot")}
                  </>
                );
              })()}
              <TextField
                label="Observação (opcional)"
                placeholder="Ex.: sem cebola, ponto da carne..."
                value={addOnModalObservation}
                onChange={(e) => setAddOnModalObservation(e.target.value)}
                inputProps={{ maxLength: 200 }}
                variant={fieldVariant}
                size="small"
                fullWidth
                multiline
                minRows={2}
                style={{ marginTop: 8 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeAddOnModal} color="secondary">Cancelar</Button>
              <Button
                onClick={confirmAddOnModal}
                variant="contained"
                style={{ backgroundColor: brandPrimary, color: "#fff" }}
              >
                {addOnModalHalfIndex === -1 && addOnModalHalfPending
                  ? "Adicionar ao pedido"
                  : "Confirmar"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Sheet de detalhe do item (padrão iFood): foto, variação, adicionais, observação */}
          <Dialog
            open={detailOpen}
            onClose={closeProductDetail}
            fullScreen={detailFullScreen}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              style: {
                position: "relative",
                overflow: "hidden",
                ...(detailFullScreen ? {} : { borderRadius: 16 }),
              },
            }}
          >
            {detailProduct && (() => {
              const isComboDetail = detailProduct.isCombo === true;
              const g = isComboDetail ? null : detailProduct.addOnGroup;
              const hasVars = !isComboDetail && detailProduct.variations && detailProduct.variations.length > 0;
              const firstVariation = hasVars ? detailProduct.variations[0] : null;
              const unitPrice = getDetailUnitPrice();
              const qtyNum = Math.max(1, parseInt(detailQty, 10) || 1);
              const lineTotal = (unitPrice + (isComboDetail ? 0 : getDetailAddonsTotal())) * qtyNum;
              const detailComboItems = isComboDetail
                ? (detailProduct.comboItems || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                : [];

              // Linha de adicional: nome + preço à esquerda; "+" que vira stepper à direita
              const renderDetailAddonRow = (it, isLast) => {
                const qty = getDetailAddonQuantity(it.id);
                const addonRef = { addOnItemId: it.id, label: it.label, value: it.value };
                return (
                  <Box
                    key={it.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{
                      padding: "10px 0",
                      borderBottom: isLast ? "none" : "1px solid #f0f0f0",
                    }}
                  >
                    <Box flex={1} pr={1}>
                      <Typography variant="body2" style={{ fontWeight: 500, lineHeight: 1.3 }}>
                        {it.label}
                      </Typography>
                      {Number(it.value) > 0 && (
                        <Typography variant="caption" style={{ color: brandPrimary, fontWeight: 700 }}>
                          + R$ {Number(it.value || 0).toFixed(2).replace(".", ",")}
                        </Typography>
                      )}
                    </Box>
                    {qty === 0 ? (
                      <IconButton
                        size="small"
                        onClick={() => setDetailAddonQuantity(addonRef, 1)}
                        aria-label={`Adicionar ${it.label}`}
                        style={{
                          border: `1.5px solid ${brandPrimary}`,
                          color: brandPrimary,
                          borderRadius: 8,
                          padding: 5,
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        style={{
                          border: `1.5px solid ${brandPrimary}`,
                          borderRadius: 8,
                          backgroundColor: brandSoft,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => setDetailAddonQuantity(addonRef, qty - 1)}
                          aria-label="Menos"
                          style={{ color: brandPrimary, padding: 5 }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" style={{ minWidth: 22, textAlign: "center", fontWeight: 700 }}>
                          {qty}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setDetailAddonQuantity(addonRef, qty + 1)}
                          aria-label="Mais"
                          style={{ color: brandPrimary, padding: 5 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                );
              };

              // Seção de adicionais em card: cabeçalho com nome + regra e linhas com divisores
              const renderAddonSection = (title, rules, items, keyPrefix) => {
                if (!items || items.length === 0) return null;
                const rule = getAddonRuleLabel(rules);
                return (
                  <Box
                    key={keyPrefix}
                    mb={1.5}
                    style={{
                      border: "1px solid #ececec",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      style={{ backgroundColor: "#fafafa", padding: "10px 12px" }}
                    >
                      <Typography variant="body2" style={{ fontWeight: 700 }}>
                        {title}
                      </Typography>
                      {rule ? (
                        <span className={rule.required ? classes.requiredChip : classes.optionalChip} style={{ marginLeft: 8 }}>
                          {rule.required ? "Obrigatório" : ""}
                          {rule.text ? `${rule.required ? " • " : ""}${rule.text}` : ""}
                        </span>
                      ) : (
                        <span className={classes.optionalChip} style={{ marginLeft: 8 }}>Opcional</span>
                      )}
                    </Box>
                    <Box style={{ padding: "0 12px" }}>
                      {items.map((it, idx) => renderDetailAddonRow(it, idx === items.length - 1))}
                    </Box>
                  </Box>
                );
              };

              // Meio a meio dentro do sheet
              const halfFlavors = detailHalfMode
                ? getFlavorProductsForHalfAndHalf(detailProduct, getDetailVariationLabel(), {
                    excludeProductId: detailProduct.id,
                  })
                : [];
              const selectedHalfFlavor = detailHalfFlavorId != null
                ? products.find((p) => p.id === detailHalfFlavorId)
                : null;

              return (
                <>
                  <Box style={{ position: "relative" }}>
                    {detailProduct.imageUrl ? (
                      <img
                        src={detailProduct.imageUrl}
                        alt={detailProduct.name}
                        className={classes.detailHero}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <Box style={{ height: 12 }} />
                    )}
                    <IconButton className={classes.detailClose} size="small" onClick={closeProductDetail} aria-label="Fechar">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  <DialogContent
                    ref={detailContentRef}
                    style={{ paddingBottom: 12 }}
                  >
                    <Typography variant="h6" style={{ fontWeight: 700, lineHeight: 1.25 }}>
                      {detailProduct.name}
                      {isComboDetail ? " (Combo)" : ""}
                    </Typography>
                    {detailProduct.description && (
                      <Typography variant="body2" color="textSecondary" style={{ marginTop: 6 }}>
                        {detailProduct.description}
                      </Typography>
                    )}
                    {detailComboItems.length > 0 && (
                      <Box mt={1.5}>
                        <Typography className={classes.detailSectionTitle} gutterBottom>
                          Inclui
                        </Typography>
                        {detailComboItems.map((ci) => {
                          const q = Number(ci.quantity) || 1;
                          const name = ci.product?.name || `Produto #${ci.productId}`;
                          return (
                            <Typography key={ci.id || ci.productId} variant="body2" color="textSecondary" style={{ marginBottom: 2 }}>
                              {q > 1 ? `${q}x ` : ""}{name}
                            </Typography>
                          );
                        })}
                      </Box>
                    )}
                    <Typography style={{ fontWeight: 700, marginTop: 8, color: brandPrimary }}>
                      R$ {unitPrice.toFixed(2).replace(".", ",")}
                    </Typography>

                    {hasVars && firstVariation && (
                      <Box mt={2}>
                        <Typography className={classes.detailSectionTitle} gutterBottom>
                          {firstVariation.name}
                          <span className={classes.requiredChip}>Obrigatório</span>
                        </Typography>
                        {firstVariation.options.map((opt) => {
                          const selected = detailVariationOptionId === opt.id;
                          return (
                            <Box
                              key={opt.id}
                              component="button"
                              type="button"
                              className={classes.halfFlavorCard}
                              style={{
                                padding: "8px 12px",
                                marginBottom: 6,
                                ...(selected
                                  ? {
                                      borderColor: brandPrimary,
                                      backgroundColor: brandSoft,
                                      boxShadow: `0 0 0 1px ${brandPrimary}`,
                                    }
                                  : {}),
                              }}
                              onClick={() => {
                                setDetailVariationOptionId(opt.id);
                                // Tamanho mudou: segundo sabor pode não existir no novo tamanho
                                if (detailHalfFlavorId != null) {
                                  const flavor = products.find((p) => p.id === detailHalfFlavorId);
                                  if (
                                    !flavor ||
                                    !productMatchesHalfAndHalfVariation(
                                      flavor,
                                      opt.label,
                                      detailProduct.variations?.[0]?.name || null
                                    )
                                  ) {
                                    setDetailHalfFlavorId(null);
                                  }
                                }
                              }}
                            >
                              <Box flex={1} display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" style={{ fontWeight: selected ? 700 : 500 }}>
                                  {opt.label}
                                </Typography>
                                <Typography variant="body2" style={{ fontWeight: 700 }}>
                                  R$ {parseFloat(opt.value || 0).toFixed(2).replace(".", ",")}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}

                    {!isComboDetail && detailProduct.allowsHalfAndHalf === true && (
                      <Box mt={2}>
                        {/* Toggle Inteira | 2 sabores */}
                        <Box
                          display="flex"
                          style={{
                            border: "1px solid #ececec",
                            borderRadius: 10,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component="button"
                            type="button"
                            flex={1}
                            onClick={() => {
                              setDetailHalfMode(false);
                              setDetailHalfFlavorId(null);
                            }}
                            style={{
                              border: "none",
                              cursor: "pointer",
                              padding: "10px 8px",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              fontFamily: "inherit",
                              backgroundColor: !detailHalfMode ? brandPrimary : "transparent",
                              color: !detailHalfMode ? "#fff" : "#666",
                            }}
                          >
                            Inteira
                          </Box>
                          <Box
                            component="button"
                            type="button"
                            flex={1}
                            onClick={() => setDetailHalfMode(true)}
                            style={{
                              border: "none",
                              cursor: "pointer",
                              padding: "10px 8px",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              fontFamily: "inherit",
                              backgroundColor: detailHalfMode ? brandPrimary : "transparent",
                              color: detailHalfMode ? "#fff" : "#666",
                            }}
                          >
                            2 sabores (meio a meio)
                          </Box>
                        </Box>

                        {/* Escolha do segundo sabor, sem sair do sheet */}
                        {detailHalfMode && (
                          <Box mt={1.5}>
                            <Typography className={classes.detailSectionTitle} gutterBottom>
                              Escolha o segundo sabor
                              <span className={classes.requiredChip}>Obrigatório</span>
                            </Typography>
                            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 8 }}>
                              Metade 1: <strong>{detailProduct.name}</strong>
                              {getDetailVariationLabel() ? ` (${getDetailVariationLabel()})` : ""}
                            </Typography>
                            {halfFlavors.length === 0 && (
                              <Typography variant="body2" color="textSecondary">
                                Nenhum outro sabor disponível
                                {getDetailVariationLabel() ? ` no tamanho ${getDetailVariationLabel()}` : ""}.
                              </Typography>
                            )}
                            <Box style={{ maxHeight: 260, overflowY: "auto" }}>
                              {halfFlavors.map((flavor) => {
                                const selected = detailHalfFlavorId === flavor.id;
                                const flavorOption = findOptionByVariationLabel(flavor, getDetailVariationLabel());
                                const flavorPrice = flavorOption
                                  ? parseFloat(flavorOption.value) || 0
                                  : parseFloat(flavor.value) || 0;
                                return (
                                  <Box
                                    key={flavor.id}
                                    component="button"
                                    type="button"
                                    className={classes.halfFlavorCard}
                                    style={{
                                      padding: "8px 10px",
                                      marginBottom: 6,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                      ...(selected
                                        ? {
                                            borderColor: brandPrimary,
                                            backgroundColor: brandSoft,
                                            boxShadow: `0 0 0 1px ${brandPrimary}`,
                                          }
                                        : {}),
                                    }}
                                    onClick={() => setDetailHalfFlavorId(selected ? null : flavor.id)}
                                  >
                                    {flavor.imageUrl && (
                                      <img
                                        src={flavor.imageUrl}
                                        alt={flavor.name}
                                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                                        onError={(e) => { e.target.style.display = "none"; }}
                                      />
                                    )}
                                    <Box flex={1} style={{ textAlign: "left", minWidth: 0 }}>
                                      <Typography variant="body2" style={{ fontWeight: selected ? 700 : 500, lineHeight: 1.25 }}>
                                        {flavor.name}
                                      </Typography>
                                      {flavor.description && (
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                          style={{
                                            display: "-webkit-box",
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                          }}
                                        >
                                          {flavor.description}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Typography variant="body2" style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                                      R$ {flavorPrice.toFixed(2).replace(".", ",")}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                            {selectedHalfFlavor && (
                              <Typography variant="caption" style={{ display: "block", marginTop: 4, color: brandPrimary, fontWeight: 700 }}>
                                Meio a meio: {detailProduct.name} / {selectedHalfFlavor.name} — R$ {getDetailUnitPrice().toFixed(2).replace(".", ",")}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {hasAddonsToShow(detailProduct) && (
                      <Box mt={2} ref={detailAddonsSectionRef}>
                        <Box
                          className={classes.addonsSectionBanner}
                          style={{
                            borderColor: brandPrimary,
                            backgroundColor: brandSoft,
                          }}
                        >
                          <Box>
                            <Typography style={{ fontWeight: 800, fontSize: "0.95rem", color: brandPrimary }}>
                              Monte do seu jeito
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Escolha bordas, extras e acompanhamentos
                            </Typography>
                          </Box>
                          <KeyboardArrowDownIcon style={{ color: brandPrimary }} />
                        </Box>
                        {(g.subgroups || [])
                          .filter((sg) => (sg.items || []).length > 0)
                          .map((sg) => renderAddonSection(sg.name, sg, sg.items, `sg-${sg.id}`))}
                        {renderAddonSection("Adicionais", g, g.items || [], "root")}
                      </Box>
                    )}

                    <Box mt={2}>
                      <TextField
                        label="Alguma observação?"
                        placeholder="Ex.: sem cebola, molho à parte..."
                        value={detailObservation}
                        onChange={(e) => setDetailObservation(e.target.value)}
                        inputProps={{ maxLength: 200 }}
                        variant={fieldVariant}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        helperText={`${detailObservation.length}/200`}
                      />
                    </Box>
                  </DialogContent>

                  {showAddonsScrollHint && hasAddonsToShow(detailProduct) && (
                    <Box className={classes.addonsScrollHint}>
                      <button
                        type="button"
                        className={classes.addonsScrollHintBtn}
                        style={{ backgroundColor: brandPrimary }}
                        onClick={() => {
                          const el = detailAddonsSectionRef.current;
                          if (el) {
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }}
                      >
                        Monte do seu jeito
                        <KeyboardArrowDownIcon fontSize="small" />
                      </button>
                    </Box>
                  )}

                  <Box className={classes.detailFooter}>
                    <Box className={classes.detailStepper}>
                      <IconButton
                        size="small"
                        onClick={() => setDetailQty((q) => Math.max(1, (parseInt(q, 10) || 1) - 1))}
                        disabled={qtyNum <= 1}
                        aria-label="Menos"
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>
                        {qtyNum}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setDetailQty((q) => (parseInt(q, 10) || 1) + 1)}
                        aria-label="Mais"
                        style={{ color: brandPrimary }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={confirmProductDetail}
                      disabled={detailHalfMode && detailHalfFlavorId == null}
                      style={{
                        backgroundColor:
                          detailHalfMode && detailHalfFlavorId == null ? "#bdbdbd" : brandPrimary,
                        color: "#fff",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: 10,
                        padding: "10px 16px",
                      }}
                    >
                      {detailHalfMode && detailHalfFlavorId == null
                        ? "Escolha o segundo sabor"
                        : `Adicionar • R$ ${lineTotal.toFixed(2).replace(".", ",")}`}
                    </Button>
                  </Box>
                </>
              );
            })()}
          </Dialog>

          {view === "checkout" && (
            <form onSubmit={handleSubmit}>
              <Box style={{ marginTop: 24 }}>
                {/* Listar todos os itens normais */}
                {Object.keys(selectedItems).length > 0 && (
                  <Box marginBottom={2} padding={2} bgcolor="action.hover" borderRadius={8}>
                    <Typography variant="subtitle2" gutterBottom>Itens do pedido</Typography>
                    {Object.keys(selectedItems).map((key) => {
                      const { product, productValue, productName, addonsTotal } = getItemDetailsByKey(key);
                      const quantity = selectedItems[key];
                      const lineTotal = (productValue + (addonsTotal || 0)) * quantity;
                      const addonsList = selectedAddons[key] || [];
                      const lineObservation = selectedObservations[key] || "";
                      const checkoutComboItems = product?.isCombo
                        ? (product.comboItems || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        : [];
                      return (
                        <Box key={key} display="flex" alignItems="flex-start" justifyContent="space-between" style={{ marginTop: 4 }}>
                          <Box flex={1}>
                            <Typography variant="body2">
                              {quantity}x {productName}
                              {product?.isCombo ? " (Combo)" : ""} — R$ {lineTotal.toFixed(2).replace(".", ",")}
                            </Typography>
                            {checkoutComboItems.length > 0 && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                {checkoutComboItems
                                  .map((ci) => {
                                    const q = Number(ci.quantity) || 1;
                                    const name = ci.product?.name || `Produto #${ci.productId}`;
                                    return q > 1 ? `${q}x ${name}` : name;
                                  })
                                  .join(" · ")}
                              </Typography>
                            )}
                            {addonsList.length > 0 && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                {addonsList.map((a) => ((a.quantity ?? 1) > 1 ? `${a.quantity}x ` : "") + `${a.label} (+ R$ ${Number(a.value).toFixed(2).replace(".", ",")})`).join(", ")}
                              </Typography>
                            )}
                            {lineObservation && (
                              <Typography variant="caption" color="textSecondary" display="block" style={{ fontStyle: "italic" }}>
                                Obs: {lineObservation}
                              </Typography>
                            )}
                          </Box>
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
                      const addonsTotal = (item.addons || []).reduce(
                        (sum, a) => sum + (Number(a.value) || 0) * (a.quantity ?? 1),
                        0
                      );
                      const label = h1 && h2
                        ? `Meio a meio: ${h1.name} / ${h2.name}`
                        : "Meio a meio";
                      const addonLabels = (item.addons || [])
                        .filter((a) => (a.quantity ?? 1) > 0)
                        .map((a) => `${a.quantity > 1 ? `${a.quantity}x ` : ""}${a.label}`)
                        .join(", ");
                      return (
                        <Box key={idx} display="flex" alignItems="flex-start" justifyContent="space-between" style={{ marginTop: 8 }}>
                          <Box>
                            <Typography variant="body2">
                              {item.quantity}x {label} — R$ {((unitVal + addonsTotal) * item.quantity).toFixed(2).replace(".", ",")}
                            </Typography>
                            {addonLabels && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                + {addonLabels}
                              </Typography>
                            )}
                            {item.observation && (
                              <Typography variant="caption" color="textSecondary" display="block" style={{ fontStyle: "italic" }}>
                                Obs: {item.observation}
                              </Typography>
                            )}
                            {base && hasAddonsToShow(base) && (
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => openAddOnModalForHalfEdit(idx)}
                                style={{ marginTop: 4, paddingLeft: 0 }}
                              >
                                {addonLabels ? "Alterar adicionais" : "Adicionais"}
                              </Button>
                            )}
                          </Box>
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
                      {formatMesaComandaTitle(mesaFromQR)}
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

                {/* Cupom de desconto */}
                {getTotalItems() > 0 && (
                  <Paper className={classes.summaryCard} style={{ marginBottom: 12 }}>
                    <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 8 }}>
                      Cupom de desconto
                    </Typography>
                    {appliedCoupon ? (
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" style={{ fontWeight: 700, color: "#2e7d32" }}>
                            {appliedCoupon.code} aplicado
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Desconto de R$ {getCouponDiscount().toFixed(2).replace(".", ",")}
                          </Typography>
                        </Box>
                        <Button size="small" color="secondary" onClick={removeCoupon} style={{ textTransform: "none" }}>
                          Remover
                        </Button>
                      </Box>
                    ) : (
                      <Box display="flex" style={{ gap: 8 }}>
                        <TextField
                          placeholder="Digite o código"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          variant={fieldVariant}
                          size="small"
                          fullWidth
                          inputProps={{ maxLength: 30, style: { textTransform: "uppercase" } }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={applyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          style={{ borderColor: brandPrimary, color: brandPrimary, textTransform: "none", whiteSpace: "nowrap" }}
                        >
                          {couponLoading ? "..." : "Aplicar"}
                        </Button>
                      </Box>
                    )}
                  </Paper>
                )}

                {/* Resumo do pedido */}
                {getTotalItems() > 0 && (
                  <Paper className={classes.summaryCard}>
                    <Typography variant="h6" gutterBottom>
                      Resumo do Pedido
                    </Typography>
                    {(() => {
                      const fee = getDeliveryFeeAmount();
                      const subtotal = getCartSubtotal();
                      const discount = getCouponDiscount();
                      const total = getFinalTotal();
                      return (
                        <>
                    <Box className={classes.summaryRow}>
                      <Typography>Total de itens:</Typography>
                      <Typography fontWeight={600}>{getTotalItems()}</Typography>
                    </Box>
                    {(fee > 0 || discount > 0) && (
                      <Box className={classes.summaryRow}>
                        <Typography>Subtotal:</Typography>
                        <Typography fontWeight={600}>
                          R$ {subtotal.toFixed(2).replace(".", ",")}
                        </Typography>
                      </Box>
                    )}
                    {fee > 0 && (
                      <Box className={classes.summaryRow}>
                        <Typography>Taxa de entrega:</Typography>
                        <Typography fontWeight={600}>
                          R$ {fee.toFixed(2).replace(".", ",")}
                        </Typography>
                      </Box>
                    )}
                    {discount > 0 && (
                      <Box className={classes.summaryRow}>
                        <Typography style={{ color: "#2e7d32" }}>
                          Cupom ({appliedCoupon?.code}):
                        </Typography>
                        <Typography style={{ color: "#2e7d32", fontWeight: 600 }}>
                          - R$ {discount.toFixed(2).replace(".", ",")}
                        </Typography>
                      </Box>
                    )}
                    <Box className={classes.summaryRow}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" style={{ color: brandPrimary }}>
                        R$ {total.toFixed(2).replace(".", ",")}
                      </Typography>
                    </Box>
                    {(() => {
                      const meta = getOrderMetadata();
                      if (
                        minOrderValue > 0 &&
                        meta?.orderType === "delivery" &&
                        subtotal < minOrderValue
                      ) {
                        return (
                          <Typography
                            variant="caption"
                            style={{ color: "#c62828", display: "block", marginTop: 8 }}
                          >
                            Pedido mínimo para entrega: R$ {minOrderValue.toFixed(2).replace(".", ",")} —
                            faltam R$ {(minOrderValue - subtotal).toFixed(2).replace(".", ",")}
                          </Typography>
                        );
                      }
                      return null;
                    })()}
                        </>
                      );
                    })()}
                  </Paper>
                )}

                {String(form?.settings?.cartFooterMessage || "").trim() && (
                  <Paper
                    className={classes.summaryCard}
                    style={{ marginTop: getTotalItems() > 0 ? 12 : 0 }}
                  >
                    <Typography variant="body2" color="textSecondary" style={{ whiteSpace: "pre-line" }}>
                      {String(form.settings.cartFooterMessage).trim()}
                    </Typography>
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

                {/* Link para CompuChat no final do formulário */}
                <Box style={{ marginTop: 24, textAlign: "center", paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                    Formulário criado com
                  </Typography>
                  <Button
                    href="https://www.compuchat.cloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    color="primary"
                    size="small"
                    style={{ textTransform: "none" }}
                  >
                    CompuChat
                  </Button>
                </Box>
              </Box>
            </form>
          )}
        </Box>
      </Box>

      {/* Barra de sacola sticky: "Finalizar • N itens • R$ X" (some quando vazia ou no checkout) */}
      {!submitted && form && groups.length > 0 && view === "menu" && getTotalItems() > 0 && (
        <Box
          className={classes.stickyCartBar}
          style={{ backgroundColor: brandPrimary }}
          onClick={() => setView("checkout")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setView("checkout")}
        >
          <span>Finalizar</span>
          <span style={{ opacity: 0.9, fontWeight: 600 }}>
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "itens"}
          </span>
          <span>R$ {getFinalTotal().toFixed(2).replace(".", ",")}</span>
        </Box>
      )}

      {/* Barra inferior estilo Anota Aí: Início | Carrinho */}
      {!submitted && form && groups.length > 0 && (
        <nav className={classes.bottomNav}>
          <div
            className={`${classes.bottomNavItem} ${view === "menu" ? "active" : ""}`}
            style={view === "menu" ? { color: brandPrimary } : undefined}
            onClick={() => setView("menu")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setView("menu")}
          >
            <span style={{ fontSize: "0.75rem" }}>Início</span>
          </div>
          <div
            className={`${classes.bottomNavItem} ${view === "checkout" ? "active" : ""}`}
            style={view === "checkout" ? { color: brandPrimary } : undefined}
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
