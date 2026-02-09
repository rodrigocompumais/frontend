import React, { useState, useEffect, useReducer, useRef, useContext } from "react";

import { isSameDay, parseISO, format } from "date-fns";
import clsx from "clsx";

import { green } from "@material-ui/core/colors";
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  makeStyles,
  Popover,
  Typography,
} from "@material-ui/core";

import {
  AccessTime,
  Block,
  Done,
  DoneAll,
  ExpandMore,
  GetApp,
} from "@material-ui/icons";

import MarkdownWrapper from "../MarkdownWrapper";
import ModalImageCors from "../ModalImageCors";
import MessageOptionsMenu from "../MessageOptionsMenu";
import whatsBackground from "../../assets/wa-background.png";
import LocationPreview from "../LocationPreview";
import ContactCard from "../ContactCard";

import whatsBackgroundDark from "../../assets/wa-background-dark.png"; //DARK MODE PLW DESIGN//

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import { i18n } from "../../translate/i18n";
import ChatAIButton from "../ChatAIButton";
import ChatAIModal from "../ChatAIModal";
import AudioTranscriptionModal from "../AudioTranscriptionModal";
import AudioMessagePlayer from "../AudioMessagePlayer";
import { toast } from "react-toastify";
import useMessageTranslation from "../../hooks/useMessageTranslation";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  messagesListWrapper: {
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    width: "100%",
    minWidth: 300,
    minHeight: 200,
  },

  messagesList: {
    backgroundImage: theme.mode === 'light' ? `url(${whatsBackground})` : `url(${whatsBackgroundDark})`, //DARK MODE PLW DESIGN//
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "20px 20px 20px 20px",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },

  circleLoading: {
    color: green[500],
    position: "absolute",
    opacity: "70%",
    top: 0,
    left: "50%",
    marginTop: 12,
  },

  messageLeft: {
    marginRight: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#ffffff",
    color: "#303030",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerLeft: {
    margin: "-3px -80px 6px -6px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsg: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  quotedSideColorLeft: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageRight: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerRight: {
    margin: "-3px -80px 6px -6px",
    overflowY: "hidden",
    backgroundColor: "#cfe9ba",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsgRight: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    whiteSpace: "pre-wrap",
  },

  quotedSideColorRight: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  messageActionsButton: {
    display: "none",
    position: "relative",
    color: "#999",
    zIndex: 1,
    backgroundColor: "inherit",
    opacity: "90%",
    "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },

  messageWithReactionsWrapper: {
    display: "flex",
    flexDirection: "column",
    alignSelf: "flex-start",
  },

  messageWithReactionsWrapperRight: {
    alignSelf: "flex-end",
  },

  messageReactions: {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
    marginBottom: 8,
  },

  reactionEmoji: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 6px",
    minWidth: 24,
    borderRadius: 12,
    fontSize: "0.85rem",
    cursor: "pointer",
    backgroundColor: theme.mode === "dark" ? "rgba(45, 55, 72, 0.95)" : "rgba(255, 255, 255, 0.95)",
    boxShadow: theme.mode === "dark" ? "0 1px 3px rgba(0, 0, 0, 0.4)" : "0 1px 3px rgba(0, 0, 0, 0.15)",
    border: theme.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
  },

  reactionPopover: {
    padding: theme.spacing(1.5, 2),
  },

  // Estilos para mensagens internas da empresa em grupos
  messageRightCompanyUser: {
    borderLeft: "4px solid",
    paddingLeft: "8px !important",
  },

  companyUserName: {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    marginBottom: 2,
    opacity: 0.9,
  },

  textContentItem: {
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },
  
  textContentItemEdited: {
    overflowWrap: "break-word",
    padding: "3px 120px 6px 6px",
  },

  textContentItemDeleted: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  messageInternal: {
    backgroundColor: "#fff3cd",
    borderLeft: "3px solid #ffc107",
    borderStyle: "dashed",
    borderWidth: "1px",
    borderColor: "#ffc107",
  },

  internalBadge: {
    display: "inline-block",
    backgroundColor: "#ffc107",
    color: "#000",
    fontSize: "0.7rem",
    padding: "2px 6px",
    borderRadius: "4px",
    marginRight: "8px",
    fontWeight: "bold",
  },

  internalSignature: {
    display: "block",
    fontSize: "0.75rem",
    fontStyle: "italic",
    color: "#856404",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px dashed #ffc107",
  },

  messageMedia: {
    objectFit: "cover",
    width: 250,
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
    right: 5,
    color: "#999",
  },

  dailyTimestamp: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },

  dailyTimestampText: {
    color: "#808888",
    padding: 8,
    alignSelf: "center",
    marginLeft: "0px",
  },

  ackIcons: {
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  deletedIcon: {
    fontSize: 18,
    verticalAlign: "middle",
    marginRight: 4,
  },

  ackDoneAllIcon: {
    color: green[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },

  translationBadge: {
    display: "block",
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    fontStyle: "italic",
    marginTop: 4,
    marginBottom: 2,
    opacity: 0.8,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList = ({ ticket, ticketId, isGroup, onAiHandlersReady, realTimeTranslationEnabled = true, scrollToMessageId, onScrollToMessageDone, onScrollToMessageRequest }) => {
  const classes = useStyles();

  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [menuAnchorOrigin, setMenuAnchorOrigin] = useState({ vertical: "top", horizontal: "left" });
  const messageOptionsMenuOpen = Boolean(anchorPosition);
  const currentTicketId = useRef(ticketId);
  
  // Estados para IA
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState("analyze");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiKeyPoints, setAiKeyPoints] = useState([]);
  const [aiAudioSummary, setAiAudioSummary] = useState("");
  const [aiAudioCount, setAiAudioCount] = useState(0);

  // Estados para transcrição de áudio
  const [transcriptionModalOpen, setTranscriptionModalOpen] = useState(false);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [transcriptionError, setTranscriptionError] = useState(null);
  const [transcriptionMessageId, setTranscriptionMessageId] = useState(null);

  const socketManager = useContext(SocketContext);
  const { user, companyLanguage: authCompanyLanguage } = useContext(AuthContext);

  // Usar idioma do contexto, ou buscar via API como fallback
  const [companyLanguage, setCompanyLanguage] = useState(authCompanyLanguage || "pt");

  useEffect(() => {
    if (authCompanyLanguage) {
      setCompanyLanguage(authCompanyLanguage);
    } else {
      // Fallback: buscar da API
      const fetchCompanyLanguage = async () => {
        try {
          const { data } = await api.get("/translation/company-language");
          setCompanyLanguage(data.language || "pt");
        } catch (err) {
          console.error("Erro ao buscar idioma da empresa:", err);
          // Usar padrão pt
        }
      };
      fetchCompanyLanguage();
    }
  }, [authCompanyLanguage]);

  // Função para gerar cor consistente baseada em uma string (contactId ou participant)
  const generateColorFromString = (str) => {
    if (!str) return "#dcf8c6"; // Cor padrão
    
    // Hash simples da string para gerar um número
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Paleta de cores agradáveis para mensagens
    const colors = [
      "#D1F2EB", // Verde claro
      "#D6EAF8", // Azul claro
      "#FCF3CF", // Amarelo claro
      "#F9E79F", // Dourado claro
      "#D5F4E6", // Menta
      "#E8DAEF", // Roxo claro
      "#FADBD8", // Rosa claro
      "#F5CBA7", // Laranja claro
      "#AED6F1", // Azul céu
      "#ABEBC6", // Verde suave
      "#F8BBD0", // Rosa suave
      "#DCEDC8", // Verde limão
      "#FFF9C4", // Amarelo suave
      "#E1BEE7", // Lavanda
      "#FFCCBC", // Pêssego
    ];
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Função para gerar cor da borda (mais escura) baseada na cor de fundo
  const generateBorderColor = (backgroundColor) => {
    // Converte hex para RGB e escurece
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Escurece 30%
    const darken = (val) => Math.max(0, Math.floor(val * 0.7));
    
    return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
  };

  // Função para extrair nome do usuário da empresa
  const getCompanyUserName = (message) => {
    // Tentar pegar o nome do participant ou do contato
    if (message.participant) {
      // Para grupos, o participant pode ter o número do telefone
      // Formato: 5511999999999@s.whatsapp.net
      const phone = message.participant.split("@")[0];
      return phone.slice(-4); // Últimos 4 dígitos
    }
    if (message.contact?.name) {
      return message.contact.name;
    }
    return "Equipe";
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        if (ticketId === undefined) return;
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });

          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
            setLoading(false);
          }

          if (pageNumber === 1 && data.messages.length > 1) {
            scrollToBottom();
          }
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchMessages();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleReady = () => socket.emit("joinChatBox", `${ticket.id}`);
    const handleAppMessage = (data) => {
      if (data.action === "create" && data.message.ticketId === currentTicketId.current) {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });
        scrollToBottom();
      }

      if (data.action === "update" && data.message.ticketId === currentTicketId.current) {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    };

    socket.on("ready", handleReady);
    socket.on(`company-${companyId}-appMessage`, handleAppMessage);

    return () => {
      socket.off("ready", handleReady);
      socket.off(`company-${companyId}-appMessage`, handleAppMessage);
    };
  }, [ticketId, ticket, socketManager]);

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  useEffect(() => {
    if (!scrollToMessageId || !onScrollToMessageDone) return;
    const el = document.getElementById(`message-${scrollToMessageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "background-color 0.5s ease";
      el.style.backgroundColor = "rgba(14, 165, 233, 0.2)";
      const t = setTimeout(() => {
        el.style.backgroundColor = "";
        onScrollToMessageDone();
      }, 2000);
      return () => clearTimeout(t);
    }
    onScrollToMessageDone();
  }, [scrollToMessageId, onScrollToMessageDone]);

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }

    if (loading) {
      return;
    }

    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorPosition({ left: rect.right, top: rect.bottom });
    setMenuAnchorOrigin({ vertical: "top", horizontal: "right" });
    setSelectedMessage(message);
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorPosition({ left: e.clientX, top: e.clientY });
    setMenuAnchorOrigin({ vertical: "top", horizontal: "left" });
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = () => {
    setAnchorPosition(null);
  };

  const checkMessageMedia = (message, index = -1) => {
    // Check for vCard first (can be in body even if mediaType is not set)
    const isVCard = message.mediaType === "vcard" || 
                    (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD"));
    
    if (isVCard) {
      return <ContactCard vcardString={message.body} ticketId={message.ticketId} />
    }

    if (message.mediaType === "locationMessage" && message.body.split('|').length >= 2) {
      let locationParts = message.body.split('|')
      let imageLocation = locationParts[0]
      let linkLocation = locationParts[1]

      let descriptionLocation = null

      if (locationParts.length > 2)
        descriptionLocation = message.body.split('|')[2]

      return <LocationPreview image={imageLocation} link={linkLocation} description={descriptionLocation} />
    }
    /*else if (message.mediaType === "multi_vcard") {
      console.log("multi_vcard")
      console.log(message)
    	
      if(message.body !== null && message.body !== "") {
        let newBody = JSON.parse(message.body)
        return (
          <>
            {
            newBody.map(v => (
              <VcardPreview contact={v.name} numbers={v.number} />
            ))
            }
          </>
        )
      } else return (<></>)
    }*/
    else if (message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaUrl} />;
    } else if (message.mediaType === "audio") {
      const nextAudios = index >= 0
        ? messagesList.slice(index + 1).filter((m) => m.mediaType === "audio").map((m) => ({ url: m.mediaUrl, messageId: m.id }))
        : [];
      return (
        <AudioMessagePlayer
          messageId={message.id}
          mediaUrl={message.mediaUrl}
          nextAudiosInQueue={nextAudios}
          onTranscribe={handleTranscribeAudio}
          transcriptionLoading={transcriptionLoading}
        />
      );
    } else if (message.mediaType === "video") {
      return (
        <video
          className={classes.messageMedia}
          src={message.mediaUrl}
          controls
        />
      );
    } else {
      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              {i18n.t("messagesList.header.buttons.download")}
            </Button>
          </div>
          <div style={{marginBottom: message.body === "" ? 8 : 0}}>
            <Divider />
          </div>
        </>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 1) {
      return <AccessTime fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 2) {
      return <Done fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 3) {
      return <DoneAll fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 4 || message.ack === 5) {
      return <DoneAll fontSize="small" className={classes.ackDoneAllIcon} />;
    }
  };

  const renderDailyTimestamps = (message, index, list = messagesList) => {
    if (index === 0) {
      return (
        <span
          className={classes.dailyTimestamp}
          key={`timestamp-${message.id}`}
        >
          <div className={classes.dailyTimestampText}>
            {format(parseISO(list[index].createdAt), "dd/MM/yyyy")}
          </div>
        </span>
      );
    }
    if (index < list.length - 1) {
      let messageDay = parseISO(list[index].createdAt);
      let previousMessageDay = parseISO(list[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span
            className={classes.dailyTimestamp}
            key={`timestamp-${message.id}`}
          >
            <div className={classes.dailyTimestampText}>
              {format(parseISO(list[index].createdAt), "dd/MM/yyyy")}
            </div>
          </span>
        );
      }
    }
    if (index === list.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };

  const renderNumberTicket = (message, index, list = messagesList) => {
    if (index < list.length && index > 0) {

      let messageTicket = message.ticketId;
      let connectionName = message.ticket?.whatsapp?.name;
      let previousMessageTicket = list[index - 1].ticketId;

      if (messageTicket !== previousMessageTicket) {
        return (
          <center>
            <div className={classes.ticketNunberClosed}>
              Conversa encerrada: {format(parseISO(list[index - 1].createdAt), "dd/MM/yyyy HH:mm:ss")}
            </div>

            <div className={classes.ticketNunberOpen}>
              Conversa iniciada: {format(parseISO(message.createdAt), "dd/MM/yyyy HH:mm:ss")}
            </div>
          </center>
        );
      }
    }
  };

  const renderMessageDivider = (message, index, list = messagesList) => {
    if (index < list.length && index > 0) {
      let messageUser = list[index].fromMe;
      let previousMessageUser = list[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const renderQuotedMessage = (message) => {
    const quoted = message.quotedMsg;
    if (!quoted) return null;

    const isTextMessage = !quoted.mediaType || quoted.mediaType === "chat" || quoted.mediaType === "conversation" || quoted.mediaType === "extendedTextMessage";
    const isMediaMessage = ["audio", "video", "image", "application", "document", "contactMessage", "vcard", "locationMessage"].includes(quoted.mediaType);
    const showText = isTextMessage || (!isMediaMessage && (quoted.body || quoted.isDeleted));
    const handleQuotedClick = quoted.id && onScrollToMessageRequest
      ? () => onScrollToMessageRequest(quoted.id)
      : undefined;

    return (
      <div
        className={clsx(classes.quotedContainerLeft, {
          [classes.quotedContainerRight]: message.fromMe,
        })}
        onClick={handleQuotedClick}
        role={handleQuotedClick ? "button" : undefined}
        style={handleQuotedClick ? { cursor: "pointer" } : undefined}
      >
        <span
          className={clsx(classes.quotedSideColorLeft, {
            [classes.quotedSideColorRight]: quoted.fromMe,
          })}
        ></span>
        <div className={classes.quotedMsg}>
          {!quoted.fromMe && (
            <span className={classes.messageContactName}>
              {quoted.contact?.name}
            </span>
          )}

          {quoted.mediaType === "audio" && (
            <div className={classes.downloadMedia}>
              <AudioMessagePlayer
                messageId={quoted.id}
                mediaUrl={quoted.mediaUrl}
              />
            </div>
          )}
          {quoted.mediaType === "video" && (
            <video
              className={classes.messageMedia}
              src={quoted.mediaUrl}
              controls
            />
          )}
          {quoted.mediaType === "application" && (
            <div className={classes.downloadMedia}>
              <Button
                startIcon={<GetApp />}
                color="primary"
                variant="outlined"
                target="_blank"
                href={quoted.mediaUrl}
              >
                {i18n.t("messagesList.header.buttons.download")}
              </Button>
            </div>
          )}
          {quoted.mediaType === "image" && (
            <ModalImageCors imageUrl={quoted.mediaUrl} />
          )}
          {quoted.mediaType === "contactMessage" && (
            <span>{quoted.body}</span>
          )}
          {(showText || (quoted.body && !isMediaMessage)) && (
            <MarkdownWrapper>
              {quoted.isDeleted ? i18n.t("messagesList.deletedMessage") : (quoted.body && quoted.body.length > 100 ? `${quoted.body.slice(0, 100)}...` : (quoted.body || ""))}
            </MarkdownWrapper>
          )}
        </div>
      </div>
    );
  };

  // Componente auxiliar para renderizar mensagem com tradução
  const MessageWithTranslation = ({ message, index, fromMe, displayList }) => {
    const { translation, loading: translationLoading } = useMessageTranslation(
      message,
      companyLanguage,
      realTimeTranslationEnabled && !message.isDeleted && message.body && message.body.trim().length >= 10
    );

    const displayText = translation?.translatedText || message.body;
    const showTranslationBadge = translation?.translatedText && translation?.translationNeeded;

    if (fromMe) {
      // Mensagens enviadas (empresa)
      if (isGroup && message.participant) {
        const userIdentifier = message.participant;
        const backgroundColor = generateColorFromString(userIdentifier);
        const borderColor = generateBorderColor(backgroundColor);

        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index, displayList)}
            {renderNumberTicket(message, index, displayList)}
            {renderMessageDivider(message, index, displayList)}
            <div className={clsx(classes.messageWithReactionsWrapper, classes.messageWithReactionsWrapperRight)} onContextMenu={(e) => handleContextMenu(e, message)}>
            <div 
              id={`message-${message.id}`}
              className={classes.messageLeft}
              style={{ 
                backgroundColor: backgroundColor,
              }}
            >
              <IconButton
                variant="contained"
                size="small"
                id="messageActionsButton"
                disabled={message.isDeleted}
                className={classes.messageActionsButton}
                onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
              >
                <ExpandMore />
              </IconButton>
              {((message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD")))
              ) && checkMessageMedia(message, index)}
              <div
                className={clsx(classes.textContentItem, {
                  [classes.textContentItemDeleted]: message.isDeleted,
                  [classes.textContentItemEdited]: message.isEdited,
                  [classes.messageInternal]: message.isInternal,
                  [classes.messageRightCompanyUser]: true,
                })}
                style={{
                  borderLeftColor: borderColor,
                }}
              >
                {message.isDeleted && (
                  <Block
                    color="disabled"
                    fontSize="small"
                    className={classes.deletedIcon}
                  />
                )}
                {message.quotedMsg && renderQuotedMessage(message)}
                <MarkdownWrapper>
                  {(message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD"))) ? null : displayText}
                </MarkdownWrapper>
                {showTranslationBadge && (
                  <span className={classes.translationBadge}>
                    {i18n.t("messagesList.translation.badge")}
                  </span>
                )}
                {message.isInternal && (
                  <span className={classes.internalBadge}>
                    🔒 INTERNA {ticket.user?.name ? `(${ticket.user.name})` : ""}
                  </span>
                )}
                <span className={classes.timestamp}>
                  {message.isForwarded && <span>{i18n.t("messagesList.forwarded")} </span>}
                  {message.isEdited && <span>{i18n.t("messagesList.edited")} </span>}
                  {format(parseISO(message.createdAt), "HH:mm")}
                  {renderMessageAck(message)}
                </span>
              </div>
            </div>
            {renderMessageReactions(message.id)}
            </div>
          </React.Fragment>
        );
      } else {
        // Mensagens fromMe normais (não em grupo)
        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index, displayList)}
            {renderNumberTicket(message, index, displayList)}
            {renderMessageDivider(message, index, displayList)}
            <div className={clsx(classes.messageWithReactionsWrapper, classes.messageWithReactionsWrapperRight)} onContextMenu={(e) => handleContextMenu(e, message)}>
            <div id={`message-${message.id}`} className={clsx(classes.messageRight, {
              [classes.messageInternal]: message.isInternal,
            })}>
              <IconButton
                variant="contained"
                size="small"
                id="messageActionsButton"
                disabled={message.isDeleted}
                className={classes.messageActionsButton}
                onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
              >
                <ExpandMore />
              </IconButton>
              {((message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD")))
              ) && checkMessageMedia(message, index)}
              <div
                className={clsx(classes.textContentItem, {
                  [classes.textContentItemDeleted]: message.isDeleted,
                  [classes.textContentItemEdited]: message.isEdited,
                })}
              >
                {message.isDeleted && (
                  <Block
                    color="disabled"
                    fontSize="small"
                    className={classes.deletedIcon}
                  />
                )}
                {message.quotedMsg && renderQuotedMessage(message)}
                <MarkdownWrapper>
                  {(message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD"))) ? null : displayText}
                </MarkdownWrapper>
                {showTranslationBadge && (
                  <span className={classes.translationBadge}>
                    {i18n.t("messagesList.translation.badge")}
                  </span>
                )}
                {message.isInternal && (
                  <span className={classes.internalBadge}>
                    🔒 INTERNA {ticket.user?.name ? `(${ticket.user.name})` : ""}
                  </span>
                )}
                <span className={classes.timestamp}>
                  {message.isForwarded && <span>{i18n.t("messagesList.forwarded")} </span>}
                  {message.isEdited && <span>{i18n.t("messagesList.edited")} </span>}
                  {format(parseISO(message.createdAt), "HH:mm")}
                  {renderMessageAck(message)}
                </span>
              </div>
            </div>
            {renderMessageReactions(message.id)}
            </div>
          </React.Fragment>
        );
      }
    } else {
      // Mensagens recebidas (clientes)
      return (
        <React.Fragment key={message.id}>
          {renderDailyTimestamps(message, index, displayList)}
          {renderNumberTicket(message, index, displayList)}
          {renderMessageDivider(message, index, displayList)}
          <div className={classes.messageWithReactionsWrapper} onContextMenu={(e) => handleContextMenu(e, message)}>
          <div id={`message-${message.id}`} className={classes.messageLeft}>
            <IconButton
              variant="contained"
              size="small"
              id="messageActionsButton"
              disabled={message.isDeleted}
              className={classes.messageActionsButton}
              onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
            >
              <ExpandMore />
            </IconButton>
            {isGroup && (
              <span className={classes.messageContactName}>
                {message.contact?.name}
              </span>
            )}

            {message.isDeleted && (
              <div>
                <span className={"message-deleted"}>
                  {i18n.t("messagesList.deletedMessage")} &nbsp;
                  <Block
                    color="error"
                    fontSize="small"
                    className={classes.deletedIcon}
                  />
                </span>
              </div>
            )}

            {((message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD")))
            ) && checkMessageMedia(message, index)}
            <div className={classes.textContentItem}>
              {message.quotedMsg && renderQuotedMessage(message)}
              <MarkdownWrapper>
                {(message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD"))) ? null : displayText}
              </MarkdownWrapper>
              {showTranslationBadge && (
                <span className={classes.translationBadge}>
                  {i18n.t("messagesList.translation.badge")}
                </span>
              )}
              <span className={classes.timestamp}>
                {message.isForwarded && <span>{i18n.t("messagesList.forwarded")} </span>}
                {message.isEdited && <span>{i18n.t("messagesList.edited")} </span>}
                {format(parseISO(message.createdAt), "HH:mm")}
              </span>
            </div>
          </div>
          {renderMessageReactions(message.id)}
          </div>
        </React.Fragment>
      );
    }
  };

  const reactionsMap = React.useMemo(() => {
    const map = {};
    const byUser = {};
    messagesList
      .filter((m) => m.mediaType === "reactionMessage")
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .forEach((r) => {
        const targetId = r.quotedMsgId || r.quotedMsg?.id;
        if (!targetId) return;
        const userKey = r.fromMe ? "me" : (r.contactId || r.participant || r.id);
        if (!map[targetId]) map[targetId] = [];
        if (!byUser[targetId]) byUser[targetId] = {};
        if (byUser[targetId][userKey]) {
          const idx = map[targetId].findIndex((x) => x.id === byUser[targetId][userKey].id);
          if (idx >= 0) map[targetId].splice(idx, 1);
        }
        byUser[targetId][userKey] = r;
        map[targetId].push(r);
      });
    return map;
  }, [messagesList]);

  const [reactionPopover, setReactionPopover] = useState({ anchorEl: null, reactors: [], emoji: "" });

  const getReactorName = (r) => {
    if (r.fromMe) return ticket?.user?.name || i18n.t("messagesList.you") || "Você";
    return r.contact?.name || (r.participant ? r.participant.split("@")[0] : "") || i18n.t("messagesList.contact") || "Contato";
  };

  const renderMessageReactions = (messageId) => {
    const reactions = reactionsMap[messageId] || [];
    if (reactions.length === 0) return null;
    const grouped = {};
    reactions.forEach((r) => {
      const emoji = r.body || "👍";
      if (!grouped[emoji]) grouped[emoji] = [];
      grouped[emoji].push(r);
    });
    return (
      <div className={classes.messageReactions}>
        {Object.entries(grouped).map(([emoji, list]) => (
          <span
            key={emoji}
            className={classes.reactionEmoji}
            onClick={(e) => {
              e.stopPropagation();
              setReactionPopover({ anchorEl: e.currentTarget, reactors: list, emoji });
            }}
          >
            {emoji}
            {list.length > 1 && (
              <span style={{ marginLeft: 2, fontSize: "0.7rem", opacity: 0.8 }}>
                {list.length}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  const renderMessages = () => {
    const displayableMessages = messagesList.filter((m) => m.mediaType !== "reactionMessage");
    if (displayableMessages.length > 0) {
      const viewMessagesList = displayableMessages.map((message, index) => {
        if (message.mediaType === "call_log") {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index, displayableMessages)}
              {renderNumberTicket(message, index, displayableMessages)}
              {renderMessageDivider(message, index, displayableMessages)}
              <div id={`message-${message.id}`} className={classes.messageCenter} onContextMenu={(e) => handleContextMenu(e, message)}>
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButton>
                {isGroup && (
                  <span className={classes.messageContactName}>
                    {message.contact?.name}
                  </span>
                )}
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17" width="20" height="17">
                    <path fill="#df3333" d="M18.2 12.1c-1.5-1.8-5-2.7-8.2-2.7s-6.7 1-8.2 2.7c-.7.8-.3 2.3.2 2.8.2.2.3.3.5.3 1.4 0 3.6-.7 3.6-.7.5-.2.8-.5.8-1v-1.3c.7-1.2 5.4-1.2 6.4-.1l.1.1v1.3c0 .2.1.4.2.6.1.2.3.3.5.4 0 0 2.2.7 3.6.7.2 0 1.4-2 .5-3.1zM5.4 3.2l4.7 4.6 5.8-5.7-.9-.8L10.1 6 6.4 2.3h2.5V1H4.1v4.8h1.3V3.2z"></path>
                  </svg> <span>{i18n.t("messagesList.lostCall")} {format(parseISO(message.createdAt), "HH:mm")}</span>
                </div>
              </div>
            </React.Fragment>
          );
        }

        if (!message.fromMe) {
          // Mensagens recebidas (clientes)
          return <MessageWithTranslation key={message.id} message={message} index={index} fromMe={false} displayList={displayableMessages} />;
        } else {
          // Mensagens fromMe (enviadas pela empresa) em GRUPOS
          // Cada número/participant diferente recebe uma cor diferente
          if (isGroup && message.participant) {
            const userIdentifier = message.participant;
            const backgroundColor = generateColorFromString(userIdentifier);
            const borderColor = generateBorderColor(backgroundColor);

            return (
              <React.Fragment key={message.id}>
                {renderDailyTimestamps(message, index, displayableMessages)}
                {renderNumberTicket(message, index, displayableMessages)}
                {renderMessageDivider(message, index, displayableMessages)}
                <div className={clsx(classes.messageWithReactionsWrapper, classes.messageWithReactionsWrapperRight)} onContextMenu={(e) => handleContextMenu(e, message)}>
                <div 
                  id={`message-${message.id}`}
                  className={classes.messageLeft}
                  style={{ 
                    backgroundColor: backgroundColor,
                  }}
                >
                  <IconButton
                    variant="contained"
                    size="small"
                    id="messageActionsButton"
                    disabled={message.isDeleted}
                    className={classes.messageActionsButton}
                    onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                  >
                    <ExpandMore />
                  </IconButton>
                  {((message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD")))
                    //|| message.mediaType === "multi_vcard" 
                  ) && checkMessageMedia(message, index)}
                  <div
                    className={clsx(classes.textContentItem, {
                      [classes.textContentItemDeleted]: message.isDeleted,
                      [classes.textContentItemEdited]: message.isEdited,
                      [classes.messageInternal]: message.isInternal,
                      [classes.messageRightCompanyUser]: true,
                    })}
                    style={{
                      borderLeftColor: borderColor,
                    }}
                  >
                    {message.isDeleted && (
                      <Block
                        color="disabled"
                        fontSize="small"
                        className={classes.deletedIcon}
                      />
                    )}
                    {message.isInternal && (
                      <span className={classes.internalBadge}>🔒 INTERNA</span>
                    )}
                    {message.quotedMsg && renderQuotedMessage(message)}
                    <MarkdownWrapper>{(message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD"))) ? null : message.body}</MarkdownWrapper>
                    {message.isInternal && ticket?.user?.name && (
                      <div className={classes.internalSignature}>
                        — {ticket.user.name}
                      </div>
                    )}
                    <span className={classes.timestamp}>
                      {message.isForwarded && <span>{i18n.t("messagesList.forwarded")} </span>}
                      {message.isEdited && <span>{i18n.t("messagesList.edited")}</span>}
                      {format(parseISO(message.createdAt), "HH:mm")}
                      {!message.isInternal && renderMessageAck(message)}
                    </span>
                  </div>
                </div>
                {renderMessageReactions(message.id)}
                </div>
              </React.Fragment>
            );
          } else {
            // Mensagens fromMe em conversas individuais (comportamento padrão - direita, verde)
            return (
              <React.Fragment key={message.id}>
                {renderDailyTimestamps(message, index, displayableMessages)}
                {renderNumberTicket(message, index, displayableMessages)}
                {renderMessageDivider(message, index, displayableMessages)}
                <div className={clsx(classes.messageWithReactionsWrapper, classes.messageWithReactionsWrapperRight)} onContextMenu={(e) => handleContextMenu(e, message)}>
                <div id={`message-${message.id}`} className={classes.messageRight}>
                  <IconButton
                    variant="contained"
                    size="small"
                    id="messageActionsButton"
                    disabled={message.isDeleted}
                    className={classes.messageActionsButton}
                    onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                  >
                    <ExpandMore />
                  </IconButton>
                  {((message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD")))
                    //|| message.mediaType === "multi_vcard" 
                  ) && checkMessageMedia(message, index)}
                  <div
                    className={clsx(classes.textContentItem, {
                      [classes.textContentItemDeleted]: message.isDeleted,
                      [classes.textContentItemEdited]: message.isEdited,
                      [classes.messageInternal]: message.isInternal,
                    })}
                  >
                    {message.isDeleted && (
                      <Block
                        color="disabled"
                        fontSize="small"
                        className={classes.deletedIcon}
                      />
                    )}
                    {message.isInternal && (
                      <span className={classes.internalBadge}>🔒 INTERNA</span>
                    )}
                    {message.quotedMsg && renderQuotedMessage(message)}
                    <MarkdownWrapper>{(message.mediaType === "locationMessage" || message.mediaType === "vcard" || (message.body && message.body.trim().toUpperCase().startsWith("BEGIN:VCARD"))) ? null : message.body}</MarkdownWrapper>
                    {message.isInternal && ticket?.user?.name && (
                      <div className={classes.internalSignature}>
                        — {ticket.user.name}
                      </div>
                    )}
                    <span className={classes.timestamp}>
                      {message.isForwarded && <span>{i18n.t("messagesList.forwarded")} </span>}
                      {message.isEdited && <span>{i18n.t("messagesList.edited")}</span>}
                      {format(parseISO(message.createdAt), "HH:mm")}
                      {!message.isInternal && renderMessageAck(message)}
                    </span>
                  </div>
                </div>
                {renderMessageReactions(message.id)}
                </div>
              </React.Fragment>
            );
          }
        }
      });
      return viewMessagesList;
    } else {
      return <div>{i18n.t("messagesList.saudation")}</div>;
    }
  };

  const handleAnalyzeChat = async () => {
    setAiModalOpen(true);
    setAiMode("analyze");
    setAiLoading(true);
    setAiAnalysis("");
    setAiKeyPoints([]);
    
    try {
      const { data } = await api.post("/chat-ai/analyze", {
        ticketId: ticketId,
      });
      setAiAnalysis(data.analysis || "");
      setAiKeyPoints(data.keyPoints || []);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações → Chave da API do Gemini");
      } else {
        toastError(err);
        toast.error("Erro ao analisar conversa");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarizeAudios = async () => {
    setAiModalOpen(true);
    setAiMode("audio");
    setAiLoading(true);
    setAiAudioSummary("");
    setAiAudioCount(0);
    
    try {
      const { data } = await api.post("/chat-ai/audio-summary", {
        ticketId: ticketId,
      });
      setAiAudioSummary(data.summary || "");
      setAiAudioCount(data.audioCount || 0);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações → Chave da API do Gemini");
      } else {
        toastError(err);
        toast.error("Erro ao resumir áudios");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSuggestResponse = async () => {
    setAiModalOpen(true);
    setAiMode("suggest");
    setAiLoading(true);
    setAiSuggestions([]);
    
    try {
      const { data } = await api.post("/chat-ai/analyze", {
        ticketId: ticketId,
        suggestResponse: true,
      });
      setAiSuggestions(data.suggestions || []);
      setAiKeyPoints(data.keyPoints || []);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações → Chave da API do Gemini");
      } else {
        toastError(err);
        toast.error("Erro ao sugerir resposta");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendQuestion = async (question) => {
    setAiLoading(true);
    try {
      const { data } = await api.post("/chat-ai/analyze", {
        ticketId: ticketId,
        question: question,
      });
      setAiAnalysis(data.analysis || "");
      setAiKeyPoints(data.keyPoints || []);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações → Chave da API do Gemini");
      } else {
        toastError(err);
        toast.error("Erro ao processar pergunta");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    // Copiar sugestão para área de transferência ou input
    navigator.clipboard.writeText(suggestion);
    toast.success("Sugestão copiada para área de transferência!");
  };

  const handleTranscribeAudio = async (messageId) => {
    setTranscriptionModalOpen(true);
    setTranscriptionLoading(true);
    setTranscription("");
    setTranscriptionError(null);
    setTranscriptionMessageId(messageId);
    
    try {
      const { data } = await api.post(`/chat-ai/transcribe/${messageId}`);
      setTranscription(data.transcription || "");
    } catch (err) {
      const errorCode = err.response?.data?.error;
      const friendlyMessage = errorCode && i18n.exists(`backendErrors.${errorCode}`)
        ? i18n.t(`backendErrors.${errorCode}`)
        : (errorCode || i18n.t("backendErrors.ERR_CHAT_AI_TRANSCRIBE"));
      setTranscriptionError(friendlyMessage);
      toastError(err);
    } finally {
      setTranscriptionLoading(false);
    }
  };

  // Expor handlers para o componente pai
  useEffect(() => {
    if (onAiHandlersReady && ticketId) {
      onAiHandlersReady({
        handleAnalyzeChat,
        handleSummarizeAudios,
        handleSuggestResponse
      });
    }
  }, [ticketId, onAiHandlersReady]);

  return (
    <div className={classes.messagesListWrapper}>
      <MessageOptionsMenu
        message={selectedMessage}
        anchorPosition={anchorPosition}
        anchorOrigin={menuAnchorOrigin}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
        ticketId={ticketId}
      />
      <div
        id="messagesList"
        className={classes.messagesList}
        onScroll={handleScroll}
      >
        {messagesList.length > 0 ? renderMessages() : []}
      </div>
      {loading && (
        <div>
          <CircularProgress className={classes.circleLoading} />
        </div>
      )}
      <ChatAIModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        mode={aiMode}
        loading={aiLoading}
        analysis={aiAnalysis}
        suggestions={aiSuggestions}
        keyPoints={aiKeyPoints}
        audioSummary={aiAudioSummary}
        audioCount={aiAudioCount}
        onSendQuestion={handleSendQuestion}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <AudioTranscriptionModal
        open={transcriptionModalOpen}
        onClose={() => {
          setTranscriptionModalOpen(false);
          setTranscription("");
          setTranscriptionError(null);
          setTranscriptionMessageId(null);
        }}
        onRetry={transcriptionError ? () => handleTranscribeAudio(transcriptionMessageId) : undefined}
        loading={transcriptionLoading}
        transcription={transcription}
        error={transcriptionError}
      />
      <Popover
        open={Boolean(reactionPopover.anchorEl)}
        anchorEl={reactionPopover.anchorEl}
        onClose={() => setReactionPopover({ anchorEl: null, reactors: [], emoji: "" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <div className={classes.reactionPopover}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {reactionPopover.emoji} {i18n.t("messagesList.reactedWith") || "Reagiu com"}
          </Typography>
          {reactionPopover.reactors.map((r, i) => (
            <Typography key={i} variant="body2">
              • {getReactorName(r)}
            </Typography>
          ))}
        </div>
      </Popover>
    </div>
  );
};

export default MessagesList;
