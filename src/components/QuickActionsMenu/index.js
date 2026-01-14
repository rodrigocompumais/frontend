import React, { useState, useEffect, useRef } from "react";
import { makeStyles, IconButton, Collapse, Tooltip } from "@material-ui/core";
import {
  MoreVert,
  Assignment,
  FlashOn,
  Schedule,
  Forum,
  ExpandLess,
  ConfirmationNumber,
} from "@material-ui/icons";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  quickActionsContainer: {
    position: "fixed",
    bottom: 100,
    right: 20,
    zIndex: 1300,
    display: "flex",
    flexDirection: "column-reverse",
    alignItems: "center",
    gap: 4,
    pointerEvents: "none",
  },
  toggleButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[2],
    pointerEvents: "auto",
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
    flexDirection: "column-reverse",
    gap: 4,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    padding: 4,
    boxShadow: theme.shadows[4],
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: 4,
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
  onGenerateTicketClick,
  showGenerateTicket = false,
}) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef(null);

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
    e.stopPropagation();
    setExpanded(!expanded);
  };

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

  // Adicionar botão de gerar ticket apenas se showGenerateTicket for true
  if (showGenerateTicket) {
    actions.push({
      id: "generateTicket",
      icon: <ConfirmationNumber className={classes.actionIcon} />,
      label: i18n.t("quickActions.generateTicket"),
      onClick: () => {
        onGenerateTicketClick();
        setExpanded(false);
      },
    });
  }

  return (
    <div ref={containerRef} className={classes.quickActionsContainer}>
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
      <Tooltip title={expanded ? i18n.t("quickActions.collapse") : i18n.t("quickActions.expand")}>
        <IconButton
          className={classes.toggleButton}
          onClick={handleToggle}
          size="small"
        >
          {expanded ? <ExpandLess /> : <MoreVert />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default QuickActionsMenu;
