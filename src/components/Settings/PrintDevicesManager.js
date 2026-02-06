import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import RefreshIcon from "@material-ui/icons/Refresh";
import DeleteIcon from "@material-ui/icons/Delete";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(3),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 500,
  },
  tokenCell: {
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontFamily: "monospace",
    fontSize: "0.8rem",
  },
}));

export default function PrintDevicesManager() {
  const classes = useStyles();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(null);
  const [form, setForm] = useState({ deviceId: "", name: "" });

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/print-devices");
      setDevices(data || []);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(i18n.t("settings.options.fields.apiCredentials.copied", { label }));
    } catch (err) {
      toast.error(i18n.t("settings.options.fields.apiCredentials.copyError"));
    }
  };

  const handleCreate = async () => {
    if (!form.deviceId?.trim()) {
      toast.error(i18n.t("settings.options.fields.printDevices.deviceIdRequired"));
      return;
    }
    setSaving(true);
    try {
      await api.post("/print-devices", {
        deviceId: form.deviceId.trim(),
        name: form.name?.trim() || form.deviceId.trim(),
      });
      toast.success(i18n.t("settings.options.fields.printDevices.created"));
      setModalOpen(false);
      setForm({ deviceId: "", name: "" });
      fetchDevices();
    } catch (err) {
      toastError(err);
    }
    setSaving(false);
  };

  const handleRegenerateToken = async (id) => {
    setRegenerating(id);
    try {
      const { data } = await api.post(`/print-devices/${id}/regenerate-token`);
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? { ...d, token: data.token } : d))
      );
      toast.success(i18n.t("settings.options.fields.printDevices.tokenRegenerated"));
    } catch (err) {
      toastError(err);
    }
    setRegenerating(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(i18n.t("settings.options.fields.printDevices.confirmDelete"))) {
      return;
    }
    try {
      await api.delete(`/print-devices/${id}`);
      toast.success(i18n.t("settings.options.fields.printDevices.deleted"));
      fetchDevices();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Box className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h6">
          {i18n.t("settings.options.fields.printDevices.title")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          {i18n.t("settings.options.fields.printDevices.add")}
        </Button>
      </div>
      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
        {i18n.t("settings.options.fields.printDevices.helper")}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress size={32} />
        </Box>
      ) : devices.length === 0 ? (
        <Typography color="textSecondary">
          {i18n.t("settings.options.fields.printDevices.empty")}
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{i18n.t("settings.options.fields.printDevices.name")}</TableCell>
                <TableCell>{i18n.t("settings.options.fields.printDevices.deviceId")}</TableCell>
                <TableCell>{i18n.t("settings.options.fields.printDevices.token")}</TableCell>
                <TableCell align="right">{i18n.t("settings.options.fields.printDevices.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.name || device.deviceId}</TableCell>
                  <TableCell>{device.deviceId}</TableCell>
                  <TableCell className={classes.tokenCell} title={device.token}>
                    {device.token ? `${device.token.substring(0, 16)}...` : "-"}
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(device.token, "Token")}
                      title={i18n.t("settings.options.fields.apiCredentials.copy")}
                    >
                      <FileCopyIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleRegenerateToken(device.id)}
                      disabled={regenerating === device.id}
                      title={i18n.t("settings.options.fields.printDevices.regenerateToken")}
                    >
                      {regenerating === device.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <RefreshIcon fontSize="small" />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(device.id)}
                      title={i18n.t("settings.options.fields.printDevices.delete")}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{i18n.t("settings.options.fields.printDevices.addTitle")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={i18n.t("settings.options.fields.printDevices.deviceId")}
            value={form.deviceId}
            onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
            placeholder="ex: cozinha-01"
            variant="outlined"
            margin="normal"
          />
          <TextField
            fullWidth
            label={i18n.t("settings.options.fields.printDevices.name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={i18n.t("settings.options.fields.printDevices.namePlaceholder")}
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>
            {i18n.t("settings.options.fields.printDevices.cancel")}
          </Button>
          <Button onClick={handleCreate} color="primary" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : i18n.t("settings.options.fields.printDevices.create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
