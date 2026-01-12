import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  Input,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: theme.spacing(2),
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    overflowX: "hidden",
    height: "100%",
    padding: theme.spacing(2),
    ...theme.scrollbarStyles,
    backgroundColor: theme.palette.type === "dark" ? "#0B1120" : "#F9FAFB",
    display: "flex",
    flexDirection: "column",
  },
  inputArea: {
    position: "relative",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
  },
  inputContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: theme.spacing(1),
    backgroundColor: theme.palette.type === "dark" ? "#1F2937" : "#FFFFFF",
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1, 2),
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
    transition: "all 0.2s ease",
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.type === "dark" ? "rgba(14, 165, 233, 0.1)" : "rgba(14, 165, 233, 0.15)"}`,
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.75, 1.5),
      borderRadius: theme.spacing(2),
    },
  },
  input: {
    flex: 1,
    padding: theme.spacing(1.5, 0),
    fontSize: "0.9375rem",
    color: theme.palette.text.primary,
    "&::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    resize: "none",
    maxHeight: "120px",
    overflowY: "auto",
    ...theme.scrollbarStylesSoft,
  },
  buttonSend: {
    minWidth: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    color: "#FFFFFF",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      transform: "scale(1.05)",
    },
    "&:disabled": {
      backgroundColor: theme.palette.type === "dark" ? "#374151" : "#E5E7EB",
      color: theme.palette.text.secondary,
    },
  },
  messageBubble: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "70%",
    minWidth: "120px",
    marginBottom: theme.spacing(1.5),
    wordWrap: "break-word",
    animation: "fadeIn 0.3s ease",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "85%",
      minWidth: "100px",
    },
  },
  "@keyframes fadeIn": {
    from: {
      opacity: 0,
      transform: "translateY(10px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  boxLeft: {
    alignSelf: "flex-start",
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.type === "dark" ? "#1F2937" : "#FFFFFF",
    borderRadius: theme.spacing(2),
    borderBottomLeftRadius: theme.spacing(0.5),
    boxShadow: theme.palette.type === "dark" 
      ? "0 2px 8px rgba(0, 0, 0, 0.3)" 
      : "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
  },
  boxRight: {
    alignSelf: "flex-end",
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.type === "dark" ? "#1E3A5F" : "#E3F2FD",
    borderRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(0.5),
    boxShadow: theme.palette.type === "dark" 
      ? "0 2px 8px rgba(0, 0, 0, 0.3)" 
      : "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(14, 165, 233, 0.3)" : "rgba(14, 165, 233, 0.2)"}`,
  },
  senderName: {
    fontSize: "0.75rem",
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  messageContent: {
    fontSize: "0.9375rem",
    lineHeight: 1.5,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    wordBreak: "break-word",
  },
  messageTime: {
    fontSize: "0.6875rem",
    color: theme.palette.text.secondary,
    opacity: 0.7,
    marginTop: theme.spacing(0.25),
    alignSelf: "flex-end",
  },
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  };

  useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      handleLoadMore();
    }
  };

  return (
    <Paper className={classes.mainContainer} elevation={0}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => {
            const isOwnMessage = item.senderId === user.id;
            return (
              <Box 
                key={key} 
                className={`${classes.messageBubble} ${isOwnMessage ? classes.boxRight : classes.boxLeft}`}
                style={{
                  alignSelf: isOwnMessage ? "flex-end" : "flex-start"
                }}
              >
                <Typography className={classes.senderName}>
                  {item.sender.name}
                </Typography>
                <Typography className={classes.messageContent}>
                  {item.message}
                </Typography>
                <Typography className={classes.messageTime}>
                  {datetimeToClient(item.createdAt)}
                </Typography>
              </Box>
            );
          })}
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <div className={classes.inputContainer}>
          <Input
            multiline
            rowsMax={4}
            value={contentMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && contentMessage.trim() !== "") {
                e.preventDefault();
                handleSendMessage(contentMessage);
                setContentMessage("");
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            className={classes.input}
            placeholder="Digite sua mensagem..."
            disableUnderline
            inputProps={{
              style: {
                padding: 0,
                margin: 0,
              }
            }}
          />
          <IconButton
            onClick={() => {
              if (contentMessage.trim() !== "") {
                handleSendMessage(contentMessage);
                setContentMessage("");
              }
            }}
            className={classes.buttonSend}
            disabled={!contentMessage.trim()}
            size="small"
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </Paper>
  );
}
