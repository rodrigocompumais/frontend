import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Tooltip, makeStyles, Box, Typography } from "@material-ui/core";
import favicon from "../../assets/favicon.ico";
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

const ChatAIButton = ({ ticketId, onAnalyzeChat, onSummarizeAudios, onSuggestResponse, simple = false }) => {
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

  const menuOpen = Boolean(anchorEl);

  // Modo simples: apenas botão de análise de conversa
  if (simple && onAnalyzeChat) {
    return (
      <Tooltip title="Analisar conversa - Compuchat">
        <IconButton
          className={classes.iconButton}
          onClick={handleAnalyzeChat}
          aria-label="Analisar conversa"
          size="small"
        >
          <img src={favicon} alt="Compuchat" className={classes.faviconIcon} />
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
          <img src={favicon} alt="Compuchat" className={classes.faviconIcon} />
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
      </Menu>
    </>
  );
};

export default ChatAIButton;

