import React, { useState, useEffect, useRef } from "react";
import { makeStyles, IconButton, Collapse, Tooltip } from "@material-ui/core";
import {
  MoreVert,
  Assignment,
  FlashOn,
  Schedule,
  Forum,
  ExpandLess,
  ExpandMore,
} from "@material-ui/icons";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  quickActionsContainer: {
    position: "fixed",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    pointerEvents: "none",
  },
  toggleButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[2],
    cursor: "grab",
    pointerEvents: "auto",
    userSelect: "none",
    "&:active": {
      cursor: "grabbing",
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      boxShadow: theme.shadows[4],
    },
    width: 36,
    height: 36,
    minWidth: 36,
    padding: 0,
  },
  actionsMenu: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    padding: 4,
    boxShadow: theme.shadows[4],
    border: `1px solid ${theme.palette.divider}`,
    pointerEvents: "auto",
  },
  actionButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    minWidth: 40,
    width: 40,
    height: 40,
    padding: 0,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  actionIcon: {
    fontSize: 20,
  },
}));

const QuickActionsMenu = ({
  onTaskClick,
  onQuickMessageClick,
  onScheduleClick,
  onInternalChatClick,
}) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 50, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Carregar posição salva do localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem("quickActionsPosition");
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } catch (e) {
        console.error("Erro ao carregar posição salva:", e);
      }
    }
  }, []);

  // Salvar posição no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("quickActionsPosition", JSON.stringify(position));
  }, [position]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        expanded &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [expanded]);

  const handleToggle = (e) => {
    // Não expandir se foi um arrasto
    if (hasMoved) {
      return;
    }
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleMouseDown = (e) => {
    // Só arrastar se clicar no botão ou seus filhos (ícone)
    const target = e.target;
    if (buttonRef.current && (
      target === buttonRef.current || 
      buttonRef.current.contains(target) ||
      target.closest('button') === buttonRef.current
    )) {
      setIsDragging(true);
      setHasMoved(false);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = Math.abs(e.clientX - (dragStart.x + position.x));
        const deltaY = Math.abs(e.clientY - (dragStart.y + position.y));
        
        // Se moveu mais de 5px, considera como arrasto
        if (deltaX > 5 || deltaY > 5) {
          setHasMoved(true);
        }
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Limitar dentro da tela
        const maxX = window.innerWidth - 36;
        const maxY = window.innerHeight - 36;
        const minX = 0;
        const minY = 0;
        
        setPosition({
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Resetar hasMoved após um pequeno delay para permitir clique
        setTimeout(() => {
          setHasMoved(false);
        }, 100);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  const actions = [
    {
      id: "task",
      icon: <Assignment className={classes.actionIcon} />,
      label: i18n.t("quickActions.task"),
      onClick: () => {
        onTaskClick();
        setExpanded(false);
      },
    },
    {
      id: "quickMessage",
      icon: <FlashOn className={classes.actionIcon} />,
      label: i18n.t("quickActions.quickMessage"),
      onClick: () => {
        onQuickMessageClick();
        setExpanded(false);
      },
    },
    {
      id: "schedule",
      icon: <Schedule className={classes.actionIcon} />,
      label: i18n.t("quickActions.schedule"),
      onClick: () => {
        onScheduleClick();
        setExpanded(false);
      },
    },
    {
      id: "internalChat",
      icon: <Forum className={classes.actionIcon} />,
      label: i18n.t("quickActions.internalChat"),
      onClick: () => {
        onInternalChatClick();
        setExpanded(false);
      },
    },
  ];

  return (
    <div
      ref={containerRef}
      className={classes.quickActionsContainer}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Tooltip title={expanded ? i18n.t("quickActions.collapse") : i18n.t("quickActions.expand")}>
        <IconButton
          ref={buttonRef}
          className={classes.toggleButton}
          onClick={handleToggle}
          onMouseDown={handleMouseDown}
          size="small"
        >
          {expanded ? <ExpandLess /> : <MoreVert />}
        </IconButton>
      </Tooltip>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <div className={classes.actionsMenu}>
          {actions.map((action) => (
            <Tooltip key={action.id} title={action.label} placement="left">
              <IconButton
                className={classes.actionButton}
                onClick={action.onClick}
                size="small"
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
        </div>
      </Collapse>
    </div>
  );
};

export default QuickActionsMenu;
