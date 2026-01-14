import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@material-ui/core";
import { Search, Send } from "@material-ui/icons";
import api from "../../services/api";
import useQuickMessages from "../../hooks/useQuickMessages";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minWidth: 500,
    maxHeight: 500,
    overflow: "auto",
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  messageItem: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  messageText: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
}));

const QuickMessageModal = ({ open, onClose, onSendMessage }) => {
  const classes = useStyles();
  const { list } = useQuickMessages();
  const [loading, setLoading] = useState(false);
  const [quickMessages, setQuickMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      fetchQuickMessages();
      setSearchTerm("");
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMessages(quickMessages);
    } else {
      const filtered = quickMessages.filter(
        (msg) =>
          msg.shortcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [searchTerm, quickMessages]);

  const fetchQuickMessages = async () => {
    setLoading(true);
    try {
      const data = await list();
      setQuickMessages(data.quickMessages || []);
      setFilteredMessages(data.quickMessages || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = (message) => {
    if (onSendMessage) {
      onSendMessage(message.message);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{i18n.t("quickActions.quickMessages")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
          className={classes.searchField}
          placeholder={i18n.t("quickMessages.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
            <CircularProgress />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center" }}>
            {i18n.t("quickActions.noQuickMessages")}
          </div>
        ) : (
          <List>
            {filteredMessages.map((msg) => (
              <ListItem
                key={msg.id}
                className={classes.messageItem}
                onClick={() => handleSelectMessage(msg)}
              >
                <ListItemText
                  primary={msg.shortcode}
                  secondary={
                    <span className={classes.messageText}>
                      {msg.message?.substring(0, 100)}
                      {msg.message?.length > 100 ? "..." : ""}
                    </span>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleSelectMessage(msg)}
                    size="small"
                  >
                    <Send />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{i18n.t("quickActions.close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickMessageModal;
