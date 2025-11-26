import React, { useState, useRef, useEffect } from "react";
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import ExtensionIcon from "@material-ui/icons/Extension";
import SendIcon from "@material-ui/icons/Send";
import CloseIcon from "@material-ui/icons/Close";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1000,
    background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    color: "#FFFFFF",
    "&:hover": {
      background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
    },
  },
  dialog: {
    "& .MuiDialog-paper": {
      width: "90%",
      maxWidth: "500px",
      maxHeight: "80vh",
      display: "flex",
      flexDirection: "column",
    },
  },
  dialogTitle: {
    background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    color: "#FFFFFF",
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dialogContent: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    ...theme.scrollbarStyles,
  },
  messageContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  messageBubble: {
    padding: theme.spacing(1.5),
    borderRadius: 12,
    maxWidth: "80%",
    wordWrap: "break-word",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    color: "#FFFFFF",
  },
  aiMessage: {
    alignSelf: "flex-start",
    background: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.1)" 
      : "rgba(0, 0, 0, 0.05)",
    color: theme.palette.text.primary,
  },
  messageTime: {
    fontSize: "0.7rem",
    opacity: 0.7,
    marginTop: theme.spacing(0.5),
  },
  inputContainer: {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
  },
  input: {
    flex: 1,
  },
  sendButton: {
    background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    color: "#FFFFFF",
    "&:hover": {
      background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
    },
    "&:disabled": {
      background: theme.palette.action.disabledBackground,
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const AiChatFloating = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    // Adicionar mensagem do usuário
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Preparar histórico de conversa
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data } = await api.post("/ai/chat", {
        message: userMessage,
        conversationHistory,
      });

      // Adicionar resposta da IA
      const aiMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações");
      } else {
        toastError(err);
      }
      // Remover mensagem do usuário em caso de erro
      setMessages((prev) => prev.filter((msg) => msg !== newUserMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Fab
        className={classes.fab}
        color="primary"
        onClick={() => setOpen(true)}
        aria-label="Chat com IA"
      >
        <ExtensionIcon />
      </Fab>

      <Dialog
        open={open}
        onClose={handleClose}
        className={classes.dialog}
        fullWidth
      >
        <DialogTitle className={classes.dialogTitle}>
          <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ExtensionIcon />
            <Typography variant="h6">Assistente IA</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            style={{ color: "#FFFFFF" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          {messages.length === 0 ? (
            <Box className={classes.emptyState}>
              <ExtensionIcon style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }} />
              <Typography variant="body1">
                Olá! Sou seu assistente de IA. Como posso ajudar?
              </Typography>
              <Typography variant="body2" style={{ marginTop: 8, opacity: 0.7 }}>
                Faça perguntas sobre sua base de dados, análises, estatísticas e muito mais.
              </Typography>
            </Box>
          ) : (
            <Box className={classes.messageContainer}>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  className={`${classes.messageBubble} ${
                    msg.role === "user" ? classes.userMessage : classes.aiMessage
                  }`}
                >
                  <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </Typography>
                  <Typography className={classes.messageTime}>
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              ))}
              {loading && (
                <Box className={`${classes.messageBubble} ${classes.aiMessage}`}>
                  <CircularProgress size={16} />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </DialogContent>

        <Box className={classes.inputContainer}>
          <TextField
            inputRef={inputRef}
            className={classes.input}
            placeholder="Digite sua pergunta..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
            size="small"
            multiline
            maxRows={3}
          />
          <IconButton
            className={classes.sendButton}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            color="primary"
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Dialog>
    </>
  );
};

export default AiChatFloating;

