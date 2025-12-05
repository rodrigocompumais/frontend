import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  makeStyles,
  Box,
  Typography,
  Paper,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import GeminiIcon from "../GeminiIcon";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      minWidth: "600px",
      maxWidth: "800px",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
  },
  content: {
    padding: theme.spacing(3),
    minHeight: "300px",
  },
  objectiveInput: {
    marginBottom: theme.spacing(3),
  },
  previewBox: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "#f5f5f5",
    borderRadius: theme.spacing(1),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  messagePreview: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: "'Roboto', sans-serif",
    fontSize: "0.95rem",
    lineHeight: 1.6,
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  successBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(3),
  },
  successIcon: {
    fontSize: 64,
    color: green[500],
  },
  variationsList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    maxHeight: "400px",
    overflowY: "auto",
  },
  variationItem: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "#fafafa",
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
  },
  variationLabel: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  btnWrapper: {
    position: "relative",
  },
  stepper: {
    padding: theme.spacing(3, 0, 2),
  },
  geminiIcon: {
    width: 32,
    height: 32,
  },
}));

const CampaignAIModal = ({ open, onClose, onApply }) => {
  const classes = useStyles();
  const [step, setStep] = useState(0); // 0: objetivo, 1: preview, 2: gerando variações, 3: sucesso
  const [objective, setObjective] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);

  const steps = ["Definir Objetivo", "Revisar Mensagem", "Gerar Variações"];

  const handleClose = () => {
    setStep(0);
    setObjective("");
    setInitialMessage("");
    setVariations([]);
    setLoading(false);
    onClose();
  };

  const handleGenerateInitial = async () => {
    if (!objective.trim()) {
      toast.warn("Por favor, descreva o objetivo da campanha");
      return;
    }

    if (objective.trim().length < 10) {
      toast.warn("Objetivo deve ter pelo menos 10 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/ai/campaign/initial", {
        objective: objective.trim(),
      });

      setInitialMessage(data.message);
      setStep(1);
      toast.success("Mensagem inicial gerada com sucesso!");
    } catch (err) {
      if (err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações");
      } else if (err.response?.data?.message) {
        // Mensagem específica do backend
        toast.error(err.response.data.message);
      } else {
        toastError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/ai/campaign/initial", {
        objective: objective.trim(),
      });

      setInitialMessage(data.message);
      toast.success("Nova mensagem gerada!");
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toastError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVariations = async () => {
    setStep(2);
    setLoading(true);

    try {
      const { data } = await api.post("/ai/campaign/variations", {
        originalMessage: initialMessage,
        objective: objective.trim(),
      });

      setVariations(data.variations || []);
      setStep(3);
      toast.success(`${data.variations?.length || 0} variações geradas com sucesso!`);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações → Chave da API do Gemini");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toastError(err);
      }
      setStep(1); // Volta para o passo anterior em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMessages = () => {
    const allMessages = [initialMessage, ...variations];
    onApply(allMessages);
    handleClose();
    toast.success("Mensagens aplicadas com sucesso!");
  };

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <>
          <Typography variant="body1" gutterBottom>
            Descreva o objetivo da sua campanha e deixe a IA criar mensagens persuasivas para você.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Qual o objetivo desta campanha?"
            placeholder="Ex: Promover desconto de Black Friday de 50% em todos os produtos com entrega grátis para compras acima de R$ 100"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className={classes.objectiveInput}
            helperText={`${objective.length}/500 caracteres`}
            inputProps={{ maxLength: 500 }}
          />
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Typography variant="body1" gutterBottom>
            Revise a mensagem inicial gerada. Se aprovar, vamos gerar 4 variações automáticas.
          </Typography>
          <Paper className={classes.previewBox} elevation={0}>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              📱 PRÉVIA DA MENSAGEM
            </Typography>
            <Typography className={classes.messagePreview}>{initialMessage}</Typography>
          </Paper>
        </>
      );
    }

    if (step === 2) {
      return (
        <Box className={classes.loadingBox}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6">Gerando variações criativas...</Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            A IA está criando 4 versões diferentes da sua mensagem.
            <br />
            Isso pode levar alguns segundos.
          </Typography>
        </Box>
      );
    }

    if (step === 3) {
      return (
        <Box>
          <Box className={classes.successBox}>
            <CheckCircleIcon className={classes.successIcon} />
            <Typography variant="h6">5 mensagens criadas com sucesso!</Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              Revise as variações abaixo antes de aplicar à sua campanha.
            </Typography>
          </Box>

          <Box className={classes.variationsList}>
            <Paper className={classes.variationItem} elevation={1}>
              <Typography className={classes.variationLabel}>📱 Mensagem 1 (Original)</Typography>
              <Typography className={classes.messagePreview}>{initialMessage}</Typography>
            </Paper>

            {variations.map((variation, index) => (
              <Paper key={index} className={classes.variationItem} elevation={1}>
                <Typography className={classes.variationLabel}>
                  📱 Mensagem {index + 2}
                </Typography>
                <Typography className={classes.messagePreview}>{variation}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      );
    }
  };

  const renderActions = () => {
    if (step === 0) {
      return (
        <>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Box className={classes.btnWrapper}>
            <Button
              onClick={handleGenerateInitial}
              color="primary"
              variant="contained"
              disabled={loading || !objective.trim() || objective.trim().length < 10}
            >
              Gerar Mensagem
            </Button>
            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Box>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Button onClick={() => setStep(0)} color="secondary">
            Voltar
          </Button>
          <Box className={classes.btnWrapper}>
            <IconButton
              onClick={handleRegenerate}
              disabled={loading}
              color="primary"
              title="Gerar outra mensagem"
            >
              <AutorenewIcon />
            </IconButton>
          </Box>
          <Box className={classes.btnWrapper}>
            <Button
              onClick={handleGenerateVariations}
              color="primary"
              variant="contained"
              disabled={loading}
            >
              Aprovar e Gerar Variações
            </Button>
            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Box>
        </>
      );
    }

    if (step === 2) {
      return null; // Sem ações durante o loading
    }

    if (step === 3) {
      return (
        <>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleApplyMessages} color="primary" variant="contained">
            Aplicar Mensagens
          </Button>
        </>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      maxWidth="md"
      fullWidth
      className={classes.dialog}
      disableBackdropClick={loading}
      disableEscapeKeyDown={loading}
    >
      <Box className={classes.header}>
        <GeminiIcon size={32} className={classes.geminiIcon} />
        <Box>
          <DialogTitle style={{ padding: 0, color: "inherit" }}>
            Gerador de Campanhas com IA
          </DialogTitle>
          <Typography variant="caption" style={{ opacity: 0.9 }}>
            Powered by Gemini AI - Criatividade Aumentada
          </Typography>
        </Box>
      </Box>

      <Stepper activeStep={step} className={classes.stepper} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <DialogContent className={classes.content}>{renderStepContent()}</DialogContent>

      <DialogActions style={{ padding: "16px 24px" }}>{renderActions()}</DialogActions>
    </Dialog>
  );
};

export default CampaignAIModal;

