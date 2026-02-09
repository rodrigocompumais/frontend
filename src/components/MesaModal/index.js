import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const SECTIONS = [
  { value: "", label: "Nenhuma" },
  { value: "salao", label: "Salão" },
  { value: "varanda", label: "Varanda" },
  { value: "area_externa", label: "Área externa" },
];

const MesaModal = ({ open, onClose, mesa, initialType = "mesa", onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("mesa");
  const [capacity, setCapacity] = useState("");
  const [section, setSection] = useState("");
  const [forms, setForms] = useState([]);
  const [formId, setFormId] = useState("");

  useEffect(() => {
    if (open) {
      if (mesa) {
        setNumber(mesa.number || "");
        setName(mesa.name || "");
        setType(mesa.type === "comanda" ? "comanda" : "mesa");
        setCapacity(mesa.capacity ? String(mesa.capacity) : "");
        setSection(mesa.section || "");
        setFormId(mesa.formId ? String(mesa.formId) : "");
      } else {
        setNumber("");
        setName("");
        setType(initialType === "comanda" ? "comanda" : "mesa");
        setCapacity("");
        setSection("");
        setFormId("");
      }
    }
  }, [open, mesa, initialType]);

  useEffect(() => {
    if (open) {
      api.get("/forms?formType=cardapio").then(({ data }) => {
        setForms(data.forms || []);
      }).catch(() => setForms([]));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!number.trim()) {
      toast.error("Número da mesa é obrigatório");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        number: number.trim(),
        name: name.trim() || null,
        type: type === "comanda" ? "comanda" : "mesa",
        capacity: capacity ? parseInt(capacity) : null,
        section: section || null,
        formId: formId ? parseInt(formId) : null,
      };
      if (mesa) {
        await api.put(`/mesas/${mesa.id}`, payload);
        toast.success(type === "comanda" ? "Comanda atualizada" : "Mesa atualizada");
      } else {
        await api.post("/mesas", payload);
        toast.success(type === "comanda" ? "Comanda criada" : "Mesa criada");
      }
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mesa ? (type === "comanda" ? "Editar comanda" : "Editar mesa") : (type === "comanda" ? "Nova comanda" : "Nova mesa")}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel>Tipo</InputLabel>
          <Select value={type} onChange={(e) => setType(e.target.value)} label="Tipo">
            <MenuItem value="mesa">Mesa</MenuItem>
            <MenuItem value="comanda">Comanda</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label={type === "comanda" ? "Código da comanda (ex.: para leitor)" : "Número"}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          fullWidth
          margin="dense"
          required
          placeholder={type === "comanda" ? "Ex.: 1001" : ""}
        />
        <TextField
          label="Nome (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Capacidade (pessoas)"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          inputProps={{ min: 1 }}
          fullWidth
          margin="dense"
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Seção</InputLabel>
          <Select value={section} onChange={(e) => setSection(e.target.value)}>
            {SECTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Formulário cardápio (opcional)</InputLabel>
          <Select value={formId} onChange={(e) => setFormId(e.target.value)}>
            <MenuItem value="">
              <em>Nenhum — usar cardápio padrão (QR único por mesa)</em>
            </MenuItem>
            {forms.map((f) => (
              <MenuItem key={f.id} value={String(f.id)}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || !number.trim()}
        >
          {loading ? <CircularProgress size={24} /> : mesa ? "Salvar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MesaModal;
