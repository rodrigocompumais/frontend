import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Checkbox,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Flag as FlagIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from "@material-ui/icons";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

const priorityColors = {
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#F97316",
  urgent: "#EF4444",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const statusColors = {
  pending: "#64748B",
  in_progress: "#3B82F6",
  completed: "#22C55E",
  cancelled: "#EF4444",
};

const statusLabels = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(1.5),
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    position: "relative",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
      borderColor: theme.palette.primary.main,
    },
  },
  cardCompleted: {
    opacity: 0.7,
    "& $title": {
      textDecoration: "line-through",
      color: theme.palette.text.secondary,
    },
  },
  cardContent: {
    padding: theme.spacing(2),
    "&:last-child": {
      paddingBottom: theme.spacing(2),
    },
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  checkbox: {
    padding: 0,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: theme.palette.text.primary,
    wordBreak: "break-word",
  },
  description: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1.5),
  },
  metaInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    flexWrap: "wrap",
  },
  chip: {
    height: 24,
    fontSize: "0.7rem",
    fontWeight: 500,
  },
  priorityChip: {
    backgroundColor: (props) => props.priorityColor,
    color: "#fff",
  },
  statusChip: {
    backgroundColor: (props) => props.statusColor,
    color: "#fff",
  },
  categoryChip: {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.text.secondary,
  },
  dueDate: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  dueDateOverdue: {
    color: "#EF4444",
    fontWeight: 600,
  },
  dueDateToday: {
    color: "#F59E0B",
    fontWeight: 600,
  },
  dueDateTomorrow: {
    color: "#3B82F6",
  },
  assignedTo: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  avatar: {
    width: 20,
    height: 20,
    fontSize: "0.65rem",
    backgroundColor: theme.palette.primary.main,
  },
  moreButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    opacity: 0,
    transition: "opacity 0.2s ease",
    "$card:hover &": {
      opacity: 1,
    },
  },
  priorityIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: "12px 0 0 12px",
    backgroundColor: (props) => props.priorityColor,
  },
}));

const TaskCard = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onClick,
}) => {
  const priorityColor = priorityColors[task.priority] || priorityColors.medium;
  const statusColor = statusColors[task.status] || statusColors.pending;
  const classes = useStyles({ priorityColor, statusColor });
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleComplete = (event) => {
    event.stopPropagation();
    if (onToggleComplete) {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      onToggleComplete(task.id, newStatus);
    }
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit(task);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) onDelete(task.id);
  };

  const handleDuplicate = () => {
    handleMenuClose();
    if (onDuplicate) onDuplicate(task);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    const dueDate = new Date(date);
    
    if (isPast(dueDate) && task.status !== "completed") {
      return {
        text: `Atrasada: ${format(dueDate, "dd/MM")}`,
        className: classes.dueDateOverdue,
      };
    }
    if (isToday(dueDate)) {
      return {
        text: "Hoje",
        className: classes.dueDateToday,
      };
    }
    if (isTomorrow(dueDate)) {
      return {
        text: "Amanhã",
        className: classes.dueDateTomorrow,
      };
    }
    return {
      text: format(dueDate, "dd/MM"),
      className: classes.dueDate,
    };
  };

  const dueDateInfo = formatDueDate(task.dueDate);
  const isCompleted = task.status === "completed";

  return (
    <Card
      className={`${classes.card} ${isCompleted ? classes.cardCompleted : ""}`}
      onClick={() => onClick && onClick(task)}
    >
      <div className={classes.priorityIndicator} />
      
      <CardContent className={classes.cardContent}>
        {/* Header: Checkbox + Title */}
        <Box className={classes.header}>
          <Checkbox
            checked={isCompleted}
            onChange={handleToggleComplete}
            icon={<UncheckedIcon />}
            checkedIcon={<CheckCircleIcon style={{ color: "#22C55E" }} />}
            className={classes.checkbox}
            onClick={(e) => e.stopPropagation()}
          />
          <Box className={classes.titleContainer}>
            <Typography className={classes.title}>
              {task.title}
            </Typography>
            {task.description && (
              <Typography className={classes.description}>
                {task.description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Footer: Meta info */}
        <Box className={classes.footer}>
          <Box className={classes.metaInfo}>
            {/* Priority */}
            <Tooltip title={`Prioridade: ${priorityLabels[task.priority]}`}>
              <Chip
                icon={<FlagIcon style={{ fontSize: 14, color: "#fff" }} />}
                label={priorityLabels[task.priority]}
                size="small"
                className={`${classes.chip} ${classes.priorityChip}`}
              />
            </Tooltip>

            {/* Status */}
            {task.status !== "pending" && task.status !== "completed" && (
              <Chip
                label={statusLabels[task.status]}
                size="small"
                className={`${classes.chip} ${classes.statusChip}`}
              />
            )}

            {/* Category */}
            {task.category && (
              <Chip
                label={task.category}
                size="small"
                className={`${classes.chip} ${classes.categoryChip}`}
              />
            )}
          </Box>

          <Box className={classes.metaInfo}>
            {/* Due Date */}
            {dueDateInfo && (
              <Tooltip title={`Vencimento: ${format(new Date(task.dueDate), "dd/MM/yyyy")}`}>
                <Box className={`${classes.dueDate} ${dueDateInfo.className}`}>
                  <TimeIcon style={{ fontSize: 14 }} />
                  {dueDateInfo.text}
                </Box>
              </Tooltip>
            )}

            {/* Assigned To */}
            {task.assignedTo && (
              <Tooltip title={`Responsável: ${task.assignedTo.name}`}>
                <Box className={classes.assignedTo}>
                  <Avatar className={classes.avatar}>
                    {getInitials(task.assignedTo.name)}
                  </Avatar>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* More Actions Button */}
      <IconButton
        className={classes.moreButton}
        size="small"
        onClick={handleMenuOpen}
      >
        <MoreIcon fontSize="small" />
      </IconButton>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Editar" />
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Duplicar" />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Excluir" style={{ color: "#EF4444" }} />
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskCard;

