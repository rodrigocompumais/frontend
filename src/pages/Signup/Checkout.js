import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import qs from "query-string";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Container,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import PersonIcon from "@material-ui/icons/Person";
import LockIcon from "@material-ui/icons/Lock";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";

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
    maxWidth: 900,
    width: "100%",
    borderRadius: 24,
    background: "linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))",
    border: "1px solid rgba(0, 217, 255, 0.15)",
    backdropFilter: "blur(20px)",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  cardContent: {
    padding: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1.8rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(1),
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.95rem",
    color: "rgba(148, 163, 184, 0.8)",
    marginBottom: theme.spacing(4),
    textAlign: "center",
  },
  planInfo: {
    background: "rgba(0, 217, 255, 0.1)",
    border: "1px solid rgba(0, 217, 255, 0.3)",
    borderRadius: 12,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  planName: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: "1.1rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(0.5),
  },
  planPrice: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1.5rem",
    background: "linear-gradient(135deg, #00D9FF, #22C55E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#E5E7EB",
    marginBottom: theme.spacing(2),
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
    },
    "& .MuiInputLabel-root": {
      color: "rgba(148, 163, 184, 0.8)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#00D9FF",
    },
  },
  mpCardContainer: {
    marginBottom: theme.spacing(2),
    minHeight: 56,
    width: "100%",
    "& .mp-card": {
      width: "100%",
      minHeight: 56,
      borderRadius: 12,
      background: "rgba(30, 41, 59, 0.5)",
      border: "1px solid rgba(148, 163, 184, 0.3)",
      padding: theme.spacing(1.5),
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "rgba(0, 217, 255, 0.5)",
      },
      "&.mp-focus": {
        borderColor: "#00D9FF",
        borderWidth: 2,
      },
      "& iframe": {
        width: "100% !important",
        height: "56px !important",
        border: "none !important",
      },
      "& input": {
        color: "#F9FAFB !important",
        background: "transparent",
        border: "none",
        outline: "none",
        width: "100%",
        fontSize: "1rem",
        fontFamily: "'Inter', sans-serif",
        padding: theme.spacing(1),
        "&::placeholder": {
          color: "rgba(148, 163, 184, 0.6)",
        },
      },
    },
    "& .mp-form-control": {
      width: "100%",
      "& iframe": {
        width: "100% !important",
        height: "56px !important",
      },
    },
  },
  select: {
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
    "& .MuiSelect-root": {
      color: "#F9FAFB !important",
    },
    "& .MuiInputLabel-root": {
      color: "rgba(148, 163, 184, 0.8)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#00D9FF",
    },
  },
  buttonContainer: {
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
  submitButton: {
    flex: 1,
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
  errorText: {
    color: "#EF4444",
    fontSize: "0.85rem",
    marginTop: theme.spacing(0.5),
    fontFamily: "'Inter', sans-serif",
  },
}));

