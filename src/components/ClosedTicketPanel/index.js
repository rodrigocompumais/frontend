import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Paper,
  Typography,
  makeStyles,
  Chip,
  Box,
  CircularProgress,
  Button,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import MessagesList from "../MessagesList";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AudioPlayerProvider } from "../../context/AudioPlayer/AudioPlayerContext";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import { canUserViewTicket } from "../../utils/ticketEligibility";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  readOnlyBanner: {
    padding: theme.spacing(2),
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(249, 115, 22, 0.2)"
        : "rgba(249, 115, 22, 0.12)",
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
  },
  readOnlyIcon: {
    color: theme.palette.primary.main,
    fontSize: 32,
    marginTop: 2,
  },
  messagesArea: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  stepBadge: {
    display: "inline-block",
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
    margin: theme.spacing(1, 2, 0),
  },
}));

const ClosedTicketPanel = ({ ticketUuid, onBack }) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState({});
  const [contact, setContact] = useState({});

  useEffect(() => {
    setTicket({});
    setContact({});
    setLoading(true);

    const timer = setTimeout(async () => {
      if (!ticketUuid) return;
      try {
        const { data } = await api.get(`/tickets/u/${ticketUuid}`);
        const userCompanyId =
          user?.companyId ?? parseInt(localStorage.getItem("companyId") || "0", 10);
        if (data.companyId != null && Number(data.companyId) !== Number(userCompanyId)) {
          toast.error(i18n.t("tickets.toasts.unauthorized"));
          history.push("/tickets/finalizadas");
          return;
        }
        if (!canUserViewTicket(data, user)) {
          toast.error(i18n.t("tickets.toasts.unauthorized"));
          history.push("/tickets/finalizadas");
          return;
        }
        setTicket(data);
        setContact(data.contact || {});
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [ticketUuid, user, history]);

  useEffect(() => {
    if (!ticket?.id) return;
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);
    const handleTicket = (data) => {
      if (data.action === "update" && data.ticket?.id === ticket.id) {
        setTicket(data.ticket);
      }
    };
    socket.on(`company-${companyId}-ticket`, handleTicket);
    return () => {
      socket.off(`company-${companyId}-ticket`, handleTicket);
    };
  }, [ticket, socketManager]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!ticket?.id) {
    return null;
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      history.push("/tickets/finalizadas");
    }
  };

  return (
    <div className={classes.root}>
      {onBack && (
        <Box p={1} borderBottom={`1px solid`} style={{ borderColor: "inherit" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            color="primary"
            style={{ textTransform: "none", fontWeight: 600 }}
          >
            {i18n.t("ticketsHistory.backToSessions")}
          </Button>
        </Box>
      )}

      <span className={classes.stepBadge}>{i18n.t("ticketsHistory.step3Label")}</span>

      <TicketHeader loading={false}>
        <TicketInfo contact={contact} ticket={ticket} onClick={() => {}} />
      </TicketHeader>

      <div className={classes.readOnlyBanner}>
        <LockOutlinedIcon className={classes.readOnlyIcon} />
        <Box flex={1}>
          <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
            {i18n.t("ticketsHistory.readOnlyTitle")}
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 4, lineHeight: 1.5 }}>
            {i18n.t("ticketsHistory.readOnlyDesc")}
          </Typography>
          {ticket.whatsapp?.name && (
            <Chip
              size="small"
              label={`${i18n.t("ticketsHistory.connection")}: ${ticket.whatsapp.name}`}
              color="primary"
              style={{ marginTop: 8 }}
            />
          )}
        </Box>
      </div>

      <Typography
        variant="body2"
        color="textSecondary"
        style={{ padding: "8px 16px", lineHeight: 1.5 }}
      >
        {i18n.t("ticketsHistory.step3Hint")}
      </Typography>

      <Paper elevation={0} variant="outlined" className={classes.messagesArea}>
        <ReplyMessageProvider>
          <AudioPlayerProvider>
            <MessagesList ticket={ticket} ticketId={ticket.id} isGroup={ticket.isGroup} readOnly />
          </AudioPlayerProvider>
        </ReplyMessageProvider>
      </Paper>
    </div>
  );
};

export default ClosedTicketPanel;
