import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import {
  MoreVert as MoreIcon,
  Add as AddIcon,
} from "@material-ui/icons";
import { Droppable, Draggable } from "react-beautiful-dnd";
import KanbanCard from "../KanbanCard";

const useStyles = makeStyles((theme) => ({
  column: {
    minWidth: 300,
    maxWidth: 320,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    background: theme.palette.type === "dark" 
      ? "rgba(30, 41, 59, 0.6)" 
      : "rgba(241, 245, 249, 0.8)",
    backdropFilter: "blur(10px)",
    border: `1px solid ${theme.palette.divider}`,
    overflow: "hidden",
  },
  columnHeader: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: (props) => props.headerColor || theme.palette.primary.main,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  columnTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  countChip: {
    backgroundColor: "rgba(255,255,255,0.25)",
    color: "#fff",
    fontWeight: 600,
    height: 24,
    minWidth: 24,
    "& .MuiChip-label": {
      padding: "0 8px",
    },
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  headerButton: {
    padding: 4,
    color: "rgba(255,255,255,0.8)",
    "&:hover": {
      color: "#fff",
      backgroundColor: "rgba(255,255,255,0.1)",
    },
  },
  cardsContainer: {
    flex: 1,
    padding: theme.spacing(1.5),
    overflowY: "auto",
    overflowX: "hidden",
    minHeight: 200,
    ...theme.scrollbarStylesSoft,
  },
  cardsContainerDraggingOver: {
    background: theme.palette.type === "dark"
      ? "rgba(14, 165, 233, 0.1)"
      : "rgba(14, 165, 233, 0.05)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(1),
    opacity: 0.3,
  },
  emptyText: {
    fontSize: "0.85rem",
  },
  columnFooter: {
    padding: theme.spacing(1.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    justifyContent: "center",
  },
  avgTime: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
}));

const KanbanColumn = ({
  column,
  tickets,
  index,
  onViewTicket,
  onTransfer,
  onColumnSettings,
}) => {
  const headerColor = column.color || "#6366F1";
  const classes = useStyles({ headerColor });

  return (
    <Draggable draggableId={`column-${column.id}`} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={classes.column}
          elevation={0}
        >
          {/* Header da Coluna */}
          <Box 
            className={classes.columnHeader}
            {...provided.dragHandleProps}
          >
            <Box className={classes.headerContent}>
              <Box className={classes.headerTitle}>
                <Typography className={classes.columnTitle}>
                  {column.title || column.name}
                </Typography>
                <Chip
                  label={tickets.length}
                  size="small"
                  className={classes.countChip}
                />
              </Box>
              <Box className={classes.headerActions}>
                <Tooltip title="Configurações">
                  <IconButton
                    size="small"
                    className={classes.headerButton}
                    onClick={() => onColumnSettings && onColumnSettings(column)}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Cards */}
          <Droppable droppableId={column.id.toString()} type="CARD">
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`${classes.cardsContainer} ${
                  snapshot.isDraggingOver ? classes.cardsContainerDraggingOver : ""
                }`}
              >
                {tickets.length === 0 ? (
                  <Box className={classes.emptyState}>
                    <Typography className={classes.emptyText}>
                      Nenhum ticket nesta etapa
                    </Typography>
                  </Box>
                ) : (
                  tickets.map((ticket, ticketIndex) => (
                    <Draggable
                      key={ticket.id.toString()}
                      draggableId={ticket.id.toString()}
                      index={ticketIndex}
                    >
                      {(provided, snapshot) => (
                        <KanbanCard
                          ticket={ticket}
                          onViewTicket={onViewTicket}
                          onTransfer={onTransfer}
                          isDragging={snapshot.isDragging}
                          provided={provided}
                        />
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </Paper>
      )}
    </Draggable>
  );
};

export default KanbanColumn;

