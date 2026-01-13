import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import { useHistory } from "react-router-dom";
import moment from "moment";

import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Chip from "@material-ui/core/Chip";
import { makeStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";
import AssignmentIcon from "@material-ui/icons/Assignment";
import WarningIcon from "@material-ui/icons/Warning";
import TodayIcon from "@material-ui/icons/Today";
import { Typography, Box, Divider, useTheme } from "@material-ui/core";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  popoverPaper: {
    width: "100%",
    maxWidth: 400,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
    boxShadow: theme.shadows[8],
    [theme.breakpoints.down("sm")]: {
      maxWidth: 320,
    },
  },
  tabContainer: {
    maxHeight: 400,
    overflowY: "auto",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    ...theme.scrollbarStyles,
  },
  listItem: {
    color: theme.palette.text.primary,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.08)" 
        : "rgba(0, 0, 0, 0.04)",
      cursor: "pointer",
    },
  },
  listItemText: {
    color: theme.palette.text.primary,
  },
  taskTitle: {
    fontWeight: 500,
    marginBottom: theme.spacing(0.5),
  },
  taskMeta: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
  priorityChip: {
    height: "20px",
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  priorityHigh: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
  },
  priorityMedium: {
    backgroundColor: "#F59E0B",
    color: "#FFFFFF",
  },
  priorityLow: {
    backgroundColor: "#22C55E",
    color: "#FFFFFF",
  },
  overdueBadge: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontSize: "0.7rem",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: 600,
  },
  todayBadge: {
    backgroundColor: "#F59E0B",
    color: "#FFFFFF",
    fontSize: "0.7rem",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: 600,
  },
  emptyState: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  header: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
  },
  sectionTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
}));

