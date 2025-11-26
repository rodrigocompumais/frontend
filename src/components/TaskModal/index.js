import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
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
  Grid,
  IconButton,
  Typography,
  Box,
  Chip,
  Autocomplete,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Label as LabelIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import { format } from "date-fns";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

const priorityOptions = [
  { value: "low", label: "Baixa", color: "#22C55E" },
  { value: "medium", label: "Média", color: "#F59E0B" },
  { value: "high", label: "Alta", color: "#F97316" },
  { value: "urgent", label: "Urgente", color: "#EF4444" },
];

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "completed", label: "Concluída" },
  { value: "cancelled", label: "Cancelada" },
];

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  dialogContent: {
    paddingTop: theme.spacing(3),
  },
  formControl: {
    marginBottom: theme.spacing(2),
  },
  priorityChip: {
    margin: theme.spacing(0.5),
    cursor: "pointer",
    "&.selected": {
      border: `2px solid ${theme.palette.primary.main}`,
    },
  },
  priorityContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  sectionTitle: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  dateField: {
    "& input": {
      padding: "10px 14px",
    },
  },
}));

const TaskModal = ({
  open,
  onClose,
  task,
  onSave,
  contacts = [],
  users = [],
}) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    category: "",
    assignedToId: null,
    contactId: null,
    ticketId: null,
  });

  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [categories, setCategories] = useState([
    "Comercial",
    "Suporte",
    "Financeiro",
    "Marketing",
    "Desenvolvimento",
    "RH",
    "Outros",
  ]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "medium",
        dueDate: task.dueDate
          ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm")
          : "",
        category: task.category || "",
        assignedToId: task.assignedToId || null,
        contactId: task.contactId || null,
        ticketId: task.ticketId || null,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: "",
        category: "",
        assignedToId: null,
        contactId: null,
        ticketId: null,
      });
    }
  }, [task, open]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setUsersList(data.users || []);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePriorityChange = (priority) => {
    setFormData((prev) => ({
      ...prev,
      priority,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        assignedToId: formData.assignedToId || null,
        contactId: formData.contactId || null,
        ticketId: formData.ticketId || null,
      };

      if (task?.id) {
        await api.put(`/tasks/${task.id}`, dataToSend);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        await api.post("/tasks", dataToSend);
        toast.success("Tarefa criada com sucesso!");
      }

      if (onSave) onSave();
      onClose();
    } catch (err) {
      toast.error("Erro ao salvar tarefa");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!task?.id;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: { borderRadius: 16 },
      }}
    >
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6" style={{ fontWeight: 600 }}>
          {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <Grid container spacing={2}>
          {/* Título */}
          <Grid item xs={12}>
            <TextField
              label="Título"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleChange("title")}
              required
              autoFocus
            />
          </Grid>

          {/* Descrição */}
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange("description")}
            />
          </Grid>

          {/* Prioridade */}
          <Grid item xs={12}>
            <Typography className={classes.sectionTitle}>
              <FlagIcon fontSize="small" />
              Prioridade
            </Typography>
            <Box className={classes.priorityContainer}>
              {priorityOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onClick={() => handlePriorityChange(option.value)}
                  className={`${classes.priorityChip} ${
                    formData.priority === option.value ? "selected" : ""
                  }`}
                  style={{
                    backgroundColor:
                      formData.priority === option.value
                        ? option.color
                        : "transparent",
                    color:
                      formData.priority === option.value
                        ? "#fff"
                        : option.color,
                    border: `1px solid ${option.color}`,
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleChange("status")}
                label="Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Data de Vencimento */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data de Vencimento"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={formData.dueDate}
              onChange={handleChange("dueDate")}
              InputLabelProps={{ shrink: true }}
              className={classes.dateField}
            />
          </Grid>

          {/* Responsável */}
          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={formData.assignedToId || ""}
                onChange={handleChange("assignedToId")}
                label="Responsável"
              >
                <MenuItem value="">
                  <em>Nenhum</em>
                </MenuItem>
                {usersList.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Categoria */}
          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                onChange={handleChange("category")}
                label="Categoria"
              >
                <MenuItem value="">
                  <em>Nenhuma</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions style={{ padding: "16px 24px" }}>
        <Button onClick={onClose} color="default">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Salvando..." : isEditing ? "Salvar" : "Criar Tarefa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;

