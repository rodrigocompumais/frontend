import React, { useState, useEffect, useContext, useCallback } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Fab,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  ViewColumn as ViewKanbanIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  PlayArrow as InProgressIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import TaskCard from "../../components/TaskCard";
import TaskModal from "../../components/TaskModal";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    minHeight: "100vh",
    background: theme.palette.type === "dark" 
      ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
      : "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  title: {
    fontWeight: 700,
    fontSize: "1.8rem",
    color: theme.palette.text.primary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  statsContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    flexWrap: "wrap",
  },
  statCard: {
    padding: theme.spacing(2),
    borderRadius: 12,
    minWidth: 140,
    textAlign: "center",
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
    },
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 700,
  },
  statLabel: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  filtersContainer: {
    padding: theme.spacing(2),
    borderRadius: 12,
    marginBottom: theme.spacing(3),
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
  filterRow: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchField: {
    minWidth: 250,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  filterSelect: {
    minWidth: 150,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  viewToggle: {
    marginLeft: "auto",
    display: "flex",
    gap: theme.spacing(0.5),
    background: theme.palette.action.hover,
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    padding: theme.spacing(1),
    borderRadius: 6,
    "&.active": {
      background: theme.palette.background.paper,
      boxShadow: theme.shadows[2],
    },
  },
  tasksContainer: {
    minHeight: 400,
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  kanbanContainer: {
    display: "flex",
    gap: theme.spacing(2),
    overflowX: "auto",
    paddingBottom: theme.spacing(2),
  },
  kanbanColumn: {
    minWidth: 300,
    maxWidth: 300,
    background: theme.palette.background.default,
    borderRadius: 12,
    padding: theme.spacing(2),
  },
  kanbanColumnHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  kanbanColumnTitle: {
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  kanbanColumnCount: {
    background: theme.palette.action.hover,
    borderRadius: 12,
    padding: "2px 8px",
    fontSize: "0.8rem",
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  tabIndicator: {
    height: 3,
    borderRadius: 3,
  },
}));

const statusConfig = {
  pending: { label: "Pendentes", icon: PendingIcon, color: "#64748B" },
  in_progress: { label: "Em Andamento", icon: InProgressIcon, color: "#3B82F6" },
  completed: { label: "Concluídas", icon: CheckIcon, color: "#22C55E" },
  cancelled: { label: "Canceladas", icon: CancelIcon, color: "#EF4444" },
};

const ToDoList = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" ou "kanban"
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        searchParam,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        showAll: showAllTasks,
      };

      const { data } = await api.get("/tasks", { params });
      setTasks(data.tasks || []);
    } catch (err) {
      toast.error("Erro ao carregar tarefas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParam, statusFilter, priorityFilter, categoryFilter, showAllTasks]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/tasks/stats", {
        params: { showAll: showAllTasks },
      });
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  }, [showAllTasks]);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-task`, (data) => {
      if (data.action === "create" || data.action === "update") {
        fetchTasks();
        fetchStats();
      }
      if (data.action === "delete") {
        setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
        fetchStats();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, fetchTasks, fetchStats]);

  const handleToggleComplete = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      fetchStats();
      toast.success(
        newStatus === "completed" ? "Tarefa concluída!" : "Tarefa reaberta"
      );
    } catch (err) {
      toast.error("Erro ao atualizar tarefa");
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      fetchStats();
      toast.success("Tarefa excluída com sucesso!");
    } catch (err) {
      toast.error("Erro ao excluir tarefa");
    }
  };

  const handleDuplicateTask = (task) => {
    setSelectedTask({
      ...task,
      id: undefined,
      title: `${task.title} (cópia)`,
    });
    setTaskModalOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = () => {
    fetchTasks();
    fetchStats();
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))];

  const renderTaskList = () => (
    <div className={classes.taskList}>
      {tasks.length === 0 ? (
        <Box className={classes.emptyState}>
          <AssignmentIcon style={{ fontSize: 64, opacity: 0.3 }} />
          <Typography variant="h6" style={{ marginTop: 16 }}>
            Nenhuma tarefa encontrada
          </Typography>
          <Typography variant="body2">
            Clique no botão + para criar sua primeira tarefa
          </Typography>
        </Box>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onDuplicate={handleDuplicateTask}
            onClick={handleEditTask}
          />
        ))
      )}
    </div>
  );

  const renderKanbanView = () => (
    <div className={classes.kanbanContainer}>
      {Object.entries(statusConfig).map(([status, config]) => {
        const StatusIcon = config.icon;
        const columnTasks = getTasksByStatus(status);

        return (
          <Paper key={status} className={classes.kanbanColumn}>
            <Box className={classes.kanbanColumnHeader}>
              <Typography
                className={classes.kanbanColumnTitle}
                style={{ color: config.color }}
              >
                <StatusIcon fontSize="small" />
                {config.label}
              </Typography>
              <span className={classes.kanbanColumnCount}>
                {columnTasks.length}
              </span>
            </Box>
            <div className={classes.taskList}>
              {columnTasks.length === 0 ? (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                  style={{ padding: 16 }}
                >
                  Nenhuma tarefa
                </Typography>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onDuplicate={handleDuplicateTask}
                    onClick={handleEditTask}
                  />
                ))
              )}
            </div>
          </Paper>
        );
      })}
    </div>
  );

  return (
    <div className={classes.root}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box className={classes.header}>
          <Typography className={classes.title}>
            <AssignmentIcon fontSize="large" />
            Minhas Tarefas
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box className={classes.statsContainer}>
          <Paper
            className={classes.statCard}
            style={{ borderTop: `3px solid #3B82F6` }}
          >
            <Typography
              className={classes.statValue}
              style={{ color: "#3B82F6" }}
            >
              {stats.total}
            </Typography>
            <Typography className={classes.statLabel}>Total</Typography>
          </Paper>
          <Paper
            className={classes.statCard}
            style={{ borderTop: `3px solid #64748B` }}
          >
            <Typography
              className={classes.statValue}
              style={{ color: "#64748B" }}
            >
              {stats.pending}
            </Typography>
            <Typography className={classes.statLabel}>Pendentes</Typography>
          </Paper>
          <Paper
            className={classes.statCard}
            style={{ borderTop: `3px solid #F59E0B` }}
          >
            <Typography
              className={classes.statValue}
              style={{ color: "#F59E0B" }}
            >
              {stats.inProgress}
            </Typography>
            <Typography className={classes.statLabel}>Em Andamento</Typography>
          </Paper>
          <Paper
            className={classes.statCard}
            style={{ borderTop: `3px solid #22C55E` }}
          >
            <Typography
              className={classes.statValue}
              style={{ color: "#22C55E" }}
            >
              {stats.completed}
            </Typography>
            <Typography className={classes.statLabel}>Concluídas</Typography>
          </Paper>
        </Box>

        {/* Filters */}
        <Paper className={classes.filtersContainer}>
          <Box className={classes.filterRow}>
            <TextField
              placeholder="Buscar tarefas..."
              variant="outlined"
              size="small"
              className={classes.searchField}
              value={searchParam}
              onChange={(e) => setSearchParam(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              variant="outlined"
              size="small"
              className={classes.filterSelect}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendentes</MenuItem>
                <MenuItem value="in_progress">Em Andamento</MenuItem>
                <MenuItem value="completed">Concluídas</MenuItem>
                <MenuItem value="cancelled">Canceladas</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              variant="outlined"
              size="small"
              className={classes.filterSelect}
            >
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Prioridade"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="low">Baixa</MenuItem>
                <MenuItem value="medium">Média</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="urgent">Urgente</MenuItem>
              </Select>
            </FormControl>

            {categories.length > 0 && (
              <FormControl
                variant="outlined"
                size="small"
                className={classes.filterSelect}
              >
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Categoria"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Tooltip title="Atualizar">
              <IconButton onClick={fetchTasks}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Box className={classes.viewToggle}>
              <Tooltip title="Visualização em Lista">
                <IconButton
                  size="small"
                  className={`${classes.viewButton} ${
                    viewMode === "list" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Visualização Kanban">
                <IconButton
                  size="small"
                  className={`${classes.viewButton} ${
                    viewMode === "kanban" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("kanban")}
                >
                  <ViewKanbanIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewTask}
              style={{ marginLeft: "auto", borderRadius: 8 }}
            >
              Nova Tarefa
            </Button>
          </Box>
        </Paper>

        {/* Tasks */}
        <div className={classes.tasksContainer}>
          {loading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress />
            </Box>
          ) : viewMode === "list" ? (
            renderTaskList()
          ) : (
            renderKanbanView()
          )}
        </div>
      </Container>

      {/* FAB */}
      <Fab
        color="primary"
        className={classes.fab}
        onClick={handleNewTask}
      >
        <AddIcon />
      </Fab>

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default ToDoList;
