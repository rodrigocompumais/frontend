import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  makeStyles,
} from "@material-ui/core";
import { HiSparkles } from "react-icons/hi";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      minWidth: 380,
      maxWidth: 480,
      borderRadius: 12,
      padding: theme.spacing(1),
    },
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(4, 4, 2),
    gap: theme.spacing(2),
  },
  iconRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  title: {
    fontWeight: 600,
  },
  progressWrap: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    "& .MuiLinearProgress-bar": {
      borderRadius: 5,
      transition: "transform 0.6s ease",
    },
  },
  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(0.5),
  },
  phase: {
    marginTop: theme.spacing(2),
    textAlign: "center",
    minHeight: 40,
    color: theme.palette.text.secondary,
  },
  actions: {
    padding: theme.spacing(1, 3, 2),
    justifyContent: "center",
  },
}));

/**
 * Modal de progresso genérico para operações de IA.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose - chamado ao cancelar (não fecha automaticamente)
 * @param {number}  props.progress  0–100
 * @param {string}  props.phase     Texto da fase actual
 * @param {string}  props.title     Título do modal
 * @param {boolean} props.allowCancel  se false, oculta botão Cancelar (default true)
 */
const AiProgressModal = ({
  open,
  onClose,
  progress = 0,
  phase = "Processando…",
  title = "Processando com IA",
  allowCancel = true,
}) => {
  const classes = useStyles();
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <Dialog
      open={open}
      className={classes.dialog}
      maxWidth="sm"
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogContent className={classes.content}>
        <Box className={classes.iconRow}>
          <HiSparkles size={28} color="#1976d2" />
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
        </Box>

        <Box className={classes.progressWrap}>
          <LinearProgress
            variant="determinate"
            value={clampedProgress}
            className={classes.progressBar}
            color="primary"
          />
          <Box className={classes.progressRow}>
            <Typography variant="caption" color="textSecondary">
              Progresso
            </Typography>
            <Typography variant="caption" color="primary">
              <strong>{clampedProgress}%</strong>
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" className={classes.phase}>
          {phase}
        </Typography>
      </DialogContent>

      {allowCancel && (
        <DialogActions className={classes.actions}>
          <Button onClick={onClose} color="default" variant="outlined" size="small">
            Cancelar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AiProgressModal;
