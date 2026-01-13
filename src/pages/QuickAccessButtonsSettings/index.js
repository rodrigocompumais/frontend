import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Grid,
  Switch,
  FormControlLabel,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@material-ui/icons";
import * as Icons from "@material-ui/icons";
import useQuickAccessButtons from "../../hooks/useQuickAccessButtons";
import QuickAccessButtonModal from "../../components/QuickAccessButtonModal";
import { getRouteInfo } from "../../utils/availableRoutes";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    minHeight: "100vh",
  },
  header: {
    marginBottom: theme.spacing(3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: 700,
    fontSize: "1.8rem",
  },
  buttonCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  buttonPreview: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flex: 1,
  },
  buttonIcon: {
    fontSize: "2rem",
  },
  buttonInfo: {
    flex: 1,
  },
  buttonActions: {
    display: "flex",
    gap: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
}));

const QuickAccessButtonsSettings = () => {
  const classes = useStyles();
  const history = useHistory();
  const { buttons, loading, remove, update, reorder, list } = useQuickAccessButtons();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingButton, setEditingButton] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buttonToDelete, setButtonToDelete] = useState(null);

  const handleAdd = () => {
    setEditingButton(null);
    setModalOpen(true);
  };

  const handleEdit = (button) => {
    setEditingButton(button.id);
    setModalOpen(true);
  };

  const handleDelete = (button) => {
    setButtonToDelete(button);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (buttonToDelete) {
      await remove(buttonToDelete.id);
      setDeleteDialogOpen(false);
      setButtonToDelete(null);
    }
  };

  const handleToggleVisibility = async (button) => {
    await update(button.id, { isVisible: !button.isVisible });
  };

  const handleMoveUp = async (button, index) => {
    if (index === 0) return;
    const newOrder = [...buttons];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    const buttonsOrder = newOrder.map((btn, idx) => ({ id: btn.id, order: idx }));
    await reorder(buttonsOrder);
  };

  const handleMoveDown = async (button, index) => {
    if (index === buttons.length - 1) return;
    const newOrder = [...buttons];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    const buttonsOrder = newOrder.map((btn, idx) => ({ id: btn.id, order: idx }));
    await reorder(buttonsOrder);
  };

  const getIconComponent = (iconName) => {
    if (!iconName) return Icons.Link || Icons.Dashboard;
    // Tentar com o nome fornecido, depois tentar sem sufixo Icon, depois fallback
    let IconComponent = Icons[iconName];
    if (!IconComponent && iconName.endsWith("Icon")) {
      IconComponent = Icons[iconName.replace("Icon", "")];
    }
    return IconComponent || Icons.Link || Icons.Dashboard;
  };

  const sortedButtons = [...buttons].sort((a, b) => a.order - b.order);

  return (
    <Container maxWidth="md" className={classes.root}>
      <Box className={classes.header}>
        <Typography className={classes.title}>Botões de Acesso Rápido</Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => history.push("/dashboard")}
        >
          Voltar ao Dashboard
        </Button>
      </Box>

      <Paper>
        {loading ? (
          <Box p={4} textAlign="center">
            <Typography>Carregando...</Typography>
          </Box>
        ) : sortedButtons.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="h6" gutterBottom>
              Nenhum botão configurado
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Clique no botão + para adicionar seu primeiro botão de acesso rápido
            </Typography>
          </Box>
        ) : (
          <Box p={2}>
            {sortedButtons.map((button, index) => {
              const IconComponent = getIconComponent(button.icon);
              const routeInfo = getRouteInfo(button.route);
              return (
                <Paper key={button.id} className={classes.buttonCard} elevation={2}>
                  <DragIcon style={{ cursor: "move", color: "#999" }} />
                  <Box
                    className={classes.buttonPreview}
                    style={{
                      backgroundColor: button.color || "#1976d2",
                      color: "#FFFFFF",
                      padding: "8px 16px",
                      borderRadius: 8,
                      minWidth: 200,
                    }}
                  >
                    <IconComponent className={classes.buttonIcon} />
                    <Box className={classes.buttonInfo}>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {button.label}
                      </Typography>
                      <Typography variant="caption" style={{ opacity: 0.9 }}>
                        {routeInfo.label}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.buttonActions}>
                    <Tooltip title="Mover para cima">
                      <IconButton
                        size="small"
                        onClick={() => handleMoveUp(button, index)}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mover para baixo">
                      <IconButton
                        size="small"
                        onClick={() => handleMoveDown(button, index)}
                        disabled={index === sortedButtons.length - 1}
                      >
                        <ArrowDownIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={button.isVisible ? "Ocultar" : "Mostrar"}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleVisibility(button)}
                      >
                        {button.isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEdit(button)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleDelete(button)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>

      <Fab
        color="primary"
        aria-label="add"
        className={classes.fab}
        onClick={handleAdd}
        disabled={buttons.length >= 12}
      >
        <AddIcon />
      </Fab>

      {buttons.length >= 12 && (
        <Tooltip title="Limite máximo de 12 botões atingido">
          <span>
            <Fab
              color="primary"
              aria-label="add"
              className={classes.fab}
              disabled
            >
              <AddIcon />
            </Fab>
          </span>
        </Tooltip>
      )}

      <QuickAccessButtonModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingButton(null);
        }}
        buttonId={editingButton}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o botão "{buttonToDelete?.label}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="secondary" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuickAccessButtonsSettings;
