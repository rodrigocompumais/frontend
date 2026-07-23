import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green, grey, blue } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";

import VisibilityIcon from "@material-ui/icons/Visibility";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import AndroidIcon from "@material-ui/icons/Android";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ReplayIcon from "@material-ui/icons/Replay";
import FolderIcon from "@material-ui/icons/Folder";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import ContactAvatar from "../ContactAvatar";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import TicketMessagesDialog from "../TicketMessagesDialog";

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: "relative",
    padding: theme.spacing(1.5, 2),
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.05)" 
        : "rgba(0, 0, 0, 0.04)",
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.type === "dark"
        ? "rgba(25, 118, 210, 0.16)"
        : "rgba(25, 118, 210, 0.08)",
      "&:hover": {
        backgroundColor: theme.palette.type === "dark"
          ? "rgba(25, 118, 210, 0.24)"
          : "rgba(25, 118, 210, 0.12)",
      },
    },
  },
  ticketUnread: {
    backgroundColor: theme.palette.type === "dark"
      ? "rgba(25, 118, 210, 0.08)"
      : "rgba(25, 118, 210, 0.04)",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark"
        ? "rgba(25, 118, 210, 0.12)"
        : "rgba(25, 118, 210, 0.08)",
    },
  },

  pendingTicket: {
    cursor: "unset",
  },

  ticketQueueColor: {
    flex: "none",
    width: "4px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
    borderRadius: "0 2px 2px 0",
  },

  avatar: {
    width: 40,
    height: 40,
    marginRight: theme.spacing(1.5),
  },

  contactName: {
    fontWeight: 600,
    fontSize: "0.9375rem",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.25),
    paddingRight: 40, // Espaço para o botão de visualizar
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  contactNameWrapper: {
    position: "relative",
    width: "100%",
  },

  viewButton: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 4,
    zIndex: 1,
    backgroundColor: theme.palette.type === "dark"
      ? theme.palette.background.paper
      : "#FFFFFF",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.04)",
    },
  },

  attendantName: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
  },

  lastMessage: {
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
    marginTop: theme.spacing(0.25),
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    lineHeight: 1.4,
  },

  timeText: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
    marginBottom: theme.spacing(0.5),
  },

  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },

  actionButton: {
    minWidth: "auto",
    padding: theme.spacing(0.5, 1.5),
    fontSize: "0.75rem",
    textTransform: "none",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "none",
    "&:hover": {
      boxShadow: "none",
    },
  },

  acceptButton: {
    backgroundColor: green[600],
    color: "white",
    "&:hover": {
      backgroundColor: green[700],
    },
  },

  rejectButton: {
    backgroundColor: "#ef4444",
    color: "white",
    marginRight: "8px",
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },

  closeButton: {
    backgroundColor: "#ef4444",
    color: "white",
    "&:hover": {
      backgroundColor: "#dc2626",
    },
  },

  reopenButton: {
    backgroundColor: blue[600],
    color: "white",
    "&:hover": {
      backgroundColor: blue[700],
    },
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    maxWidth: "100%",
    paddingRight: 28,
  },

  metaChip: {
    height: 20,
    maxWidth: 120,
    fontSize: "0.6875rem",
    fontWeight: 500,
    borderRadius: 4,
    "& .MuiChip-label": {
      paddingLeft: 6,
      paddingRight: 6,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    "& .MuiChip-icon": {
      marginLeft: 4,
      marginRight: -2,
      fontSize: "0.875rem",
    },
  },

  queueChip: {
    height: 20,
    maxWidth: 110,
    fontSize: "0.6875rem",
    fontWeight: 600,
    color: "#fff",
    borderRadius: 4,
    "& .MuiChip-label": {
      paddingLeft: 6,
      paddingRight: 6,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },

  tagChip: {
    height: 18,
    maxWidth: 90,
    fontSize: "0.625rem",
    fontWeight: 500,
    borderRadius: 3,
    "& .MuiChip-label": {
      paddingLeft: 5,
      paddingRight: 5,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },

  avatarBadge: {
    "& .MuiBadge-badge": {
      backgroundColor: green[500],
      color: "white",
      fontSize: "0.6875rem",
      fontWeight: 600,
      minWidth: 20,
      height: 20,
      padding: "0 5px",
      borderRadius: "10px",
      border: `2px solid ${theme.palette.background.paper}`,
      boxShadow: theme.shadows[2],
    },
  },

  actionIconButton: {
    padding: theme.spacing(0.5),
    "&:hover": {
      backgroundColor: theme.palette.type === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)",
    },
  },

  closeIcon: {
    color: "#ef4444",
    "&:hover": {
      color: "#dc2626",
    },
  },

  reopenIcon: {
    color: blue[600],
    "&:hover": {
      color: blue[700],
    },
  },
}));

