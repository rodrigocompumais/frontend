import React, { useState } from "react";
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
    position: "absolute",
    right: 8,
    bottom: 80,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  toggleButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[2],
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

  const handleToggle = () => {
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

  return (
    <div className={classes.quickActionsContainer}>
      <Tooltip title={expanded ? i18n.t("quickActions.collapse") : i18n.t("quickActions.expand")}>
        <IconButton
          className={classes.toggleButton}
          onClick={handleToggle}
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
