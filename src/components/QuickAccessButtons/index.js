import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Fab, Tooltip, useTheme, useMediaQuery } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import * as Icons from "@material-ui/icons";
import useQuickAccessButtons from "../../hooks/useQuickAccessButtons";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "fixed",
    left: theme.spacing(2),
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1300,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    transition: "all 0.3s ease",
  },
  arrowButton: {
    backgroundColor: "transparent",
    color: "#FFFFFF",
    boxShadow: theme.shadows[4],
    width: 48,
    height: 48,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: theme.shadows[8],
    },
    transition: "all 0.3s ease",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    transition: "all 0.3s ease",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    boxShadow: theme.shadows[6],
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: theme.shadows[12],
    },
    [theme.breakpoints.down("sm")]: {
      width: 48,
      height: 48,
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
  const location = useLocation();
  const { buttons, loading } = useQuickAccessButtons();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Verificar se está no dashboard
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";

  // Filtrar apenas botões visíveis
  const visibleButtons = buttons.filter((btn) => btn.isVisible);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
      setIsOpen(false); // Fechar após navegar
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  // Não mostrar nada se não estiver no dashboard
  if (!isDashboard) {
    return null;
  }

  return (
    <Box ref={containerRef} className={classes.container}>
      {!isOpen && (
        <Fab
          className={classes.arrowButton}
          onClick={handleArrowClick}
          aria-label="Abrir acesso rápido"
        >
          <ChevronRightIcon />
        </Fab>
      )}

      {isOpen && (
        <Box className={classes.buttonsContainer}>
          {visibleButtons.map((button) => {
            const IconComponent = getIcon(button.icon);
            return (
              <Tooltip
                key={button.id}
                title={button.label}
                arrow
                placement="right"
              >
                <Fab
                  className={classes.fab}
                  style={{
                    backgroundColor: button.color || theme.palette.primary.main,
                    color: "#FFFFFF",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleButtonClick(button.route);
                  }}
                  aria-label={button.label}
                >
                  <IconComponent className={classes.icon} />
                </Fab>
              </Tooltip>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default QuickAccessButtons;