const TasksNotification = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  
  const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const today = moment().startOf('day').toISOString();
      const tomorrow = moment().add(1, 'day').startOf('day').toISOString();
      
      // Buscar tarefas pendentes do usuário
      const { data } = await api.get("/tasks", {
        params: {
          status: "pending",
          showAll: false,
          limit: 50,
        },
      });

      const tasks = data.tasks || [];
      const now = moment();

      // Separar tarefas vencidas e para hoje
      const overdue = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = moment(task.dueDate);
        return dueDate.isBefore(now, 'day') && task.status === 'pending';
      });

      const today = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = moment(task.dueDate);
        return dueDate.isSame(now, 'day') && task.status === 'pending';
      });

      // Ordenar por prioridade e data
      const sortTasks = (tasksList) => {
        return tasksList.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;
          
          const dateA = a.dueDate ? moment(a.dueDate) : moment(0);
          const dateB = b.dueDate ? moment(b.dueDate) : moment(0);
          return dateA.diff(dateB);
        });
      };

      setOverdueTasks(sortTasks(overdue));
      setTodayTasks(sortTasks(today));

      // Notificar sobre novas tarefas vencidas (apenas na primeira vez ou quando houver novas)
      if (overdue.length > 0) {
        if (!lastNotificationTime) {
          // Primeira vez - notificar se houver tarefas vencidas
          toast.warning(
            `⚠️ Você tem ${overdue.length} ${overdue.length === 1 ? 'tarefa vencida' : 'tarefas vencidas'}`,
            {
              autoClose: 5000,
              onClick: () => {
                setIsOpen(true);
                history.push("/todolist");
              },
            }
          );
        } else {
          // Verificar se há novas tarefas vencidas desde a última verificação
          const newOverdue = overdue.filter(task => {
            const taskDate = moment(task.updatedAt || task.createdAt);
            return taskDate.isAfter(lastNotificationTime);
          });
          
          if (newOverdue.length > 0) {
            toast.warning(
              `⚠️ Você tem ${newOverdue.length} ${newOverdue.length === 1 ? 'nova tarefa vencida' : 'novas tarefas vencidas'}`,
              {
                autoClose: 5000,
                onClick: () => {
                  setIsOpen(true);
                  history.push("/todolist");
                },
              }
            );
          }
        }
      }

      // Notificar sobre tarefas para hoje (apenas na primeira vez)
      if (today.length > 0 && !lastNotificationTime) {
        toast.info(
          `📅 Você tem ${today.length} ${today.length === 1 ? 'tarefa para hoje' : 'tarefas para hoje'}`,
          {
            autoClose: 4000,
            onClick: () => {
              setIsOpen(true);
              history.push("/todolist");
            },
          }
        );
      }

      setLastNotificationTime(moment());
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      // Não mostrar erro se a API de tarefas não existir
      if (err.response?.status !== 404) {
        toastError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, lastNotificationTime, history]);

  useEffect(() => {
    if (!user?.id) return;

    // Buscar tarefas imediatamente
    fetchTasks();

    // Atualizar a cada 2 minutos
    const interval = setInterval(() => {
      fetchTasks();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [user?.id, fetchTasks]);

  const handleClick = (event) => {
    setIsOpen(!isOpen);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const handleTaskClick = (taskId) => {
    setIsOpen(false);
    history.push("/todolist");
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return classes.priorityHigh;
      case "medium":
        return classes.priorityMedium;
      case "low":
        return classes.priorityLow;
      default:
        return "";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "";
    const date = moment(dueDate);
    const now = moment();
    
    if (date.isBefore(now, 'day')) {
      const daysDiff = now.diff(date, 'days');
      return `Vencida há ${daysDiff} ${daysDiff === 1 ? 'dia' : 'dias'}`;
    } else if (date.isSame(now, 'day')) {
      return "Hoje";
    } else if (date.isSame(now.add(1, 'day'), 'day')) {
      return "Amanhã";
    } else {
      return date.format("DD/MM/YYYY");
    }
  };

  const totalTasks = overdueTasks.length + todayTasks.length;

  if (!user?.id) return null;

  return (
    <>
      <IconButton
        onClick={handleClick}
        ref={anchorEl}
        aria-label="Tarefas"
        color="inherit"
        style={{ color: "white" }}
      >
        <Badge 
          overlap="rectangular" 
          badgeContent={totalTasks} 
          color={overdueTasks.length > 0 ? "error" : "secondary"}
        >
          <AssignmentIcon />
        </Badge>
      </IconButton>
      
      <Popover
        disableScrollLock
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        classes={{ paper: classes.popoverPaper }}
        onClose={handleClickAway}
      >
        <Box className={classes.header}>
          <Typography variant="h6" style={{ fontSize: "1rem", fontWeight: 600 }}>
            📋 Tarefas Pendentes
          </Typography>
          {totalTasks === 0 && (
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
              Nenhuma tarefa pendente
            </Typography>
          )}
        </Box>

        {totalTasks > 0 && (
          <List dense className={classes.tabContainer}>
            {/* Tarefas Vencidas */}
            {overdueTasks.length > 0 && (
              <>
                <Box px={2} py={1}>
                  <Typography className={classes.sectionTitle}>
                    <WarningIcon style={{ color: "#EF4444", fontSize: 18 }} />
                    Vencidas ({overdueTasks.length})
                  </Typography>
                </Box>
                {overdueTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    className={classes.listItem}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography className={classes.taskTitle}>
                            {task.title || "Sem título"}
                          </Typography>
                          {task.priority && (
                            <Chip
                              label={getPriorityLabel(task.priority)}
                              size="small"
                              className={`${classes.priorityChip} ${getPriorityClass(task.priority)}`}
                            />
                          )}
                          <Chip
                            label="Vencida"
                            size="small"
                            className={classes.overdueBadge}
                          />
                        </Box>
                      }
                      secondary={
                        <Box className={classes.taskMeta}>
                          {task.dueDate && (
                            <span>{formatDueDate(task.dueDate)}</span>
                          )}
                          {task.category && (
                            <>
                              <span>•</span>
                              <span>{task.category}</span>
                            </>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <WarningIcon style={{ color: "#EF4444", fontSize: 20 }} />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {todayTasks.length > 0 && <Divider />}
              </>
            )}

            {/* Tarefas para Hoje */}
            {todayTasks.length > 0 && (
              <>
                <Box px={2} py={1}>
                  <Typography className={classes.sectionTitle}>
                    <TodayIcon style={{ color: "#F59E0B", fontSize: 18 }} />
                    Para Hoje ({todayTasks.length})
                  </Typography>
                </Box>
                {todayTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    className={classes.listItem}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography className={classes.taskTitle}>
                            {task.title || "Sem título"}
                          </Typography>
                          {task.priority && (
                            <Chip
                              label={getPriorityLabel(task.priority)}
                              size="small"
                              className={`${classes.priorityChip} ${getPriorityClass(task.priority)}`}
                            />
                          )}
                          <Chip
                            label="Hoje"
                            size="small"
                            className={classes.todayBadge}
                          />
                        </Box>
                      }
                      secondary={
                        <Box className={classes.taskMeta}>
                          {task.category && <span>{task.category}</span>}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <TodayIcon style={{ color: "#F59E0B", fontSize: 20 }} />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </>
            )}
          </List>
        )}

        {totalTasks > 0 && (
          <Box 
            p={2} 
            textAlign="center" 
            style={{ 
              borderTop: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
            }}
          >
            <Typography
              variant="body2"
              style={{ 
                color: "#3B82F6", 
                cursor: "pointer",
                textDecoration: "underline"
              }}
              onClick={() => {
                setIsOpen(false);
                history.push("/todolist");
              }}
            >
              Ver todas as tarefas
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default TasksNotification;
