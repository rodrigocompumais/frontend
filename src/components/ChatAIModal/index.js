import React, { useState } from "react";
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
  Chip,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import SendIcon from "@material-ui/icons/Send";
import MarkdownWrapper from "../MarkdownWrapper";

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
  analysisBox: {
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.05)" 
      : "rgba(0, 0, 0, 0.02)",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  suggestionChip: {
    margin: theme.spacing(0.5),
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: "#FFFFFF",
    },
  },
  inputArea: {
    marginTop: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(1),
  },
  loadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4),
  },
  keyPointsList: {
    marginTop: theme.spacing(1),
    "& li": {
      marginBottom: theme.spacing(0.5),
    },
  },
}));

const ChatAIModal = ({
  open,
  onClose,
  mode = "analyze", // "analyze", "audio", "suggest"
  loading = false,
  analysis = "",
  suggestions = [],
  keyPoints = [],
  audioSummary = "",
  audioCount = 0,
  onSendQuestion,
  onSelectSuggestion,
}) => {
  const classes = useStyles();
  const [question, setQuestion] = useState("");

  const handleSendQuestion = () => {
    if (question.trim() && onSendQuestion) {
      onSendQuestion(question.trim());
      setQuestion("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "audio":
        return "Resumo de Áudios";
      case "suggest":
        return "Sugestões de Resposta";
      default:
        return "Análise da Conversa";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>
        <Typography variant="h6">{getTitle()}</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box className={classes.loadingBox}>
            <CircularProgress />
            <Typography variant="body2" style={{ marginLeft: 16 }}>
              {mode === "audio" ? "Processando áudios..." : "Analisando..."}
            </Typography>
          </Box>
        ) : (
          <>
            {mode === "audio" && audioCount > 0 && (
              <Typography variant="caption" color="textSecondary">
                {audioCount} áudio(s) processado(s)
              </Typography>
            )}
            
            {mode === "audio" && audioSummary && (
              <Box className={classes.analysisBox}>
                <Typography variant="subtitle2" gutterBottom>
                  Resumo dos Áudios:
                </Typography>
                <MarkdownWrapper>{audioSummary}</MarkdownWrapper>
              </Box>
            )}

            {mode === "analyze" && analysis && (
              <Box className={classes.analysisBox}>
                <Typography variant="subtitle2" gutterBottom>
                  Análise do Contexto:
                </Typography>
                <MarkdownWrapper>{analysis}</MarkdownWrapper>
              </Box>
            )}

            {keyPoints.length > 0 && (
              <Box className={classes.analysisBox}>
                <Typography variant="subtitle2" gutterBottom>
                  Pontos Principais:
                </Typography>
                <ul className={classes.keyPointsList}>
                  {keyPoints.map((point, index) => (
                    <li key={index}>
                      <Typography variant="body2">{point}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            )}

            {mode === "suggest" && suggestions.length > 0 && (
              <Box className={classes.analysisBox}>
                <Typography variant="subtitle2" gutterBottom>
                  Sugestões de Resposta:
                </Typography>
                <Box>
                  {suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      className={classes.suggestionChip}
                      onClick={() => onSelectSuggestion && onSelectSuggestion(suggestion)}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {mode === "analyze" && onSendQuestion && (
              <Box className={classes.inputArea}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Faça uma pergunta sobre a conversa..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  color="primary"
                  onClick={handleSendQuestion}
                  disabled={!question.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatAIModal;

