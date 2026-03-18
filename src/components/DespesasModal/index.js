import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const formatCurrency = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
const formatDate = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "-");

const DespesasModal = ({ open, onClose, onSaved }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filtroInicial, setFiltroInicial] = useState("");
  const [filtroFinal, setFiltroFinal] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    descricao: "",
    observacoes: "",
    valor: "",
    dataVencimento: "",
  });

  const fetchList = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (filtroInicial) params.initialDate = filtroInicial;
      if (filtroFinal) params.finalDate = filtroFinal;
      const { data } = await api.get("/despesas", { params });
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [open, search, filtroInicial, filtroFinal]);

  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  useEffect(() => {
    if (!open) {
      setFormOpen(false);
      setEditingId(null);
      setForm({ descricao: "", observacoes: "", valor: "", dataVencimento: "" });
    }
  }, [open]);

  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        descricao: item.descricao || "",
        observacoes: item.observacoes || "",
        valor: String(item.valor ?? ""),
        dataVencimento: item.dataVencimento || "",
      });
    } else {
      setEditingId(null);
      setForm({ descricao: "", observacoes: "", valor: "", dataVencimento: "" });
    }
    setFormOpen(true);
  };

  const handlePickFile = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleExtractFromImage = async (file) => {
    if (!file) return;
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/despesas/extract-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const extracted = data || {};
      setEditingId(null);
      setForm({
        descricao: extracted.descricao || "",
        observacoes: extracted.observacoes || "",
        valor: extracted.valor != null ? String(extracted.valor) : "",
        dataVencimento: extracted.dataVencimento || "",
      });
      setFormOpen(true);
      toast.success("Dados extraídos. Confira e salve a despesa.");
    } catch (err) {
      toastError(err);
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm({ descricao: "", observacoes: "", valor: "", dataVencimento: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const descricao = String(form.descricao || "").trim();
    const valor = Number(form.valor);
    const dataVencimento = String(form.dataVencimento || "").trim();
    if (!descricao || !dataVencimento || (dataVencimento.length !== 10)) {
      toast.error("Preencha descrição e data de vencimento (AAAA-MM-DD).");
      return;
    }
    if (isNaN(valor) || valor < 0) {
      toast.error("Valor inválido.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/despesas/${editingId}`, {
          descricao,
          observacoes: form.observacoes ? String(form.observacoes).trim() : null,
          valor,
          dataVencimento,
        });
        toast.success("Despesa atualizada.");
      } else {
        await api.post("/despesas", {
          descricao,
          observacoes: form.observacoes ? String(form.observacoes).trim() : null,
          valor,
          dataVencimento,
        });
        toast.success("Despesa cadastrada.");
      }
      handleCloseForm();
      fetchList();
      if (typeof onSaved === "function") onSaved();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir esta despesa?")) return;
    try {
      await api.delete(`/despesas/${id}`);
      toast.success("Despesa excluída.");
      fetchList();
      if (typeof onSaved === "function") onSaved();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Despesas</DialogTitle>
      <DialogContent>
        <Box display="flex" flexWrap="wrap" alignItems="center" style={{ gap: 12 }} marginBottom={2}>
          <TextField
            size="small"
            label="Buscar (descrição ou observações)"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <TextField
            size="small"
            type="date"
            label="Início"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={filtroInicial}
            onChange={(e) => setFiltroInicial(e.target.value)}
          />
          <TextField
            size="small"
            type="date"
            label="Fim"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={filtroFinal}
            onChange={(e) => setFiltroFinal(e.target.value)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleExtractFromImage(e.target.files?.[0])}
          />
          <Button
            variant="outlined"
            color="primary"
            startIcon={extracting ? <CircularProgress size={18} /> : <CameraAltIcon />}
            onClick={handlePickFile}
            disabled={extracting}
          >
            Extrair por foto
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenForm(null)}>
            Inserir despesa
          </Button>
        </Box>

        {formOpen && (
          <Paper style={{ padding: 16, marginBottom: 16 }}>
            <Typography variant="subtitle2" gutterBottom>
              {editingId ? "Editar despesa" : "Nova despesa"}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" style={{ gap: 12 }} maxWidth={400}>
                <TextField
                  size="small"
                  label="Descrição"
                  variant="outlined"
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  required
                />
                <TextField
                  size="small"
                  label="Observações"
                  variant="outlined"
                  multiline
                  rows={2}
                  value={form.observacoes}
                  onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                />
                <TextField
                  size="small"
                  label="Valor (R$)"
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  required
                />
                <TextField
                  size="small"
                  label="Data de vencimento"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.dataVencimento}
                  onChange={(e) => setForm((f) => ({ ...f, dataVencimento: e.target.value }))}
                  required
                />
                <Box display="flex" style={{ gap: 8 }}>
                  <Button type="submit" variant="contained" color="primary" disabled={saving}>
                    {saving ? <CircularProgress size={24} /> : editingId ? "Salvar" : "Cadastrar"}
                  </Button>
                  <Button type="button" onClick={handleCloseForm} disabled={saving}>
                    Cancelar
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>
        )}

        <TableContainer component={Paper} style={{ maxHeight: 360 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
              <CircularProgress />
            </Box>
          ) : list.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography color="textSecondary">Nenhuma despesa encontrada.</Typography>
            </Box>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Observações</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.descricao || "-"}</TableCell>
                    <TableCell align="right">{formatCurrency(row.valor)}</TableCell>
                    <TableCell>{formatDate(row.dataVencimento)}</TableCell>
                    <TableCell style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.observacoes || "-"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenForm(row)} title="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row.id)} title="Excluir">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DespesasModal;