const TicketListItemCustom = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);

  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  const whatsAppName = ticket.whatsapp?.name || null;
  const tags = Array.isArray(ticket?.tags) ? ticket.tags : [];
  const visibleTags = tags.slice(0, 3);
  const extraTagsCount = Math.max(0, tags.length - visibleTags.length);

  useEffect(() => {
    isMounted.current = true;
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user?.name);
    } else {
      setTicketUser(null);
    }

    return () => {
      isMounted.current = false;
    };
  }, [ticket.id, ticket.userId, ticket.user]);

  const handleCloseTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id,
        queueId: ticket?.queue?.id,
        useIntegration: false,
        promptId: null,
        integrationId: null,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  const handleReopenTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });

      let settingIndex;

      try {
        const { data } = await api.get("/settings/");
        settingIndex = data.filter((s) => s.key === "sendGreetingAccepted");
      } catch (err) {
        toastError(err);
      }

      if (settingIndex?.[0]?.value === "enabled" && !ticket.isGroup) {
        handleSendMessage(ticket.id);
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleRejectTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id,
      });
      toast.success("Ticket rejeitado com sucesso!");
    } catch (err) {
      toastError(err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async (id) => {
    const msg = `{{ms}} *{{name}}*, meu nome é *${user?.name}* e agora vou prosseguir com seu atendimento!`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: `*Mensagem Automática:*\n${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const connectionLabel =
    ticket.whatsapp?.type === "instagram" ? "Instagram" : "WhatsApp";

  return (
    <React.Fragment key={ticket.id}>
      <TicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      />
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
          [classes.ticketUnread]: (ticket.unreadMessages || 0) > 0,
        })}
      >
        <Tooltip
          arrow
          placement="right"
          title={ticket.queue?.name || i18n.t("ticketsListItem.noQueue")}
        >
          <span
            style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
            className={classes.ticketQueueColor}
          />
        </Tooltip>

        <ListItemAvatar>
          <Badge
            className={classes.avatarBadge}
            badgeContent={ticket.unreadMessages > 0 ? ticket.unreadMessages : 0}
            max={99}
            overlap="circular"
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <ContactAvatar
              contact={ticket?.contact}
              contactId={ticket?.contactId}
              className={classes.avatar}
            />
          </Badge>
        </ListItemAvatar>

        <ListItemText
          disableTypography
          primary={
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1} minWidth={0} className={classes.contactNameWrapper}>
                <Typography className={classes.contactName} noWrap>
                  {ticket.contact.name}
                  {ticket.whatsapp?.type === "instagram" && (
                    <Tooltip title="Instagram">
                      <PhotoCameraIcon
                        fontSize="small"
                        style={{
                          color: "#E4405F",
                          marginLeft: 8,
                          verticalAlign: "middle",
                        }}
                      />
                    </Tooltip>
                  )}
                  {ticket.whatsapp?.type === "whatsapp" && (
                    <Tooltip title="WhatsApp">
                      <WhatsAppIcon
                        fontSize="small"
                        style={{
                          color: green[600],
                          marginLeft: 8,
                          verticalAlign: "middle",
                        }}
                      />
                    </Tooltip>
                  )}
                  {ticket.chatbot && (
                    <Tooltip title={i18n.t("ticketsListItem.tooltip.chatbot")}>
                      <AndroidIcon
                        fontSize="small"
                        style={{
                          color: grey[600],
                          marginLeft: 8,
                          verticalAlign: "middle",
                        }}
                      />
                    </Tooltip>
                  )}
                </Typography>
                {profile === "admin" && (
                  <Tooltip title={i18n.t("ticketsListItem.tooltip.peek")}>
                    <IconButton
                      size="small"
                      className={classes.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTicketMessageDialog(true);
                      }}
                    >
                      <VisibilityIcon fontSize="small" style={{ color: blue[600] }} />
                    </IconButton>
                  </Tooltip>
                )}
                {ticketUser && (
                  <Typography className={classes.attendantName} noWrap>
                    Atendente: {ticketUser}
                  </Typography>
                )}
                {!ticketUser && ticket.status === "pending" && (
                  <Typography className={classes.attendantName} noWrap>
                    Sem atendente
                  </Typography>
                )}

                <Box className={classes.metaRow}>
                  <Tooltip title={ticket.queue?.name || i18n.t("ticketsListItem.noQueue")}>
                    <Chip
                      size="small"
                      icon={<FolderIcon style={{ color: "#fff", fontSize: "0.875rem" }} />}
                      label={ticket.queue?.name || i18n.t("ticketsListItem.noQueue")}
                      className={classes.queueChip}
                      style={{
                        backgroundColor: ticket.queue?.color || "#7C7C7C",
                      }}
                    />
                  </Tooltip>

                  {whatsAppName && (
                    <Tooltip title={`${connectionLabel}: ${whatsAppName}`}>
                      <Chip
                        size="small"
                        icon={
                          ticket.whatsapp?.type === "instagram" ? (
                            <PhotoCameraIcon style={{ color: "#E4405F", fontSize: "0.875rem" }} />
                          ) : (
                            <WhatsAppIcon style={{ color: green[600], fontSize: "0.875rem" }} />
                          )
                        }
                        label={whatsAppName}
                        className={classes.metaChip}
                        variant="outlined"
                      />
                    </Tooltip>
                  )}

                  {visibleTags.map((tagItem) => (
                    <Tooltip title={tagItem.name} key={`ticket-tag-${ticket.id}-${tagItem.id}`}>
                      <Chip
                        size="small"
                        label={tagItem.name}
                        className={classes.tagChip}
                        style={{
                          backgroundColor: tagItem.color || "#9CA3AF",
                          color: "#fff",
                        }}
                      />
                    </Tooltip>
                  ))}
                  {extraTagsCount > 0 && (
                    <Tooltip title={tags.slice(3).map((t) => t.name).join(", ")}>
                      <Chip
                        size="small"
                        label={`+${extraTagsCount}`}
                        className={classes.tagChip}
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                </Box>

                {ticket.fromMe === false && ticket.status !== "pending" && (
                  <Chip
                    size="small"
                    label={i18n.t("ticketsListItem.awaitingResponse")}
                    style={{
                      marginTop: 4,
                      height: 18,
                      fontSize: "0.65rem",
                      backgroundColor: "rgba(237, 108, 2, 0.15)",
                      color: "#ed6c02",
                    }}
                  />
                )}
                {ticket.lastMessage && (
                  <Typography className={classes.lastMessage}>
                    {ticket.lastMessage.includes('data:image/png;base64') ? (
                      "📍 Localização"
                    ) : (
                      <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                    )}
                  </Typography>
                )}
              </Box>
              <Box display="flex" flexDirection="column" alignItems="flex-end" ml={1}>
                <Box display="flex" alignItems="center">
                  <Typography className={classes.timeText} style={{ marginRight: 4 }}>
                    {ticket.updatedAt &&
                      (isSameDay(parseISO(ticket.updatedAt), new Date())
                        ? format(parseISO(ticket.updatedAt), "HH:mm")
                        : format(parseISO(ticket.updatedAt), "dd/MM/yyyy"))}
                  </Typography>
                  {ticket.status !== "pending" && ticket.status !== "closed" && (
                    <Tooltip title={i18n.t("ticketsList.buttons.closed")}>
                      <IconButton
                        size="small"
                        className={`${classes.actionIconButton} ${classes.closeIcon}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTicket(ticket.id);
                        }}
                        disabled={loading}
                        aria-label="finalizar ticket"
                      >
                        {loading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CheckCircleIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                  {ticket.status === "closed" && (
                    <Tooltip title={i18n.t("ticketsList.buttons.reopen")}>
                      <IconButton
                        size="small"
                        className={`${classes.actionIconButton} ${classes.reopenIcon}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReopenTicket(ticket.id);
                        }}
                        disabled={loading}
                        aria-label="reabrir ticket"
                      >
                        {loading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <ReplayIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          }
          secondary={
            ticket.status === "pending" && (
              <Box className={classes.actionButtons}>
                <ButtonWithSpinner
                  className={`${classes.actionButton} ${classes.rejectButton}`}
                  size="small"
                  loading={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectTicket(ticket.id);
                  }}
                >
                  Rejeitar
                </ButtonWithSpinner>
                <ButtonWithSpinner
                  className={`${classes.actionButton} ${classes.acceptButton}`}
                  size="small"
                  loading={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcepptTicket(ticket.id);
                  }}
                >
                  {i18n.t("ticketsList.buttons.accept")}
                </ButtonWithSpinner>
              </Box>
            )
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
};

export default TicketListItemCustom;
