import React, { useContext, useEffect, useRef, useState } from "react";

import { useParams, useHistory } from "react-router-dom";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  useTheme,
} from "@material-ui/core";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";

import { has, isObject } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    padding: theme.spacing(2),
    minHeight: 0,
    height: "calc(100vh - 56px)",
    maxHeight: "calc(100vh - 56px)",
    overflow: "hidden",
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
  },
  gridContainer: {
    height: "100%",
    maxHeight: "100%",
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
    overflow: "hidden",
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxHeight: "100%",
    overflow: "hidden",
    "&:first-child": {
      borderRight: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
      [theme.breakpoints.down("md")]: {
        borderRight: "none",
        borderBottom: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
      },
    },
  },
  gridItemTab: {
    flex: 1,
    minHeight: 0,
    maxHeight: "100%",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    overflow: "hidden",
  },
  btnContainer: {
    textAlign: "right",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
  },
  newButton: {
    borderRadius: theme.spacing(1.5),
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 2.5),
    boxShadow: theme.shadows[2],
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  tabs: {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
    "& .MuiTab-root": {
      textTransform: "none",
      fontWeight: 500,
      minHeight: 48,
    },
  },
}));

export function ChatModal({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
}) {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle("");
    setUsers([]);
    if (type === "edit") {
      const userList = chat.users.map((u) => ({
        id: u.user.id,
        name: u.user.name,
      }));
      setUsers(userList);
      setTitle(chat.title);
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      if (!title) {
        alert(i18n.t("chat.toasts.fillTitle"));
        return;
      }

      // Para grupos, é obrigatório ter pelo menos um usuário além do criador
      if (type === "new" && (!users || users.length === 0)) {
        alert(i18n.t("chat.toasts.fillUser"));
        return;
      }

      if (type === "edit") {
        await api.put(`/chats/${chat.id}`, {
          users,
          title,
        });
      } else {
        const { data } = await api.post("/chats", {
          users,
          title,
          isGroup: users && users.length > 0, // Se tem usuários, é grupo
        });
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (err) {}
  };  

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{i18n.t("chat.modal.title")}</DialogTitle>
      <DialogContent>
        <Grid spacing={2} container>
          <Grid xs={12} style={{ padding: 18 }} item>
            <TextField
              label={i18n.t("chat.modal.titleField")}
              placeholder={i18n.t("chat.modal.titleField")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid xs={12} item>
            <UsersFilter
              onFiltered={(users) => setUsers(users)}
              initialUsers={users}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {i18n.t("chat.buttons.close")}
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {i18n.t("chat.buttons.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [chatType, setChatType] = useState("individual"); // "individual" ou "group"
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const { id } = useParams();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      const isGroup = chatType === "group";
      findChats(isGroup).then((data) => {
        const { records } = data;
        if (records.length > 0) {
          setChats(records);
          setChatsPageInfo(data);

          if (id && records.length) {
            const chat = records.find((r) => r.uuid === id);
            if (chat) {
              selectChat(chat);
            }
          }
        } else {
          setChats([]);
          setChatsPageInfo(data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatType]);

  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      setMessagesPage(1); // Resetar para primeira página ao trocar de chat
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-chat-user-${user.id}`, (data) => {
      if (data.action === "create") {
        setChats((prev) => [data.record, ...prev]);
      }
      if (data.action === "update") {
        const changedChats = chats.map((chat) => {
          if (chat.id === data.record.id) {
            setCurrentChat(data.record);
            return {
              ...data.record,
            };
          }
          return chat;
        });
        setChats(changedChats);
      }
    });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "delete") {
        const filteredChats = chats.filter((c) => c.id !== +data.id);
        setChats(filteredChats);
        setMessages([]);
        setMessagesPage(1);
        setMessagesPageInfo({ hasMore: false });
        setCurrentChat({});
        history.push("/chats");
      }
    });

    if (isObject(currentChat) && has(currentChat, "id")) {
      socket.on(`company-${companyId}-chat-${currentChat.id}`, (data) => {
        if (data.action === "new-message" && data.newMessage.chatId === currentChat.id) {
          // Adicionar nova mensagem no final (mensagens mais recentes)
          setMessages((prev) => {
            // Verificar se a mensagem já existe para evitar duplicatas
            const exists = prev.some(msg => msg.id === data.newMessage.id);
            if (exists) return prev;
            return [...prev, data.newMessage];
          });
          const changedChats = chats.map((chat) => {
            if (chat.id === data.newMessage.chatId) {
              return {
                ...data.chat,
              };
            }
            return chat;
          });
          setChats(changedChats);
          setTimeout(() => {
            if (scrollToBottomRef.current) {
              scrollToBottomRef.current();
            }
          }, 100);
        }

        if (data.action === "update") {
          const changedChats = chats.map((chat) => {
            if (chat.id === data.chat.id) {
              return {
                ...data.chat,
              };
            }
            return chat;
          });
          setChats(changedChats);
          scrollToBottomRef.current();
        }
      });
    }

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat, socketManager]);

  const selectChat = (chat) => {
    try {
      setMessages([]);
      setMessagesPage(1);
      setCurrentChat(chat);
      setTab(1);
    } catch (err) {}
  };

  const sendMessage = async (contentMessage) => {
    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage,
      });
    } catch (err) {}
    setLoading(false);
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (err) {}
  };

  const findMessages = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/chats/${chatId}/messages?pageNumber=${messagesPage}`
      );
      const nextPage = messagesPage + 1;
      setMessagesPage(nextPage);
      setMessagesPageInfo(data);
      // Se é a primeira página, substituir todas as mensagens
      // Se não, adicionar mensagens antigas no início (para scroll infinito)
      if (messagesPage === 1) {
        // Mensagens já vêm ordenadas do backend (mais antigas primeiro, mais recentes por último)
        setMessages(data.records);
      } else {
        // Adicionar mensagens antigas no início
        setMessages((prev) => [...data.records, ...prev]);
      }
    } catch (err) {}
    setLoading(false);
  };

  const loadMoreMessages = async () => {
    if (!loading) {
      findMessages(currentChat.id);
    }
  };

  const findChats = async (isGroup = false) => {
    try {
      const { data } = await api.get("/chats", {
        params: { isGroup: isGroup }
      });
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  const renderGrid = () => {
    return (
      <Grid className={classes.gridContainer} container>
        <Grid className={classes.gridItem} md={3} item>
          <div style={{ borderBottom: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}` }}>
            <Tabs
              value={chatType === "individual" ? 0 : 1}
              indicatorColor="secondary"
              textColor="secondary"
              onChange={(e, v) => {
                setChatType(v === 0 ? "individual" : "group");
                setCurrentChat({});
                setMessages([]);
                setMessagesPage(1);
              }}
              className={classes.tabs}
            >
              <Tab label="Chats Individuais" />
              <Tab label="Grupos" />
            </Tabs>
          </div>
            {chatType === "group" && (
              <div className={classes.btnContainer}>
                <Button
                  onClick={() => {
                    setDialogType("new");
                    setShowDialog(true);
                  }}
                  color="primary"
                  variant="contained"
                  className={classes.newButton}
                >
                  Novo Grupo
                </Button>
              </div>
            )}
          
          <ChatList
            chats={chats}
            pageInfo={chatsPageInfo}
            loading={loading}
            handleSelectChat={(chat) => selectChat(chat)}
            handleDeleteChat={(chat) => deleteChat(chat)}
            handleEditChat={() => {
              setDialogType("edit");
              setShowDialog(true);
            }}
          />
        </Grid>
        <Grid className={classes.gridItem} md={9} item>
          {isObject(currentChat) && has(currentChat, "id") && (
            <ChatMessages
              chat={currentChat}
              scrollToBottomRef={scrollToBottomRef}
              pageInfo={messagesPageInfo}
              messages={messages}
              loading={loading}
              handleSendMessage={sendMessage}
              handleLoadMore={loadMoreMessages}
            />
          )}
        </Grid>
      </Grid>
    );
  };

  const renderTab = () => {
    return (
      <Grid className={classes.gridContainer} container>
        <Grid md={12} item>
          <Tabs
            value={tab}
            indicatorColor="primary"
            textColor="primary"
            onChange={(e, v) => setTab(v)}
            aria-label="disabled tabs example"
            className={classes.tabs}
          >
            <Tab label={i18n.t("chat.chats")} />
            <Tab label={i18n.t("chat.messages")} />
          </Tabs>
          <Tabs
            value={chatType === "individual" ? 0 : 1}
            indicatorColor="secondary"
            textColor="secondary"
            onChange={(e, v) => {
              setChatType(v === 0 ? "individual" : "group");
              setCurrentChat({});
              setMessages([]);
              setMessagesPage(1);
            }}
            className={classes.tabs}
            style={{ marginTop: 8 }}
          >
            <Tab label="Chats Individuais" />
            <Tab label="Grupos" />
          </Tabs>
        </Grid>
        {tab === 0 && (
          <Grid className={classes.gridItemTab} md={12} item>
            {chatType === "group" && (
              <div className={classes.btnContainer}>
                <Button
                  onClick={() => {
                    setDialogType("new");
                    setShowDialog(true);
                  }}
                  color="primary"
                  variant="contained"
                  className={classes.newButton}
                >
                  Novo Grupo
                </Button>
              </div>
            )}
            <ChatList
              chats={chats}
              pageInfo={chatsPageInfo}
              loading={loading}
              handleSelectChat={(chat) => selectChat(chat)}
              handleDeleteChat={(chat) => deleteChat(chat)}
            />
          </Grid>
        )}
        {tab === 1 && (
          <Grid className={classes.gridItemTab} md={12} item>
            {isObject(currentChat) && has(currentChat, "id") && (
              <ChatMessages
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
              />
            )}
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        handleLoadNewChat={(data) => {
          setMessages([]);
          setMessagesPage(1);
          setCurrentChat(data);
          setTab(1);
          history.push(`/chats/${data.uuid}`);
        }}
        handleClose={() => setShowDialog(false)}
      />
      <Paper className={classes.mainContainer}>
        {isWidthUp("md", props.width) ? renderGrid() : renderTab()}
      </Paper>
    </>
  );
}

export default withWidth()(Chat);
