import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
} from "@material-ui/core";
import { Check as CheckIcon, Cancel as CancelIcon, Done as DoneIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useUsers from "../../hooks/useUsers";
import { i18n } from "../../translate/i18n";

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const formatTime = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};
const statusLabel = (s) => {
  const map = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado", completed: "Concluído" };
  return map[s] || s;
};

const AgendamentoAgenda = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d.toISOString().slice(0, 10);
  });
  const [assignedUserId, setAssignedUserId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const { users } = useUsers();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { dateFrom, dateTo };
      if (assignedUserId) params.assignedUserId = assignedUserId;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/appointments", { params });
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, assignedUserId, statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success("Status atualizado");
      fetchList();
    } catch (err) {
      toastError(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 16, marginBottom: 16 }}>
        <TextField
          type="date"
          label="De"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{ minWidth: 140 }}
        />
        <TextField
          type="date"
          label="Até"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{ minWidth: 140 }}
        />
        <FormControl style={{ minWidth: 180 }}>
          <InputLabel>Profissional</InputLabel>
          <Select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} label="Profissional">
            <MenuItem value="">Todos</MenuItem>
            {(users || []).map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="confirmed">Confirmado</MenuItem>
            <MenuItem value="cancelled">Cancelado</MenuItem>
            <MenuItem value="completed">Concluído</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" padding={4}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Box padding={4} textAlign="center" color="text.secondary">
          <Typography>Nenhum agendamento no período.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell>Profissional</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.startTime)}</TableCell>
                  <TableCell>{formatTime(row.startTime)} – {formatTime(row.endTime)}</TableCell>
                  <TableCell>{row.responderName || row.contact?.name || "—"}</TableCell>
                  <TableCell>{row.appointmentService?.name || "—"}</TableCell>
                  <TableCell>{row.assignedUser?.name || "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={statusLabel(row.status)} color={row.status === "confirmed" ? "primary" : row.status === "completed" ? "default" : "secondary"} />
                  </TableCell>
                  <TableCell align="right">
                    {row.status === "pending" && (
                      <>
                        <IconButton size="small" title="Confirmar" onClick={() => updateStatus(row.id, "confirmed")} disabled={updatingId === row.id}>
                          <CheckIcon />
                        </IconButton>
                        <IconButton size="small" title="Cancelar" onClick={() => updateStatus(row.id, "cancelled")} disabled={updatingId === row.id}>
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                    {(row.status === "pending" || row.status === "confirmed") && (
                      <IconButton size="small" title="Concluir" onClick={() => updateStatus(row.id, "completed")} disabled={updatingId === row.id}>
                        <DoneIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AgendamentoAgenda;
