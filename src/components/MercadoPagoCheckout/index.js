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
  "@global": {
    "#cardNumber iframe, #expirationDate iframe, #securityCode iframe, #cardholderName iframe": {
      pointerEvents: "auto !important",
      zIndex: "9999 !important",
      position: "relative !important",
      cursor: "text !important",
    },
  },
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
    overflow: "visible",
    zIndex: 1,
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
      position: "relative !important",
      zIndex: "999 !important",
      pointerEvents: "auto !important",
      display: "block !important",
      cursor: "text !important",
    },
    "& *": {
      pointerEvents: "auto !important",
      zIndex: "999 !important",
    },
    "& input": {
      pointerEvents: "auto !important",
      cursor: "text !important",
      zIndex: "999 !important",
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

    const mountingRef = useRef({
      cardNumber: false,
      expirationDate: false,
      securityCode: false,
      cardholderName: false,
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
        return false;
      }

      // Verificar se elemento está no DOM
      if (!document.contains(element)) {
        console.warn(`Elemento ${frameType} não está no DOM`);
        return false;
      }

      // Verificar se já está montado
      if (framesRef.current[frameType]) {
        return true;
      }

      // Verificar se já está sendo montado (evitar montagem duplicada)
      if (mountingRef.current[frameType]) {
        return false;
      }

      // Marcar como montando
      mountingRef.current[frameType] = true;

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

        // Verificar novamente se o elemento ainda existe e está no DOM antes de criar o frame
        if (!document.contains(element)) {
          console.error(`Elemento ${frameType} foi removido do DOM antes de criar frame`);
          mountingRef.current[frameType] = false;
          return false;
        }

        // Verificar se o elemento tem dimensões válidas (não precisa estar na viewport)
        const rect = element.getBoundingClientRect();
        const hasValidDimensions = rect.width > 0 && rect.height > 0;
        
        if (!hasValidDimensions) {
          console.warn(`Elemento ${frameType} não tem dimensões válidas (width: ${rect.width}, height: ${rect.height})`);
          mountingRef.current[frameType] = false; // Resetar flag
          return false;
        }

        // Criar e montar o frame
        try {
          // Verificar se mp.fields existe
          if (!mp.fields || typeof mp.fields.create !== "function") {
            console.error(`mp.fields.create não está disponível para ${frameType}`);
            mountingRef.current[frameType] = false;
            return false;
          }

          frame = mp.fields.create(frameType, config[frameType]);
          
          // Verificar se o frame foi criado
          if (!frame) {
            console.error(`Frame ${frameType} não foi criado`);
            mountingRef.current[frameType] = false;
            return false;
          }
          
          // Verificar novamente se o elemento ainda existe antes de montar
          if (!document.contains(element)) {
            console.error(`Elemento ${frameType} foi removido do DOM antes de montar`);
            mountingRef.current[frameType] = false;
            return false;
          }

          // Verificar se o elemento ainda está vazio (Mercado Pago precisa de elemento vazio)
          if (element.children.length > 0 && !element.querySelector("iframe")) {
            // Se tiver filhos que não são iframes, limpar
            element.innerHTML = "";
          }

          // Verificar dimensões do elemento antes de montar
          const finalRect = element.getBoundingClientRect();
          if (finalRect.width === 0 || finalRect.height === 0) {
            console.warn(`Elemento ${frameType} não tem dimensões válidas antes de montar`);
            mountingRef.current[frameType] = false;
            return false;
          }

          // Montar o frame
          frame.mount(element);
          framesRef.current[frameType] = frame;
          
          // Aguardar um pouco antes de adicionar listeners para garantir que o frame está totalmente inicializado
          setTimeout(() => {
            // Adicionar listeners baseado no tipo APÓS montar com sucesso
            try {
            if (frameType === "cardNumber") {
              frame.on("validityChange", (event) => {
                if (event && event.isValid) {
                  setCardNumber(event.value || "");
                  if (event.issuer) {
                    setIssuerId(event.issuer.id);
                  }
                  if (event.payment_method_id) {
                    setPaymentMethodId(event.payment_method_id);
                  }
                }
              });
              frame.on("binChange", async (event) => {
                if (event && event.bin && planValue) {
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
                if (event && event.isValid) {
                  setExpirationDate(event.value || "");
                }
              });
            } else if (frameType === "securityCode") {
              frame.on("validityChange", (event) => {
                if (event && event.isValid) {
                  setSecurityCode(event.value || "");
                }
              });
            } else if (frameType === "cardholderName") {
              frame.on("validityChange", (event) => {
                if (event && event.isValid) {
                  setCardholderName(event.value || "");
                }
              });
            }
            } catch (listenerError) {
              console.warn(`Erro ao adicionar listeners para ${frameType}:`, listenerError);
              // Continuar mesmo se houver erro nos listeners
            }
          }, 100); // Delay de 100ms para garantir que o frame está totalmente inicializado
          
          mountingRef.current[frameType] = false; // Marcar como montado
          console.log(`Frame ${frameType} montado com sucesso`);
        } catch (mountError) {
          mountingRef.current[frameType] = false; // Resetar flag em caso de erro
          console.error(`Erro ao montar frame ${frameType}:`, mountError);
          
          // Se o erro for "Container not found", pode ser que o elemento não esteja pronto
          // Não tentar novamente automaticamente - deixar o useEffect tentar
          return false;
        }
      } catch (err) {
        mountingRef.current[frameType] = false; // Resetar flag em caso de erro
        console.error(`Erro geral ao montar frame ${frameType}:`, err);
        return false;
      }
      
      return true;
    }, [mp, planValue, installments]);

    // Inicializar Mercado Pago SDK
    useEffect(() => {
      // Verificar se o SDK está carregado
      if (!window.MercadoPago) {
        console.error("SDK do Mercado Pago não está disponível. Verifique se o script está carregado no index.html");
        setError("SDK do Mercado Pago não está disponível");
        return;
      }

      if (publicKey) {
        // Verificar se a chave pública é válida
        if (!publicKey || publicKey.trim() === "") {
          console.error("Public Key do Mercado Pago está vazia ou inválida");
          setError("Chave pública do Mercado Pago não configurada");
          return;
        }

        // Verificar formato da chave
        const isTestKey = publicKey.startsWith("TEST-");
        const isProdKey = publicKey.startsWith("APP_USR-");
        
        if (!isTestKey && !isProdKey) {
          console.error("Public Key do Mercado Pago está em formato incorreto:", publicKey.substring(0, 30) + "...");
          console.error("A chave deve começar com 'TEST-' (teste) ou 'APP_USR-' (produção)");
          setError("Chave pública do Mercado Pago em formato incorreto");
          return;
        } else {
          console.log(`✓ Mercado Pago inicializando com chave ${isTestKey ? "TEST" : "PRODUCTION"}`);
          console.log(`✓ Public Key: ${publicKey.substring(0, 20)}...`);
        }

        try {
          // Verificar se o construtor existe
          if (typeof window.MercadoPago !== "function") {
            console.error("window.MercadoPago não é uma função. SDK pode não estar carregado corretamente");
            setError("SDK do Mercado Pago não está disponível corretamente");
            return;
          }

          const mercadoPago = new window.MercadoPago(publicKey, {
            locale: "pt-BR",
          });
          
          // Verificar se o SDK foi inicializado corretamente
          if (!mercadoPago) {
            console.error("SDK do Mercado Pago não foi inicializado (retornou null/undefined)");
            setError("Erro ao inicializar sistema de pagamento");
            return;
          }

          // Verificar se fields está disponível
          if (!mercadoPago.fields) {
            console.error("mercadoPago.fields não está disponível. SDK pode estar incompleto");
            console.error("Objeto mercadoPago:", Object.keys(mercadoPago));
            setError("SDK do Mercado Pago não possui a funcionalidade 'fields'");
            return;
          }

          // Verificar se fields.create existe
          if (typeof mercadoPago.fields.create !== "function") {
            console.error("mercadoPago.fields.create não é uma função");
            console.error("mercadoPago.fields:", Object.keys(mercadoPago.fields || {}));
            setError("SDK do Mercado Pago não possui a função 'fields.create'");
            return;
          }
          
          setMp(mercadoPago);
          console.log("✓ Mercado Pago SDK inicializado com sucesso");
          console.log("✓ SDK versão:", mercadoPago.version || "desconhecida");
          console.log("✓ Fields disponíveis:", Object.keys(mercadoPago.fields || {}));
        } catch (err) {
          console.error("✗ Erro ao inicializar Mercado Pago:", err);
          console.error("✗ Detalhes do erro:", {
            message: err.message,
            stack: err.stack,
            publicKey: publicKey.substring(0, 20) + "...",
            windowMercadoPago: typeof window.MercadoPago
          });
          setError("Erro ao inicializar sistema de pagamento. Verifique a chave pública.");
        }
      } else if (!publicKey) {
        console.warn("Public Key do Mercado Pago não foi fornecida");
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
        if (mountFrameToElement(cardNumberEl, "cardNumber")) {
          mounted++;
        }
      }
      if (expirationDateEl && !framesRef.current.expirationDate) {
        if (mountFrameToElement(expirationDateEl, "expirationDate")) {
          mounted++;
        }
      }
      if (securityCodeEl && !framesRef.current.securityCode) {
        if (mountFrameToElement(securityCodeEl, "securityCode")) {
          mounted++;
        }
      }
      if (cardholderNameEl && !framesRef.current.cardholderName) {
        if (mountFrameToElement(cardholderNameEl, "cardholderName")) {
          mounted++;
        }
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

      // Aguardar um pouco para garantir que o DOM está estável e visível
      const timeout1 = setTimeout(() => {
        mountAllFrames();
      }, 800);

      // Tentar novamente após mais tempo se necessário
      const timeout2 = setTimeout(() => {
        mountAllFrames();
      }, 1500);

      // Última tentativa
      const timeout3 = setTimeout(() => {
        mountAllFrames();
      }, 2500);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
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