const Checkout = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const params = qs.parse(location.search);
  
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [mpInstance, setMpInstance] = useState(null);
  const [cardToken, setCardToken] = useState(null);
  const [errors, setErrors] = useState({});
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [installments, setInstallments] = useState(1);
  const [installmentsOptions, setInstallmentsOptions] = useState([]);
  const [issuerId, setIssuerId] = useState("");
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    cardholderName: "",
    identificationType: "CPF",
    identificationNumber: "",
  });

  // Referências para os campos do Mercado Pago
  const cardNumberRef = useRef(null);
  const expirationDateRef = useRef(null);
  const securityCodeRef = useRef(null);
  const cardholderNameRef = useRef(null);

  // Dados do signup (do sessionStorage ou params)
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    planId: null,
    planName: "",
    planValue: 0,
  });

  useEffect(() => {
    // Carregar dados do signup do sessionStorage
    const storedData = sessionStorage.getItem("signupData");
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setSignupData(data);
      } catch (err) {
        console.error("Erro ao carregar dados do signup:", err);
      }
    }

    // Buscar public key
    loadPublicKey();
  }, []);

  useEffect(() => {
    if (publicKey && cardNumberRef.current && expirationDateRef.current && securityCodeRef.current) {
      // Verificar se o SDK já foi carregado
      if (window.MercadoPago) {
        // SDK já carregado, apenas inicializar
        const mp = new window.MercadoPago(publicKey);
        setMpInstance(mp);
        setTimeout(() => {
          initializeCardFields(mp);
        }, 100);
      } else {
        // Carregar SDK e depois inicializar
        loadMercadoPagoSDK();
      }
    }
  }, [publicKey, cardNumberRef.current, expirationDateRef.current, securityCodeRef.current]);

  const loadPublicKey = async () => {
    try {
      const response = await openApi.get("/companies/mercado-pago/public-key");
      setPublicKey(response.data.publicKey);
    } catch (err) {
      console.error("Erro ao carregar public key:", err);
      toast.error("Erro ao carregar configurações de pagamento. Por favor, recarregue a página.");
    }
  };

  const loadMercadoPagoSDK = () => {
    // Verificar se o script já foi adicionado
    if (document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')) {
      // Script já existe, apenas inicializar quando carregar
      if (window.MercadoPago) {
        const mp = new window.MercadoPago(publicKey);
        setMpInstance(mp);
        setTimeout(() => {
          initializeCardFields(mp);
        }, 100);
      } else {
        // Aguardar o script carregar
        const checkSDK = setInterval(() => {
          if (window.MercadoPago) {
            clearInterval(checkSDK);
            const mp = new window.MercadoPago(publicKey);
            setMpInstance(mp);
            setTimeout(() => {
              initializeCardFields(mp);
            }, 100);
          }
        }, 100);
      }
      return;
    }

    // Carregar SDK do Mercado Pago
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      if (window.MercadoPago && publicKey) {
        const mp = new window.MercadoPago(publicKey);
        setMpInstance(mp);
        // Aguardar um pouco para garantir que os elementos estão no DOM
        setTimeout(() => {
          initializeCardFields(mp);
        }, 200);
      }
    };
    script.onerror = () => {
      console.error("Erro ao carregar SDK do Mercado Pago");
      toast.error("Erro ao carregar serviços de pagamento. Por favor, recarregue a página.");
    };
    document.body.appendChild(script);
  };

  const initializeCardFields = (mp) => {
    if (!mp || !mp.fields) {
      console.error("SDK do Mercado Pago não inicializado corretamente");
      return;
    }

    if (!cardNumberRef.current || !expirationDateRef.current || !securityCodeRef.current) {
      console.error("Elementos DOM não estão prontos:", {
        cardNumber: !!cardNumberRef.current,
        expirationDate: !!expirationDateRef.current,
        securityCode: !!securityCodeRef.current,
      });
      return;
    }

    try {
      // Limpar campos anteriores se existirem
      if (window.mpCardFields) {
        try {
          if (window.mpCardFields.cardNumber && typeof window.mpCardFields.cardNumber.unmount === 'function') {
            window.mpCardFields.cardNumber.unmount();
          }
          if (window.mpCardFields.expirationDate && typeof window.mpCardFields.expirationDate.unmount === 'function') {
            window.mpCardFields.expirationDate.unmount();
          }
          if (window.mpCardFields.securityCode && typeof window.mpCardFields.securityCode.unmount === 'function') {
            window.mpCardFields.securityCode.unmount();
          }
        } catch (e) {
          console.warn("Erro ao desmontar campos anteriores:", e);
        }
      }

      // Garantir que os elementos estão vazios
      if (cardNumberRef.current) {
        cardNumberRef.current.innerHTML = "";
      }
      if (expirationDateRef.current) {
        expirationDateRef.current.innerHTML = "";
      }
      if (securityCodeRef.current) {
        securityCodeRef.current.innerHTML = "";
      }

      // Inicializar campos de cartão do Mercado Pago
      console.log("Inicializando campos do Mercado Pago...", {
        cardNumberElement: cardNumberRef.current,
        expirationDateElement: expirationDateRef.current,
        securityCodeElement: securityCodeRef.current,
      });

      const cardNumber = mp.fields.create("cardNumber", {
        placeholder: "Número do cartão",
      });
      
      const expirationDate = mp.fields.create("expirationDate", {
        placeholder: "MM/AA",
      });
      
      const securityCode = mp.fields.create("securityCode", {
        placeholder: "CVV",
      });

      // Montar campos nos elementos
      cardNumber.mount(cardNumberRef.current);
      expirationDate.mount(expirationDateRef.current);
      securityCode.mount(securityCodeRef.current);

      console.log("Campos montados com sucesso:", {
        cardNumber: !!cardNumber,
        expirationDate: !!expirationDate,
        securityCode: !!securityCode,
      });

      // Event listeners para cardNumber
      cardNumber.on("validityChange", (event) => {
        if (event.isValid) {
          if (event.payment_method_id) {
            setPaymentMethodId(event.payment_method_id.id);
            if (event.first_six_digits) {
              loadInstallments(event.payment_method_id.id, event.first_six_digits);
            }
          }
          clearError("cardNumber");
        } else {
          setError("cardNumber", "Número do cartão inválido");
        }
      });

      cardNumber.on("binChange", (event) => {
        if (event.payment_method_id) {
          setPaymentMethodId(event.payment_method_id.id);
          setIssuerId(event.issuer?.id?.toString() || "");
          if (event.first_six_digits) {
            loadInstallments(event.payment_method_id.id, event.first_six_digits);
          }
        }
      });

      // Event listeners para expirationDate
      expirationDate.on("validityChange", (event) => {
        if (event.isValid) {
          clearError("expirationDate");
        } else {
          setError("expirationDate", "Data de validade inválida");
        }
      });

      // Event listeners para securityCode
      securityCode.on("validityChange", (event) => {
        if (event.isValid) {
          clearError("securityCode");
        } else {
          setError("securityCode", "CVV inválido");
        }
      });

      // Guardar referências para uso posterior
      window.mpCardFields = {
        cardNumber,
        expirationDate,
        securityCode,
      };
    } catch (err) {
      console.error("Erro ao inicializar campos do Mercado Pago:", err);
      toast.error("Erro ao carregar campos de pagamento. Por favor, recarregue a página.");
    }
  };

  const loadInstallments = async (paymentMethodId, bin) => {
    if (!bin || !signupData.planValue || !mpInstance) return;

    try {
      const binString = typeof bin === 'string' ? bin.substring(0, 6) : bin.toString().substring(0, 6);
      
      const response = await mpInstance.getInstallments({
        amount: signupData.planValue,
        bin: binString,
        payment_type_id: paymentMethodId,
      });

      if (response && response.length > 0 && response[0].payer_costs) {
        const options = response[0].payer_costs.map((cost) => ({
          value: cost.installments,
          label: cost.recommended_message || `${cost.installments}x de R$ ${(signupData.planValue / cost.installments).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        }));
        setInstallmentsOptions(options);
        if (options.length > 0) {
          setInstallments(options[0].value);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar parcelas:", err);
      // Não mostrar erro ao usuário, apenas continuar sem opções de parcelas
    }
  };

  const createToken = async () => {
    if (!mpInstance || !window.mpCardFields) {
      throw new Error("Campos do cartão não foram inicializados. Por favor, recarregue a página.");
    }

    try {
      const { cardNumber, expirationDate, securityCode } = window.mpCardFields;
      
      // Obter valores dos campos
      const cardNumberValue = cardNumber.getValue();
      const expirationDateValue = expirationDate.getValue();
      const securityCodeValue = securityCode.getValue();

      if (!cardNumberValue || !expirationDateValue || !securityCodeValue) {
        throw new Error("Por favor, preencha todos os dados do cartão.");
      }

      const [expMonth, expYear] = expirationDateValue.split("/");
      
      const tokenData = {
        cardNumber: cardNumberValue.replace(/\s/g, ""),
        cardholderName: formData.cardholderName,
        cardExpirationMonth: expMonth,
        cardExpirationYear: "20" + expYear,
        securityCode: securityCodeValue,
        identificationType: formData.identificationType,
        identificationNumber: formData.identificationNumber.replace(/\D/g, ""),
      };

      const token = await mpInstance.fields.createCardToken(tokenData);
      
      if (!token || !token.id) {
        throw new Error("Não foi possível processar o cartão. Verifique os dados e tente novamente.");
      }

      return token.id;
    } catch (err) {
      console.error("Erro ao criar token:", err);
      const errorMessage = err.message || "Erro ao processar dados do cartão. Verifique os dados e tente novamente.";
      throw new Error(errorMessage);
    }
  };

  const setError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearError = (field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Nome do portador é obrigatório";
    }

    if (!formData.identificationNumber.trim()) {
      newErrors.identificationNumber = "CPF/CNPJ é obrigatório";
    }

    if (!paymentMethodId) {
      newErrors.cardNumber = "Cartão inválido ou não reconhecido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setLoading(true);

    try {
      // Criar token do cartão
      const token = await createToken();

      if (!token) {
        throw new Error("Não foi possível processar o cartão. Verifique os dados e tente novamente.");
      }

      // Enviar dados para o backend
      const response = await openApi.post("/companies/create-with-transparent-checkout", {
        companyData: {
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
          planId: signupData.planId,
          recurrence: "MENSAL",
          campaignsEnabled: true,
        },
        paymentData: {
          token: token,
          paymentMethodId: paymentMethodId,
          installments: installments,
          transactionAmount: signupData.planValue,
          identificationType: formData.identificationType,
          identificationNumber: formData.identificationNumber.replace(/\D/g, ""),
          payer: {
            email: signupData.email,
            firstName: signupData.name.split(" ")[0] || "",
            lastName: signupData.name.split(" ").slice(1).join(" ") || "",
          },
          issuerId: issuerId || undefined,
        },
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message || "Conta criada com sucesso!");
        // Limpar dados do sessionStorage
        sessionStorage.removeItem("signupData");
        
        // Redirecionar baseado no status do pagamento
        setTimeout(() => {
          if (response.data.payment.status === "approved") {
            history.push("/signup/success");
          } else if (response.data.payment.status === "pending") {
            history.push("/signup/pending");
          } else {
            history.push("/signup/failure");
          }
        }, 2000);
      } else {
        throw new Error("Erro ao processar pagamento. Por favor, tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao processar pagamento:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao processar pagamento. Por favor, tente novamente.";
      toast.error(errorMessage);
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    history.push("/signup");
  };

  return (
    <Box className={classes.root}>
      <Container maxWidth="lg" className={classes.container}>
        <Card className={classes.mainCard} elevation={0}>
          <Box className={classes.cardContent}>
            <Typography className={classes.title}>Finalizar Pagamento</Typography>
            <Typography className={classes.subtitle}>
              Preencha os dados do cartão para concluir seu cadastro
            </Typography>

            {/* Informações do Plano */}
            <Box className={classes.planInfo}>
              <Typography className={classes.planName}>{signupData.planName}</Typography>
              <Typography className={classes.planPrice}>
                R$ {signupData.planValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                /mês
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              {/* Dados do Cartão */}
              <Box className={classes.formSection}>
                <Typography className={classes.sectionTitle}>Dados do Cartão</Typography>
                
                {/* Número do Cartão */}
                <Box className={classes.mpCardContainer}>
                  <div 
                    ref={cardNumberRef} 
                    className="mp-card" 
                    style={{ 
                      minHeight: '56px', 
                      width: '100%',
                      display: 'block'
                    }}
                    id="mp-card-number"
                  />
                  {errors.cardNumber && (
                    <Typography className={classes.errorText}>{errors.cardNumber}</Typography>
                  )}
                  {!mpInstance && (
                    <Typography style={{ color: 'rgba(148, 163, 184, 0.6)', fontSize: '0.85rem', marginTop: '8px' }}>
                      Carregando campos de pagamento...
                    </Typography>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {/* Data de Validade */}
                    <Box className={classes.mpCardContainer}>
                      <div 
                        ref={expirationDateRef} 
                        className="mp-card"
                        style={{ 
                          minHeight: '56px', 
                          width: '100%',
                          display: 'block'
                        }}
                        id="mp-card-expiration"
                      />
                      {errors.expirationDate && (
                        <Typography className={classes.errorText}>{errors.expirationDate}</Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    {/* CVV */}
                    <Box className={classes.mpCardContainer}>
                      <div 
                        ref={securityCodeRef} 
                        className="mp-card"
                        style={{ 
                          minHeight: '56px', 
                          width: '100%',
                          display: 'block'
                        }}
                        id="mp-card-security"
                      />
                      {errors.securityCode && (
                        <Typography className={classes.errorText}>{errors.securityCode}</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Nome do Portador */}
                <TextField
                  fullWidth
                  label="Nome no cartão"
                  variant="outlined"
                  className={classes.textField}
                  value={formData.cardholderName}
                  onChange={(e) => {
                    setFormData({ ...formData, cardholderName: e.target.value });
                    clearError("cardholderName");
                  }}
                  error={!!errors.cardholderName}
                  helperText={errors.cardholderName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon style={{ color: "rgba(148, 163, 184, 0.6)" }} />
                      </InputAdornment>
                    ),
                  }}
                  inputRef={cardholderNameRef}
                />
              </Box>

              {/* Dados Pessoais */}
              <Box className={classes.formSection}>
                <Typography className={classes.sectionTitle}>Dados Pessoais</Typography>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <FormControl fullWidth variant="outlined" className={classes.select}>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={formData.identificationType}
                        onChange={(e) =>
                          setFormData({ ...formData, identificationType: e.target.value })
                        }
                        label="Tipo"
                      >
                        <MenuItem value="CPF">CPF</MenuItem>
                        <MenuItem value="CNPJ">CNPJ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={8}>
                    <InputMask
                      mask={
                        formData.identificationType === "CPF"
                          ? "999.999.999-99"
                          : "99.999.999/9999-99"
                      }
                      maskChar={null}
                      value={formData.identificationNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, identificationNumber: e.target.value });
                        clearError("identificationNumber");
                      }}
                    >
                      {(inputProps) => (
                        <TextField
                          {...inputProps}
                          fullWidth
                          label={formData.identificationType === "CPF" ? "CPF" : "CNPJ"}
                          variant="outlined"
                          className={classes.textField}
                          error={!!errors.identificationNumber}
                          helperText={errors.identificationNumber}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon style={{ color: "rgba(148, 163, 184, 0.6)" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </InputMask>
                  </Grid>
                </Grid>

                {/* Parcelas */}
                {installmentsOptions.length > 0 && (
                  <FormControl fullWidth variant="outlined" className={classes.select}>
                    <InputLabel>Parcelas</InputLabel>
                    <Select
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      label="Parcelas"
                    >
                      {installmentsOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>

              {/* Botões */}
              <Box className={classes.buttonContainer}>
                <Button
                  className={classes.backButton}
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  disabled={loading}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className={classes.submitButton}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                  disabled={loading || !mpInstance}
                >
                  {loading ? "Processando..." : "Finalizar Pagamento"}
                </Button>
              </Box>
            </form>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Checkout;
