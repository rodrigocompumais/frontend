import React, { useContext, useState } from "react";
import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
} from "@material-ui/core";

import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: theme.spacing(1),
    ...theme.scrollbarStyles,
  },
  listItem: {
    cursor: "pointer",
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    padding: theme.spacing(1.5),
    transition: "all 0.2s ease",
    border: `1px solid transparent`,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.05)" 
        : "rgba(0, 0, 0, 0.04)",
      transform: "translateX(4px)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
    },
  },
  listItemActive: {
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(14, 165, 233, 0.15)" 
      : "rgba(14, 165, 233, 0.08)",
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(14, 165, 233, 0.2)" 
        : "rgba(14, 165, 233, 0.12)",
    },
  },
  listItemText: {
    "& .MuiListItemText-primary": {
      fontSize: "0.9375rem",
      fontWeight: 500,
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0.25),
    },
    "& .MuiListItemText-secondary": {
      fontSize: "0.8125rem",
      color: theme.palette.text.secondary,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  },
  badge: {
    "& .MuiChip-root": {
      height: "20px",
      fontSize: "0.6875rem",
      fontWeight: 600,
      backgroundColor: theme.palette.secondary.main,
      color: "#FFFFFF",
    },
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
  },
  iconButton: {
    padding: theme.spacing(0.75),
    color: theme.palette.text.secondary,
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.1)" 
        : "rgba(0, 0, 0, 0.08)",
      color: theme.palette.text.primary,
    },
  },
}));

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});

  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }

    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser.unreads;
  };

  const getPrimaryText = (chat) => {
    // Para chats individuais, mostrar o nome do outro usuário
    let mainText = chat.title;
    if (!chat.isGroup && chat.users && chat.users.length === 2) {
      const otherUser = chat.users.find((u) => u.userId !== user.id);
      if (otherUser && otherUser.user) {
        mainText = otherUser.user.name;
      }
    } else {
      mainText = chat.title;
    }
    
    const unreads = unreadMessages(chat);
    return (
      <>
        {mainText}
        {unreads > 0 && (
          <Chip
            size="small"
            style={{ marginLeft: 8 }}
            label={unreads}
            color="secondary"
            className={classes.badge}
          />
        )}
      </>
    );
  };

  const getSecondaryText = (chat) => {
    return chat.lastMessage !== ""
      ? `${datetimeToClient(chat.updatedAt)}: ${chat.lastMessage}`
      : "";
  };

  const getItemClassName = (chat) => {
    return chat.uuid === id 
      ? `${classes.listItem} ${classes.listItemActive}` 
      : classes.listItem;
  };

  return (
    <>
      <ConfirmationModal
        title={i18n.t("chat.confirm.title")}
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        {i18n.t("chat.confirm.message")}
      </ConfirmationModal>
      <div className={classes.mainContainer}>
        <div className={classes.chatList}>
          <List>
            {Array.isArray(chats) &&
              chats.length > 0 &&
              chats.map((chat, key) => (
                <ListItem
                  onClick={() => goToMessages(chat)}
                  key={key}
                  className={getItemClassName(chat)}
                  button
                >
                  <ListItemText
                    className={classes.listItemText}
                    primary={getPrimaryText(chat)}
                    secondary={getSecondaryText(chat)}
                  />
                  {chat.ownerId === user.id && (
                    <ListItemSecondaryAction>
                      <div className={classes.actionButtons}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            goToMessages(chat).then(() => {
                              handleEditChat(chat);
                            });
                          }}
                          edge="end"
                          aria-label="edit"
                          size="small"
                          className={classes.iconButton}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChat(chat);
                            setConfirmModalOpen(true);
                          }}
                          edge="end"
                          aria-label="delete"
                          size="small"
                          className={classes.iconButton}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
          </List>
        </div>
      </div>
    </>
  );
}
