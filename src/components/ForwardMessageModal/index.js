import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Typography,
  InputAdornment
} from "@material-ui/core";
import { Search } from "@material-ui/icons";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import ButtonWithSpinner from "../ButtonWithSpinner";

const ForwardMessageModal = ({ modalOpen, onClose, message, currentTicketId }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);

  useEffect(() => {
    if (modalOpen) {
      fetchTickets();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (searchParam.trim() === "") {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(
        (ticket) =>
          ticket.contact?.name?.toLowerCase().includes(searchParam.toLowerCase()) ||
          ticket.contact?.number?.includes(searchParam) ||
          ticket.lastMessage?.toLowerCase().includes(searchParam.toLowerCase())
      );
      setFilteredTickets(filtered);
    }
  }, [searchParam, tickets]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tickets", {
        params: {
          pageNumber: "1",
          showAll: "true",
          status: "open"
        }
      });
      // Filtrar o ticket atual e apenas tickets abertos
      const filtered = data.tickets.filter(
        (ticket) => ticket.id !== currentTicketId && ticket.status === "open"
      );
      setTickets(filtered);
      setFilteredTickets(filtered);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    if (!selectedTicket) {
      return;
    }

    setLoading(true);
    try {
      await api.post(`/messages/${message.id}/forward`, {
        targetTicketId: selectedTicket.id
      });
      toast.success(i18n.t("forwardMessageModal.success") || "Mensagem encaminhada com sucesso!");
      onClose();
      setSelectedTicket(null);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTicket(null);
    setSearchParam("");
    onClose();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {i18n.t("forwardMessageModal.title") || "Encaminhar Mensagem"}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={i18n.t("forwardMessageModal.searchPlaceholder") || "Buscar conversa..."}
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          style={{ marginBottom: 16 }}
        />
        {loading && tickets.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
            <CircularProgress />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Typography variant="body2" color="textSecondary" align="center" style={{ padding: 20 }}>
            {i18n.t("forwardMessageModal.noConversations") || "Nenhuma conversa encontrada"}
          </Typography>
        ) : (
          <List style={{ maxHeight: 400, overflow: "auto" }}>
            {filteredTickets.map((ticket) => (
              <ListItem
                key={ticket.id}
                button
                selected={selectedTicket?.id === ticket.id}
                onClick={() => setSelectedTicket(ticket)}
              >
                <ListItemAvatar>
                  <Avatar src={ticket.contact?.profilePicUrl}>
                    {ticket.contact?.name?.charAt(0)?.toUpperCase() || "#"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={ticket.contact?.name || ticket.contact?.number}
                  secondary={
                    ticket.lastMessage
                      ? ticket.lastMessage.length > 50
                        ? `${ticket.lastMessage.substring(0, 50)}...`
                        : ticket.lastMessage
                      : ""
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading} variant="outlined">
          {i18n.t("forwardMessageModal.buttons.cancel") || "Cancelar"}
        </Button>
        <ButtonWithSpinner
          variant="contained"
          color="primary"
          onClick={handleForward}
          loading={loading}
          disabled={!selectedTicket}
        >
          {i18n.t("forwardMessageModal.buttons.forward") || "Encaminhar"}
        </ButtonWithSpinner>
      </DialogActions>
    </Dialog>
  );
};

export default ForwardMessageModal;
