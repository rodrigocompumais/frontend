import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  Collapse,
  Typography,
  Divider,
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import * as Icons from "@material-ui/icons";
import useQuickAccessButtons from "../../hooks/useQuickAccessButtons";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "fixed",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1300, // Acima do drawer (1200) e AppBar
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s ease",
    pointerEvents: "none", // Permite cliques através do container
    "& > *": {
      pointerEvents: "auto", // Reabilita cliques nos filhos
    },
  },
  panel: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[8],
    borderRadius: `0 ${theme.spacing(2)} ${theme.spacing(2)} 0`,
    overflow: "hidden",
    transition: "all 0.3s ease",
    border: `1px solid ${theme.palette.divider}`,
    borderLeft: "none",
  },
  toggleButton: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1301,
    backgroundColor: theme.palette.primary.main,
    color: "#FFFFFF",
    borderRadius: `0 ${theme.spacing(1)} ${theme.spacing(1)} 0`,
    minWidth: 40,
    width: 40,
    height: 60,
    boxShadow: theme.shadows[4],
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: theme.shadows[8],
    },
    transition: "all 0.3s ease",
    pointerEvents: "auto",
  },
  content: {
    padding: theme.spacing(1.5),
    minWidth: 200,
    maxWidth: 200,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  buttonsList: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25, 1.5),
    borderRadius: theme.spacing(1),
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    backgroundColor: "transparent",
    width: "100%",
    textAlign: "left",
    pointerEvents: "auto",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      transform: "translateX(4px)",
    },
    "&:active": {
      transform: "translateX(2px)",
    },
    "&:focus": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  },
  buttonIcon: {
    fontSize: "1.5rem",
    minWidth: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  emptyState: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
  },
  collapsed: {
    left: -200,
  },
}));

const QuickAccessButtons = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { buttons, loading } = useQuickAccessButtons();
  const [expanded, setExpanded] = useState(true);

  // Filtrar apenas botões visíveis
  const visibleButtons = buttons.filter((btn) => btn.isVisible);

  if (loading || visibleButtons.length === 0) {
    return null;
  }

  // Função para obter o componente de ícone
  const getIcon = (iconName) => {
    if (!iconName) return Icons.Link || Icons.Dashboard;
    // Tentar com o nome fornecido, depois tentar sem sufixo Icon, depois fallback
    let IconComponent = Icons[iconName];
    if (!IconComponent && iconName.endsWith("Icon")) {
      IconComponent = Icons[iconName.replace("Icon", "")];
    }
    return IconComponent || Icons.Link || Icons.Dashboard;
  };

  const handleButtonClick = (route) => {
    if (route) {
      history.push(route);
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Box className={`${classes.container} ${!expanded ? classes.collapsed : ""}`}>
      <IconButton
        className={classes.toggleButton}
        onClick={toggleExpanded}
        aria-label={expanded ? "Recolher" : "Expandir"}
      >
        {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      <Collapse in={expanded} orientation="horizontal">
        <Paper className={classes.panel} elevation={0}>
          <Box className={classes.content}>
            <Box className={classes.header}>
              <Typography className={classes.title}>Acesso Rápido</Typography>
            </Box>
            <Divider style={{ marginBottom: theme.spacing(1) }} />
            <Box className={classes.buttonsList}>
              {visibleButtons.length === 0 ? (
                <Typography className={classes.emptyState}>
                  Nenhum botão configurado
                </Typography>
              ) : (
                visibleButtons.map((button) => {
                  const IconComponent = getIcon(button.icon);
                  return (
                    <Tooltip
                      key={button.id}
                      title={button.label}
                      arrow
                      placement="right"
                    >
                      <button
                        className={classes.button}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleButtonClick(button.route);
                        }}
                        style={{
                          color: button.color || theme.palette.primary.main,
                        }}
                        aria-label={button.label}
                      >
                        <Box
                          className={classes.buttonIcon}
                          style={{
                            color: button.color || theme.palette.primary.main,
                          }}
                        >
                          <IconComponent />
                        </Box>
                        <Typography className={classes.buttonLabel}>
                          {button.label}
                        </Typography>
                      </button>
                    </Tooltip>
                  );
                })
              )}
            </Box>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default QuickAccessButtons;
