import React, { useState, useEffect } from "react";
import qs from "query-string";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import usePlans from "../../hooks/usePlans";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InputMask from "react-input-mask";

import BusinessIcon from "@material-ui/icons/Business";
import EmailIcon from "@material-ui/icons/Email";
import PhoneIcon from "@material-ui/icons/Phone";
import LockIcon from "@material-ui/icons/Lock";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import PeopleIcon from "@material-ui/icons/People";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import QueueIcon from "@material-ui/icons/Queue";
import StarIcon from "@material-ui/icons/Star";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import AutorenewIcon from "@material-ui/icons/Autorenew";

import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import moment from "moment";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CreditCardIcon from "@material-ui/icons/CreditCard";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(180deg, #0A0A0F 0%, #111827 50%, #0A0A0F 100%)",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  mainCard: {
    maxWidth: 1100,
    width: "100%",
    borderRadius: 24,
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))",
    border: "1px solid rgba(0, 217, 255, 0.15)",
    backdropFilter: "blur(20px)",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  gridContainer: {
    minHeight: 600,
    alignItems: "flex-start",
  },
  // Coluna esquerda - Benefícios
  benefitsColumn: {
    background: "linear-gradient(135deg, rgba(0, 217, 255, 0.08), rgba(34, 197, 94, 0.08))",
    padding: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderRight: "1px solid rgba(0, 217, 255, 0.1)",
    [theme.breakpoints.down("sm")]: {
      borderRight: "none",
      borderBottom: "1px solid rgba(0, 217, 255, 0.1)",
      padding: theme.spacing(3),
    },
  },
  trialBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: 30,
    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    width: "fit-content",
    marginBottom: theme.spacing(3),
  },
  trialBadgeText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#22C55E",
  },
  benefitsTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(2),
    lineHeight: 1.2,
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.5rem",
    },
  },
  benefitsSubtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    color: "rgba(148, 163, 184, 0.9)",
    marginBottom: theme.spacing(4),
    lineHeight: 1.6,
  },
  benefitsList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  benefitItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(34, 197, 94, 0.15))",
    color: "#00D9FF",
    "& svg": {
      fontSize: 18,
    },
  },
  benefitText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.95rem",
    color: "#E5E7EB",
  },
  // Coluna direita - Formulário
  formColumn: {
    padding: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
  formTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1.5rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(3),
  },
  textField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      background: "rgba(30, 41, 59, 0.5)",
      "& fieldset": {
        borderColor: "rgba(148, 163, 184, 0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(0, 217, 255, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00D9FF",
        borderWidth: 2,
      },
    },
    "& .MuiOutlinedInput-input": {
      color: "#F9FAFB !important",
      caretColor: "#F9FAFB",
      "&::placeholder": {
        color: "rgba(148, 163, 184, 0.6)",
        opacity: 1,
      },
      // Corrigir autofill do navegador
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 100px rgba(30, 41, 59, 0.9) inset !important",
        WebkitTextFillColor: "#F9FAFB !important",
        caretColor: "#F9FAFB !important",
        borderRadius: 12,
      },
      "&:-webkit-autofill:hover": {
        WebkitBoxShadow: "0 0 0 100px rgba(30, 41, 59, 0.9) inset !important",
        WebkitTextFillColor: "#F9FAFB !important",
      },
      "&:-webkit-autofill:focus": {
        WebkitBoxShadow: "0 0 0 100px rgba(30, 41, 59, 0.9) inset !important",
        WebkitTextFillColor: "#F9FAFB !important",
      },
      "&:-webkit-autofill:active": {
        WebkitBoxShadow: "0 0 0 100px rgba(30, 41, 59, 0.9) inset !important",
        WebkitTextFillColor: "#F9FAFB !important",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(148, 163, 184, 0.8)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#00D9FF",
    },
    "& .MuiInputAdornment-root": {
      color: "rgba(148, 163, 184, 0.6)",
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      color: "rgba(148, 163, 184, 0.6)",
    },
    "& .MuiFormHelperText-root": {
      color: "#EF4444",
    },
  },
  // Seleção de Plano
  plansSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  plansSectionTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#E5E7EB",
    marginBottom: theme.spacing(1.5),
  },
  plansGrid: {
    display: "flex",
    gap: theme.spacing(1.5),
    flexWrap: "wrap",
  },
  planCard: {
    flex: "1 1 calc(50% - 12px)",
    minWidth: 140,
    padding: theme.spacing(2),
    borderRadius: 12,
    background: "rgba(30, 41, 59, 0.4)",
    border: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(30, 41, 59, 0.6)",
      borderColor: "rgba(0, 217, 255, 0.3)",
    },
  },
  planCardSelected: {
    background: "rgba(0, 217, 255, 0.1)",
    borderColor: "#00D9FF",
    boxShadow: "0 0 20px rgba(0, 217, 255, 0.2)",
  },
  planCardFeatured: {
    position: "relative",
    "&::before": {
      content: '"Popular"',
      position: "absolute",
      top: -8,
      right: 8,
      fontSize: "0.65rem",
      fontWeight: 700,
      padding: "2px 8px",
      borderRadius: 10,
      background: "linear-gradient(135deg, #00D9FF, #22C55E)",
      color: "#0A0A0F",
      textTransform: "uppercase",
    },
  },
  planName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(0.5),
  },
  planPrice: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1.25rem",
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: theme.spacing(1),
  },
  planFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  planFeature: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.75rem",
    color: "rgba(148, 163, 184, 0.9)",
    "& svg": {
      fontSize: 14,
      color: "#22C55E",
    },
  },
  // Cards de módulos (mesma linguagem visual dos planos)
  modulesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1),
  },
  moduleCard: {
    padding: theme.spacing(2),
    borderRadius: 12,
    background: "rgba(30, 41, 59, 0.45)",
    border: "2px solid rgba(148, 163, 184, 0.2)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    position: "relative",
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      background: "rgba(30, 41, 59, 0.65)",
      borderColor: "rgba(0, 217, 255, 0.35)",
    },
  },
  moduleCardSelected: {
    background: "rgba(0, 217, 255, 0.08)",
    borderColor: "#00D9FF",
    boxShadow: "0 0 16px rgba(0, 217, 255, 0.15)",
  },
  moduleCardName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(0.5),
    paddingRight: 28,
  },
  moduleCardDesc: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.75rem",
    color: "rgba(148, 163, 184, 0.95)",
    lineHeight: 1.45,
    flex: 1,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    marginBottom: theme.spacing(1),
  },
  moduleCardPrice: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1rem",
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginTop: "auto",
  },
  moduleCardBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    color: "#22C55E",
    "& svg": { fontSize: 22 },
  },
  // Botões
  submitButton: {
    padding: "14px 24px",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    color: "#0A0A0F",
    boxShadow: "0 4px 15px rgba(0, 217, 255, 0.3)",
    transition: "all 0.3s ease",
    marginTop: theme.spacing(2),
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(0, 217, 255, 0.4)",
      background: "linear-gradient(135deg, #00E5FF, #2DD881)",
    },
    "&:disabled": {
      background: "rgba(148, 163, 184, 0.3)",
      color: "rgba(148, 163, 184, 0.5)",
    },
  },
  loginLink: {
    marginTop: theme.spacing(3),
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "rgba(148, 163, 184, 0.8)",
    "& a": {
      color: "#00D9FF",
      textDecoration: "none",
      fontWeight: 600,
      "&:hover": {
        textDecoration: "underline",
      },
    },
  },
  loadingPlans: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
  // Steps
  stepsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    background: "rgba(30, 41, 59, 0.3)",
    borderRadius: 12,
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    borderRadius: 8,
    transition: "all 0.3s ease",
  },
  stepActive: {
    background: "rgba(0, 217, 255, 0.15)",
    border: "1px solid rgba(0, 217, 255, 0.3)",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "0.85rem",
    background: "rgba(148, 163, 184, 0.2)",
    color: "rgba(148, 163, 184, 0.8)",
  },
  stepNumberActive: {
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    color: "#0A0A0F",
  },
  stepLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "rgba(148, 163, 184, 0.8)",
  },
  stepLabelActive: {
    color: "#F9FAFB",
    fontWeight: 600,
  },
  stepDivider: {
    width: 40,
    height: 2,
    background: "rgba(148, 163, 184, 0.2)",
    borderRadius: 2,
  },
  navigationButtons: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  backButton: {
    padding: "14px 24px",
    borderRadius: 12,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none",
    background: "transparent",
    color: "#F9FAFB",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    "&:hover": {
      background: "rgba(148, 163, 184, 0.1)",
      borderColor: "rgba(148, 163, 184, 0.5)",
    },
  },
  paymentStepContainer: {
    marginTop: theme.spacing(2),
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .required("Nome da empresa é obrigatório"),
  email: Yup.string()
    .email("Email inválido")
    .required("Email é obrigatório"),
  password: Yup.string()
    .min(5, "Senha deve ter no mínimo 5 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres")
    .required("Senha é obrigatória"),
  phone: Yup.string().required("Telefone é obrigatório"),
  cpfCnpj: Yup.string()
    .test("cpfcnpj-len", "CPF (11 dígitos) ou CNPJ (14 dígitos) inválido", (v) => {
      const digits = (v ?? "").replace(/\D/g, "");
      return digits.length === 11 || digits.length === 14;
    })
    .required("CPF/CNPJ é obrigatório"),
});

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();

  const params = qs.parse(window.location.search);
  const companyId = params.companyId || null;
  const planIdFromUrl = params.planId ? parseInt(params.planId, 10) : null;
  const isFreeFlow = params.free === "true"; // Detecta se veio do botão "Começar gratuitamente"

  const initialState = {
    name: "",
    email: "",
    phone: "",
    password: "",
    cpfCnpj: "",
    planId: "",
  };

  // Pagamento: PIX (padrão) ou cartão — assinatura recorrente no Asaas
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiryMonth, setCardExpiryMonth] = useState("");
  const [cardExpiryYear, setCardExpiryYear] = useState("");
  const [cardCcv, setCardCcv] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");

  // Módulos opcionais (slugs) — mesma API da LP
  const [availableModules, setAvailableModules] = useState([]);
  /** Apenas um módulo por vez; null = nenhum selecionado */
  const [selectedModuleSlug, setSelectedModuleSlug] = useState(null);

  const [user] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [currentStep] = useState(1); // Apenas step 1 (dados da empresa)

  const { list: listPlans } = usePlans();

  const dueDate = moment().add(7, "day").format();

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const list = await listPlans();
        if (!isMounted) return;
        setPlans(list);
        // Se veio do botão "Começar gratuitamente", selecionar primeiro plano disponível (todos terão período de teste)
        if (list.length > 0) {
          if (isFreeFlow) {
            // Fluxo gratuito: procurar plano gratuito primeiro, se não houver, selecionar o primeiro disponível
            const freePlan = list.find((p) => p.value === 0 || p.value === null);
            if (freePlan) {
              setSelectedPlanId(freePlan.id);
            } else {
              // Se não houver plano gratuito, selecionar o primeiro disponível (todos terão período de teste de 7 dias)
              setSelectedPlanId(list[0].id);
            }
          } else if (planIdFromUrl) {
            // Verificar se o planId da URL existe na lista
            const planExists = list.find((p) => p.id === planIdFromUrl);
            if (planExists) {
              setSelectedPlanId(planIdFromUrl);
            } else {
              // Se não existir, procurar plano gratuito primeiro
              const freePlan = list.find((p) => p.value === 0 || p.value === null);
              if (freePlan) {
                setSelectedPlanId(freePlan.id);
              } else {
                // Se não houver plano gratuito, selecionar o primeiro
                setSelectedPlanId(list[0].id);
              }
            }
          } else {
            // Procurar plano gratuito primeiro (valor 0 ou null)
            const freePlan = list.find((p) => p.value === 0 || p.value === null);
            if (freePlan) {
              setSelectedPlanId(freePlan.id);
            } else {
              // Se não houver plano gratuito, selecionar o primeiro da lista
              setSelectedPlanId(list[0].id);
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Erro ao carregar planos:", err);
        toast.error("Erro ao carregar planos. Por favor, recarregue a página.");
      } finally {
        if (isMounted) {
          setLoadingPlans(false);
        }
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [listPlans, planIdFromUrl, isFreeFlow]); // listPlans agora é estável com useCallback

  // Carregar módulos públicos para aquisição junto ao plano
  useEffect(() => {
    let mounted = true;
    openApi
      .get("/modules/public")
      .then(({ data }) => {
        if (mounted && data?.modules) setAvailableModules(data.modules);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const selectModule = (slug) => {
    setSelectedModuleSlug((prev) => (prev === slug ? null : slug));
  };


  const handleSignUp = async (values) => {
    if (!selectedPlanId) {
      toast.error("Por favor, selecione um plano.");
      return;
    }

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (!selectedPlan) {
      toast.error("Plano não encontrado");
      return;
    }

    const isFreePlan = selectedPlan.value === 0 || selectedPlan.value === null;
    const shouldCreateFreeAccount = isFreeFlow || isFreePlan;

    try {
      if (shouldCreateFreeAccount) {
        // Criar conta gratuita diretamente
        const response = await openApi.post("/companies/create-free-account", {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          planId: selectedPlanId,
          ...(selectedModuleSlug && { modules: [selectedModuleSlug] }),
        });

        if (response.data && response.data.success) {
          toast.success(response.data.message || "Conta criada com sucesso!");
          setTimeout(() => history.push("/login"), 2000);
        } else {
          toast.error("Erro ao criar conta. Por favor, tente novamente.");
        }
      } else {
        const payload = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          cpfCnpj: values.cpfCnpj,
          planId: selectedPlanId,
          recurrence: "MENSAL",
          billingType: paymentMethod === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX",
          ...(selectedModuleSlug && { modules: [selectedModuleSlug] }),
        };

        if (paymentMethod === "CREDIT_CARD") {
          const num = (cardNumber || "").replace(/\D/g, "");
          if (num.length < 13) {
            toast.error("Número do cartão inválido.");
            return;
          }
          if (!cardHolderName.trim()) {
            toast.error("Nome no cartão é obrigatório.");
            return;
          }
          if (!cardExpiryMonth || !cardExpiryYear || !cardCcv) {
            toast.error("Preencha validade e CVV do cartão.");
            return;
          }
          if (!(postalCode || "").replace(/\D/g, "") || !addressNumber.trim()) {
            toast.error("CEP e número do endereço são obrigatórios para pagamento com cartão.");
            return;
          }
          payload.postalCode = postalCode;
          payload.addressNumber = addressNumber;
          payload.creditCard = {
            holderName: cardHolderName.trim(),
            number: num,
            expiryMonth: String(cardExpiryMonth).padStart(2, "0"),
            expiryYear: String(cardExpiryYear).length === 2 ? `20${cardExpiryYear}` : String(cardExpiryYear),
            ccv: String(cardCcv).replace(/\D/g, ""),
          };
        }

        const response = await openApi.post("/companies/create-asaas-subscription", payload);
        const data = response.data;

        if (data && data.companyId) {
          if (data.paymentConfirmed) {
            toast.success("Pagamento aprovado! Sua conta está ativa.");
            history.push("/signup/success");
            return;
          }
          if (data.billingType === "CREDIT_CARD" && !data.paymentConfirmed) {
            toast.info("Assinatura criada. Aguardando confirmação do cartão...");
            history.push("/signup/pending", {
              companyId: data.companyId,
              value: data.value,
              planName: data.planName,
              cardPending: true,
            });
            return;
          }
          if (data.pixUnavailable) {
            toast.warning("PIX indisponível no momento. Aguardando confirmação...");
            history.push("/signup/pending", {
              companyId: data.companyId,
              value: data.value,
              planName: data.planName,
            });
            return;
          }
          toast.success("Assinatura criada! Pague com PIX para ativar.");
          history.push("/signup/pending", {
            companyId: data.companyId,
            pixQrCode: data.pixQrCode,
            pixPayload: data.pixPayload,
            expirationDate: data.expirationDate,
            value: data.value,
            planName: data.planName,
          });
        } else {
          toast.error("Erro ao criar assinatura. Por favor, tente novamente.");
        }
      }
    } catch (err) {
      console.error("Erro ao processar cadastro:", err);
      let errorMessage = shouldCreateFreeAccount
        ? "Erro ao criar conta. Por favor, tente novamente."
        : "Erro ao criar assinatura. Por favor, tente novamente.";

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    }
  };


  const formatCurrency = (value) => {
    if (!value && value !== 0) return "Consulte";
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const benefits = [
    { icon: <WhatsAppIcon />, text: "Múltiplas contas WhatsApp" },
    { icon: <PeopleIcon />, text: "Time multiusuário" },
    { icon: <FlashOnIcon />, text: "Campanhas em massa" },
    { icon: <AutorenewIcon />, text: "Chatbot com IA" },
    { icon: <VerifiedUserIcon />, text: "Suporte especializado" },
  ];

  return (
    <Box className={classes.root}>
      <Container maxWidth="lg" className={classes.container}>
        <Card className={classes.mainCard} elevation={0}>
          <Grid container className={classes.gridContainer}>
            {/* Coluna Esquerda - Benefícios */}
            <Grid item xs={12} md={5} className={classes.benefitsColumn}>
              {isFreeFlow && (
              <Box className={classes.trialBadge}>
                <StarIcon style={{ fontSize: 18, color: "#22C55E" }} />
                <Typography className={classes.trialBadgeText}>
                  7 dias grátis
                </Typography>
              </Box>
              )}

              <Typography className={classes.benefitsTitle}>
                Comece a transformar seu atendimento hoje
              </Typography>

              <Typography className={classes.benefitsSubtitle}>
                Crie sua conta em segundos e tenha acesso completo a todas as
                funcionalidades durante o período de teste.
              </Typography>

              <Box className={classes.benefitsList}>
                {benefits.map((benefit, index) => (
                  <Box key={index} className={classes.benefitItem}>
                    <Box className={classes.benefitIcon}>{benefit.icon}</Box>
                    <Typography className={classes.benefitText}>
                      {benefit.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Coluna Direita - Formulário */}
            <Grid item xs={12} md={7} className={classes.formColumn}>
              <Typography className={classes.formTitle}>
                {currentStep === 1 ? "Criar conta" : "Dados de Pagamento"}
              </Typography>

              {/* Steps Indicator - Removido pois agora temos apenas um step */}

              <Formik
                initialValues={user}
                enableReinitialize={true}
                validationSchema={UserSchema}
                onSubmit={async (values, actions) => {
                  await handleSignUp(values);
                  actions.setSubmitting(false);
                }}
              >
                {({ touched, errors, isSubmitting }) => (
                  <Form>
                    <Field
                      as={TextField}
                      name="name"
                      label="Nome da empresa"
                      variant="outlined"
                      fullWidth
                      className={classes.textField}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Field
                      as={TextField}
                      name="email"
                      label="Email"
                      type="email"
                      variant="outlined"
                      fullWidth
                      className={classes.textField}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Field name="phone">
                      {({ field, meta }) => (
                        <InputMask
                          {...field}
                          mask="(99) 99999-9999"
                          maskChar={null}
                        >
                          {(inputProps) => (
                            <TextField
                              {...inputProps}
                              label="Telefone"
                              variant="outlined"
                              fullWidth
                              className={classes.textField}
                              error={meta.touched && Boolean(meta.error)}
                              helperText={meta.touched && meta.error}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        </InputMask>
                      )}
                    </Field>

                    <Field
                      as={TextField}
                      name="password"
                      label="Senha"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      className={classes.textField}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              style={{ color: "rgba(148, 163, 184, 0.6)" }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* CPF/CNPJ — oculto para planos gratuitos */}
                    {(() => {
                      const selPlan = plans.find((p) => p.id === selectedPlanId);
                      const isPaid = selPlan && selPlan.value > 0 && !isFreeFlow;
                      if (!isPaid) return null;
                      return (
                        <Field name="cpfCnpj">
                          {({ field, meta }) => (
                            <InputMask
                              {...field}
                              mask={
                                field.value.replace(/\D/g, "").length <= 11
                                  ? "999.999.999-999"
                                  : "99.999.999/9999-99"
                              }
                              maskChar={null}
                            >
                              {(inputProps) => (
                                <TextField
                                  {...inputProps}
                                  label="CPF / CNPJ"
                                  variant="outlined"
                                  fullWidth
                                  className={classes.textField}
                                  error={meta.touched && Boolean(meta.error)}
                                  helperText={meta.touched && meta.error}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <VerifiedUserIcon />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              )}
                            </InputMask>
                          )}
                        </Field>
                      );
                    })()}

                    {/* PIX vs Cartão — só planos pagos */}
                    {(() => {
                      const selPlan = plans.find((p) => p.id === selectedPlanId);
                      const isPaid = selPlan && selPlan.value > 0 && !isFreeFlow;
                      if (!isPaid) return null;
                      return (
                        <Box style={{ marginBottom: 16 }}>
                          <Typography className={classes.plansSectionTitle}>
                            Forma de pagamento
                          </Typography>
                          <Box style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <Button
                              type="button"
                              variant={paymentMethod === "PIX" ? "contained" : "outlined"}
                              onClick={() => setPaymentMethod("PIX")}
                              style={{
                                flex: 1,
                                minWidth: 120,
                                borderColor: "rgba(0, 217, 255, 0.5)",
                                color: paymentMethod === "PIX" ? "#0A0A0F" : "#E5E7EB",
                                background: paymentMethod === "PIX" ? "linear-gradient(135deg, #00D9FF, #22C55E)" : "transparent",
                              }}
                            >
                              PIX
                            </Button>
                            <Button
                              type="button"
                              variant={paymentMethod === "CREDIT_CARD" ? "contained" : "outlined"}
                              onClick={() => setPaymentMethod("CREDIT_CARD")}
                              startIcon={<CreditCardIcon />}
                              style={{
                                flex: 1,
                                minWidth: 120,
                                borderColor: "rgba(0, 217, 255, 0.5)",
                                color: paymentMethod === "CREDIT_CARD" ? "#0A0A0F" : "#E5E7EB",
                                background: paymentMethod === "CREDIT_CARD" ? "linear-gradient(135deg, #00D9FF, #22C55E)" : "transparent",
                              }}
                            >
                              Cartão (assinatura)
                            </Button>
                          </Box>
                          {paymentMethod === "CREDIT_CARD" && (
                            <Box style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                              <TextField
                                label="Nome no cartão"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={cardHolderName}
                                onChange={(e) => setCardHolderName(e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CreditCardIcon />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                              <TextField
                                label="Número do cartão"
                                variant="outlined"
                                fullWidth
                                className={classes.textField}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="0000 0000 0000 0000"
                              />
                              <Box style={{ display: "flex", gap: 12 }}>
                                <TextField
                                  label="Mês"
                                  variant="outlined"
                                  className={classes.textField}
                                  style={{ flex: 1 }}
                                  value={cardExpiryMonth}
                                  onChange={(e) => setCardExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                                  placeholder="MM"
                                />
                                <TextField
                                  label="Ano"
                                  variant="outlined"
                                  className={classes.textField}
                                  style={{ flex: 1 }}
                                  value={cardExpiryYear}
                                  onChange={(e) => setCardExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                  placeholder="AAAA"
                                />
                                <TextField
                                  label="CVV"
                                  variant="outlined"
                                  className={classes.textField}
                                  style={{ flex: 1 }}
                                  type="password"
                                  value={cardCcv}
                                  onChange={(e) => setCardCcv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                />
                              </Box>
                              <Box style={{ display: "flex", gap: 12 }}>
                                <TextField
                                  label="CEP"
                                  variant="outlined"
                                  className={classes.textField}
                                  style={{ flex: 1 }}
                                  value={postalCode}
                                  onChange={(e) => setPostalCode(e.target.value)}
                                  placeholder="00000-000"
                                />
                                <TextField
                                  label="Nº endereço"
                                  variant="outlined"
                                  className={classes.textField}
                                  style={{ flex: 1 }}
                                  value={addressNumber}
                                  onChange={(e) => setAddressNumber(e.target.value)}
                                />
                              </Box>
                              <Typography style={{ fontSize: "0.75rem", color: "rgba(148, 163, 184, 0.8)" }}>
                                A cobrança será recorrente no cartão conforme o plano. Dados enviados com segurança ao Asaas.
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })()}

                      <>
                        {/* Seleção de Plano */}
                        <Box className={classes.plansSection}>
                          <Typography className={classes.plansSectionTitle}>
                          {isFreeFlow ? "Selecione o plano desejado e preencha seus dados..." : "Selecione seu plano"}
                          </Typography>

                          {loadingPlans ? (
                            <Box className={classes.loadingPlans}>
                              <CircularProgress
                                size={30}
                                style={{ color: "#00D9FF" }}
                              />
                            </Box>
                          ) : plans.length === 0 ? (
                            <Typography style={{ color: "rgba(148, 163, 184, 0.7)", fontSize: "0.9rem", textAlign: "center", padding: "16px" }}>
                              Nenhum plano disponível. Entre em contato para mais informações.
                            </Typography>
                          ) : (
                            <Box className={classes.plansGrid}>
                              {plans.map((plan, index) => {
                                const isFeatured =
                                  index === Math.floor(plans.length / 2);
                                const isSelected = selectedPlanId === plan.id;

                                return (
                                  <Box
                                    key={plan.id}
                                    className={`${classes.planCard} ${
                                      isSelected ? classes.planCardSelected : ""
                                    } ${isFeatured ? classes.planCardFeatured : ""}`}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                  >
                                    <Typography className={classes.planName}>
                                      {plan.name}
                                    </Typography>
                                    <Typography className={classes.planPrice}>
                                      R$ {formatCurrency(plan.value)}/mês
                                    </Typography>
                                    <Box className={classes.planFeatures}>
                                      <Box className={classes.planFeature}>
                                        <CheckCircleIcon />
                                        <span>{plan.users || 0} usuário(s)</span>
                                      </Box>
                                      <Box className={classes.planFeature}>
                                        <CheckCircleIcon />
                                        <span>{plan.connections || 0} WhatsApp</span>
                                      </Box>
                                      <Box className={classes.planFeature}>
                                        <CheckCircleIcon />
                                        <span>{plan.queues || 0} fila(s)</span>
                                      </Box>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        </Box>

                        {/* Módulos adicionais — cards com valor e descrição */}
                        {availableModules.length > 0 && (
                          <Box className={classes.plansSection}>
                            <Typography className={classes.plansSectionTitle}>
                              Módulos adicionais (opcional)
                            </Typography>
                            <Typography
                              style={{
                                fontSize: "0.8rem",
                                color: "rgba(148, 163, 184, 0.85)",
                                marginBottom: 8,
                              }}
                            >
                              Selecione um módulo (apenas um por vez). Toque novamente no mesmo card para remover. O valor é somado ao plano quando houver preço cadastrado.
                            </Typography>
                            <Box className={classes.modulesGrid}>
                              {availableModules.map((mod) => {
                                const selected = selectedModuleSlug === mod.id;
                                const priceNum = Number(mod.price);
                                const hasPrice = priceNum > 0;
                                const desc =
                                  mod.description && String(mod.description).trim()
                                    ? String(mod.description).trim()
                                    : "Módulo opcional para expandir as funcionalidades da sua conta.";
                                return (
                                  <Box
                                    key={mod.id}
                                    className={`${classes.moduleCard} ${
                                      selected ? classes.moduleCardSelected : ""
                                    }`}
                                    onClick={() => selectModule(mod.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        selectModule(mod.id);
                                      }
                                    }}
                                  >
                                    {selected && (
                                      <Box className={classes.moduleCardBadge}>
                                        <CheckCircleIcon />
                                      </Box>
                                    )}
                                    <Typography className={classes.moduleCardName}>
                                      {mod.name}
                                    </Typography>
                                    <Typography className={classes.moduleCardDesc}>
                                      {desc}
                                    </Typography>
                                    <Typography className={classes.moduleCardPrice}>
                                      {hasPrice
                                        ? `+ R$ ${priceNum.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                          })}/mês`
                                        : "Incluso / sob consulta"}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        )}

                        {(() => {
                          const selectedPlan = plans.find((p) => p.id === selectedPlanId);
                          const isFreePlan = selectedPlan && (selectedPlan.value === 0 || selectedPlan.value === null);
                          // Se for fluxo gratuito, sempre mostrar "Registrar", senão verificar se é plano gratuito
                          const buttonText = isFreeFlow
                            ? "Registrar"
                            : isFreePlan
                            ? "Registrar"
                            : paymentMethod === "CREDIT_CARD"
                            ? "Assinar com cartão"
                            : "Pagar via PIX";
                          
                          return (
                        <Button
                          type="submit"
                          fullWidth
                          className={classes.submitButton}
                          disabled={isSubmitting || !selectedPlanId}
                          endIcon={<ArrowForwardIcon />}
                        >
                          {isSubmitting ? (
                            <CircularProgress size={24} style={{ color: "#0A0A0F" }} />
                          ) : (
                                buttonText
                          )}
                        </Button>
                          );
                        })()}
                      </>

                    <Typography className={classes.loginLink}>
                      Já tem uma conta?{" "}
                      <RouterLink to="/login">Fazer login</RouterLink>
                    </Typography>
                  </Form>
                )}
              </Formik>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
};

export default SignUp;
