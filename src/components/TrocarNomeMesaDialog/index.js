import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { getOcupanteNome } from "../../helpers/mesaSearch";

const TrocarNomeMesaDialog = ({ open, onClose, mesa, onSuccess }) => {
  const [nome, setNome] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && mesa) {
      setNome(getOcupanteNome(mesa) || mesa?.contact?.name || "");
    }
  }, [open, mesa]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSave = async () => {
    const trimmed = String(nome || "").trim();
    if (!trimmed) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    if (!mesa?.id) return;

    setSubmitting(true);
    try {
      const { data } = await api.put(`/mesas/${mesa.id}/contato-nome`, {
        contactName: trimmed,
      });
      toast.success("Nome do cliente atualizado.");
      onSuccess?.(data);
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Trocar nome do cliente</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          variant="outlined"
          margin="dense"
          disabled={submitting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={submitting}>
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={submitting}>
          {submitting ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrocarNomeMesaDialog;
