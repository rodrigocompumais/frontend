import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Box,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import ContactModal from "../ContactModal";

const filter = createFilterOptions({ trim: true });

const MesaOcuparModal = ({ open, onClose, mesa, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [createTicket, setCreateTicket] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newContactInitial, setNewContactInitial] = useState({});

  useEffect(() => {
    if (!open) {
      setSelectedContact(null);
      setSearchParam("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || searchParam.length < 2) {
      setContacts([]);
      return;
    }
    setLoadingContacts(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/contacts", {
          params: { searchParam },
        });
        setContacts(data.contacts || []);
      } catch (err) {
        toastError(err);
        setContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchParam, open]);

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue && params.inputValue.trim() && searchParam.length >= 2) {
      filtered.push({
        name: params.inputValue.trim(),
        number: "",
        isNew: true,
      });
    }
    return filtered;
  };

  const handleSelectOption = (_, val) => {
    if (!val) {
      setSelectedContact(null);
      return;
    }
    if (val.isNew) {
      setNewContactInitial({ name: val.name });
      setContactModalOpen(true);
    } else {
      setSelectedContact(val);
    }
  };

  const handleContactCreated = (contact) => {
    setSelectedContact(contact);
    setContactModalOpen(false);
    setNewContactInitial({});
  };

  const handleOpenNewContact = () => {
    setNewContactInitial({});
    setContactModalOpen(true);
  };

  const handleOcupar = async () => {
    if (!selectedContact || !mesa) return;
    setLoading(true);
    try {
      let ticketId = null;
      if (createTicket) {
        const { data: ticket } = await api.post("/tickets", {
          contactId: selectedContact.id,
          status: "open",
        });
        ticketId = ticket?.id;
      }
      await api.put(`/mesas/${mesa.id}/ocupar`, {
        contactId: selectedContact.id,
        ticketId,
      });
      toast.success("Mesa ocupada com sucesso");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContactModal
        open={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setNewContactInitial({});
        }}
        onSave={handleContactCreated}
        initialValues={newContactInitial}
      />
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Ocupar mesa {mesa?.number || mesa?.name}</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={contacts}
            getOptionLabel={(opt) => {
              if (opt.isNew) return `Criar contato: ${opt.name}`;
              return opt.name ? `${opt.name} (${opt.number})` : opt.number || "";
            }}
            value={selectedContact}
            onChange={handleSelectOption}
            onInputChange={(_, val) => setSearchParam(val)}
            loading={loadingContacts}
            filterOptions={createAddContactOption}
            renderOption={(opt) =>
              opt.isNew ? (
                <Typography component="span" color="primary">
                  + Criar contato: {opt.name}
                </Typography>
              ) : (
                <Typography component="span">
                  {opt.name ? `${opt.name} (${opt.number})` : opt.number}
                </Typography>
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar ou criar contato"
                variant="outlined"
                margin="dense"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingContacts ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Box mt={1} mb={1}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenNewContact}
            >
              Novo contato
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            Ao ocupar, um ticket será criado para o contato para facilitar o atendimento.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOcupar}
            disabled={!selectedContact || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Ocupar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MesaOcuparModal;
