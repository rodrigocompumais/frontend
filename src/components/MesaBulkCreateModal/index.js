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

const defaultPrefixForType = (tipo) => (tipo === "comanda" ? "Comanda" : "Mesa");

const MesaBulkCreateModal = ({ open, onClose, onSuccess, initialType = "mesa" }) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("mesa");
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState("Mesa");
  const [suffix, setSuffix] = useState("");
  const [startFrom, setStartFrom] = useState(1);
  const [formId, setFormId] = useState("");
  const [forms, setForms] = useState([]);

  useEffect(() => {
    if (!open) return;
    const tipo = initialType === "comanda" ? "comanda" : "mesa";
    setType(tipo);
    setPrefix(defaultPrefixForType(tipo));
    setCount(10);
    setSuffix("");
    setStartFrom(1);
    setFormId("");
  }, [open, initialType]);

  useEffect(() => {
    if (open) {
      api.get("/forms?formType=cardapio").then(({ data }) => {
        setForms(data.forms || []);
      }).catch(() => setForms([]));
    }
  }, [open]);

  const handleTypeChange = (newType) => {
    const tipo = newType === "comanda" ? "comanda" : "mesa";
    setType(tipo);
    const expected = defaultPrefixForType(tipo);
    const other = defaultPrefixForType(tipo === "comanda" ? "mesa" : "comanda");
    if (!prefix || prefix === other) {
      setPrefix(expected);
    }
  };

  const handleSubmit = async () => {
    if (count < 1 || count > 50) {
      toast.error("Quantidade deve ser entre 1 e 50");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/mesas/bulk", {
        count,
        type,
        prefix: prefix || defaultPrefixForType(type),
        suffix: suffix || "",
        startFrom: startFrom || 1,
        formId: formId ? parseInt(formId, 10) : null,
      });
      const created = Array.isArray(data) ? data.length : count;
      const label = type === "comanda" ? "comandas" : "mesas";
      toast.success(`${created} ${label} criadas com sucesso`);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = type === "comanda" ? "comandas" : "mesas";
  const examplePrefix = prefix || defaultPrefixForType(type);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Criar várias {typeLabel}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            label="Tipo"
          >
            <MenuItem value="mesa">Mesa</MenuItem>
            <MenuItem value="comanda">Comanda</MenuItem>
          </Select>
        </FormControl>
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
          placeholder={defaultPrefixForType(type)}
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
            Associar todas as {typeLabel} a um cardápio para gerar links de pedido
          </Typography>
        </FormControl>
        <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 8 }}>
          Exemplo: {examplePrefix} {startFrom}, {examplePrefix} {startFrom + 1}, ... {examplePrefix}{" "}
          {startFrom + count - 1}
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
