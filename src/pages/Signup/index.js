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
import MercadoPagoCheckout from "../../components/MercadoPagoCheckout";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
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
});

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();

  const params = qs.parse(window.location.search);
  const companyId = params.companyId || null;
  const planIdFromUrl = params.planId ? parseInt(params.planId, 10) : null;

  const initialState = {
    name: "",
    email: "",
    phone: "",
    password: "",
    planId: "",
  };

  const [user] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1 = dados, 2 = pagamento
  const [publicKey, setPublicKey] = useState(null);
  const [paymentToken, setPaymentToken] = useState(null);
  const [isPaymentFormValid, setIsPaymentFormValid] = useState(false);
  const checkoutRef = React.useRef(null);

  const { list: listPlans } = usePlans();

  const dueDate = moment().add(7, "day").format();

  useEffect(() => {
    async function fetchData() {
      try {
        const list = await listPlans();
        setPlans(list);
        // Selecionar plano da URL se existir, senão selecionar o do meio
        if (list.length > 0) {
          if (planIdFromUrl) {
            // Verificar se o planId da URL existe na lista
            const planExists = list.find((p) => p.id === planIdFromUrl);
            if (planExists) {
              setSelectedPlanId(planIdFromUrl);
            } else {
              // Se não existir, selecionar o plano do meio
              const middleIndex = Math.floor(list.length / 2);
              setSelectedPlanId(list[middleIndex].id);
            }
          } else {
            // Selecionar o plano do meio como padrão
            const middleIndex = Math.floor(list.length / 2);
            setSelectedPlanId(list[middleIndex].id);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchData();
  }, [listPlans, planIdFromUrl]);

  // Buscar public key do Mercado Pago
  useEffect(() => {
    // A public key deve vir de uma variável de ambiente ou endpoint específico
    // Por enquanto, vamos buscar do backend
    async function fetchPublicKey() {
      try {
        if (selectedPlanId) {
          const selectedPlan = plans.find((p) => p.id === selectedPlanId);
          if (selectedPlan) {
            // Criar payment intent para obter public key
            const response = await openApi.post("/mercadopago/create-payment-intent", {
              transactionAmount: selectedPlan.value,
              description: `Plano ${selectedPlan.name}`,
            });
            if (response.data.publicKey) {
              setPublicKey(response.data.publicKey);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao obter public key:", err);
        // Fallback: tentar usar variável de ambiente se disponível
        if (process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY) {
          setPublicKey(process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY);
        }
      }
    }
    // Buscar public key assim que tiver um plano selecionado, mesmo que ainda não esteja no step 2
    // Isso garante que a public key esteja pronta quando o usuário avançar para o step 2
    if (selectedPlanId && plans.length > 0) {
      fetchPublicKey();
    }
  }, [selectedPlanId, plans]);

  const handleSignUp = async (values, withPayment = false) => {
    if (withPayment && currentStep === 2) {
      // Cadastro com pagamento
      if (!paymentToken) {
        toast.error("Por favor, preencha os dados de pagamento");
        return;
      }

      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      if (!selectedPlan) {
        toast.error("Plano não encontrado");
        return;
      }

      try {
        // Usar o token que já foi gerado
        if (!paymentToken || !paymentToken.token) {
          toast.error("Erro ao processar dados do cartão. Por favor, tente novamente.");
          return;
        }

        const signupData = {
          companyData: {
            name: values.name,
            email: values.email,
            phone: values.phone,
            password: values.password,
            planId: selectedPlanId,
            campaignsEnabled: true,
            recurrence: "MENSAL",
          },
          paymentData: {
            transactionAmount: selectedPlan.value,
            paymentMethodId: paymentToken.paymentMethodId || "visa",
            token: paymentToken.token,
            installments: paymentToken.installments || 1,
            identificationType: paymentToken.identificationType || "CPF",
            identificationNumber: paymentToken.identificationNumber,
            payer: {
              email: values.email,
              firstName: values.name.split(" ")[0],
              lastName: values.name.split(" ").slice(1).join(" ") || "",
            },
            issuerId: paymentToken.issuerId || "",
          },
        };

        console.log("Enviando dados para cadastro com pagamento:", signupData);
        
        const response = await openApi.post(
          "/companies/cadastro-with-payment",
          signupData
        );

        console.log("Resposta do backend:", response.data);

        if (response.data && response.data.success) {
          toast.success(
            "Conta criada e pagamento aprovado! Você já pode fazer login."
          );
          setTimeout(() => {
            history.push("/login");
          }, 1500);
        } else {
          toast.warn(
            "Conta criada, mas pagamento pendente. Você receberá um email quando o pagamento for confirmado."
          );
          setTimeout(() => {
            history.push("/login");
          }, 1500);
        }
      } catch (err) {
        console.error("Erro completo:", err);
        console.error("Erro response:", err.response);
        console.error("Erro data:", err.response?.data);
        
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            "Erro ao criar conta. Por favor, tente novamente.";
        
        toast.error(errorMessage);
        
        // Não redirecionar em caso de erro, deixar o usuário tentar novamente
      }
    } else {
      // Cadastro sem pagamento (teste grátis)
      const signupData = {
        ...values,
        planId: selectedPlanId,
        recurrence: "MENSAL",
        dueDate: dueDate,
        status: "t",
        campaignsEnabled: true,
      };

      try {
        await openApi.post("/companies/cadastro", signupData);
        toast.success("Conta criada com sucesso! Você tem 7 dias de teste grátis.");
        history.push("/login");
      } catch (err) {
        console.log(err);
        toastError(err);
      }
    }
  };

  const handleNextStep = async (values) => {
    if (currentStep === 1) {
      // Validar dados antes de avançar
      if (!selectedPlanId) {
        toast.error("Selecione um plano para continuar");
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleTokenGenerated = (tokenData) => {
    setPaymentToken(tokenData);
    // Token gerado, agora podemos processar o cadastro
    // Mas não vamos chamar handleSignUp aqui, vamos esperar o submit do formulário
  };

  // Resetar validação quando mudar de step
  useEffect(() => {
    if (currentStep !== 2) {
      setIsPaymentFormValid(false);
    }
  }, [currentStep]);

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
              <Box className={classes.trialBadge}>
                <StarIcon style={{ fontSize: 18, color: "#22C55E" }} />
                <Typography className={classes.trialBadgeText}>
                  7 dias grátis
                </Typography>
              </Box>

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

              {/* Steps Indicator */}
              <Box className={classes.stepsContainer}>
                <Box
                  className={`${classes.step} ${
                    currentStep === 1 ? classes.stepActive : ""
                  }`}
                >
                  <Box
                    className={`${classes.stepNumber} ${
                      currentStep === 1 ? classes.stepNumberActive : ""
                    }`}
                  >
                    1
                  </Box>
                  <Typography
                    className={`${classes.stepLabel} ${
                      currentStep === 1 ? classes.stepLabelActive : ""
                    }`}
                  >
                    Dados da Empresa
                  </Typography>
                </Box>
                <Box className={classes.stepDivider} />
                <Box
                  className={`${classes.step} ${
                    currentStep === 2 ? classes.stepActive : ""
                  }`}
                >
                  <Box
                    className={`${classes.stepNumber} ${
                      currentStep === 2 ? classes.stepNumberActive : ""
                    }`}
                  >
                    2
                  </Box>
                  <Typography
                    className={`${classes.stepLabel} ${
                      currentStep === 2 ? classes.stepLabelActive : ""
                    }`}
                  >
                    Pagamento
                  </Typography>
                </Box>
              </Box>

              <Formik
                initialValues={user}
                enableReinitialize={true}
                validationSchema={UserSchema}
                onSubmit={async (values, actions) => {
                  if (currentStep === 1) {
                    handleNextStep(values);
                    actions.setSubmitting(false);
                  } else if (currentStep === 2) {
                    // Gerar token do cartão antes de processar
                    try {
                      if (!paymentToken && checkoutRef.current) {
                        // Gerar token primeiro
                        const tokenData = await checkoutRef.current.generateToken();
                        // O onTokenGenerated será chamado automaticamente, mas vamos usar o tokenData diretamente
                        setPaymentToken(tokenData);
                        // Aguardar um pouco para garantir que o estado foi atualizado
                        await new Promise(resolve => setTimeout(resolve, 100));
                        // Agora processar o cadastro
                        await handleSignUp(values, true);
                        actions.setSubmitting(false);
                      } else if (paymentToken) {
                        // Token já gerado, processar pagamento diretamente
                        await handleSignUp(values, true);
                        actions.setSubmitting(false);
                      } else {
                        toast.error("Por favor, preencha os dados de pagamento");
                        actions.setSubmitting(false);
                      }
                    } catch (err) {
                      console.error("Erro ao processar pagamento:", err);
                      const errorMessage = err.response?.data?.message || err.message || "Erro ao processar pagamento";
                      toast.error(errorMessage);
                      actions.setSubmitting(false);
                    }
                  }
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

                    {currentStep === 1 ? (
                      <>
                        {/* Seleção de Plano */}
                        <Box className={classes.plansSection}>
                          <Typography className={classes.plansSectionTitle}>
                            Selecione seu plano
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
                            "Continuar para pagamento"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Step 2: Pagamento */}
                        <Box className={classes.paymentStepContainer}>
                          {publicKey && selectedPlanId ? (
                            <MercadoPagoCheckout
                              ref={checkoutRef}
                              publicKey={publicKey}
                              planValue={
                                plans.find((p) => p.id === selectedPlanId)?.value || 0
                              }
                              planName={
                                plans.find((p) => p.id === selectedPlanId)?.name || ""
                              }
                              isVisible={currentStep === 2}
                              onTokenGenerated={handleTokenGenerated}
                              onValidationChange={(isValid) => {
                                setIsPaymentFormValid(isValid);
                              }}
                              onError={(err) => {
                                toast.error(err.message || "Erro ao processar pagamento");
                              }}
                            />
                          ) : (
                            <Box className={classes.loadingPlans}>
                              <CircularProgress
                                size={30}
                                style={{ color: "#00D9FF" }}
                              />
                            </Box>
                          )}

                          <Box className={classes.navigationButtons}>
                            <Button
                              onClick={handleBackStep}
                              className={classes.backButton}
                              startIcon={<ArrowBackIcon />}
                              fullWidth
                            >
                              Voltar
                            </Button>
                            <Button
                              type="submit"
                              fullWidth
                              className={classes.submitButton}
                              disabled={isSubmitting || !isPaymentFormValid}
                              endIcon={<CreditCardIcon />}
                            >
                              {isSubmitting ? (
                                <CircularProgress
                                  size={24}
                                  style={{ color: "#0A0A0F" }}
                                />
                              ) : (
                                "Finalizar cadastro e pagar"
                              )}
                            </Button>
                          </Box>
                        </Box>
                      </>
                    )}

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
