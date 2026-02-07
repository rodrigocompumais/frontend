import React, { useState, useEffect, useContext, useRef } from "react";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";
import { isNil } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import IconButton from "@material-ui/core/IconButton";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";
import ClearIcon from "@material-ui/icons/Clear";
import MicIcon from "@material-ui/icons/Mic";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import EditIcon from "@material-ui/icons/Edit";
import { FormControlLabel, Switch, Dialog, DialogContent, Box, Typography } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { isString, isEmpty, isObject, has } from "lodash";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import VisibilityIcon from "@material-ui/icons/Visibility";
import AlternateEmailIcon from "@material-ui/icons/AlternateEmail";
import Popover from "@material-ui/core/Popover";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import axios from "axios";

import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";

import useQuickMessages from "../../hooks/useQuickMessages";
import ChatAIButton from "../ChatAIButton";
import MessageImproveModal from "../MessageImproveModal";
import { toast } from "react-toastify";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    backgroundColor: theme.palette.bordabox, //DARK MODE PLW DESIGN//
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },

  newMessageBox: {
    backgroundColor: theme.palette.newmessagebox, //DARK MODE PLW DESIGN//
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },

  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    backgroundColor: theme.palette.inputdigita, //DARK MODE PLW DESIGN//
    display: "flex",
    borderRadius: 20,
    flex: 1,
  },

  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
  },

  sendMessageIcons: {
    color: "grey",
  },

  uploadInput: {
    display: "none",
  },

  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    gap: "8px",
    flexWrap: "wrap",
  },
  previewModal: {
    "& .MuiDialog-paper": {
      maxWidth: "90vw",
      maxHeight: "90vh",
      backgroundColor: "rgba(0, 0, 0, 0.95)",
      borderRadius: theme.spacing(2),
    },
  },
  previewModalContent: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
    minHeight: "400px",
    maxHeight: "80vh",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "80vh",
    objectFit: "contain",
    borderRadius: theme.spacing(1),
  },
  previewNavButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    zIndex: 10,
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    "&:disabled": {
      opacity: 0.3,
    },
  },
  previewNavButtonLeft: {
    left: theme.spacing(2),
  },
  previewNavButtonRight: {
    right: theme.spacing(2),
  },
  previewIndicators: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  previewIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    cursor: "pointer",
    transition: "all 0.3s",
    "&.active": {
      backgroundColor: "#FFFFFF",
      width: "24px",
      borderRadius: "4px",
    },
  },
  previewImageInfo: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#FFFFFF",
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(1),
    textAlign: "center",
  },
  previewButton: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: "#FFFFFF",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },

  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },

  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },

  audioLoading: {
    color: green[500],
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },

  cancelAudioIcon: {
    color: "red",
  },

  sendAudioIcon: {
    color: "green",
  },

  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    padding: "8px 12px",
  },

  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },
}));

const EmojiOptions = (props) => {
  const { disabled, showEmoji, setShowEmoji, handleAddEmoji } = props;
  const classes = useStyles();
  return (
    <>
      <IconButton
        aria-label="emojiPicker"
        component="span"
        disabled={disabled}
        onClick={(e) => setShowEmoji((prevState) => !prevState)}
      >
        <MoodIcon className={classes.sendMessageIcons} />
      </IconButton>
      {showEmoji ? (
        <div className={classes.emojiBox}>
          <Picker
            perLine={16}
            showPreview={false}
            showSkinTones={false}
            onSelect={handleAddEmoji}
          />
        </div>
      ) : null}
    </>
  );
};

const SignSwitch = (props) => {
  const { width, setSignMessage, signMessage } = props;
  if (isWidthUp("md", width)) {
    return (
      <FormControlLabel
        style={{ marginRight: 7, color: "gray", display: "flex", alignItems: "center" }}
        label={
          <EditIcon style={{ fontSize: 18, marginRight: 4 }} />
        }
        labelPlacement="start"
        control={
          <Switch
            size="small"
            checked={signMessage}
            onChange={(e) => {
              setSignMessage(e.target.checked);
            }}
            name="showAllTickets"
            color="primary"
          />
        }
      />
    );
  }
  return null;
};

