import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  FitScreen,
  Delete,
  ContentCopy,
  FileDownload,
  FileUpload,
  PlayArrow,
  Stop,
} from "@mui/icons-material";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    backgroundColor: theme.palette.mode === "dark" 
      ? theme.palette.background.paper 
      : "#ffffff",
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    boxShadow: theme.palette.mode === "dark"
      ? "0 2px 4px rgba(0,0,0,0.3)"
      : "0 2px 4px rgba(0,0,0,0.05)",
    zIndex: 1000,
  },
  buttonGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  divider: {
    height: 24,
    margin: theme.spacing(0, 1),
  },
  saveButton: {
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(0.75, 2),
  },
}));

const FlowBuilderToolbar = ({
  onSave,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onDelete,
  onDuplicate,
  onExport,
  onImport,
  onTest,
  canUndo = false,
  canRedo = false,
  isTestMode = false,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.toolbar}>
      {/* Ações principais */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={onSave}
          className={classes.saveButton}
        >
          Salvar
        </Button>
      </Stack>

      <Divider orientation="vertical" flexItem className={classes.divider} />

      {/* Edição */}
      <div className={classes.buttonGroup}>
        <Tooltip title="Desfazer">
          <span>
            <IconButton
              size="small"
              onClick={onUndo}
              disabled={!canUndo}
              color={canUndo ? "default" : "disabled"}
            >
              <Undo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Refazer">
          <span>
            <IconButton
              size="small"
              onClick={onRedo}
              disabled={!canRedo}
              color={canRedo ? "default" : "disabled"}
            >
              <Redo fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Duplicar">
          <IconButton size="small" onClick={onDuplicate}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton size="small" onClick={onDelete} color="error">
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      <Divider orientation="vertical" flexItem className={classes.divider} />

      {/* Zoom */}
      <div className={classes.buttonGroup}>
        <Tooltip title="Aumentar zoom">
          <IconButton size="small" onClick={onZoomIn}>
            <ZoomIn fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Diminuir zoom">
          <IconButton size="small" onClick={onZoomOut}>
            <ZoomOut fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ajustar visualização">
          <IconButton size="small" onClick={onFitView}>
            <FitScreen fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      <Divider orientation="vertical" flexItem className={classes.divider} />

      {/* Importar/Exportar */}
      <div className={classes.buttonGroup}>
        <Tooltip title="Exportar fluxo">
          <IconButton size="small" onClick={onExport}>
            <FileDownload fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Importar fluxo">
          <IconButton size="small" onClick={onImport}>
            <FileUpload fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      <Box sx={{ flexGrow: 1 }} />

      {/* Teste */}
      <div className={classes.buttonGroup}>
        <Button
          variant={isTestMode ? "contained" : "outlined"}
          color={isTestMode ? "error" : "primary"}
          startIcon={isTestMode ? <Stop /> : <PlayArrow />}
          onClick={onTest}
          size="small"
          sx={{ textTransform: "none" }}
        >
          {isTestMode ? "Parar Teste" : "Testar Fluxo"}
        </Button>
      </div>
    </Box>
  );
};

export default FlowBuilderToolbar;

