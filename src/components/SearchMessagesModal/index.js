import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  makeStyles,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { format, parseISO } from "date-fns";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  searchField: {
    marginBottom: theme.spacing(2),
  },
  resultsList: {
    maxHeight: 400,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  listItem: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  messagePreview: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 400,
  },
}));

const SearchMessagesModal = ({ open, onClose, ticketId, onSelectMessage }) => {
  const classes = useStyles();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setMessages([]);
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchResults = useCallback(async () => {
    if (!ticketId || !debouncedQuery) {
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${ticketId}/search`, {
        params: { query: debouncedQuery },
      });
      setMessages(data.messages || []);
    } catch (err) {
      toastError(err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [ticketId, debouncedQuery]);

  useEffect(() => {
    if (!open || !ticketId) return;
    if (debouncedQuery) {
      fetchResults();
    } else {
      setMessages([]);
    }
  }, [open, ticketId, debouncedQuery, fetchResults]);

  const handleSelectMessage = (message) => {
    if (onSelectMessage) onSelectMessage(message.id);
    onClose();
  };

  const getMessagePreview = (message) => {
    if (message.isDeleted) return "(Mensagem excluída)";
    if (message.body && message.body.trim()) {
      const text = message.body.trim();
      return text.length > 80 ? `${text.slice(0, 80)}...` : text;
    }
    if (message.mediaType === "audio") return "🎵 Áudio";
    if (message.mediaType === "image") return "🖼️ Imagem";
    if (message.mediaType === "video") return "🎬 Vídeo";
    if (message.mediaType === "document" || message.mediaType === "application") return "📄 Documento";
    return "(Sem texto)";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Buscar na conversa</DialogTitle>
      <DialogContent>
        <TextField
          className={classes.searchField}
          fullWidth
          placeholder="Digite o texto para buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        {loading ? (
          <div className={classes.loadingWrapper}>
            <CircularProgress size={32} />
          </div>
        ) : debouncedQuery && messages.length === 0 ? (
          <div className={classes.emptyState}>
            <Typography variant="body2">
              Nenhuma mensagem encontrada para &quot;{debouncedQuery}&quot;
            </Typography>
          </div>
        ) : debouncedQuery && messages.length > 0 ? (
          <List className={classes.resultsList}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                className={classes.listItem}
                onClick={() => handleSelectMessage(message)}
              >
                <ListItemText
                  primary={
                    <span className={classes.messagePreview}>
                      {message.fromMe ? "Você" : message.contact?.name || "Cliente"}
                      {" · "}
                      {format(parseISO(message.createdAt), "dd/MM HH:mm")}
                    </span>
                  }
                  secondary={getMessagePreview(message)}
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <div className={classes.emptyState}>
            <Typography variant="body2">
              Digite acima para buscar mensagens nesta conversa
            </Typography>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchMessagesModal;
