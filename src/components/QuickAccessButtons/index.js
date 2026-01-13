import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Fab, Tooltip, useTheme, useMediaQuery } from "@material-ui/core";
import * as Icons from "@material-ui/icons";
import useQuickAccessButtons from "../../hooks/useQuickAccessButtons";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    [theme.breakpoints.down("sm")]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
      gap: theme.spacing(1),
    },
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: theme.spacing(1.5),
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: theme.spacing(1),
    },
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  fab: {
    minWidth: 120,
    height: 56,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[6],
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[12],
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 100,
      height: 48,
    },
  },
  buttonContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5),
  },
  buttonLabel: {
    fontSize: "0.7rem",
    fontWeight: 500,
    textTransform: "none",
    lineHeight: 1.2,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.65rem",
    },
  },
  icon: {
    fontSize: "1.5rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.2rem",
    },
  },
}));

const QuickAccessButtons = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { buttons, loading } = useQuickAccessButtons();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    history.push(route);
  };

  // Limitar a 6 botões visíveis para não sobrecarregar
  const displayButtons = visibleButtons.slice(0, 6);

  return (
    <Box className={classes.container}>
      <Box className={classes.buttonGrid}>
        {displayButtons.map((button) => {
          const IconComponent = getIcon(button.icon);
          return (
            <Tooltip key={button.id} title={button.label} arrow placement="left">
              <Fab
                className={classes.fab}
                style={{
                  backgroundColor: button.color || theme.palette.primary.main,
                  color: "#FFFFFF",
                }}
                onClick={() => handleButtonClick(button.route)}
                aria-label={button.label}
              >
                <Box className={classes.buttonContent}>
                  <IconComponent className={classes.icon} />
                  {!isMobile && (
                    <span className={classes.buttonLabel}>{button.label}</span>
                  )}
                </Box>
              </Fab>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default QuickAccessButtons;
