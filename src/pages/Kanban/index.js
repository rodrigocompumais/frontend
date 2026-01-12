import React, { useState, useEffect, useContext, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Assessment as MetricsIcon,
  Person as PersonIcon,
  Queue as QueueIcon,
} from "@material-ui/icons";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import { i18n } from "../../translate/i18n";
import KanbanColumn from "../../components/KanbanColumn";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxHeight: "calc(100vh - 64px)",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.fancyBackground,
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      height: "auto",
      maxHeight: "none",
      minHeight: "calc(100vh - 64px)",
      padding: theme.spacing(1),
    },
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  title: {
    fontWeight: 700,
    fontSize: "1.5rem",
    color: theme.palette.text.primary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  searchField: {
    minWidth: 250,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: theme.palette.background.paper,
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "100%",
      width: "100%",
    },
  },
  filterSelect: {
    minWidth: 150,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: theme.palette.background.paper,
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "auto",
      flex: 1,
    },
  },
  metricsBar: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  metricItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  metricValue: {
    fontWeight: 700,
    fontSize: "1.25rem",
    color: theme.palette.primary.main,
  },
  metricLabel: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
  boardContainer: {
    flex: 1,
    display: "flex",
    gap: theme.spacing(2),
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: theme.spacing(2),
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("sm")]: {
      minHeight: 0,
      maxHeight: "calc(100vh - 300px)",
    },
  },
  columnWrapper: {
    display: "flex",
    gap: theme.spacing(2),
    height: "100%",
    minHeight: 0,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: theme.palette.text.secondary,
  },
  refreshButton: {
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
  },
  filterChip: {
    borderRadius: 8,
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [columns, setColumns] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [filterQueue, setFilterQueue] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [queues, setQueues] = useState([]);
  const [users, setUsers] = useState([]);

  const { profile } = user;
  const userQueueIds = user.queues?.map((queue) => queue.UserQueue?.queueId) || [];

  // Fetch tags (colunas do Kanban)
  const fetchTags = useCallback(async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
    } catch (error) {
      console.error("Erro ao carregar tags:", error);
      toastError(error);
    }
  }, []);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(userQueueIds),
          showAll: profile === "admin",
        },
      });
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
      toastError(error);
      setTickets([]);
    }
  }, [userQueueIds, profile]);

  // Fetch queues para filtro
  const fetchQueues = useCallback(async () => {
    try {
      const { data } = await api.get("/queue");
      setQueues(data);
    } catch (error) {
      console.error("Erro ao carregar filas:", error);
    }
  }, []);

  // Fetch users para filtro
  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTags(), fetchQueues(), fetchUsers()]);
      await fetchTickets();
      setLoading(false);
    };
    loadData();
  }, []);

  // Organizar colunas com tickets
  useEffect(() => {
    const filteredTickets = tickets.filter((ticket) => {
      // Filtro de busca
      if (searchParam) {
        const search = searchParam.toLowerCase();
        const matchName = ticket.contact?.name?.toLowerCase().includes(search);
        const matchNumber = ticket.contact?.number?.includes(search);
        const matchMessage = ticket.lastMessage?.toLowerCase().includes(search);
        if (!matchName && !matchNumber && !matchMessage) return false;
      }
      // Filtro de fila
      if (filterQueue && ticket.queueId !== parseInt(filterQueue)) return false;
      // Filtro de usuário
      if (filterUser && ticket.userId !== parseInt(filterUser)) return false;
      return true;
    });

    // Coluna "Em aberto" - tickets sem tags
    const openTickets = filteredTickets.filter(
      (ticket) => !ticket.tags || ticket.tags.length === 0
    );

    const newColumns = [
      {
        id: "lane0",
        name: i18n.t("kanban.open"),
        title: i18n.t("kanban.open"),
        color: "#6366F1",
        tickets: openTickets,
      },
      ...tags.map((tag) => {
        const tagTickets = filteredTickets.filter((ticket) => {
          const ticketTagIds = ticket.tags?.map((t) => t.id) || [];
          return ticketTagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          name: tag.name,
          title: tag.name,
          color: tag.color || "#6B7280",
          tickets: tagTickets,
        };
      }),
    ];

    setColumns(newColumns);
  }, [tags, tickets, searchParam, filterQueue, filterUser]);

  // WebSocket para atualizações em tempo real
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-ticket`, (data) => {
      if (data.action === "update" || data.action === "create") {
        fetchTickets();
      }
      if (data.action === "delete") {
        setTickets((prev) => prev.filter((t) => t.id !== data.ticketId));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager, fetchTickets]);

  // Handler para drag and drop
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Se não tem destino ou é o mesmo lugar, ignora
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const ticketId = parseInt(draggableId);
    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;

    try {
      // Se moveu para "Em aberto", remove a tag
      if (destColumnId === "lane0") {
        // Remove tag do ticket
        const ticket = tickets.find((t) => t.id === ticketId);
        if (ticket?.tags?.length > 0) {
          await api.delete(`/ticket-tags/${ticketId}`);
          toast.success(i18n.t("kanban.toasts.removed"));
        }
      } else {
        // Adiciona/atualiza tag do ticket
        await api.delete(`/ticket-tags/${ticketId}`);
        await api.put(`/ticket-tags/${ticketId}/${destColumnId}`);
        toast.success(i18n.t("kanban.toasts.added"));
      }

      // Atualiza tickets
      fetchTickets();
    } catch (error) {
      console.error("Erro ao mover ticket:", error);
      toastError(error);
    }
  };

  // Navegar para ticket
  const handleViewTicket = (uuid) => {
    history.push(`/tickets/${uuid}`);
  };

  // Transferir ticket
  const handleTransfer = (ticket) => {
    // TODO: Abrir modal de transferência
    console.log("Transferir ticket:", ticket);
  };

  // Refresh
  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchTags(), fetchTickets()]).then(() => {
      setLoading(false);
      toast.success("Kanban atualizado!");
    });
  };

  // Métricas
  const totalTickets = tickets.length;
  const ticketsWithUser = tickets.filter((t) => t.userId).length;
  const ticketsWithoutUser = tickets.filter((t) => !t.userId).length;

  if (loading) {
    return (
      <Box className={classes.root}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.headerTop}>
          <Typography className={classes.title}>
            <MetricsIcon />
            Kanban CRM
          </Typography>
          <Box className={classes.headerActions}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Buscar..."
              value={searchParam}
              onChange={(e) => setSearchParam(e.target.value)}
              className={classes.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl variant="outlined" size="small" className={classes.filterSelect}>
              <Select
                value={filterQueue}
                onChange={(e) => setFilterQueue(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Todas as filas</MenuItem>
                {queues.map((queue) => (
                  <MenuItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" className={classes.filterSelect}>
              <Select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">Todos os atendentes</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Atualizar">
              <IconButton
                onClick={handleRefresh}
                className={classes.refreshButton}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Metrics Bar */}
        <Paper className={classes.metricsBar} elevation={0}>
          <Box className={classes.metricItem}>
            <Box>
              <Typography className={classes.metricValue}>{totalTickets}</Typography>
              <Typography className={classes.metricLabel}>Total</Typography>
            </Box>
          </Box>
          <Box className={classes.metricItem}>
            <Box>
              <Typography className={classes.metricValue} style={{ color: "#22C55E" }}>
                {ticketsWithUser}
              </Typography>
              <Typography className={classes.metricLabel}>Em atendimento</Typography>
            </Box>
          </Box>
          <Box className={classes.metricItem}>
            <Box>
              <Typography className={classes.metricValue} style={{ color: "#F59E0B" }}>
                {ticketsWithoutUser}
              </Typography>
              <Typography className={classes.metricLabel}>Aguardando</Typography>
            </Box>
          </Box>
          {columns.map((col) => (
            <Chip
              key={col.id}
              label={`${col.name}: ${col.tickets?.length || 0}`}
              size="small"
              className={classes.filterChip}
              style={{
                backgroundColor: col.color,
                color: "#fff",
              }}
            />
          ))}
        </Paper>
      </Box>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={classes.boardContainer}
            >
              <Box className={classes.columnWrapper}>
                {columns.map((column, index) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tickets={column.tickets || []}
                    index={index}
                    onViewTicket={handleViewTicket}
                    onTransfer={handleTransfer}
                  />
                ))}
              </Box>
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default Kanban;
