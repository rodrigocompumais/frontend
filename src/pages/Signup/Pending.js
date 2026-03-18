import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import { openApi } from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    background: "linear-gradient(180deg, #0A0A0F 0%, #111827 50%, #0A0A0F 100%)",
  },
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
  content: {
    background:
      "linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(10, 10, 15, 0.98))",
    borderRadius: 24,
    padding: theme.spacing(5),
    textAlign: "center",
    maxWidth: 560,
    width: "100%",
    border: "1px solid rgba(0, 217, 255, 0.15)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: "1.8rem",
    color: "#F9FAFB",
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("sm")]: { fontSize: "1.4rem" },
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    color: "rgba(226, 232, 240, 0.75)",
    marginBottom: theme.spacing(3),
    lineHeight: 1.6,
  },
  qrContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(3),
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    border: "2px solid rgba(0, 217, 255, 0.4)",
    padding: 8,
    background: "#FFF",
  },
  copyBox: {
    display: "flex",
    alignItems: "center",
    background: "rgba(30, 41, 59, 0.6)",
    border: "1px solid rgba(0, 217, 255, 0.25)",
    borderRadius: 12,
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(3),
    gap: theme.spacing(1),
    wordBreak: "break-all",
  },
  pixPayloadText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.75rem",
    color: "rgba(148, 163, 184, 0.9)",
    flex: 1,
    textAlign: "left",
  },
  copyButton: {
    color: "#00D9FF",
    flexShrink: 0,
    padding: 4,
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  statusText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    color: "rgba(148, 163, 184, 0.7)",
    fontStyle: "italic",
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
      transform: "translateY(-2px)",
    },
    transition: "all 0.3s ease",
  },
  expiry: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.8rem",
    color: "#F59E0B",
    marginBottom: theme.spacing(2),
  },
}));

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 120; // 10 minutos

const SignupPending = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const intervalRef = useRef(null);
  const pollCountRef = useRef(0);

  // Estado passado via history.push (fluxo Asaas)
  const state = location.state || {};
  const {
    companyId,
    pixQrCode,
    pixPayload,
    expirationDate,
    value,
    planName,
    cardPending,
  } = state;

  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(Boolean(companyId));

  const handleCopy = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload).then(() => {
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    });
  };

  useEffect(() => {
    if (!companyId) return;

    const poll = async () => {
      try {
        const response = await openApi.get(
          `/companies/asaas-payment-status/${companyId}`
        );
        const { status } = response.data;

        if (status === "active") {
          clearInterval(intervalRef.current);
          setChecking(false);
          toast.success("Pagamento confirmado! Sua conta está ativa.");
          setTimeout(() => history.push("/signup/success"), 1500);
          return;
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      }

      pollCountRef.current += 1;
      if (pollCountRef.current >= MAX_POLLS) {
        clearInterval(intervalRef.current);
        setChecking(false);
        toast.info(
          cardPending
            ? "Aguardando confirmação do cartão. Sua conta será ativada em instantes."
            : "Aguardando confirmação do PIX. Você receberá acesso assim que o pagamento for identificado."
        );
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [companyId, history]);

  // Se não tiver state (acesso direto à URL), mostrar mensagem genérica
  if (!companyId) {
    return (
      <Box className={classes.root}>
        <Container className={classes.container}>
          <Box className={classes.content}>
            <HourglassEmptyIcon
              style={{ fontSize: 80, color: "#F59E0B", marginBottom: 16 }}
            />
            <Typography className={classes.title}>
              Aguardando Pagamento
            </Typography>
            <Typography className={classes.subtitle}>
              Se você já realizou um cadastro, aguarde a confirmação do
              pagamento. Você receberá acesso assim que o PIX for confirmado.
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
  }

  return (
    <Box className={classes.root}>
      <Container className={classes.container}>
        <Box className={classes.content}>
          <Typography className={classes.title}>
            {cardPending
              ? "Confirmando pagamento no cartão"
              : "Pague via PIX para ativar sua conta"}
          </Typography>

          {planName && value && (
            <Typography className={classes.subtitle}>
              {planName} — R${" "}
              {Number(value).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
              /mês
            </Typography>
          )}

          {cardPending && (
            <Typography className={classes.subtitle} style={{ marginBottom: 24 }}>
              Sua assinatura foi registrada. Estamos aguardando a confirmação da operadora do cartão. Esta página atualiza automaticamente.
            </Typography>
          )}

          {/* QR Code — só PIX */}
          {!cardPending && pixQrCode && (
            <Box className={classes.qrContainer}>
              <img
                src={pixQrCode}
                alt="QR Code PIX"
                className={classes.qrImage}
              />
            </Box>
          )}

          {/* Copia e cola — só PIX */}
          {!cardPending && pixPayload && (
            <Box className={classes.copyBox}>
              <Typography className={classes.pixPayloadText}>
                {pixPayload}
              </Typography>
              <Tooltip title={copied ? "Copiado!" : "Copiar código PIX"}>
                <IconButton className={classes.copyButton} onClick={handleCopy}>
                  {copied ? (
                    <CheckCircleOutlineIcon style={{ color: "#22C55E" }} />
                  ) : (
                    <FileCopyIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {expirationDate && (
            <Typography className={classes.expiry}>
              Válido até:{" "}
              {new Date(expirationDate).toLocaleString("pt-BR")}
            </Typography>
          )}

          {/* Status do polling */}
          <Box className={classes.statusRow}>
            {checking && (
              <>
                <CircularProgress size={18} style={{ color: "#00D9FF" }} />
                <Typography className={classes.statusText}>
                  Aguardando confirmação do pagamento...
                </Typography>
              </>
            )}
            {!checking && (
              <Typography className={classes.statusText}>
                Verificação encerrada. Seu acesso será liberado após a confirmação do banco.
              </Typography>
            )}
          </Box>

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

export default SignupPending;
