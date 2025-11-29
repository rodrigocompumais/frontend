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
    position: "relative",
    display: "block",
    "&:focus-within": {
      borderColor: "#00D9FF",
      borderWidth: 2,
    },
    "& iframe": {
      border: "none !important",
      background: "transparent !important",
      width: "100% !important",
      height: "100% !important",
      minHeight: "32px !important",
      position: "relative",
      zIndex: 1,
      pointerEvents: "auto",
    },
    "& *": {
      pointerEvents: "auto",
    },
  },
}));

const MercadoPagoCheckout = React.forwardRef(
  ({ publicKey, planValue, planName, onTokenGenerated, onError, isVisible = true }, ref) => {
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

    // Callback refs para montar frames quando elementos são adicionados ao DOM
    const setCardNumberRef = React.useCallback((node) => {
      cardNumberFrameRef.current = node;
      // Não montar aqui - será montado pelo useEffect quando mp/publicKey estiverem prontos
    }, []);

    const setExpirationDateRef = React.useCallback((node) => {
      expirationDateFrameRef.current = node;
    }, []);

    const setSecurityCodeRef = React.useCallback((node) => {
      securityCodeFrameRef.current = node;
    }, []);

    const setCardholderNameRef = React.useCallback((node) => {
      cardholderNameFrameRef.current = node;
    }, []);

    // Função auxiliar para montar um frame em um elemento
    const mountFrameToElement = React.useCallback((element, frameType) => {
      if (!element || !mp) {
        return;
      }

      // Verificar se elemento está no DOM
      if (!document.contains(element)) {
        console.warn(`Elemento ${frameType} não está no DOM`);
        return;
      }

      // Verificar se já está montado
      if (framesRef.current[frameType]) {
        return;
      }

      // Verificar se o elemento está vazio (sem filhos)
      // O Mercado Pago precisa de um elemento vazio para montar o iframe
      if (element.children.length > 0) {
        // Limpar conteúdo existente
        element.innerHTML = "";
      }

      try {
        let frame;
        const config = {
          cardNumber: { placeholder: "Número do cartão" },
          expirationDate: { placeholder: "MM/AA" },
          securityCode: { placeholder: "CVV" },
          cardholderName: { placeholder: "Nome no cartão" },
        };

        // Verificar se o elemento ainda existe e está no DOM antes de criar o frame
        if (!document.contains(element)) {
          console.error(`Elemento ${frameType} não está no DOM`);
          return;
        }

        // Verificar se o elemento tem dimensões válidas
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          console.warn(`Elemento ${frameType} não tem dimensões válidas, aguardando...`);
          // Tentar novamente após um delay
          setTimeout(() => {
            if (document.contains(element) && element.getBoundingClientRect().width > 0) {
              mountFrameToElement(element, frameType);
            }
          }, 200);
          return;
        }

        // Criar e montar o frame
        try {
          frame = mp.fields.create(frameType, config[frameType]);
          
          // Verificar novamente se o elemento ainda existe antes de montar
          if (!document.contains(element)) {
            console.error(`Elemento ${frameType} foi removido do DOM antes de montar`);
            return;
          }

          // Montar o frame
          frame.mount(element);
          framesRef.current[frameType] = frame;
          
          console.log(`Frame ${frameType} montado com sucesso`);
        } catch (mountError) {
          console.error(`Erro ao montar frame ${frameType}:`, mountError);
          // Se o erro for "Container not found", tentar novamente após um delay
          if (mountError.message && mountError.message.includes("Container not found")) {
            setTimeout(() => {
              if (document.contains(element)) {
                try {
                  const retryFrame = mp.fields.create(frameType, config[frameType]);
                  retryFrame.mount(element);
                  framesRef.current[frameType] = retryFrame;
                  console.log(`Frame ${frameType} montado com sucesso na segunda tentativa`);
                } catch (retryError) {
                  console.error(`Erro na segunda tentativa de montar ${frameType}:`, retryError);
                }
              }
            }, 500);
          }
          throw mountError;
        }

        // Adicionar listeners baseado no tipo
        if (frameType === "cardNumber") {
          frame.on("validityChange", (event) => {
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
          frame.on("binChange", async (event) => {
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
        } else if (frameType === "expirationDate") {
          frame.on("validityChange", (event) => {
            if (event.isValid) {
              setExpirationDate(event.value);
            }
          });
        } else if (frameType === "securityCode") {
          frame.on("validityChange", (event) => {
            if (event.isValid) {
              setSecurityCode(event.value);
            }
          });
        } else if (frameType === "cardholderName") {
          frame.on("validityChange", (event) => {
            if (event.isValid) {
              setCardholderName(event.value);
            }
          });
        }
      } catch (err) {
        console.error(`Erro ao montar frame ${frameType}:`, err);
        setError(`Erro ao inicializar campo ${frameType}: ${err.message}`);
      }
    }, [mp, planValue, installments]);

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

    // Função para montar todos os frames
    const mountAllFrames = React.useCallback(() => {
      if (!mp || !publicKey || !isVisible) {
        return false;
      }

      // Verificar se todos os elementos existem e estão no DOM
      const cardNumberEl = cardNumberFrameRef.current;
      const expirationDateEl = expirationDateFrameRef.current;
      const securityCodeEl = securityCodeFrameRef.current;
      const cardholderNameEl = cardholderNameFrameRef.current;

      if (!cardNumberEl || !expirationDateEl || !securityCodeEl || !cardholderNameEl) {
        return false;
      }

      if (
        !document.contains(cardNumberEl) ||
        !document.contains(expirationDateEl) ||
        !document.contains(securityCodeEl) ||
        !document.contains(cardholderNameEl)
      ) {
        return false;
      }

      // Montar frames que ainda não foram montados
      let mounted = 0;
      if (cardNumberEl && !framesRef.current.cardNumber) {
        mountFrameToElement(cardNumberEl, "cardNumber");
        mounted++;
      }
      if (expirationDateEl && !framesRef.current.expirationDate) {
        mountFrameToElement(expirationDateEl, "expirationDate");
        mounted++;
      }
      if (securityCodeEl && !framesRef.current.securityCode) {
        mountFrameToElement(securityCodeEl, "securityCode");
        mounted++;
      }
      if (cardholderNameEl && !framesRef.current.cardholderName) {
        mountFrameToElement(cardholderNameEl, "cardholderName");
        mounted++;
      }

      return mounted > 0;
    }, [mp, publicKey, isVisible, mountFrameToElement]);

    // Desmontar frames quando não estiver visível
    useEffect(() => {
      if (!isVisible) {
        if (framesRef.current.cardNumber) {
          try {
            framesRef.current.cardNumber.unmount();
            framesRef.current.cardNumber = null;
          } catch (e) {}
        }
        if (framesRef.current.expirationDate) {
          try {
            framesRef.current.expirationDate.unmount();
            framesRef.current.expirationDate = null;
          } catch (e) {}
        }
        if (framesRef.current.securityCode) {
          try {
            framesRef.current.securityCode.unmount();
            framesRef.current.securityCode = null;
          } catch (e) {}
        }
        if (framesRef.current.cardholderName) {
          try {
            framesRef.current.cardholderName.unmount();
            framesRef.current.cardholderName = null;
          } catch (e) {}
        }
      }
    }, [isVisible]);

    // Montar frames quando mp, publicKey ou isVisible mudarem
    useEffect(() => {
      if (!mp || !publicKey || !isVisible) {
        return;
      }

      // Função para tentar montar frames
      const tryMountFrames = () => {
        if (mountAllFrames()) {
          return true;
        }
        return false;
      };

      // Tentar montar imediatamente se elementos já existirem
      if (tryMountFrames()) {
        return;
      }

      // Se não conseguir, usar MutationObserver para detectar quando elementos são adicionados
      const observer = new MutationObserver(() => {
        if (tryMountFrames()) {
          observer.disconnect();
        }
      });

      // Observar o body para detectar quando elementos são adicionados
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }

      // Também tentar após delays
      let timeout2;
      const timeout1 = setTimeout(() => {
        if (tryMountFrames()) {
          observer.disconnect();
        } else {
          timeout2 = setTimeout(() => {
            if (tryMountFrames()) {
              observer.disconnect();
            }
          }, 500);
        }
      }, 500);

      return () => {
        observer.disconnect();
        clearTimeout(timeout1);
        if (timeout2) clearTimeout(timeout2);
      };
    }, [mp, publicKey, isVisible, mountAllFrames]);

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

    // Se não tiver publicKey mas estiver visível, mostrar mensagem de carregamento
    // Se não estiver visível, não renderizar nada (evita erros)
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
      return null; // Não renderizar se não estiver visível
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
          <div
            ref={setCardNumberRef}
            className={classes.mpFrame}
            id="cardNumber"
            key={`cardNumber-${isVisible}`}
            style={{ position: "relative", minHeight: 48 }}
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
          <div
            ref={setCardholderNameRef}
            className={classes.mpFrame}
            id="cardholderName"
            key={`cardholderName-${isVisible}`}
            style={{ position: "relative", minHeight: 48 }}
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
            <div
              ref={setExpirationDateRef}
              className={classes.mpFrame}
              id="expirationDate"
              key={`expirationDate-${isVisible}`}
              style={{ position: "relative", minHeight: 48 }}
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
            <div
              ref={setSecurityCodeRef}
              className={classes.mpFrame}
              id="securityCode"
              key={`securityCode-${isVisible}`}
              style={{ position: "relative", minHeight: 48 }}
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
