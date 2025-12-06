import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import NewTicketModal from "../../components/NewTicketModal";
import {
  AddCircle,
  DevicesFold,
  MoreVert,
  Edit,
  ContentCopy,
  Delete,
  PlayArrow,
  Pause,
  AccountTree,
  ViewModule,
  ViewList,
  FilterList,
  Sort,
} from "@mui/icons-material";

import {
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Stack,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  useTheme,
} from "@mui/material";

import FlowBuilderModal from "../../components/FlowBuilderModal";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    borderRadius: 12,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    backgroundColor: theme.palette.mode === "dark" 
      ? theme.palette.background.default 
      : "#F8F9FA",
  },
  automationCard: {
    height: "100%",
    borderRadius: 16,
    border: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : "#E0E0E0"}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.palette.mode === "dark" 
      ? theme.palette.background.paper 
      : "#FFFFFF",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.palette.mode === "dark"
        ? "0 8px 24px rgba(0, 0, 0, 0.4)"
        : "0 8px 24px rgba(0, 0, 0, 0.12)",
      borderColor: theme.palette.primary.main,
    },
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1.5),
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.palette.mode === "dark"
      ? theme.palette.primary.dark
      : "#E3F2FD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.primary.main,
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: "1.1rem",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
  statusChip: {
    fontWeight: 600,
    fontSize: "0.75rem",
    height: 24,
  },
  cardActions: {
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : "#F0F0F0"}`,
    marginTop: theme.spacing(1.5),
  },
  actionButton: {
    padding: theme.spacing(0.75),
    borderRadius: 8,
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "#F5F5F5",
    },
  },
  filtersContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : "#FFFFFF",
    borderRadius: 12,
    border: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : "#E0E0E0"}`,
  },
  viewToggle: {
    border: `1px solid ${theme.palette.mode === "dark" ? theme.palette.divider : "#E0E0E0"}`,
    borderRadius: 8,
    "& .MuiToggleButton-root": {
      border: "none",
      padding: theme.spacing(0.75, 1.5),
      "&.Mui-selected": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      },
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(8),
    color: theme.palette.text.secondary,
  },
  statsBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
}));

