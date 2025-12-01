import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Button, Container, CircularProgress } from "@material-ui/core";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
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
    color: "#F59E0B",
    marginBottom: theme.spacing(3),
    filter: "drop-shadow(0 0 20px rgba(245, 158, 11, 0.5))",
    animation: "$pulse 2s infinite",
  },
  "@keyframes pulse": {
    "0%, 100%": {
      opacity: 1,
      transform: "scale(1)",
    },
    "50%": {
      opacity: 0.8,
      transform: "scale(1.05)",
    },
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "2.5rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, #FFFFFF 0%, #F59E0B 100%)",
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
  loading: {
    marginBottom: theme.spacing(3),
    color: "#00D9FF",
  },
  statusText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "rgba(148, 163, 184, 0.7)",
    marginTop: theme.spacing(2),
    fontStyle: "italic",
  },
}));

const SignupPending = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [checkCount, setCheckCount] = useState(0);
  const maxChecks = 60; // Verificar por até 5 minutos (60 * 5 segundos)

  // Extrair preference_id da URL ou sessionStorage
  const searchParams = new URLSearchParams(location.search);
  const preferenceIdFromUrl = searchParams.get("preference_id");
  const preferenceIdFromStorage = sessionStorage.getItem("mp_preference_id");
  const preferenceId = preferenceIdFromUrl || preferenceIdFromStorage;

  useEffect(() => {
    if (!preferenceId) {
      setIsChecking(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await openApi.get(
          `/mercadopago/preference-status/${preferenceId}`
        );

        const { status, payment } = response.data;

        if (status === "approved") {
          // Pagamento aprovado, redirecionar para success
          toast.success("Pagamento confirmado! Redirecionando...");
          setTimeout(() => {
            history.push(`/signup/success?preference_id=${preferenceId}`);
          }, 1500);
          return;
        } else if (status === "rejected" || status === "cancelled") {
          // Pagamento rejeitado, redirecionar para failure
          toast.error("Pagamento não foi aprovado.");
          setTimeout(() => {
            history.push(`/signup/failure?preference_id=${preferenceId}`);
          }, 1500);
          return;
        }

        // Se ainda está pendente, continuar verificando
        setCheckCount((prev) => {
          if (prev >= maxChecks) {
            setIsChecking(false);
            toast.info("Aguardando confirmação do pagamento. Você receberá um email quando for confirmado.");
            return prev;
          }
          return prev + 1;
        });
      } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
        // Continuar tentando mesmo em caso de erro
        setCheckCount((prev) => {
          if (prev >= maxChecks) {
            setIsChecking(false);
            return prev;
          }
          return prev + 1;
        });
      }
    };

    // Verificar imediatamente
    checkPaymentStatus();

    // Verificar a cada 5 segundos
    const interval = setInterval(() => {
      if (checkCount < maxChecks && isChecking) {
        checkPaymentStatus();
      } else {
        clearInterval(interval);
        setIsChecking(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [preferenceId, checkCount, isChecking, maxChecks, history]);

  return (
    <Box className={classes.root}>
      <Container className={classes.container}>
        <Box className={classes.content}>
          <CircularProgress className={classes.loading} size={60} />
          <HourglassEmptyIcon className={classes.icon} />
          <Typography className={classes.title}>
            Pagamento em Processamento
          </Typography>
          <Typography className={classes.message}>
            Seu pagamento está sendo processado pelo Mercado Pago. Isso pode
            levar alguns minutos. Sua empresa será criada automaticamente assim
            que o pagamento for confirmado. Você receberá um email quando tudo
            estiver pronto.
          </Typography>
          {isChecking && checkCount > 0 && (
            <Typography className={classes.statusText}>
              Verificando status... ({checkCount}/{maxChecks})
            </Typography>
          )}
          <Button
            className={classes.button}
            variant="contained"
            onClick={() => history.push("/login")}
            style={{ marginTop: 16 }}
          >
            Ir para Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SignupPending;

