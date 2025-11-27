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

const MessageImproveModal = ({
  open,
  onClose,
  loading = false,
  originalText = "",
  improvedText = "",
  onUseImproved,
}) => {
  const classes = useStyles();

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
              Você pode editar o texto acima antes de usar, ou clicar em "Usar Texto Melhorado" para aplicar diretamente.
            </Typography>
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

