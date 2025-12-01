import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Container, CircularProgress } from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { openApi } from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: theme.spacing(3),
  },
  content: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: theme.spacing(4),
    textAlign: "center",
    maxWidth: 500,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  icon: {
    fontSize: 80,
    color: "#4caf50",
    marginBottom: theme.spacing(2),
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2rem",
    color: "#1a202c",
    marginBottom: theme.spacing(2),
  },
  message: {
    fontSize: "1.1rem",
    color: "#4a5568",
    marginBottom: theme.spacing(3),
    lineHeight: 1.6,
  },
  button: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: theme.spacing(1.5, 4),
    borderRadius: 12,
    textTransform: "none",
    fontSize: "1rem",
    fontWeight: 600,
    "&:hover": {
      background: "linear-gradient(135deg, #5568d3 0%, #653a91 100%)",
    },
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
      <Box className={classes.container}>
        <Container>
          <Box className={classes.content}>
            <CircularProgress size={60} style={{ marginBottom: 16 }} />
            <Typography className={classes.title}>
              Verificando Pagamento...
            </Typography>
            <Typography className={classes.message}>
              Aguarde enquanto verificamos o status do seu pagamento.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Container>
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

