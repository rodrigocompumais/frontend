import React, { useState, useEffect, useImperativeHandle } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, CircularProgress } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

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
  errorAlert: {
    borderRadius: 12,
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#EF4444",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(3),
  },
  cardPaymentContainer: {
    "& .mp-card-payment-form": {
      fontFamily: "'Inter', sans-serif",
    },
    // Estilos para dark theme
    "& input": {
      color: "#F9FAFB !important",
      backgroundColor: "rgba(30, 41, 59, 0.5) !important",
      borderColor: "rgba(148, 163, 184, 0.3) !important",
    },
    "& input:focus": {
      borderColor: "#00D9FF !important",
    },
    "& select": {
      color: "#F9FAFB !important",
      backgroundColor: "rgba(30, 41, 59, 0.5) !important",
      borderColor: "rgba(148, 163, 184, 0.3) !important",
    },
    "& label": {
      color: "rgba(148, 163, 184, 0.8) !important",
    },
  },
}));

const MercadoPagoCheckout = React.forwardRef(
  ({ publicKey, planValue, planName, onTokenGenerated, onError, isVisible = true }, ref) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    // Inicializar Mercado Pago SDK
    useEffect(() => {
      if (publicKey && !initialized) {
        try {
          initMercadoPago(publicKey);
          setInitialized(true);
          console.log("✓ Mercado Pago SDK React inicializado com sucesso");
        } catch (err) {
          console.error("Erro ao inicializar Mercado Pago:", err);
          setError("Erro ao inicializar sistema de pagamento");
          if (onError) {
            onError(err);
          }
        }
      }
    }, [publicKey, initialized, onError]);

    // Handler para quando o formulário é submetido
    const handleSubmit = async (param) => {
      try {
        setLoading(true);
        setError(null);

        console.log("CardPayment onSubmit chamado:", param);

        // O param contém formData e selectedPaymentMethod
        const { formData, selectedPaymentMethod } = param;

        // Extrair dados do formulário
        const tokenData = {
          token: formData.token,
          installments: formData.installments || 1,
          identificationType: formData.identificationType || "CPF",
          identificationNumber: formData.identificationNumber?.replace(/\D/g, "") || "",
          issuerId: selectedPaymentMethod?.issuer_id?.toString() || formData.issuerId?.toString() || "",
          paymentMethodId: selectedPaymentMethod?.id || formData.paymentMethodId || "",
        };

        console.log("Token data gerado:", tokenData);

        // Armazenar dados para uso via ref
        setPaymentData(tokenData);

        // Chamar callback
        if (onTokenGenerated) {
          onTokenGenerated(tokenData);
        }
      } catch (err) {
        console.error("Erro ao processar pagamento:", err);
        const errorMessage = err.message || "Erro ao processar pagamento";
        setError(errorMessage);
        if (onError) {
          onError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    // Handler para erros do CardPayment
    const handleError = (error) => {
      console.error("Erro no CardPayment:", error);
      setError(error.message || "Erro ao processar pagamento");
      if (onError) {
        onError(error);
      }
    };

    // Expor método generateToken via ref (para compatibilidade com código existente)
    useImperativeHandle(ref, () => ({
      generateToken: async () => {
        // Se já temos paymentData, retornar
        if (paymentData) {
          return paymentData;
        }
        // Caso contrário, o token será gerado quando o usuário submeter o formulário
        throw new Error("Por favor, preencha e submeta o formulário de pagamento");
      },
      getFormData: () => paymentData || {},
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

    // Se não estiver inicializado, mostrar loading
    if (!initialized) {
      return (
        <Box className={classes.root}>
          <Typography className={classes.sectionTitle}>
            Dados de Pagamento
          </Typography>
          <Box className={classes.loadingContainer}>
            <CircularProgress size={30} style={{ color: "#00D9FF" }} />
          </Box>
        </Box>
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

        <Box className={classes.cardPaymentContainer}>
          <CardPayment
            initialization={{
              amount: planValue,
            }}
            customization={{
              visual: {
                style: {
                  theme: "dark",
                  borderRadius: "12px",
                },
                text: {
                  color: "#F9FAFB",
                  fontFamily: "'Inter', sans-serif",
                },
                formInputs: {
                  baseColor: "#00D9FF",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontFamily: "'Inter', sans-serif",
                  primaryColor: "#00D9FF",
                  errorColor: "#EF4444",
                  placeholderColor: "rgba(148, 163, 184, 0.6)",
                },
                formSelect: {
                  backgroundColor: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "12px",
                  color: "#F9FAFB",
                  fontFamily: "'Inter', sans-serif",
                },
                formCheckbox: {
                  primaryColor: "#00D9FF",
                },
                formToggle: {
                  primaryColor: "#00D9FF",
                },
                button: {
                  backgroundColor: "#00D9FF",
                  borderRadius: "12px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "600",
                  fontSize: "16px",
                  height: "48px",
                },
              },
              paymentMethods: {
                creditCard: "all",
                debitCard: "all",
              },
            }}
            onSubmit={handleSubmit}
            onReady={() => {
              console.log("✓ CardPayment Brick pronto");
            }}
            onError={handleError}
          />
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
