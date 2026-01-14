import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minWidth: 400,
  },
}));

const TaskModal = ({ open, onClose, contact, ticket }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    category: "",
    assignedToId: null,
  });

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: "",
        category: "",
        assignedToId: null,
      });
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
    } catch (err) {
      toastError(err);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target ? event.target.value : event;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("O título da tarefa é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      await api.post("/tasks", {
        ...formData,
        contactId: contact?.id,
        ticketId: ticket?.id,
        companyId: parseInt(companyId),
      });
      toast.success("Tarefa criada com sucesso!");
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{i18n.t("quickActions.createTask")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
          label={i18n.t("quickActions.taskTitle")}
          value={formData.title}
          onChange={handleChange("title")}
          fullWidth
          required
          disabled={loading}
        />
        <TextField
          label={i18n.t("quickActions.taskDescription")}
          value={formData.description}
          onChange={handleChange("description")}
          fullWidth
          multiline
          rows={3}
          disabled={loading}
        />
        <TextField
          select
          label={i18n.t("quickActions.taskStatus")}
          value={formData.status}
          onChange={handleChange("status")}
          fullWidth
          disabled={loading}
        >
          <MenuItem value="pending">Pendente</MenuItem>
          <MenuItem value="in_progress">Em Progresso</MenuItem>
          <MenuItem value="completed">Concluída</MenuItem>
          <MenuItem value="cancelled">Cancelada</MenuItem>
        </TextField>
        <TextField
          select
          label={i18n.t("quickActions.taskPriority")}
          value={formData.priority}
          onChange={handleChange("priority")}
          fullWidth
          disabled={loading}
        >
          <MenuItem value="low">Baixa</MenuItem>
          <MenuItem value="medium">Média</MenuItem>
          <MenuItem value="high">Alta</MenuItem>
          <MenuItem value="urgent">Urgente</MenuItem>
        </TextField>
        <TextField
          label={i18n.t("quickActions.taskDueDate")}
          type="datetime-local"
          value={formData.dueDate}
          onChange={handleChange("dueDate")}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          disabled={loading}
        />
        <TextField
          label={i18n.t("quickActions.taskCategory")}
          value={formData.category}
          onChange={handleChange("category")}
          fullWidth
          disabled={loading}
        />
        <Autocomplete
          options={users}
          getOptionLabel={(option) => option.name || ""}
          value={users.find((u) => u.id === formData.assignedToId) || null}
          onChange={(event, newValue) => {
            setFormData((prev) => ({
              ...prev,
              assignedToId: newValue ? newValue.id : null,
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={i18n.t("quickActions.assignTo")}
              disabled={loading}
            />
          )}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {i18n.t("quickActions.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : i18n.t("quickActions.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;
