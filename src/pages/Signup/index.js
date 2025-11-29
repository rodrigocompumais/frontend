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

  const { list: listPlans } = usePlans();

  const dueDate = moment().add(7, "day").format();

  useEffect(() => {
    async function fetchData() {
      try {
        const list = await listPlans();
        setPlans(list);
        // Selecionar o plano do meio como padrão
        if (list.length > 0) {
          const middleIndex = Math.floor(list.length / 2);
          setSelectedPlanId(list[middleIndex].id);
        }
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchData();
  }, [listPlans]);

  const handleSignUp = async (values) => {
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
                Criar conta gratuita
              </Typography>

              <Formik
                initialValues={user}
                enableReinitialize={true}
                validationSchema={UserSchema}
                onSubmit={(values, actions) => {
                  if (!selectedPlanId) {
                    toast.error("Selecione um plano para continuar");
                    actions.setSubmitting(false);
                    return;
                  }
                  setTimeout(() => {
                    handleSignUp(values);
                    actions.setSubmitting(false);
                  }, 400);
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
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} style={{ color: "#0A0A0F" }} />
                      ) : (
                        "Começar teste grátis"
                      )}
                    </Button>

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
