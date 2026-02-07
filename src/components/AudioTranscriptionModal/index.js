import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  makeStyles,
  IconButton,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import RefreshIcon from "@material-ui/icons/Refresh";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      minWidth: 500,
      maxWidth: 700,
      maxHeight: "80vh",
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
    maxHeight: "60vh",
  },
  transcriptionBox: {
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.05)" 
      : "rgba(0, 0, 0, 0.02)",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  errorBox: {
    backgroundColor: theme.palette.type === "dark"
      ? "rgba(245, 158, 11, 0.15)"
      : "rgba(245, 158, 11, 0.12)",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  },
}));

const AudioTranscriptionModal = ({
  open,
  onClose,
  onRetry,
  loading = false,
  transcription = "",
  error = null,
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
        <Typography variant="h6">{i18n.t("messagesList.transcriptionModal.title")}</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box className={classes.loadingBox}>
            <CircularProgress />
            <Typography variant="body2">
              {i18n.t("messagesList.transcriptionModal.loading")}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {i18n.t("messagesList.transcriptionModal.loadingHint")}
            </Typography>
          </Box>
        ) : error ? (
          <Box className={classes.errorBox}>
            <Typography variant="subtitle2" gutterBottom color="textPrimary">
              {i18n.t("messagesList.transcriptionModal.errorTitle")}
            </Typography>
            <Typography variant="body2" color="textPrimary">
              {error}
            </Typography>
          </Box>
        ) : transcription ? (
          <Box className={classes.transcriptionBox}>
            <Typography variant="body1">
              {transcription}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            {i18n.t("messagesList.transcriptionModal.noTranscription")}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {error && onRetry && (
          <Button onClick={onRetry} color="primary" startIcon={<RefreshIcon />}>
            {i18n.t("messagesList.transcriptionModal.retry")}
          </Button>
        )}
        <Button onClick={onClose} color="primary">
          {i18n.t("messagesList.transcriptionModal.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AudioTranscriptionModal;

