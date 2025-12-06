import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  Stack,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import {
  Close,
  Edit,
  Delete,
  ContentCopy,
  Settings,
} from "@mui/icons-material";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 380,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: 380,
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
      borderLeft: "1px solid #e0e0e0",
    },
  },
  header: {
    padding: theme.spacing(2),
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    padding: theme.spacing(2),
    overflowY: "auto",
    height: "calc(100vh - 80px)",
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#666",
    marginBottom: theme.spacing(1),
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  nodeInfo: {
    padding: theme.spacing(1.5),
    backgroundColor: "#f9f9f9",
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  actionButton: {
    textTransform: "none",
    marginRight: theme.spacing(1),
  },
}));

const FlowBuilderSidebar = ({ open, onClose, selectedNode, onUpdateNode }) => {
  const classes = useStyles();
  const [nodeData, setNodeData] = useState(null);

  useEffect(() => {
    if (selectedNode) {
      setNodeData(selectedNode.data || {});
    }
  }, [selectedNode]);

  const handleFieldChange = (field, value) => {
    setNodeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (selectedNode && onUpdateNode) {
      onUpdateNode({
        ...selectedNode,
        data: nodeData,
      });
    }
  };

  const handleDelete = () => {
    // Implementar lógica de exclusão
    onClose();
  };

  const handleDuplicate = () => {
    // Implementar lógica de duplicação
  };

  if (!selectedNode) {
    return null;
  }

  const getNodeTypeLabel = (type) => {
    const labels = {
      start: "Início",
      message: "Mensagem",
      menu: "Menu",
      interval: "Intervalo",
      img: "Imagem",
      audio: "Áudio",
      video: "Vídeo",
      randomizer: "Randomizador",
      singleBlock: "Conteúdo",
      ticket: "Ticket",
      typebot: "TypeBot",
      openai: "OpenAI",
      question: "Pergunta",
    };
    return labels[type] || type;
  };

  const getNodeTypeColor = (type) => {
    const colors = {
      start: "#3ABA38",
      message: "#6865A5",
      menu: "#683AC8",
      interval: "#F7953B",
      img: "#6865A5",
      audio: "#6865A5",
      video: "#6865A5",
      randomizer: "#1FBADC",
      singleBlock: "#EC5858",
      ticket: "#F7953B",
      typebot: "#3aba38",
      openai: "#F7953B",
      question: "#F7953B",
    };
    return colors[type] || "#666";
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      className={classes.drawer}
      variant="persistent"
    >
      <Box className={classes.header}>
        <Box display="flex" alignItems="center" gap={1}>
          <Settings fontSize="small" />
          <Typography variant="h6" component="div">
            Propriedades do Nó
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Box className={classes.content}>
        {/* Informações do Nó */}
        <Paper className={classes.nodeInfo} elevation={0}>
          <Stack spacing={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={600}>
                Tipo de Nó
              </Typography>
              <Chip
                label={getNodeTypeLabel(selectedNode.type)}
                size="small"
                sx={{
                  backgroundColor: getNodeTypeColor(selectedNode.type),
                  color: "#ffffff",
                  fontWeight: 600,
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              ID: {selectedNode.id.substring(0, 8)}...
            </Typography>
          </Stack>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* Ações Rápidas */}
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>Ações</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopy />}
              onClick={handleDuplicate}
              className={classes.actionButton}
            >
              Duplicar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Delete />}
              onClick={handleDelete}
              className={classes.actionButton}
            >
              Excluir
            </Button>
          </Stack>
        </div>

        <Divider sx={{ my: 2 }} />

        {/* Propriedades do Nó */}
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>Propriedades</Typography>
          <Stack spacing={2}>
            {selectedNode.type === "message" && (
              <TextField
                label="Texto da Mensagem"
                multiline
                rows={4}
                value={nodeData?.label || ""}
                onChange={(e) => handleFieldChange("label", e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            )}

            {selectedNode.type === "interval" && (
              <TextField
                label="Segundos"
                type="number"
                value={nodeData?.sec || 0}
                onChange={(e) =>
                  handleFieldChange("sec", parseInt(e.target.value))
                }
                fullWidth
                variant="outlined"
                size="small"
              />
            )}

            {selectedNode.type === "img" && (
              <TextField
                label="URL da Imagem"
                value={nodeData?.url || ""}
                onChange={(e) => handleFieldChange("url", e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            )}

            {selectedNode.type === "audio" && (
              <>
                <TextField
                  label="URL do Áudio"
                  value={nodeData?.url || ""}
                  onChange={(e) => handleFieldChange("url", e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Gravar"
                  type="checkbox"
                  checked={nodeData?.record || false}
                  onChange={(e) => handleFieldChange("record", e.target.checked)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </>
            )}

            {selectedNode.type === "video" && (
              <TextField
                label="URL do Vídeo"
                value={nodeData?.url || ""}
                onChange={(e) => handleFieldChange("url", e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            )}

            {selectedNode.type === "randomizer" && (
              <TextField
                label="Percentual"
                type="number"
                value={nodeData?.percent || 0}
                onChange={(e) =>
                  handleFieldChange("percent", parseInt(e.target.value))
                }
                fullWidth
                variant="outlined"
                size="small"
                inputProps={{ min: 0, max: 100 }}
              />
            )}

            {/* Campos genéricos para outros tipos */}
            {!["message", "interval", "img", "audio", "video", "randomizer"].includes(
              selectedNode.type
            ) && (
              <TextField
                label="Label"
                value={nodeData?.label || ""}
                onChange={(e) => handleFieldChange("label", e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </div>

        {/* Botão Salvar */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<Edit />}
            onClick={handleSave}
          >
            Salvar Alterações
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FlowBuilderSidebar;