const FileInput = (props) => {
  const { handleChangeMedias, disableOption } = props;
  const classes = useStyles();
  return (
    <>
      <input
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption()}
        className={classes.uploadInput}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <IconButton
          aria-label="upload"
          component="span"
          disabled={disableOption()}
        >
          <AttachFileIcon className={classes.sendMessageIcons} />
        </IconButton>
      </label>
    </>
  );
};

const ActionButtons = (props) => {
  const {
    inputMessage,
    loading,
    recording,
    ticketStatus,
    handleSendMessage,
    handleCancelAudio,
    handleUploadAudio,
    handleStartRecording,
  } = props;
  const classes = useStyles();
  if (inputMessage) {
    return (
      <IconButton
        aria-label="sendMessage"
        component="span"
        onClick={handleSendMessage}
        disabled={loading}
      >
        <SendIcon className={classes.sendMessageIcons} />
      </IconButton>
    );
  } else if (recording) {
    return (
      <div className={classes.recorderWrapper}>
        <IconButton
          aria-label="cancelRecording"
          component="span"
          fontSize="large"
          disabled={loading}
          onClick={handleCancelAudio}
        >
          <HighlightOffIcon className={classes.cancelAudioIcon} />
        </IconButton>
        {loading ? (
          <div>
            <CircularProgress className={classes.audioLoading} />
          </div>
        ) : (
          <RecordingTimer />
        )}

        <IconButton
          aria-label="sendRecordedAudio"
          component="span"
          onClick={handleUploadAudio}
          disabled={loading}
        >
          <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
        </IconButton>
      </div>
    );
  } else {
    return (
      <IconButton
        aria-label="showRecorder"
        component="span"
        disabled={loading || ticketStatus !== "open"}
        onClick={handleStartRecording}
      >
        <MicIcon className={classes.sendMessageIcons} />
      </IconButton>
    );
  }
};

const CustomInput = (props) => {
  const {
    loading,
    inputRef,
    ticketStatus,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleInputPaste,
    disableOption,
    handleQuickAnswersClick,
    isInternalMessage,
  } = props;
  const classes = useStyles();
  const [quickMessages, setQuickMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const { user } = useContext(AuthContext);

  const { list: listQuickMessages } = useQuickMessages();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const messages = await listQuickMessages({ companyId, userId: user.id });
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 35) {
          truncatedMessage = m.message.substring(0, 35) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
          mediaPath: m.mediaPath,
        };
      });
      setQuickMessages(options);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      isString(inputMessage) &&
      !isEmpty(inputMessage) &&
      inputMessage.length > 1
    ) {
      const firstWord = inputMessage.charAt(0);
      setPopupOpen(firstWord.indexOf("/") > -1);

      const filteredOptions = quickMessages.filter(
        (m) => m.label.indexOf(inputMessage) > -1
      );
      setOptions(filteredOptions);
    } else {
      setPopupOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMessage]);

  const onKeyPress = (e) => {
    if (loading || e.shiftKey) return;
    else if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const onPaste = (e) => {
    if (ticketStatus === "open") {
      handleInputPaste(e);
    }
  };

  const renderPlaceholder = () => {
    if (isInternalMessage) {
      return "Digite sua mensagem interna...";
    }
    if (ticketStatus === "open") {
      return i18n.t("messagesInput.placeholderOpen");
    }
    return i18n.t("messagesInput.placeholderClosed");
  };


  const setInputRef = (input) => {
    if (input) {
      input.focus();
      inputRef.current = input;
    }
  };

  return (
    <div className={classes.messageInputWrapper}>
      <Autocomplete
        freeSolo
        open={popupOpen}
        id="grouped-demo"
        value={inputMessage}
        options={options}
        closeIcon={null}
        getOptionLabel={(option) => {
          if (isObject(option)) {
            return option.label;
          } else {
            return option;
          }
        }}
        onChange={(event, opt) => {

          if (isObject(opt) && has(opt, "value") && isNil(opt.mediaPath)) {
            setInputMessage(opt.value);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          } else if (isObject(opt) && has(opt, "value") && !isNil(opt.mediaPath)) {
            handleQuickAnswersClick(opt);

            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          }
        }}
        onInputChange={(event, opt, reason) => {
          if (reason === "input") {
            setInputMessage(event.target.value);
          }
        }}
        onPaste={onPaste}
        onKeyPress={onKeyPress}
        style={{ width: "100%" }}
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...params.InputProps}
              {...rest}
              disabled={disableOption()}
              inputRef={setInputRef}
              placeholder={renderPlaceholder()}
              multiline
              className={classes.messageInput}
              maxRows={5}
            />
          );
        }}
      />
    </div>
  );
};

