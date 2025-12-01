import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Container, CircularProgress } from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { openApi } from "../../services/api";
import { toast } from "react-toastify";

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
    maxWidth: 600,
    border: "1px solid rgba(0, 217, 255, 0.15)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    position: "relative",
    zIndex: 1,
  },
  icon: {
    fontSize: 100,
    color: "#22C55E",
    marginBottom: theme.spacing(3),
    filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2.5rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, #FFFFFF 0%, #00D9FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      fontSize: "2rem",
    },
  },
  message: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.1rem",
    color: "rgba(226, 232, 240, 0.85)",
    marginBottom: theme.spacing(4),
    lineHeight: 1.7,
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
    "&:hover": {
      background: "linear-gradient(135deg, #00E5FF, #2DD881)",
      boxShadow: "0 6px 20px rgba(0, 217, 255, 0.4)",
      transform: "translateY(-2px)",
    },
    transition: "all 0.3s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  loadingText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    color: "rgba(226, 232, 240, 0.7)",
  },
}));

const SignupSuccess = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Extrair preference_id da URL ou sessionStorage
  const searchParams = new URLSearchParams(location.search);
  const preferenceIdFromUrl = searchParams.get("preference_id");
  const preferenceIdFromStorage = sessionStorage.getItem("mp_preference_id");
  const preferenceId = preferenceIdFromUrl || preferenceIdFromStorage;

  useEffect(() => {
    if (!preferenceId) {
      setIsVerifying(false);
      return;
    }

    const verifyPaymentStatus = async () => {
      try {
        const response = await openApi.get(
          `/mercadopago/preference-status/${preferenceId}`
        );

        const { status } = response.data;
        setPaymentStatus(status);
        setIsVerifying(false);

        if (status === "pending") {
          // Se ainda está pendente, redirecionar para página de pending
          toast.info("Pagamento ainda está sendo processado...");
          setTimeout(() => {
            history.push(`/signup/pending?preference_id=${preferenceId}`);
          }, 2000);
        } else if (status === "rejected" || status === "cancelled") {
          // Se foi rejeitado, redirecionar para failure
          toast.error("Pagamento não foi aprovado.");
          setTimeout(() => {
            history.push(`/signup/failure?preference_id=${preferenceId}`);
          }, 2000);
        }
      } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
        setIsVerifying(false);
      }
    };

    verifyPaymentStatus();
  }, [preferenceId, history]);

  if (isVerifying) {
    return (
      <Box className={classes.root}>
        <Container className={classes.container}>
          <Box className={classes.content}>
            <Box className={classes.loadingContainer}>
              <CircularProgress size={60} style={{ color: "#00D9FF" }} />
              <Typography className={classes.title}>
                Verificando Pagamento...
              </Typography>
              <Typography className={classes.loadingText}>
                Aguarde enquanto verificamos o status do seu pagamento.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Container className={classes.container}>
        <Box className={classes.content}>
          <CheckCircleIcon className={classes.icon} />
          <Typography className={classes.title}>
            Pagamento Aprovado!
          </Typography>
          <Typography className={classes.message}>
            Seu pagamento foi processado com sucesso. Sua empresa será criada
            automaticamente após a confirmação do pagamento pelo Mercado Pago.
            Você receberá um email quando tudo estiver pronto.
          </Typography>
          <Button
            className={classes.button}
            variant="contained"
            onClick={() => history.push("/login")}
          >
            Ir para Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SignupSuccess;

