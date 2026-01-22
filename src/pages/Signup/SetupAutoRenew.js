import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import { openApi } from "../../services/api";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(180deg, #0A0A0F 0%, #111827 50%, #0A0A0F 100%)",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
  content: {
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))",
    borderRadius: 24,
    padding: theme.spacing(5),
    textAlign: "center",
    maxWidth: 700,
    border: "1px solid rgba(0, 217, 255, 0.15)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    position: "relative",
    zIndex: 1,
  },
  icon: {
    fontSize: 60,
    color: "#00D9FF",
    marginBottom: theme.spacing(2),
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(1),
    background: "linear-gradient(135deg, #FFFFFF 0%, #00D9FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    color: "rgba(226, 232, 240, 0.7)",
    marginBottom: theme.spacing(4),
    lineHeight: 1.7,
  },
  cardField: {
    marginBottom: theme.spacing(2),
    "& .mp-card": {
      minHeight: "56px",
      width: "100%",
      display: "block",
    },
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
  button: {
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    color: "#0A0A0F",
    padding: theme.spacing(1.5, 4),
    borderRadius: 12,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(0, 217, 255, 0.3)",
    marginTop: theme.spacing(2),
    "&:hover": {
      background: "linear-gradient(135deg, #00E5FF, #2DD881)",
      boxShadow: "0 6px 20px rgba(0, 217, 255, 0.4)",
      transform: "translateY(-2px)",
    },
    "&:disabled": {
      background: "rgba(0, 217, 255, 0.3)",
      color: "rgba(255, 255, 255, 0.5)",
    },
    transition: "all 0.3s ease",
  },
  skipButton: {
    color: "rgba(226, 232, 240, 0.7)",
    textTransform: "none",
    marginTop: theme.spacing(2),
    "&:hover": {
      color: "#FFFFFF",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
  benefitsList: {
    textAlign: "left",
    marginTop: theme.spacing(3),
    "& li": {
      marginBottom: theme.spacing(1),
      color: "rgba(226, 232, 240, 0.8)",
    },
  },
}));

const validationSchema = Yup.object().shape({
  cardholderName: Yup.string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .required("Nome do titular é obrigatório"),
  identificationNumber: Yup.string()
    .required("CPF/CNPJ é obrigatório")
    .test("valid-cpf-cnpj", "CPF/CNPJ inválido", (value) => {
      if (!value) return false;
      const clean = value.replace(/\D/g, "");
      return clean.length === 11 || clean.length === 14;
    }),
});