const MessageInputCustom = (props) => {
  const { ticketStatus, ticketId, isGroup = false, onAnalyzeChat, onSummarizeAudios, onSuggestResponse } = props;
  const classes = useStyles();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [improveModalOpen, setImproveModalOpen] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);
  const [improvedText, setImprovedText] = useState("");
  const [isInternalMessage, setIsInternalMessage] = useState(false);
  const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [pendingMentions, setPendingMentions] = useState([]);
  const [mentionFilter, setMentionFilter] = useState("");
  const inputWrapperRef = useRef(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const inputRef = useRef();
  const previewUrlsRef = useRef([]);
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  // Salvar rascunho no localStorage quando o usuário digita (com debounce)
  useEffect(() => {
    if (!ticketId) return;
    
    const draftKey = `messageDraft_${ticketId}`;
    const timeoutId = setTimeout(() => {
      if (inputMessage.trim()) {
        localStorage.setItem(draftKey, inputMessage);
      } else {
        // Se a mensagem estiver vazia, remover o rascunho
        localStorage.removeItem(draftKey);
      }
    }, 500); // Debounce de 500ms

    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputMessage, ticketId]);

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage]);

  // Carregar rascunho quando o ticketId muda
  useEffect(() => {
    if (ticketId) {
      const draftKey = `messageDraft_${ticketId}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        setInputMessage(savedDraft);
      } else {
        setInputMessage("");
      }
    } else {
      setInputMessage("");
    }
    
    inputRef.current.focus();
    return () => {
      // Não limpar o rascunho aqui, apenas limpar outros estados
      setShowEmoji(false);
      // Limpar preview URLs antes de limpar medias
      previewUrlsRef.current.forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
      previewUrlsRef.current = [];
      setMedias([]);
      setReplyingMessage(null);
      setPendingMentions([]);
      setParticipants([]);
      setMentionAnchorEl(null);
    };
  }, [ticketId, setReplyingMessage]);

  // Filtrar apenas imagens para o carrossel
  const imageMedias = medias.filter(media => media.preview);

  // Funções de navegação do carrossel
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageMedias.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < imageMedias.length - 1 ? prev + 1 : 0));
  };

  const handleIndicatorClick = (index) => {
    setCurrentImageIndex(index);
  };

  // Navegação por teclado no modal de preview
  useEffect(() => {
    if (!previewModalOpen || imageMedias.length <= 1) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageMedias.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev < imageMedias.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setPreviewModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModalOpen, imageMedias.length]);

  // const handleChangeInput = e => {
  // 	if (isObject(e) && has(e, 'value')) {
  // 		setInputMessage(e.value);
  // 	} else {
  // 		setInputMessage(e.target.value)
  // 	}
  // };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    // Criar preview URLs para imagens
    const mediasWithPreview = selectedMedias.map(media => {
      let preview = null;
      if (media.type.startsWith('image/')) {
        preview = URL.createObjectURL(media);
        previewUrlsRef.current.push(preview);
      }
      return {
        file: media,
        name: media.name,
        preview: preview,
        type: media.type
      };
    });
    setMedias(mediasWithPreview);
  };

  const handleInputPaste = (e) => {
    // Handling local files
    if (e.clipboardData.files.length > 0) {
      e.preventDefault(); // Prevent duplicate pasting if the input handles it too
      const selectedMedias = Array.from(e.clipboardData.files);

      const mediasWithPreview = selectedMedias.map(media => {
        let preview = null;
        if (media.type.startsWith('image/')) {
          preview = URL.createObjectURL(media);
          previewUrlsRef.current.push(preview);
        }
        return {
          file: media,
          name: media.name,
          preview: preview,
          type: media.type
        };
      });

      setMedias(prev => [...prev, ...mediasWithPreview]);
      return;
    }

    // Handling items (e.g. screenshots)
    if (e.clipboardData.items) {
      const items = Array.from(e.clipboardData.items);
      const files = [];

      items.forEach(item => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      });

      if (files.length > 0) {
        e.preventDefault();
        const mediasWithPreview = files.map(media => {
          let preview = null;
          if (media.type.startsWith('image/')) {
            preview = URL.createObjectURL(media);
            previewUrlsRef.current.push(preview);
          }
          return {
            file: media,
            name: media.name,
            preview: preview,
            type: media.type
          };
        });

        setMedias(prev => [...prev, ...mediasWithPreview]);
      }
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedMedias = Array.from(e.dataTransfer.files);

      const mediasWithPreview = selectedMedias.map(media => {
        let preview = null;
        if (media.type.startsWith('image/')) {
          preview = URL.createObjectURL(media);
          previewUrlsRef.current.push(preview);
        }
        return {
          file: media,
          name: media.name,
          preview: preview,
          type: media.type
        };
      });

      setMedias(prev => [...prev, ...mediasWithPreview]);
    }
  };

  const handleUploadQuickMessageMedia = async (blob, message) => {
    setLoading(true);
    try {
      const extension = blob.type.split("/")[1];

      const formData = new FormData();
      const filename = `${new Date().getTime()}.${extension}`;
      formData.append("medias", blob, filename);
      formData.append("body", message);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
      
      // Limpar rascunho após enviar áudio via quick message com sucesso
      if (ticketId) {
        const draftKey = `messageDraft_${ticketId}`;
        localStorage.removeItem(draftKey);
      }
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleQuickAnswersClick = async (value) => {
    if (value.mediaPath) {
      try {
        const { data } = await axios.get(value.mediaPath, {
          responseType: "blob",
        });

        handleUploadQuickMessageMedia(data, value.value);
        setInputMessage("");
        return;
        //  handleChangeMedias(response)
      } catch (err) {
        toastError(err);
      }
    }

    setInputMessage("");
    setInputMessage(value.value);
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      // Se media é um objeto com file, usar file, senão usar media diretamente (compatibilidade)
      const fileToUpload = media.file || media;
      formData.append("medias", fileToUpload);
      formData.append("body", media.name || fileToUpload.name);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
      
      // Limpar rascunho após enviar mídia com sucesso
      if (ticketId) {
        const draftKey = `messageDraft_${ticketId}`;
        localStorage.removeItem(draftKey);
      }
    } catch (err) {
      toastError(err);
    }

    // Limpar preview URLs para liberar memória
    previewUrlsRef.current.forEach((url) => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
    previewUrlsRef.current = [];

    setLoading(false);
    setMedias([]);
  };

  const fetchParticipants = () => {
    if (!ticketId || participants.length > 0) return;
    setParticipantsLoading(true);
    api.get(`/tickets/${ticketId}/group-participants`)
      .then(({ data }) => setParticipants(data.participants || []))
      .catch((err) => {
        toastError(err);
        setMentionAnchorEl(null);
      })
      .finally(() => setParticipantsLoading(false));
  };

  const handleMentionClick = (e) => {
    if (!isGroup || !ticketId) return;
    setMentionAnchorEl(e.currentTarget);
    setMentionFilter("");
    fetchParticipants();
  };

  const handleSelectMention = (participant) => {
    const mentionText = `@${participant.name} `;
    setInputMessage((prev) => {
      const lastAt = prev.lastIndexOf("@");
      if (lastAt >= 0) {
        return prev.slice(0, lastAt) + mentionText;
      }
      return prev + mentionText;
    });
    setPendingMentions((prev) => [...prev, participant.jid]);
    setMentionAnchorEl(null);
    setMentionFilter("");
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    if (!isGroup || isInternalMessage || !ticketId) return;
    const lastAt = inputMessage.lastIndexOf("@");
    if (lastAt >= 0) {
      const afterAt = inputMessage.slice(lastAt + 1);
      if (!afterAt.includes(" ") && !afterAt.includes("\n")) {
        setMentionFilter(afterAt.toLowerCase());
        setMentionAnchorEl(inputWrapperRef.current || inputRef.current);
        fetchParticipants();
        return;
      }
    }
    setMentionFilter("");
    setMentionAnchorEl(null);
  }, [inputMessage, isGroup, isInternalMessage, ticketId]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);

    const bodyText = isInternalMessage
      ? inputMessage.trim()
      : (signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim());

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: bodyText,
      quotedMsg: replyingMessage,
      isInternal: isInternalMessage,
      ...(isGroup && pendingMentions.length > 0 && { mentions: pendingMentions }),
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
      setIsInternalMessage(false);
      setPendingMentions([]);
      
      // Limpar rascunho após enviar mensagem com sucesso
      if (ticketId) {
        const draftKey = `messageDraft_${ticketId}`;
        localStorage.removeItem(draftKey);
      }
    } catch (err) {
      toastError(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
  };

  const handleCloseMentionPopover = () => {
    setMentionAnchorEl(null);
    setMentionFilter("");
  };

  const filteredParticipants = mentionFilter
    ? participants.filter((p) => {
        const nameLower = (p.name || "").toLowerCase();
        const jidLower = (p.jid || "").replace(/@.*$/, "").toLowerCase();
        const filterLower = mentionFilter.toLowerCase();
        return nameLower.includes(filterLower) || jidLower.includes(filterLower);
      })
    : participants;

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `audio-record-site-${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
      
      // Limpar rascunho após enviar áudio com sucesso
      if (ticketId) {
        const draftKey = `messageDraft_${ticketId}`;
        localStorage.removeItem(draftKey);
      }
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const disableOption = () => {
    return loading || recording || ticketStatus !== "open";
  };

  const handleImproveMessage = async () => {
    if (!ticketId) {
      toast.error("Ticket não encontrado");
      return;
    }

    setImproveModalOpen(true);
    setImproveLoading(true);
    setImprovedText("");

    try {
      // Preparar o payload
      const draftText = inputMessage.trim();

      // Construir payload - o backend pode ter comportamentos diferentes
      // baseado se há texto ou não na caixa
      let payload;

      if (draftText && draftText.length > 0) {
        // Quando há texto: enviar com draftText
        payload = {
          ticketId: ticketId,
          draftText: draftText,
        };
      } else {
        // Quando não há texto: tentar sem o campo primeiro
        // Se falhar, tentaremos com string vazia
        payload = {
          ticketId: ticketId,
        };
      }

      console.log("Enviando payload para /chat-ai/improve:", payload);
      console.log("Texto na caixa:", draftText ? `"${draftText.substring(0, 50)}..."` : "(vazio)");

      const response = await api.post("/chat-ai/improve", payload);
      const data = response.data;

      setImprovedText(data.improvedText || data.improved || "");
    } catch (err) {
      console.error("Erro ao melhorar mensagem:", err);
      console.error("Detalhes do erro:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      toastError(err);

      if (err.response?.status === 404) {
        toast.error("Rota não encontrada. Verifique se o backend está rodando e a rota /chat-ai/improve está disponível.");
      } else if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações");
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.response?.data?.detail || "Erro ao melhorar mensagem";
        toast.error(errorMessage);
        console.error("Mensagem de erro do backend:", errorMessage);
      } else {
        toast.error("Erro ao melhorar mensagem. Verifique sua conexão.");
      }
      setImproveModalOpen(false);
    } finally {
      setImproveLoading(false);
    }
  };

  const handleUseImprovedText = (text) => {
    setInputMessage(text);
    setImproveModalOpen(false);
    setImprovedText("");
    // Focar no input após aplicar o texto
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const getReplyPreviewText = (message) => {
    if (message.isDeleted) return "(Mensagem excluída)";
    if (message.body && message.body.trim()) {
      const text = message.body.trim();
      return text.length > 80 ? `${text.slice(0, 80)}...` : text;
    }
    if (message.mediaType === "audio") return "🎵 Áudio";
    if (message.mediaType === "image") return "🖼️ Imagem";
    if (message.mediaType === "video") return "🎬 Vídeo";
    if (message.mediaType === "document" || message.mediaType === "application") return "📄 Documento";
    if (message.mediaType === "contactMessage" || message.mediaType === "vcard") return "👤 Contato";
    if (message.mediaType === "locationMessage") return "📍 Localização";
    return "(Mensagem)";
  };

  const renderReplyingMessage = (message) => {
    const previewText = getReplyPreviewText(message);
    const senderName = message.fromMe ? "Você" : (message.contact?.name || "Cliente");
    return (
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          <div className={classes.replyginMsgBody}>
            <span className={classes.messageContactName}>
              Respondendo a {senderName}:
            </span>
            <div style={{ marginTop: 2 }}>{previewText}</div>
          </div>
        </div>
        <IconButton
          aria-label="cancel-reply"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
        >
          <ClearIcon className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };


  if (medias.length > 0)
    return (
      <>
        <Paper elevation={0} square className={classes.mainWrapper}>
          {replyingMessage && renderReplyingMessage(replyingMessage)}
          <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
          <IconButton
            aria-label="cancel-upload"
            component="span"
            onClick={(e) => {
              // Limpar preview URLs antes de limpar medias
              previewUrlsRef.current.forEach((url) => {
                if (url) {
                  URL.revokeObjectURL(url);
                }
              });
              previewUrlsRef.current = [];
              setMedias([]);
            }}
          >
            <CancelIcon className={classes.sendMessageIcons} />
          </IconButton>

          {loading ? (
            <div>
              <CircularProgress className={classes.circleLoading} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflowX: 'auto', padding: '4px' }}>
              {medias.map((media, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: 8,
                    overflow: 'hidden',
                    width: 60,
                    height: 60,
                    flexShrink: 0,
                    border: '1px solid #ddd'
                  }}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setPreviewModalOpen(true);
                  }}
                >
                  {media.preview ? (
                    <img
                      src={media.preview}
                      alt={media.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                      <AttachFileIcon style={{ fontSize: 24, color: '#666' }} />
                    </div>
                  )}
                </div>
              ))}
              {medias.length > 0 && (
                <Typography variant="caption" style={{ marginLeft: 8 }}>
                  {medias.length > 1 ? `+${medias.length - 1}` : ''}
                </Typography>
              )}
            </div>
          )}
          <IconButton
            aria-label="send-upload"
            component="span"
            onClick={handleUploadMedia}
            disabled={loading}
          >
            <SendIcon className={classes.sendMessageIcons} />
          </IconButton>
        </Paper>
        </Paper>

        {/* Modal de Preview com Carrossel */}
        <Dialog
          open={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          className={classes.previewModal}
          maxWidth={false}
          fullWidth
        >
          <DialogContent className={classes.previewModalContent} style={{ padding: 0 }}>
            {imageMedias.length > 0 ? (
              <>
                {/* Imagem atual */}
                <img
                  src={imageMedias[currentImageIndex]?.preview}
                  alt={imageMedias[currentImageIndex]?.name || 'Preview'}
                  className={classes.previewImage}
                />

                {/* Botão anterior */}
                {imageMedias.length > 1 && (
                  <IconButton
                    className={`${classes.previewNavButton} ${classes.previewNavButtonLeft}`}
                    onClick={handlePrevImage}
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                )}

                {/* Botão próximo */}
                {imageMedias.length > 1 && (
                  <IconButton
                    className={`${classes.previewNavButton} ${classes.previewNavButtonRight}`}
                    onClick={handleNextImage}
                    aria-label="Próxima imagem"
                  >
                    <ChevronRightIcon />
                  </IconButton>
                )}

                {/* Informações da imagem */}
                <Box className={classes.previewImageInfo}>
                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                    {imageMedias[currentImageIndex]?.name || 'Imagem'}
                  </Typography>
                  {imageMedias.length > 1 && (
                    <Typography variant="caption" style={{ opacity: 0.8 }}>
                      {currentImageIndex + 1} de {imageMedias.length}
                    </Typography>
                  )}
                </Box>

                {/* Indicadores */}
                {imageMedias.length > 1 && (
                  <Box className={classes.previewIndicators}>
                    {imageMedias.map((_, index) => (
                      <Box
                        key={index}
                        className={`${classes.previewIndicator} ${index === currentImageIndex ? 'active' : ''
                          }`}
                        onClick={() => handleIndicatorClick(index)}
                      />
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Box p={4} textAlign="center">
                <Typography variant="body1" color="textSecondary">
                  Nenhuma imagem para visualizar
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  else {
    return (
      <React.Fragment>
        <Paper
          square
          elevation={0}
          className={classes.mainWrapper}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {replyingMessage && renderReplyingMessage(replyingMessage)}
          <div className={classes.newMessageBox}>
            <EmojiOptions
              disabled={disableOption()}
              handleAddEmoji={handleAddEmoji}
              showEmoji={showEmoji}
              setShowEmoji={setShowEmoji}
            />

            {isGroup && (
              <IconButton
                size="small"
                onClick={handleMentionClick}
                disabled={disableOption() || isInternalMessage}
                title={i18n.t("messagesInput.mention") || "Mencionar"}
                style={{ padding: 8 }}
              >
                <AlternateEmailIcon fontSize="small" />
              </IconButton>
            )}

            <Popover
              open={Boolean(mentionAnchorEl)}
              anchorEl={mentionAnchorEl}
              onClose={handleCloseMentionPopover}
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              transformOrigin={{ vertical: "bottom", horizontal: "left" }}
              PaperProps={{ style: { maxHeight: 280, minWidth: 220 } }}
              disableEnforceFocus
              disableAutoFocus
            >
              {participantsLoading ? (
                <Box p={2} display="flex" justifyContent="center">
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List dense>
                  {filteredParticipants.map((p) => (
                    <ListItem
                      key={p.jid}
                      button
                      onClick={() => handleSelectMention(p)}
                      style={{ cursor: "pointer" }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <ListItemAvatar>
                        <Avatar style={{ width: 32, height: 32, fontSize: 14 }}>
                          {(p.name || p.jid).charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={p.name || p.jid.split("@")[0]} secondary={p.jid.split("@")[0]} />
                    </ListItem>
                  ))}
                  {filteredParticipants.length === 0 && !participantsLoading && (
                    <ListItem>
                      <ListItemText primary={i18n.t("messagesInput.noParticipants") || "Nenhum participante"} />
                    </ListItem>
                  )}
                </List>
              )}
            </Popover>

            <FileInput
              disableOption={disableOption}
              handleChangeMedias={handleChangeMedias}
            />

            <SignSwitch
              width={props.width}
              setSignMessage={setSignMessage}
              signMessage={signMessage}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isInternalMessage}
                  onChange={(e) => setIsInternalMessage(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label={
                isInternalMessage ? (
                  <LockIcon style={{ fontSize: 18, marginRight: 4 }} />
                ) : (
                  <LockOpenIcon style={{ fontSize: 18, marginRight: 4 }} />
                )
              }
              labelPlacement="start"
              style={{ marginLeft: 8, marginRight: 8, display: "flex", alignItems: "center" }}
            />

            <div ref={inputWrapperRef} style={{ flex: 1, minWidth: 0 }}>
              <CustomInput
                loading={loading}
                inputRef={inputRef}
                ticketStatus={ticketStatus}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSendMessage}
                handleInputPaste={handleInputPaste}
                disableOption={disableOption}
                handleQuickAnswersClick={handleQuickAnswersClick}
                isInternalMessage={isInternalMessage}
              />
            </div>

            {ticketId && (
              <ChatAIButton
                ticketId={ticketId}
                onImproveMessage={handleImproveMessage}
                simple={true}
              />
            )}

            <ActionButtons
              inputMessage={inputMessage}
              loading={loading}
              recording={recording}
              ticketStatus={ticketStatus}
              handleSendMessage={handleSendMessage}
              handleCancelAudio={handleCancelAudio}
              handleUploadAudio={handleUploadAudio}
              handleStartRecording={handleStartRecording}
            />
          </div>
        </Paper>
        <MessageImproveModal
          open={improveModalOpen}
          onClose={() => {
            setImproveModalOpen(false);
            setImprovedText("");
          }}
          loading={improveLoading}
          originalText={inputMessage.trim()}
          improvedText={improvedText}
          onUseImproved={handleUseImprovedText}
        />
      </React.Fragment>
    );
  }
};

export default withWidth()(MessageInputCustom);
