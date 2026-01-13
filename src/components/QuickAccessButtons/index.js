import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Fab, Tooltip, useTheme } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import * as Icons from "@material-ui/icons";
import useQuickAccessButtons from "../../hooks/useQuickAccessButtons";

const STORAGE_KEY_POSITION = "quick_access_buttons_position";

const useStyles = makeStyles((theme) => ({
  container: {
    position: "fixed",
    zIndex: 1300,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    userSelect: "none",
  },
  containerDragging: {
    transition: "none",
  },
  containerIdle: {
    transition: "all 0.3s ease",
  },
  arrowButton: {
    backgroundColor: "transparent",
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[4],
    width: 48,
    height: 48,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.1)" 
        : "rgba(0, 0, 0, 0.05)",
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
  const [position, setPosition] = useState({ x: 16, y: "50%" });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Verificar se está no dashboard
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";

  // Filtrar apenas botões visíveis
  const visibleButtons = buttons.filter((btn) => btn.isVisible);

  // Salvar posição no localStorage
  const savePosition = (pos) => {
    try {
      localStorage.setItem(STORAGE_KEY_POSITION, JSON.stringify(pos));
    } catch (err) {
      console.warn("Erro ao salvar posição:", err);
    }
  };

  // Carregar posição do localStorage
  useEffect(() => {
    if (isDashboard) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_POSITION);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.x !== undefined && parsed.y !== undefined) {
            setPosition(parsed);
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar posição:", err);
      }
    }
  }, [isDashboard]);

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

  // Handlers de drag
  const handleMouseDown = (e) => {
    if (e.button !== 0 || isOpen) return;
    const target = e.target.closest('[class*="MuiFab-root"]');
    if (!target) return;
    
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const currentTop = position.y === "50%" 
        ? window.innerHeight / 2 
        : typeof position.y === "number" ? position.y : rect.top;
      const currentLeft = position.x || rect.left;
      setDragStart({
        x: e.clientX - currentLeft,
        y: e.clientY - currentTop,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || dragStart.x === undefined || dragStart.y === undefined || isOpen) return;
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const maxX = window.innerWidth - 48;
      const maxY = window.innerHeight - 48;
      const minX = 0;
      const minY = 0;
      
      const clampedX = Math.max(minX, Math.min(maxX, newX));
      const clampedY = Math.max(minY, Math.min(maxY, newY));
      
      const newPosition = { x: clampedX, y: clampedY };
      setPosition(newPosition);
      savePosition(newPosition);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging && !isOpen) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, isOpen]);

  // Função para obter o componente de ícone
  const getIcon = (iconName) => {
    if (!iconName) return Icons.Link || Icons.Dashboard;
    let IconComponent = Icons[iconName];
    if (!IconComponent && iconName.endsWith("Icon")) {
      IconComponent = Icons[iconName.replace("Icon", "")];
    }
    return IconComponent || Icons.Link || Icons.Dashboard;
  };

  const handleButtonClick = (route) => {
    if (route) {
      history.push(route);
      setIsOpen(false);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  if (loading || visibleButtons.length === 0 || !isDashboard) {
    return null;
  }

  const containerStyle = {
    left: position.x,
    top: position.y === "50%" ? "50%" : position.y,
    transform: position.y === "50%" ? "translateY(-50%)" : "none",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <Box
      ref={containerRef}
      className={`${classes.container} ${isDragging ? classes.containerDragging : classes.containerIdle}`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      {!isOpen && (
        <Fab
          className={classes.arrowButton}
          onClick={handleArrowClick}
          aria-label="Abrir acesso rápido"
          style={{ cursor: "pointer" }}
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
