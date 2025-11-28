import React, { useState, useRef, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  Fab,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
  CircularProgress,
  makeStyles,
  Collapse,
  Badge,
  Tooltip,
  Zoom,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import CloseIcon from "@material-ui/icons/Close";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import MinimizeIcon from "@material-ui/icons/Remove";
import AssessmentIcon from "@material-ui/icons/Assessment";
import api from "../../services/api";
import GeminiIcon from "../GeminiIcon";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const STORAGE_KEY = "ai_chat_messages";
const MAX_STORED_MESSAGES = 50;

const useStyles = makeStyles((theme) => ({
  // Container principal fixo no canto inferior direito
  container: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1300,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: theme.spacing(2),
  },
  // Container dos FABs com hover
  fabContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: theme.spacing(1.5),
    "&:hover $fabSecondary": {
      opacity: 1,
      transform: "translateX(0) scale(1)",
      pointerEvents: "auto",
    },
    "&:hover $fabLabel": {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
  // Botão FAB principal
  fab: {
    background: "transparent",
    color: "#FFFFFF",
    boxShadow: "0 4px 20px rgba(14, 165, 233, 0.4)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 6px 25px rgba(14, 165, 233, 0.5)",
    },
  },
  // Botão FAB secundário (Resumo IA)
  fabSecondary: {
    background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
    color: "#FFFFFF",
    boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
    opacity: 0,
    transform: "translateX(20px) scale(0.8)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",
    "&:hover": {
      background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
      transform: "translateX(0) scale(1.05) !important",
      boxShadow: "0 6px 25px rgba(139, 92, 246, 0.5)",
    },
  },
  // Label do FAB secundário
  fabLabel: {
    position: "absolute",
    right: 60,
    backgroundColor: theme.palette.type === "dark" ? "#1F2937" : "#FFFFFF",
    color: theme.palette.text.primary,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: "0.8rem",
    fontWeight: 500,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
    whiteSpace: "nowrap",
    opacity: 0,
    transform: "translateX(10px)",
    transition: "all 0.3s ease",
    pointerEvents: "none",
  },
  // Wrapper para FAB com label
  fabWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  fabOpen: {
    background: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
    "&:hover": {
      background: "linear-gradient(135deg, #F87171 0%, #EF4444 100%)",
    },
  },
  // Painel do chat
  chatPanel: {
    width: 380,
    maxWidth: "calc(100vw - 32px)",
    height: 500,
    maxHeight: "calc(100vh - 150px)",
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  // Header do chat
  chatHeader: {
    background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    color: "#FFFFFF",
    padding: theme.spacing(1.5, 2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 56,
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  faviconIcon: {
    width: 24,
    height: 24,
    objectFit: "contain",
  },
  faviconIconLarge: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  faviconFab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    position: "relative",
    zIndex: 1,
  },
  
  fabWithBackground: {
    "&:hover .faviconFab": {
      opacity: 0.8,
    },
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  headerButton: {
    color: "#FFFFFF",
    padding: 6,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
  },
  // Área de mensagens
  messagesArea: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(0, 0, 0, 0.2)" 
      : "rgba(0, 0, 0, 0.02)",
    ...theme.scrollbarStyles,
  },
  // Mensagens
  messageBubble: {
    padding: theme.spacing(1.5),
    borderRadius: 16,
    maxWidth: "85%",
    wordWrap: "break-word",
    animation: "$fadeIn 0.3s ease",
  },
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    color: "#FFFFFF",
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: "flex-start",
    background: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.1)" 
      : "#FFFFFF",
    color: theme.palette.text.primary,
    borderBottomLeftRadius: 4,
    boxShadow: theme.palette.type === "dark" 
      ? "none" 
      : "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  messageTime: {
    fontSize: "0.65rem",
    opacity: 0.7,
    marginTop: theme.spacing(0.5),
    textAlign: "right",
  },
  // Estado vazio
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 64,
    opacity: 0.2,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  // Área de input
  inputArea: {
    padding: theme.spacing(1.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "flex-end",
    backgroundColor: theme.palette.background.paper,
  },
  input: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 20,
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.05)" 
        : "rgba(0, 0, 0, 0.02)",
    },
  },
  sendButton: {
    background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    color: "#FFFFFF",
    width: 40,
    height: 40,
    "&:hover": {
      background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
    },
    "&:disabled": {
      background: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },
  },
  // Loading
  loadingBubble: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  // Badge para indicar mensagens
  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#22C55E",
      color: "#FFFFFF",
    },
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

  // Carregar mensagens do localStorage ao iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.warn("Erro ao carregar mensagens do cache:", err);
    }
  }, []);

  // Salvar mensagens no localStorage quando mudam
  useEffect(() => {
    try {
      // Limitar quantidade de mensagens salvas
      const toStore = messages.slice(-MAX_STORED_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (err) {
      console.warn("Erro ao salvar mensagens no cache:", err);
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    }
  }, [open, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data } = await api.post("/ai/chat", {
        message: userMessage,
        conversationHistory,
      });

      const aiMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações");
      } else {
        toastError(err);
      }
      setMessages((prev) => prev.slice(0, -1));
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

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.info("Histórico de conversa limpo");
  };

  const history = useHistory();
  
  const handleGoToSummary = () => {
    // Navegar para o dashboard e focar na seção de resumo
    history.push("/dashboard");
    // Pequeno delay para garantir que a página carregou
    setTimeout(() => {
      // Disparar evento customizado para abrir o resumo
      window.dispatchEvent(new CustomEvent("openAiSummary"));
    }, 500);
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box className={classes.container}>
      {/* Painel do Chat */}
      <Collapse in={open} timeout={300}>
        <Paper className={classes.chatPanel} elevation={8}>
          {/* Header */}
          <Box className={classes.chatHeader}>
            <Box className={classes.headerTitle}>
              <GeminiIcon size={24} className={classes.faviconIcon} />
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                Compuchat
              </Typography>
            </Box>
            <Box className={classes.headerActions}>
              <Tooltip title="Limpar conversa">
                <IconButton
                  className={classes.headerButton}
                  size="small"
                  onClick={handleClearHistory}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Minimizar">
                <IconButton
                  className={classes.headerButton}
                  size="small"
                  onClick={() => setOpen(false)}
                >
                  <MinimizeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Área de Mensagens */}
          <Box className={classes.messagesArea}>
            {messages.length === 0 ? (
              <Box className={classes.emptyState}>
                <GeminiIcon size={48} className={classes.faviconIconLarge} />
                <Typography variant="body1" gutterBottom>
                  Olá! Sou o Compuchat, seu assistente inteligente.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pergunte sobre atendimentos, estatísticas, conversas e muito mais.
                </Typography>
              </Box>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    className={`${classes.messageBubble} ${
                      msg.role === "user" ? classes.userMessage : classes.aiMessage
                    }`}
                  >
                    <Typography 
                      variant="body2" 
                      style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                    >
                      {msg.content}
                    </Typography>
                    <Typography className={classes.messageTime}>
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Box>
                ))}
                {loading && (
                  <Box className={`${classes.messageBubble} ${classes.aiMessage} ${classes.loadingBubble}`}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="textSecondary">
                      Pensando...
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </Box>

          {/* Área de Input */}
          <Box className={classes.inputArea}>
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
              fullWidth
            />
            <IconButton
              className={classes.sendButton}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Paper>
      </Collapse>

      {/* Container dos FABs com hover */}
      <Box className={classes.fabContainer}>
        {/* Botão Resumo IA (aparece no hover) */}
        <Box className={classes.fabWrapper}>
          <span className={classes.fabLabel}>📊 Resumo Compuchat</span>
          <Fab
            size="medium"
            className={classes.fabSecondary}
            onClick={handleGoToSummary}
            aria-label="Resumo IA"
          >
            <AssessmentIcon />
          </Fab>
        </Box>

        {/* Botão FAB Principal */}
        <Box className={classes.fabWrapper}>
          <span className={classes.fabLabel}>
            {open ? "Fechar" : "💬 Compuchat"}
          </span>
          <Badge
            badgeContent={messages.length > 0 && !open ? messages.length : 0}
            className={classes.badge}
            max={99}
          >
            <Fab
              className={`${classes.fab} ${open ? classes.fabOpen : ""} ${!open ? classes.fabWithBackground : ""}`}
              onClick={() => setOpen(!open)}
              aria-label="Chat com IA"
            >
              {open ? (
                <CloseIcon style={{ position: "relative", zIndex: 1 }} />
              ) : (
                <GeminiIcon size={24} className={classes.faviconFab} />
              )}
            </Fab>
          </Badge>
        </Box>
      </Box>
    </Box>
  );
};

export default AiChatFloating;