const SetupAutoRenew = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [mpInstance, setMpInstance] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [errors, setErrors] = useState({});

  // Referências para os campos do Mercado Pago
  const [cardNumberElement, setCardNumberElement] = useState(null);
  const [expirationDateElement, setExpirationDateElement] = useState(null);
  const [securityCodeElement, setSecurityCodeElement] = useState(null);

  // Extrair companyId da URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("companyId");
    if (id) {
      setCompanyId(parseInt(id));
    } else {
      toast.error("ID da empresa não encontrado");
      history.push("/login");
    }
  }, [location, history]);

  // Carregar public key
  useEffect(() => {
    const loadPublicKey = async () => {
      try {
        const response = await openApi.get("/companies/mercado-pago/public-key");
        if (response.data && response.data.publicKey) {
          setPublicKey(response.data.publicKey);
        }
      } catch (error) {
        console.error("Erro ao carregar public key:", error);
        toast.error("Erro ao carregar configurações de pagamento");
      }
    };
    loadPublicKey();
  }, []);

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    if (!publicKey) return;

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      if (window.MercadoPago) {
        const mp = new window.MercadoPago(publicKey);
        setMpInstance(mp);
      }
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [publicKey]);

  // Inicializar campos do cartão
  useEffect(() => {
    if (!mpInstance || !cardNumberElement || !expirationDateElement || !securityCodeElement) {
      return;
    }

    const initializeFields = () => {
      try {
        // Limpar elementos antes de montar
        if (cardNumberElement) cardNumberElement.innerHTML = "";
        if (expirationDateElement) expirationDateElement.innerHTML = "";
        if (securityCodeElement) securityCodeElement.innerHTML = "";

        // Verificar se elementos estão no DOM
        if (!document.body.contains(cardNumberElement) ||
            !document.body.contains(expirationDateElement) ||
            !document.body.contains(securityCodeElement)) {
          setTimeout(initializeFields, 100);
          return;
        }

        const cardNumber = mpInstance.fields.create("cardNumber", {
          placeholder: "Número do cartão",
        });
        cardNumber.mount(cardNumberElement);

        const expirationDate = mpInstance.fields.create("expirationDate", {
          placeholder: "MM/AA",
        });
        expirationDate.mount(expirationDateElement);

        const securityCode = mpInstance.fields.create("securityCode", {
          placeholder: "CVV",
        });
        securityCode.mount(securityCodeElement);

        // Armazenar referências
        window.mpCardFields = {
          cardNumber,
          expirationDate,
          securityCode,
        };

        console.log("Campos do Mercado Pago inicializados com sucesso");
      } catch (error) {
        console.error("Erro ao inicializar campos:", error);
        toast.error("Erro ao inicializar campos de pagamento");
      }
    };

    initializeFields();
  }, [mpInstance, cardNumberElement, expirationDateElement, securityCodeElement]);

  const createToken = async () => {
    if (!window.mpCardFields) {
      throw new Error("Campos do cartão não foram inicializados");
    }

    const { cardNumber, expirationDate, securityCode } = window.mpCardFields;

    return new Promise((resolve, reject) => {
      cardNumber.createToken()
        .then((result) => {
          if (result.error) {
            reject(new Error(result.error.message || "Erro ao processar cartão"));
          } else {
            resolve(result.id);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const handleSubmit = async (values) => {
    if (!companyId) {
      toast.error("ID da empresa não encontrado");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Criar token do cartão
      const cardTokenId = await createToken();

      if (!cardTokenId) {
        throw new Error("Não foi possível processar o cartão. Verifique os dados e tente novamente.");
      }

      // Criar Preapproval
      const response = await openApi.post(`/companies/${companyId}/create-preapproval`, {
        cardTokenId: cardTokenId,
      });

      if (response.data && response.data.success) {
        toast.success("Renovação automática configurada com sucesso!");
        setTimeout(() => {
          history.push("/login");
        }, 2000);
      } else {
        throw new Error("Erro ao configurar renovação automática");
      }
    } catch (err) {
      console.error("Erro ao configurar renovação automática:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao configurar renovação automática. Por favor, tente novamente.";
      
      toast.error(errorMessage);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    history.push("/login");
  };

  if (!companyId) {
    return (
      <Box className={classes.root}>
        <Container className={classes.container}>
          <CircularProgress style={{ color: "#00D9FF" }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Container className={classes.container}>
        <Box className={classes.content}>
          <CreditCardIcon className={classes.icon} />
          <Typography className={classes.title}>
            Configure Renovação Automática
          </Typography>
          <Typography className={classes.subtitle}>
            Configure seu cartão para que sua assinatura seja renovada automaticamente,
            sem precisar se preocupar com pagamentos futuros.
          </Typography>

          <Alert severity="info" style={{ marginBottom: 24, textAlign: "left" }}>
            <strong>Benefícios da renovação automática:</strong>
            <ul className={classes.benefitsList}>
              <li>Nunca perca o acesso aos serviços</li>
              <li>Renovação sem interrupções</li>
              <li>Sem necessidade de lembrar de pagar</li>
              <li>Você pode cancelar a qualquer momento</li>
            </ul>
          </Alert>

          <Formik
            initialValues={{
              cardholderName: "",
              identificationType: "CPF",
              identificationNumber: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors: formikErrors, touched, handleChange, handleBlur }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <div className={classes.cardField}>
                      <Typography variant="body2" style={{ marginBottom: 8, color: "rgba(226, 232, 240, 0.8)" }}>
                        Número do Cartão
                      </Typography>
                      <div
                        ref={(el) => {
                          if (el && !cardNumberElement) setCardNumberElement(el);
                        }}
                        id="mp-card-number"
                        style={{ minHeight: "56px", width: "100%", display: "block" }}
                      />
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <div className={classes.cardField}>
                      <Typography variant="body2" style={{ marginBottom: 8, color: "rgba(226, 232, 240, 0.8)" }}>
                        Validade
                      </Typography>
                      <div
                        ref={(el) => {
                          if (el && !expirationDateElement) setExpirationDateElement(el);
                        }}
                        id="mp-card-expiration"
                        style={{ minHeight: "56px", width: "100%", display: "block" }}
                      />
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <div className={classes.cardField}>
                      <Typography variant="body2" style={{ marginBottom: 8, color: "rgba(226, 232, 240, 0.8)" }}>
                        Código de Segurança (CVV)
                      </Typography>
                      <div
                        ref={(el) => {
                          if (el && !securityCodeElement) setSecurityCodeElement(el);
                        }}
                        id="mp-card-security"
                        style={{ minHeight: "56px", width: "100%", display: "block" }}
                      />
                    </div>
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="cardholderName"
                      label="Nome do Titular (como está no cartão)"
                      fullWidth
                      variant="outlined"
                      className={classes.formField}
                      error={touched.cardholderName && !!formikErrors.cardholderName}
                      helperText={touched.cardholderName && formikErrors.cardholderName}
                      InputLabelProps={{
                        style: { color: "rgba(226, 232, 240, 0.7)" },
                      }}
                      InputProps={{
                        style: { color: "#FFFFFF" },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Field
                      as={TextField}
                      name="identificationType"
                      label="Tipo"
                      select
                      fullWidth
                      variant="outlined"
                      SelectProps={{
                        native: true,
                      }}
                      className={classes.formField}
                      InputLabelProps={{
                        style: { color: "rgba(226, 232, 240, 0.7)" },
                      }}
                      InputProps={{
                        style: { color: "#FFFFFF" },
                      }}
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <Field
                      as={TextField}
                      name="identificationNumber"
                      label="CPF/CNPJ"
                      fullWidth
                      variant="outlined"
                      className={classes.formField}
                      error={touched.identificationNumber && !!formikErrors.identificationNumber}
                      helperText={touched.identificationNumber && formikErrors.identificationNumber}
                      InputLabelProps={{
                        style: { color: "rgba(226, 232, 240, 0.7)" },
                      }}
                      InputProps={{
                        style: { color: "#FFFFFF" },
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  className={classes.button}
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} style={{ color: "#0A0A0F" }} /> : "Configurar Renovação Automática"}
                </Button>

                <Button
                  type="button"
                  variant="text"
                  className={classes.skipButton}
                  fullWidth
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Configurar depois
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Container>
    </Box>
  );
};

export default SetupAutoRenew;
