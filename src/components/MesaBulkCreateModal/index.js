import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const MesaBulkCreateModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState("Mesa");
  const [suffix, setSuffix] = useState("");
  const [startFrom, setStartFrom] = useState(1);
  const [formId, setFormId] = useState("");
  const [forms, setForms] = useState([]);

  useEffect(() => {
    if (open) {
      api.get("/forms?formType=cardapio").then(({ data }) => {
        setForms(data.forms || []);
      }).catch(() => setForms([]));
    }
  }, [open]);

  const handleSubmit = async () => {
    if (count < 1 || count > 50) {
      toast.error("Quantidade deve ser entre 1 e 50");
      return;
    }
    setLoading(true);
    try {
      await api.post("/mesas/bulk", {
        count,
        prefix: prefix || "Mesa",
        suffix: suffix || "",
        startFrom: startFrom || 1,
        formId: formId ? parseInt(formId, 10) : null,
      });
      toast.success(`${count} mesas criadas com sucesso`);
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
      <DialogTitle>Criar várias mesas</DialogTitle>
      <DialogContent>
        <TextField
          label="Quantidade"
          type="number"
          value={count}
          onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
          inputProps={{ min: 1, max: 50 }}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Prefixo"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Ex: Mesa"
          fullWidth
          margin="dense"
        />
        <TextField
          label="Sufixo"
          value={suffix}
          onChange={(e) => setSuffix(e.target.value)}
          placeholder="Ex: (opcional)"
          fullWidth
          margin="dense"
        />
        <TextField
          label="Começar do número"
          type="number"
          value={startFrom}
          onChange={(e) => setStartFrom(Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1 }}
          fullWidth
          margin="dense"
        />
        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel>Formulário (cardápio)</InputLabel>
          <Select
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
            label="Formulário (cardápio)"
          >
            <MenuItem value="">Nenhum</MenuItem>
            {forms.map((f) => (
              <MenuItem key={f.id} value={String(f.id)}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="textSecondary" style={{ marginTop: 4, display: "block" }}>
            Associar todas as mesas a um cardápio para gerar links de pedido
          </Typography>
        </FormControl>
        <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 8 }}>
          Exemplo: Mesa 1, Mesa 2, ... Mesa {count}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MesaBulkCreateModal;
