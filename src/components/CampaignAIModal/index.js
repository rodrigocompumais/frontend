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
import toastError from "../../errors/toastError";
import isAiBackendConfigError from "../../errors/isAiBackendConfigError";
import GeminiIcon from "../GeminiIcon";
import useAiJob from "../../hooks/useAiJob";
import AiProgressModal from "../AiProgressModal";

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
  const [step, setStep] = useState(0); // 0: objetivo, 1: preview, 3: sucesso
  const [objective, setObjective] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [variations, setVariations] = useState([]);

  const { startJob, cancelJob, jobOpen, progress, phase } = useAiJob();

  const steps = ["Definir Objetivo", "Revisar Mensagem", "Gerar Variações"];

  const handleClose = () => {
    setStep(0);
    setObjective("");
    setInitialMessage("");
    setVariations([]);
    cancelJob();
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

    const result = await startJob("campaign_initial", { objective: objective.trim() });
    if (result) {
      setInitialMessage(result.message);
      setStep(1);
      toast.success("Mensagem inicial gerada com sucesso!");
    } else {
      toast.error("Erro ao gerar mensagem. Tente novamente.");
    }
  };

  const handleRegenerate = async () => {
    const result = await startJob("campaign_initial", { objective: objective.trim() });
    if (result) {
      setInitialMessage(result.message);
      toast.success("Nova mensagem gerada!");
    } else {
      toast.error("Erro ao regenerar mensagem.");
    }
  };

  const handleGenerateVariations = async () => {
    const result = await startJob("campaign_variations", {
      originalMessage: initialMessage,
      objective: objective.trim(),
    });
    if (result) {
      setVariations(result.variations || []);
      setStep(3);
      toast.success(`${result.variations?.length || 0} variações geradas com sucesso!`);
    } else {
      toast.error("Erro ao gerar variações. Tente novamente.");
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
              disabled={!objective.trim() || objective.trim().length < 10}
            >
              Gerar Mensagem
            </Button>
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
            >
              Aprovar e Gerar Variações
            </Button>
          </Box>
        </>
      );
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
    <>
    <AiProgressModal
      open={jobOpen}
      onClose={cancelJob}
      progress={progress}
      phase={phase}
      title="Gerando com IA…"
    />
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      className={classes.dialog}
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
    </>
  );
};

export default CampaignAIModal;

