import React, { useState, useEffect, useImperativeHandle } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PersonIcon from "@material-ui/icons/Person";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import InputMask from "react-input-mask";
import { openApi } from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    position: "relative",
    zIndex: 1,
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: "1.1rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(1),
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
    "& .MuiInputAdornment-root": {
      color: "rgba(148, 163, 184, 0.6)",
    },
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  errorAlert: {
    borderRadius: 12,
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#EF4444",
  },
}));

const MercadoPagoCheckout = React.forwardRef(
  ({ publicKey, planValue, planName, onTokenGenerated, onError, isVisible = true, onValidationChange }, ref) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Dados do formulário
    const [cardNumber, setCardNumber] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [expirationMonth, setExpirationMonth] = useState("");
    const [expirationYear, setExpirationYear] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [installments, setInstallments] = useState(1);
    const [identificationType, setIdentificationType] = useState("CPF");
    const [identificationNumber, setIdentificationNumber] = useState("");
    const [paymentMethodId, setPaymentMethodId] = useState("");
    const [issuerId, setIssuerId] = useState("");


    // Detectar bandeira do cartão baseado no número
    useEffect(() => {
      const cardNumberClean = cardNumber.replace(/\s/g, "");
      if (cardNumberClean.length >= 6) {
        const bin = cardNumberClean.substring(0, 6);
        // Chamar API do backend para obter informações do cartão
        openApi
          .get(`/mercadopago/payment-methods?bin=${bin}`)
          .then((response) => {
            if (response.data && response.data.length > 0) {
              setPaymentMethodId(response.data[0].payment_method_id || "");
              if (response.data[0].issuer_id) {
                setIssuerId(response.data[0].issuer_id.toString());
              }
            }
          })
          .catch((err) => {
            console.warn("Erro ao obter informações do cartão:", err);
          });
      }
    }, [cardNumber]);

    // Gerar token do cartão
    const generateToken = async () => {
      // Validar campos
      if (!cardNumber || !cardholderName || !expirationMonth || !expirationYear || !securityCode) {
        throw new Error("Por favor, preencha todos os dados do cartão");
      }

      if (!identificationNumber) {
        throw new Error("Por favor, preencha o CPF/CNPJ do titular");
      }

      setLoading(true);
      setError(null);

      try {
        // Criar token usando o endpoint do backend
        const response = await openApi.post("/mercadopago/create-card-token", {
          cardNumber: cardNumber.replace(/\s/g, ""),
          cardholderName,
          expirationMonth,
          expirationYear,
          securityCode,
          identificationType,
          identificationNumber: identificationNumber.replace(/\D/g, ""),
        });

        const tokenData = response.data;

        const result = {
          token: tokenData.id,
          installments,
          identificationType,
          identificationNumber: identificationNumber.replace(/\D/g, ""),
          issuerId,
          paymentMethodId,
        };

        if (onTokenGenerated) {
          onTokenGenerated(result);
        }

        return result;
      } catch (err) {
        console.error("Erro ao gerar token:", err);
        const errorMessage = err.message || "Erro ao processar dados do cartão";
        setError(errorMessage);
        if (onError) {
          onError(err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Verificar se todos os campos estão preenchidos
    const isFormValid = () => {
      const cardNumberClean = cardNumber.replace(/\s/g, "");
      const identificationNumberClean = identificationNumber.replace(/\D/g, "");
      
      return (
        cardNumberClean.length >= 13 &&
        cardholderName.trim().length >= 3 &&
        expirationMonth.length === 2 &&
        expirationYear.length === 2 &&
        securityCode.length >= 3 &&
        identificationNumberClean.length >= 11
      );
    };

    // Notificar mudanças na validação
    useEffect(() => {
      if (onValidationChange) {
        const cardNumberClean = cardNumber.replace(/\s/g, "");
        const identificationNumberClean = identificationNumber.replace(/\D/g, "");
        
        const isValid = (
          cardNumberClean.length >= 13 &&
          cardholderName.trim().length >= 3 &&
          expirationMonth.length === 2 &&
          expirationYear.length === 2 &&
          securityCode.length >= 3 &&
          identificationNumberClean.length >= 11
        );
        
        onValidationChange(isValid);
      }
    }, [cardNumber, cardholderName, expirationMonth, expirationYear, securityCode, identificationNumber, onValidationChange]);

    // Expor método generateToken via ref
    useImperativeHandle(ref, () => ({
      generateToken,
      isFormValid,
      getFormData: () => ({
        cardNumber,
        cardholderName,
        expirationMonth,
        expirationYear,
        securityCode,
        installments,
        identificationType,
        identificationNumber: identificationNumber.replace(/\D/g, ""),
        issuerId,
        paymentMethodId,
      }),
    }));

    // Se não tiver publicKey mas estiver visível, mostrar mensagem de carregamento
    if (!publicKey) {
      if (isVisible) {
        return (
          <Box className={classes.root}>
            <Typography className={classes.sectionTitle}>
              Dados de Pagamento
            </Typography>
            <Alert severity="info" className={classes.errorAlert}>
              Carregando dados de pagamento...
            </Alert>
          </Box>
        );
      }
      return null;
    }

    // Se não estiver visível, não renderizar
    if (!isVisible) {
      return null;
    }

    return (
      <Box className={classes.root}>
        <Typography className={classes.sectionTitle}>
          Dados de Pagamento
        </Typography>

        {error && (
          <Alert severity="error" className={classes.errorAlert}>
            {error}
          </Alert>
        )}

        {/* Número do Cartão */}
        <TextField
          label="Número do Cartão"
          variant="outlined"
          fullWidth
          className={classes.textField}
          value={cardNumber}
          onChange={(e) => {
            // Formatar número do cartão (adicionar espaços a cada 4 dígitos)
            const value = e.target.value.replace(/\s/g, "");
            const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
            setCardNumber(formatted.substring(0, 19));
          }}
          placeholder="0000 0000 0000 0000"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CreditCardIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Nome do Titular */}
        <TextField
          label="Nome no Cartão"
          variant="outlined"
          fullWidth
          className={classes.textField}
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
          placeholder="NOME COMO ESTÁ NO CARTÃO"
        />

        {/* Data de Expiração e CVV */}
        <Box className={classes.formRow}>
          <Box>
            <FormControl variant="outlined" fullWidth className={classes.textField}>
              <InputLabel style={{ color: "rgba(148, 163, 184, 0.8)" }}>
                Mês
              </InputLabel>
              <Select
                value={expirationMonth}
                onChange={(e) => setExpirationMonth(e.target.value)}
                label="Mês"
                style={{
                  color: "#F9FAFB",
                  background: "rgba(30, 41, 59, 0.5)",
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                  <MenuItem key={month} value={month.toString().padStart(2, "0")}>
                    {month.toString().padStart(2, "0")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl variant="outlined" fullWidth className={classes.textField}>
              <InputLabel style={{ color: "rgba(148, 163, 184, 0.8)" }}>
                Ano
              </InputLabel>
              <Select
                value={expirationYear}
                onChange={(e) => setExpirationYear(e.target.value)}
                label="Ano"
                style={{
                  color: "#F9FAFB",
                  background: "rgba(30, 41, 59, 0.5)",
                }}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return year.toString().substring(2);
                }).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <TextField
              label="CVV"
              variant="outlined"
              fullWidth
              className={classes.textField}
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, "").substring(0, 4))}
              placeholder="123"
              type="password"
            />
          </Box>
        </Box>

        {/* Parcelas */}
        <FormControl variant="outlined" fullWidth className={classes.textField}>
          <InputLabel style={{ color: "rgba(148, 163, 184, 0.8)" }}>
            Parcelas
          </InputLabel>
          <Select
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            label="Parcelas"
            style={{
              color: "#F9FAFB",
              background: "rgba(30, 41, 59, 0.5)",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <MenuItem key={num} value={num}>
                {num}x de R$ {(planValue / num).toFixed(2)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tipo de Documento e Número */}
        <Box className={classes.formRow}>
          <FormControl
            variant="outlined"
            fullWidth
            className={classes.textField}
          >
            <InputLabel style={{ color: "rgba(148, 163, 184, 0.8)" }}>
              Tipo de Documento
            </InputLabel>
            <Select
              value={identificationType}
              onChange={(e) => setIdentificationType(e.target.value)}
              label="Tipo de Documento"
              style={{
                color: "#F9FAFB",
                background: "rgba(30, 41, 59, 0.5)",
              }}
            >
              <MenuItem value="CPF">CPF</MenuItem>
              <MenuItem value="CNPJ">CNPJ</MenuItem>
            </Select>
          </FormControl>

          <InputMask
            mask={
              identificationType === "CPF"
                ? "999.999.999-99"
                : "99.999.999/9999-99"
            }
            maskChar={null}
            value={identificationNumber}
            onChange={(e) => setIdentificationNumber(e.target.value)}
          >
            {(inputProps) => (
              <TextField
                {...inputProps}
                label={
                  identificationType === "CPF"
                    ? "CPF do Titular"
                    : "CNPJ do Titular"
                }
                variant="outlined"
                fullWidth
                className={classes.textField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </InputMask>
        </Box>

        {loading && (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={30} style={{ color: "#00D9FF" }} />
          </Box>
        )}
      </Box>
    );
  }
);

MercadoPagoCheckout.displayName = "MercadoPagoCheckout";

export default MercadoPagoCheckout;
