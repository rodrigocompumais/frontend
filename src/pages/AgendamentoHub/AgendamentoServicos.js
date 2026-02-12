import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  IconButton,
  Grid,
} from "@material-ui/core";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useUsers from "../../hooks/useUsers";
import { i18n } from "../../translate/i18n";

const AgendamentoServicos = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState("");
  const { users, loading: usersLoading } = useUsers();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (userIdFilter) params.userId = userIdFilter;
      const { data } = await api.get("/appointment-services", { params });
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [userIdFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openModal = (item = null) => {
    setEditing(item);
    if (item) {
      setName(item.name || "");
      setDurationMinutes(item.durationMinutes != null ? String(item.durationMinutes) : "");
      setValue(item.value != null ? String(item.value) : "");
      setDescription(item.description || "");
      setUserId(item.userId != null ? String(item.userId) : "");
      setIsActive(item.isActive !== false);
      setDisplayOrder(item.displayOrder != null ? String(item.displayOrder) : "");
    } else {
      setName("");
      setDurationMinutes("");
      setValue("");
      setDescription("");
      setUserId("");
      setIsActive(true);
      setDisplayOrder("");
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    const nameTrim = name.trim();
    if (!nameTrim) {
      toast.error("Nome do serviço é obrigatório");
      return;
    }
    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration < 1) {
      toast.error("Duração deve ser um número maior que zero");
      return;
    }
    if (!userId) {
      toast.error("Profissional é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: nameTrim,
        durationMinutes: duration,
        value: value === "" ? null : parseFloat(value) || null,
        description: description.trim() || null,
        userId: parseInt(userId, 10),
        isActive,
        displayOrder: displayOrder === "" ? null : parseInt(displayOrder, 10) || null,
      };
      if (editing) {
        await api.put(`/appointment-services/${editing.id}`, payload);
        toast.success("Serviço atualizado");
      } else {
        await api.post("/appointment-services", payload);
        toast.success("Serviço criado");
      }
      closeModal();
      fetchList();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Excluir este serviço?")) return;
    try {
      await api.delete(`/appointment-services/${item.id}`);
      toast.success("Serviço excluído");
      fetchList();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ marginBottom: 16, gap: 8 }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Profissional</InputLabel>
          <Select
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            label="Profissional"
          >
            <MenuItem value="">Todos</MenuItem>
            {(users || []).map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => openModal(null)}>
          Novo serviço
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" padding={4}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Box padding={4} textAlign="center" color="text.secondary">
          <Typography>Nenhum serviço cadastrado. Clique em &quot;Novo serviço&quot; para criar.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {list.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.user?.name || "—"} · {item.durationMinutes} min
                        {item.value != null && item.value !== "" ? ` · R$ ${Number(item.value).toFixed(2)}` : ""}
                      </Typography>
                      {item.description && (
                        <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 4 }}>
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => openModal(item)} aria-label="Editar">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item)} aria-label="Excluir">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Editar serviço" : "Novo serviço"}</DialogTitle>
        <DialogContent style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Box display="flex" flexDirection="column" gap={2} paddingTop={1}>
            <TextField
              fullWidth
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Profissional</InputLabel>
              <Select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                label="Profissional"
                disabled={usersLoading}
              >
                <MenuItem value="">Selecione</MenuItem>
                {(users || []).map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Duração (minutos)"
              type="number"
              inputProps={{ min: 1 }}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Valor (R$)"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <TextField
              fullWidth
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Ordem de exibição"
              type="number"
              inputProps={{ min: 0 }}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="primary" />}
              label="Ativo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgendamentoServicos;