const FlowBuilder = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [webhooks, setWebhooks] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'date', 'status'
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/flowbuilder");
          setWebhooks(data.flows);
          dispatch({ type: "LOAD_CONTACTS", payload: data.flows });
          setHasMore(data.hasMore);
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, reloadData]);

  // useEffect(() => {
  //   const companyId = user.companyId;

  //   const onContact = (data) => {
  //     if (data.action === "update" || data.action === "create") {
  //       dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
  //     }

  //     if (data.action === "delete") {
  //       dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
  //     }
  //   };

  //   socket.on(`company-${companyId}-contact`, onContact);

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = () => {
    setSelectedContactId(deletingContact.id);
    setSelectedWebhookName(deletingContact.name);
    setContactModalOpen(true);
  };

  const handleDeleteWebhook = async (webhookId) => {
    try {
      await api.delete(`/flowbuilder/${webhookId}`).then((res) => {
        setDeletingContact(null);
        setReloadData((old) => !old);
      });
      toast.success("Automação excluída com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicateFlow = async (flowId) => {
    try {
      await api
        .post(`/flowbuilder/duplicate`, { flowId: flowId })
        .then((res) => {
          setDeletingContact(null);
          setReloadData((old) => !old);
        });
      toast.success("Automação duplicada com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportLink = () => {
    history.push(`/flowbuilder/${deletingContact.id}`);
  };

  // Filtrar e ordenar automações
  const filteredAndSortedWebhooks = webhooks
    .filter((webhook) => {
      if (!searchParam) return true;
      return webhook.name?.toLowerCase().includes(searchParam);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "date":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "status":
          return (b.active ? 1 : 0) - (a.active ? 1 : 0);
        default:
          return 0;
      }
    });

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const getNodeCount = (flow) => {
    try {
      if (flow.flow && flow.flow.nodes) {
        return flow.flow.nodes.length;
      }
    } catch (e) {
      // Ignore
    }
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />

      <FlowBuilderModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        flowId={selectedContactId}
        nameWebhook={selectedWebhookName}
        onSave={() => setReloadData((old) => !old)}
      />

      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact ? handleDeleteWebhook(deletingContact.id) : () => {}
        }
      >
        {deletingContact
          ? `Tem certeza que deseja deletar esta automação? Todas as integrações relacionadas serão perdidas.`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `Deseja duplicar a automação ${deletingContact.name}?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmDuplicateOpen}
        onClose={setConfirmDuplicateOpen}
        onConfirm={(e) =>
          deletingContact ? handleDuplicateFlow(deletingContact.id) : () => {}
        }
      >
        {deletingContact
          ? `Tem certeza que deseja duplicar este fluxo?`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <MainHeader>
        <Title>Automações</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleOpenContactModal}
            color="primary"
          >
            <Stack direction={"row"} gap={1}>
              <AddCircle />
              {"Adicionar Automação"}
            </Stack>
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Stack spacing={2}>
          {/* Filtros e Controles */}
          <Box className={classes.filtersContainer}>
            <Stack direction="row" spacing={2} alignItems="center" flex={1}>
              <FilterList color="action" />
              <Typography variant="body2" color="textSecondary">
                Ordenar por:
              </Typography>
              <Button
                size="small"
                variant={sortBy === "name" ? "contained" : "outlined"}
                onClick={() => setSortBy("name")}
                startIcon={<Sort />}
              >
                Nome
              </Button>
              <Button
                size="small"
                variant={sortBy === "date" ? "contained" : "outlined"}
                onClick={() => setSortBy("date")}
                startIcon={<Sort />}
              >
                Data
              </Button>
              <Button
                size="small"
                variant={sortBy === "status" ? "contained" : "outlined"}
                onClick={() => setSortBy("status")}
                startIcon={<Sort />}
              >
                Status
              </Button>
            </Stack>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              className={classes.viewToggle}
              size="small"
            >
              <ToggleButton value="grid">
                <ViewModule fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewList fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Lista de Automações */}
          {loading ? (
            <Stack
              justifyContent="center"
              alignItems="center"
              minHeight="50vh"
            >
              <CircularProgress />
            </Stack>
          ) : filteredAndSortedWebhooks.length === 0 ? (
            <Box className={classes.emptyState}>
              <AccountTree sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {searchParam
                  ? "Nenhuma automação encontrada"
                  : "Nenhuma automação criada ainda"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {searchParam
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando sua primeira automação"}
              </Typography>
            </Box>
          ) : viewMode === "grid" ? (
            <Grid container spacing={2}>
              {filteredAndSortedWebhooks.map((automation) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={automation.id}>
                  <Card
                    className={classes.automationCard}
                    onClick={() => history.push(`/flowbuilder/${automation.id}`)}
                  >
                    <CardContent>
                    <Box className={classes.cardHeader}>
                      <Box className={classes.cardIcon}>
                        <AccountTree />
                      </Box>
                      <Chip
                        label={automation.active ? "Ativo" : "Inativo"}
                        size="small"
                        className={classes.statusChip}
                        color={automation.active ? "success" : "default"}
                        sx={{
                          backgroundColor: automation.active
                            ? theme.palette.mode === "dark"
                              ? theme.palette.success.dark
                              : "#E8F5E9"
                            : theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : "#F5F5F5",
                          color: automation.active
                            ? theme.palette.mode === "dark"
                              ? theme.palette.success.light
                              : "#2E7D32"
                            : theme.palette.text.secondary,
                        }}
                      />
                    </Box>
                    <Typography className={classes.cardTitle}>
                      {automation.name || "Sem nome"}
                    </Typography>
                    <Box className={classes.cardMeta}>
                      <AccountTree fontSize="small" />
                      <Typography variant="body2" color="textSecondary">
                        {getNodeCount(automation)} nós
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        • {formatDate(automation.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions className={classes.cardActions}>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Editar automação">
                        <IconButton
                          size="small"
                          className={classes.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            history.push(`/flowbuilder/${automation.id}`);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicar">
                        <IconButton
                          size="small"
                          className={classes.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingContact(automation);
                            setConfirmDuplicateOpen(true);
                          }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          className={classes.actionButton}
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingContact(automation);
                            setConfirmOpen(true);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Tooltip title={automation.active ? "Desativar" : "Ativar"}>
                      <IconButton
                        size="small"
                        className={classes.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implementar toggle de status
                        }}
                      >
                        {automation.active ? (
                          <Pause fontSize="small" />
                        ) : (
                          <PlayArrow fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={1}>
            {filteredAndSortedWebhooks.map((automation) => (
              <Card
                key={automation.id}
                className={classes.automationCard}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 2,
                }}
                onClick={() => history.push(`/flowbuilder/${automation.id}`)}
              >
                <Box className={classes.cardIcon} sx={{ mr: 2 }}>
                  <AccountTree />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    mb={0.5}
                  >
                    <Typography className={classes.cardTitle}>
                      {automation.name || "Sem nome"}
                    </Typography>
                    <Chip
                      label={automation.active ? "Ativo" : "Inativo"}
                      size="small"
                      className={classes.statusChip}
                      color={automation.active ? "success" : "default"}
                      sx={{
                        backgroundColor: automation.active
                          ? theme.palette.mode === "dark"
                            ? theme.palette.success.dark
                            : "#E8F5E9"
                          : theme.palette.mode === "dark"
                          ? theme.palette.grey[800]
                          : "#F5F5F5",
                        color: automation.active
                          ? theme.palette.mode === "dark"
                            ? theme.palette.success.light
                            : "#2E7D32"
                          : theme.palette.text.secondary,
                      }}
                    />
                  </Stack>
                  <Box className={classes.cardMeta}>
                    <Typography variant="body2" color="textSecondary">
                      {getNodeCount(automation)} nós
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      • {formatDate(automation.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Editar automação">
                    <IconButton
                      size="small"
                      className={classes.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        history.push(`/flowbuilder/${automation.id}`);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicar">
                    <IconButton
                      size="small"
                      className={classes.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingContact(automation);
                        setConfirmDuplicateOpen(true);
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      className={classes.actionButton}
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingContact(automation);
                        setConfirmOpen(true);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={automation.active ? "Desativar" : "Ativar"}>
                    <IconButton
                      size="small"
                      className={classes.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implementar toggle de status
                      }}
                    >
                      {automation.active ? (
                        <Pause fontSize="small" />
                      ) : (
                        <PlayArrow fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Card>
            ))}
          </Stack>
          )}
        </Stack>

        {/* Menu de contexto (mantido para compatibilidade) */}
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          sx={{ borderRadius: "40px" }}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              hadleEditContact();
            }}
          >
            Editar nome
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              exportLink();
            }}
          >
            Editar automação
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              setConfirmDuplicateOpen(true);
            }}
          >
            Duplicar
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              setConfirmOpen(true);
            }}
          >
            Excluir
          </MenuItem>
        </Menu>
      </Paper>
    </MainContainer>
  );
};

export default FlowBuilder;
