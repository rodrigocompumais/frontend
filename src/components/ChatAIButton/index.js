import React, { useState } from "react";
import { Fab, Menu, MenuItem, Tooltip, makeStyles, Box, Typography } from "@material-ui/core";
import favicon from "../../assets/favicon.ico";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    background: "transparent",
    boxShadow: "0 4px 20px rgba(14, 165, 233, 0.4)",
    transition: "all 0.3s ease",
    overflow: "hidden",
    zIndex: 10,
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: "0 6px 25px rgba(14, 165, 233, 0.5)",
    },
  },
  faviconFab: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
    zIndex: 0,
  },
  menuItem: {
    padding: theme.spacing(1.5, 2),
  },
  menuItemText: {
    marginLeft: theme.spacing(1),
  },
}));

const ChatAIButton = ({ ticketId, onAnalyzeChat, onSummarizeAudios, onSuggestResponse }) => {
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

  return (
    <>
      <Tooltip title="Compuchat - Assistente IA">
        <Fab
          size="medium"
          className={classes.fab}
          onClick={handleOpenMenu}
          aria-label="Chat AI"
        >
          <img src={favicon} alt="Compuchat" className={classes.faviconFab} />
        </Fab>
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

