import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Tooltip, makeStyles, Box, Typography } from "@material-ui/core";
import { HiSparkles } from "react-icons/hi";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  iconButton: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(0.5),
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  faviconIcon: {
    width: 24,
    height: 24,
    objectFit: "cover",
    borderRadius: "50%",
  },
  menuItem: {
    padding: theme.spacing(1.5, 2),
  },
  menuItemText: {
    marginLeft: theme.spacing(1),
  },
}));

const ChatAIButton = ({ ticketId, onAnalyzeChat, onSummarizeAudios, onSuggestResponse, onImproveMessage, simple = false }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAnalyzeChat = () => {
    handleCloseMenu();
    onAnalyzeChat();
  };

  const handleSummarizeAudios = () => {
    handleCloseMenu();
    onSummarizeAudios();
  };

  const handleSuggestResponse = () => {
    handleCloseMenu();
    onSuggestResponse();
  };

  const handleImproveMessage = () => {
    handleCloseMenu();
    if (onImproveMessage) {
      onImproveMessage();
    }
  };

  const menuOpen = Boolean(anchorEl);

  // Modo simples: botão de melhorar mensagem (nova funcionalidade principal)
  if (simple && onImproveMessage) {
    return (
      <Tooltip title="Melhorar mensagem - Compuchat">
        <IconButton
          className={classes.iconButton}
          onClick={handleImproveMessage}
          aria-label="Melhorar mensagem"
          size="small"
        >
          <HiSparkles size={24} className={classes.faviconIcon} />
        </IconButton>
      </Tooltip>
    );
  }

  // Modo simples: fallback para análise de conversa (compatibilidade)
  if (simple && onAnalyzeChat) {
    return (
      <Tooltip title="Analisar conversa - Compuchat">
        <IconButton
          className={classes.iconButton}
          onClick={handleAnalyzeChat}
          aria-label="Analisar conversa"
          size="small"
        >
          <HiSparkles size={24} className={classes.faviconIcon} />
        </IconButton>
      </Tooltip>
    );
  }

  // Modo completo: menu com todas as opções
  return (
    <>
      <Tooltip title="Compuchat - Assistente IA">
        <IconButton
          className={classes.iconButton}
          onClick={handleOpenMenu}
          aria-label="Chat AI"
          size="small"
        >
          <HiSparkles size={24} className={classes.faviconIcon} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleAnalyzeChat} className={classes.menuItem}>
          <Box display="flex" alignItems="center">
            <span>📊</span>
            <Typography className={classes.menuItemText}>
              Analisar conversa
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleSummarizeAudios} className={classes.menuItem}>
          <Box display="flex" alignItems="center">
            <span>🎵</span>
            <Typography className={classes.menuItemText}>
              Resumir áudios
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleSuggestResponse} className={classes.menuItem}>
          <Box display="flex" alignItems="center">
            <span>💡</span>
            <Typography className={classes.menuItemText}>
              Sugerir resposta
            </Typography>
          </Box>
        </MenuItem>
        {onImproveMessage && (
          <MenuItem onClick={handleImproveMessage} className={classes.menuItem}>
            <Box display="flex" alignItems="center">
              <span>✨</span>
              <Typography className={classes.menuItemText}>
                Melhorar mensagem
              </Typography>
            </Box>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ChatAIButton;

