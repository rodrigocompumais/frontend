import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  makeStyles,
  IconButton,
  Divider,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";
import { HiSparkles } from "react-icons/hi";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      minWidth: 500,
      maxWidth: 700,
      maxHeight: "85vh",
    },
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  dialogContent: {
    padding: theme.spacing(3),
    overflowY: "auto",
    maxHeight: "65vh",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  textBox: {
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.05)" 
      : "rgba(0, 0, 0, 0.02)",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  textField: {
    "& .MuiInputBase-root": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.05)" 
        : "rgba(0, 0, 0, 0.02)",
    },
  },
  improvedText: {
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(76, 175, 80, 0.1)" 
      : "rgba(76, 175, 80, 0.05)",
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(76, 175, 80, 0.3)" : "rgba(76, 175, 80, 0.2)"}`,
  },
  originalText: {
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(158, 158, 158, 0.1)" 
      : "rgba(158, 158, 158, 0.05)",
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(158, 158, 158, 0.3)" : "rgba(158, 158, 158, 0.2)"}`,
  },
  headerBox: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const summarizePendingActions = (pendingActions) => {
  if (!pendingActions || !pendingActions.length) return "";
  const parts = [];
  pendingActions.forEach((a) => {
    if (a.type === "internal_notes" && a.bodies?.length) {
      parts.push(`${a.bodies.length} nota(s) interna(s)`);
    }
    if (a.type === "change_tag") {
      parts.push(`alterar tag (${a.tagName || "?"})`);
    }
    if (a.type === "transfer_queue") {
      parts.push(
        a.queueName
          ? `transferir para fila "${a.queueName}"`
          : "transferir de fila (padrão)"
      );
    }
    if (a.type === "transfer_wait_only") {
      parts.push("avisar cliente (fila sem transferência automática)");
    }
    if (a.type === "agendar_commands" && a.commands?.length) {
      parts.push(`${a.commands.length} comando(s) de agendamento`);
    }
  });
  return parts.join(", ");
};

const MessageImproveModal = ({
  open,
  onClose,
  loading = false,
  originalText = "",
  improvedText = "",
  onUseImproved,
  pendingActions = null,
  onApplyActions = null,
  applyActionsLoading = false,
}) => {
  const classes = useStyles();
  const pendingSummary = summarizePendingActions(pendingActions);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>
        <Box className={classes.headerBox}>
          <HiSparkles size={24} />
          <Typography variant="h6">Melhorar Mensagem</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box className={classes.loadingBox}>
            <CircularProgress />
            <Typography variant="body2" color="textSecondary">
              {originalText.trim() 
                ? "Melhorando sua mensagem..." 
                : "Gerando sugestão de resposta..."}
            </Typography>
          </Box>
        ) : improvedText ? (
          <>
            {originalText.trim() && (
              <>
                <Box className={`${classes.textBox} ${classes.originalText}`}>
                  <Typography variant="subtitle2" gutterBottom color="textSecondary">
                    Texto Original:
                  </Typography>
                  <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
                    {originalText}
                  </Typography>
                </Box>
                <Divider style={{ margin: "16px 0" }} />
              </>
            )}
            <Box className={`${classes.textBox} ${classes.improvedText}`}>
              <Typography variant="subtitle2" gutterBottom style={{ color: "#4caf50", fontWeight: 600 }}>
                {originalText.trim() ? "Texto Melhorado:" : "Sugestão de Resposta:"}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={improvedText}
                onChange={() => {}} // Read-only, mas permite seleção
                variant="outlined"
                className={classes.textField}
                InputProps={{
                  readOnly: true,
                }}
                style={{ marginTop: 8 }}
              />
            </Box>
            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 8 }}>
              O texto acima já está sem marcadores técnicos para enviar ao cliente. Se a IA propôs ações no ticket (interna, fila, tag, agendamento), aplique-as com o botão abaixo antes de enviar a mensagem.
            </Typography>
            {pendingSummary ? (
              <Box className={classes.textBox} style={{ marginTop: 16 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Ações pendentes no ticket
                </Typography>
                <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                  {pendingSummary}
                </Typography>
              </Box>
            ) : null}
          </>
        ) : (
          <Box className={classes.emptyState}>
            <Typography variant="body2">
              Nenhum texto disponível
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancelar
        </Button>
        {pendingSummary && onApplyActions ? (
          <Button
            onClick={onApplyActions}
            color="secondary"
            variant="outlined"
            disabled={applyActionsLoading}
          >
            {applyActionsLoading ? "Aplicando…" : "Aplicar ações no ticket"}
          </Button>
        ) : null}
        {improvedText && (
          <Button
            onClick={() => onUseImproved && onUseImproved(improvedText)}
            color="primary"
            variant="contained"
            startIcon={<CheckIcon />}
          >
            Usar Texto Melhorado
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MessageImproveModal;

