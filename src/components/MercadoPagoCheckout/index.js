import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
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
import InputMask from "react-input-mask";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
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
  mpFrame: {
    width: "100%",
    minHeight: 48,
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: 12,
    background: "rgba(30, 41, 59, 0.5)",
    padding: "8px 12px",
    transition: "all 0.3s ease",
    "&:focus-within": {
      borderColor: "#00D9FF",
      borderWidth: 2,
    },
    "& iframe": {
      border: "none",
      background: "transparent",
    },
  },
}));

const MercadoPagoCheckout = React.forwardRef(
  ({ publicKey, planValue, planName, onTokenGenerated, onError }, ref) => {
    const classes = useStyles();
    const [mp, setMp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Dados do formulário
    const [cardNumber, setCardNumber] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [installments, setInstallments] = useState(1);
    const [identificationType, setIdentificationType] = useState("CPF");
    const [identificationNumber, setIdentificationNumber] = useState("");
    const [issuerId, setIssuerId] = useState("");
    const [paymentMethodId, setPaymentMethodId] = useState("");

    const cardNumberFrameRef = useRef(null);
    const expirationDateFrameRef = useRef(null);
    const securityCodeFrameRef = useRef(null);
    const cardholderNameFrameRef = useRef(null);
    
    const framesRef = useRef({
      cardNumber: null,
      expirationDate: null,
      securityCode: null,
      cardholderName: null,
    });

    // Inicializar Mercado Pago SDK
    useEffect(() => {
      if (window.MercadoPago && publicKey) {
        try {
          const mercadoPago = new window.MercadoPago(publicKey, {
            locale: "pt-BR",
          });
          setMp(mercadoPago);
        } catch (err) {
          console.error("Erro ao inicializar Mercado Pago:", err);
          setError("Erro ao inicializar sistema de pagamento");
        }
      }
    }, [publicKey]);

    // Criar frames do Mercado Pago quando SDK estiver pronto e elementos existirem
    useEffect(() => {
      if (!mp || !publicKey) return;

      // Função para verificar e montar frames
      const checkAndMountFrames = () => {
        // Verificar se todos os elementos existem no DOM e estão visíveis
        const cardNumberEl = cardNumberFrameRef.current;
        const expirationDateEl = expirationDateFrameRef.current;
        const securityCodeEl = securityCodeFrameRef.current;
        const cardholderNameEl = cardholderNameFrameRef.current;

        if (!cardNumberEl || !expirationDateEl || !securityCodeEl || !cardholderNameEl) {
          return false;
        }

        // Verificar se os elementos estão realmente no DOM
        if (
          !document.contains(cardNumberEl) ||
          !document.contains(expirationDateEl) ||
          !document.contains(securityCodeEl) ||
          !document.contains(cardholderNameEl)
        ) {
          return false;
        }

        try {
          // Limpar frames anteriores se existirem
          if (framesRef.current.cardNumber) {
            try {
              framesRef.current.cardNumber.unmount();
            } catch (e) {
              // Ignorar erros ao desmontar
            }
          }
          if (framesRef.current.expirationDate) {
            try {
              framesRef.current.expirationDate.unmount();
            } catch (e) {}
          }
          if (framesRef.current.securityCode) {
            try {
              framesRef.current.securityCode.unmount();
            } catch (e) {}
          }
          if (framesRef.current.cardholderName) {
            try {
              framesRef.current.cardholderName.unmount();
            } catch (e) {}
          }

          // Verificar novamente se os elementos ainda existem
          if (
            !cardNumberFrameRef.current ||
            !expirationDateFrameRef.current ||
            !securityCodeFrameRef.current ||
            !cardholderNameFrameRef.current
          ) {
            return false;
          }

          // Frame para número do cartão
          const cardNumberFrame = mp.fields
            .create("cardNumber", {
              placeholder: "Número do cartão",
            })
            .mount(cardNumberFrameRef.current);
          framesRef.current.cardNumber = cardNumberFrame;

          // Frame para data de expiração
          const expirationDateFrame = mp.fields
            .create("expirationDate", {
              placeholder: "MM/AA",
            })
            .mount(expirationDateFrameRef.current);
          framesRef.current.expirationDate = expirationDateFrame;

          // Frame para código de segurança
          const securityCodeFrame = mp.fields
            .create("securityCode", {
              placeholder: "CVV",
            })
            .mount(securityCodeFrameRef.current);
          framesRef.current.securityCode = securityCodeFrame;

          // Frame para nome do titular
          const cardholderNameFrame = mp.fields
            .create("cardholderName", {
              placeholder: "Nome no cartão",
            })
            .mount(cardholderNameFrameRef.current);
          framesRef.current.cardholderName = cardholderNameFrame;

          // Listeners para obter dados dos frames
          cardNumberFrame.on("validityChange", (event) => {
              if (event.isValid) {
                setCardNumber(event.value);
                if (event.issuer) {
                  setIssuerId(event.issuer.id);
                }
                if (event.payment_method_id) {
                  setPaymentMethodId(event.payment_method_id);
                }
              }
            });

            expirationDateFrame.on("validityChange", (event) => {
              if (event.isValid) {
                setExpirationDate(event.value);
              }
            });

            securityCodeFrame.on("validityChange", (event) => {
              if (event.isValid) {
                setSecurityCode(event.value);
              }
            });

            cardholderNameFrame.on("validityChange", (event) => {
              if (event.isValid) {
                setCardholderName(event.value);
              }
            });

          // Obter parcelas disponíveis quando BIN mudar
          cardNumberFrame.on("binChange", async (event) => {
            if (event.bin && planValue) {
              try {
                const installmentsOptions = await mp.getInstallments({
                  amount: planValue,
                  bin: event.bin,
                });
                
                if (
                  installmentsOptions &&
                  installmentsOptions.length > 0 &&
                  installmentsOptions[0].installments
                ) {
                  const maxInstallments = Math.min(
                    12,
                    installmentsOptions[0].installments.length
                  );
                  if (installments > maxInstallments) {
                    setInstallments(maxInstallments);
                  }
                }
              } catch (err) {
                console.error("Erro ao obter parcelas:", err);
              }
            }
          });

          return true; // Frames montados com sucesso
        } catch (err) {
          console.error("Erro ao criar frames do Mercado Pago:", err);
          setError("Erro ao inicializar formulário de pagamento");
          return false;
        }
      };

      // Tentar montar imediatamente
      if (checkAndMountFrames()) {
        return;
      }

      // Se não conseguir, tentar novamente após um pequeno delay
      const mountFrames = setTimeout(() => {
        checkAndMountFrames();
      }, 200);

      // Se ainda não conseguir, tentar novamente após mais tempo
      const retryMount = setTimeout(() => {
        checkAndMountFrames();
      }, 500);

      return () => {
        clearTimeout(mountFrames);
        clearTimeout(retryMount);
        // Limpar frames ao desmontar
        if (framesRef.current.cardNumber) {
          try {
            framesRef.current.cardNumber.unmount();
          } catch (e) {}
        }
        if (framesRef.current.expirationDate) {
          try {
            framesRef.current.expirationDate.unmount();
          } catch (e) {}
        }
        if (framesRef.current.securityCode) {
          try {
            framesRef.current.securityCode.unmount();
          } catch (e) {}
        }
        if (framesRef.current.cardholderName) {
          try {
            framesRef.current.cardholderName.unmount();
          } catch (e) {}
        }
      };
    }, [mp, publicKey, planValue, installments]);

    // Gerar token do cartão
    const generateToken = async () => {
      if (!mp) {
        throw new Error("Mercado Pago não inicializado");
      }

      // Verificar se os frames estão prontos
      if (
        !framesRef.current.cardNumber ||
        !framesRef.current.expirationDate ||
        !framesRef.current.securityCode ||
        !framesRef.current.cardholderName
      ) {
        throw new Error("Campos de pagamento não estão prontos. Aguarde um momento e tente novamente.");
      }

      setLoading(true);
      setError(null);

      try {
        // Obter dados dos frames
        const cardFormData = {
          cardNumber: cardNumber || framesRef.current.cardNumber.getCardFormData?.()?.cardNumber,
          cardholderName: cardholderName || framesRef.current.cardholderName.getCardFormData?.()?.cardholderName,
          cardExpirationMonth: expirationDate.split("/")[0] || "",
          cardExpirationYear: expirationDate.split("/")[1] ? "20" + expirationDate.split("/")[1] : "",
          securityCode: securityCode || "",
          identificationType: identificationType,
          identificationNumber: identificationNumber.replace(/\D/g, ""),
        };

        // Validar dados antes de criar token
        if (!cardFormData.cardNumber || !cardFormData.cardholderName || !cardFormData.cardExpirationMonth || !cardFormData.securityCode) {
          throw new Error("Por favor, preencha todos os dados do cartão");
        }

        const token = await mp.fields.createCardToken(cardFormData);

        const tokenData = {
          token: token.id,
          installments,
          identificationType,
          identificationNumber: identificationNumber.replace(/\D/g, ""),
          issuerId,
          paymentMethodId,
        };

        if (onTokenGenerated) {
          onTokenGenerated(tokenData);
        }

        return tokenData;
      } catch (err) {
        console.error("Erro ao gerar token:", err);
        const errorMessage =
          err.message || "Erro ao processar dados do cartão";
        setError(errorMessage);
        if (onError) {
          onError(err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    };

    // Expor métodos via ref
    useImperativeHandle(ref, () => ({
      generateToken,
      getFormData: () => ({
        cardNumber,
        cardholderName,
        expirationDate,
        securityCode,
        installments,
        identificationType,
        identificationNumber: identificationNumber.replace(/\D/g, ""),
        issuerId,
        paymentMethodId,
      }),
    }));

    if (!publicKey) {
      return (
        <Alert severity="error" className={classes.errorAlert}>
          Chave pública do Mercado Pago não configurada
        </Alert>
      );
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

        {/* Número do Cartão - Frame do Mercado Pago */}
        <Box>
          <Typography
            variant="caption"
            style={{
              color: "rgba(148, 163, 184, 0.8)",
              marginBottom: 8,
              display: "block",
            }}
          >
            Número do Cartão
          </Typography>
          <Box
            ref={cardNumberFrameRef}
            className={classes.mpFrame}
            id="cardNumber"
          />
        </Box>

        {/* Nome do Titular - Frame do Mercado Pago */}
        <Box>
          <Typography
            variant="caption"
            style={{
              color: "rgba(148, 163, 184, 0.8)",
              marginBottom: 8,
              display: "block",
            }}
          >
            Nome no Cartão
          </Typography>
          <Box
            ref={cardholderNameFrameRef}
            className={classes.mpFrame}
            id="cardholderName"
          />
        </Box>

        {/* Data de Expiração e CVV */}
        <Box className={classes.formRow}>
          <Box>
            <Typography
              variant="caption"
              style={{
                color: "rgba(148, 163, 184, 0.8)",
                marginBottom: 8,
                display: "block",
              }}
            >
              Validade
            </Typography>
            <Box
              ref={expirationDateFrameRef}
              className={classes.mpFrame}
              id="expirationDate"
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              style={{
                color: "rgba(148, 163, 184, 0.8)",
                marginBottom: 8,
                display: "block",
              }}
            >
              CVV
            </Typography>
            <Box
              ref={securityCodeFrameRef}
              className={classes.mpFrame}
              id="securityCode"
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
