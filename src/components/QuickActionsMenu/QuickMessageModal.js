import React, { useState, useEffect, useContext } from "react";
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
  Tabs,
  Tab,
  Box,
} from "@material-ui/core";
import { Search, Send, Add } from "@material-ui/icons";
import api from "../../services/api";
import useQuickMessages from "../../hooks/useQuickMessages";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

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
  const { list, save } = useQuickMessages();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [quickMessages, setQuickMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [newMessage, setNewMessage] = useState({
    shortcode: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchQuickMessages();
      setSearchTerm("");
      setTabValue(0);
      setNewMessage({ shortcode: "", message: "" });
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

  const handleCreateMessage = async () => {
    if (!newMessage.shortcode.trim() || !newMessage.message.trim()) {
      toast.error("Preencha o atalho e a mensagem");
      return;
    }

    setSaving(true);
    try {
      const companyId = localStorage.getItem("companyId");
      await save({
        shortcode: newMessage.shortcode.trim(),
        message: newMessage.message.trim(),
        companyId: parseInt(companyId),
        userId: user?.id,
      });
      toast.success("Resposta rápida criada com sucesso!");
      setNewMessage({ shortcode: "", message: "" });
      setTabValue(0);
      await fetchQuickMessages();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setNewMessage({ shortcode: "", message: "" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{i18n.t("quickActions.quickMessages")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="quick message tabs">
          <Tab label={i18n.t("quickActions.select")} />
          <Tab label={i18n.t("quickActions.create")} />
        </Tabs>
        
        {tabValue === 0 ? (
          <>
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
              <Box style={{ padding: 20, textAlign: "center" }}>
                <p>{i18n.t("quickActions.noQuickMessages")}</p>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => {
                    setTabValue(1);
                  }}
                  style={{ marginTop: 10 }}
                >
                  {i18n.t("quickActions.createNew")}
                </Button>
              </Box>
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
          </>
        ) : (
          <Box style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16 }}>
            <TextField
              label={i18n.t("quickMessages.dialog.shortcode")}
              value={newMessage.shortcode}
              onChange={(e) => setNewMessage({ ...newMessage, shortcode: e.target.value })}
              fullWidth
              required
              disabled={saving}
              helperText={i18n.t("quickActions.shortcodeHelper")}
            />
            <TextField
              label={i18n.t("quickMessages.dialog.message")}
              value={newMessage.message}
              onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
              fullWidth
              multiline
              rows={4}
              required
              disabled={saving}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateMessage}
              disabled={saving || !newMessage.shortcode.trim() || !newMessage.message.trim()}
              startIcon={saving ? <CircularProgress size={16} /> : <Add />}
            >
              {saving ? i18n.t("quickActions.saving") : i18n.t("quickActions.create")}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {i18n.t("quickActions.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickMessageModal;
