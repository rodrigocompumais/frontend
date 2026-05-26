import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  makeStyles,
  Avatar,
  CircularProgress,
  Paper,
  Button,
  Card,
  CardContent,
} from "@material-ui/core";
import { format, parseISO, isValid } from "date-fns";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ViewListIcon from "@material-ui/icons/ViewList";
import TimelineIcon from "@material-ui/icons/Timeline";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import ReplayIcon from "@material-ui/icons/Replay";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import MergedTimelineView from "../MergedTimelineView";

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
  header: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  stepBadge: {
    display: "inline-block",
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
    marginBottom: theme.spacing(1),
  },
  modeToggle: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.background.default
        : "#FAFAFA",
  },
  modeButton: {
    textTransform: "none",
    justifyContent: "flex-start",
    padding: theme.spacing(1.5, 2),
    borderRadius: 10,
    border: `2px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    "&.active": {
      borderColor: theme.palette.primary.main,
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(249, 115, 22, 0.15)"
          : "rgba(249, 115, 22, 0.1)",
    },
  },
  tabPanel: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(1.5, 2),
    ...theme.scrollbarStyles,
  },
  sessionCard: {
    marginBottom: theme.spacing(1.5),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
  },
  viewBtn: {
    marginTop: theme.spacing(1),
    textTransform: "none",
    fontWeight: 600,
  },
  sessionActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

const formatDate = (value) => {
  if (!value) return "";
  try {
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    return isValid(d) ? format(d, "dd/MM/yyyy 'às' HH:mm") : "";
  } catch {
    return "";
  }
};

const ClosedContactPanel = ({ contact, group, onBack }) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState("sessions");
  const [sessions, setSessions] = useState(group?.sessions || []);
  const [loading, setLoading] = useState(false);
  const [reopeningId, setReopeningId] = useState(null);

  const contactId = contact?.id;

  useEffect(() => {
    if (group?.sessions?.length) {
      setSessions(group.sessions);
      return;
    }
    if (!contactId) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tickets/history/contact/${contactId}`);
        setSessions(data.sessions || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contactId, group]);

  const displayContact = contact || group?.contact;

  const openSession = (session) => {
    if (session?.uuid) {
      history.push(`/tickets/finalizadas/${session.uuid}`);
    }
  };

  const canReopenSession = (session) =>
    session?.status === "closed" || session?.status === "rating";

  const handleReopenSession = async (session) => {
    if (!session?.id || !canReopenSession(session)) return;
    setReopeningId(session.id);
    try {
      await api.put(`/tickets/${session.id}`, {
        status: "open",
        userId: user?.id,
        queueId: session?.queue?.id ?? null,
      });
      toast.success(i18n.t("ticketsHistory.reopenSuccess"));
      history.push(`/tickets/${session.uuid}`);
    } catch (err) {
      toastError(err);
    } finally {
      setReopeningId(null);
    }
  };

  return (
    <div className={classes.root}>
      {onBack && (
        <Box p={1} borderBottom={`1px solid`} style={{ borderColor: "inherit" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            color="primary"
            style={{ textTransform: "none", fontWeight: 600 }}
          >
            {i18n.t("ticketsHistory.backToList")}
          </Button>
        </Box>
      )}

      <div className={classes.header}>
        <span className={classes.stepBadge}>{i18n.t("ticketsHistory.step2Label")}</span>
        <Box display="flex" alignItems="center" style={{ gap: 12 }}>
          <Avatar
            src={displayContact?.profilePicUrl}
            style={{ width: 56, height: 56 }}
          >
            {displayContact?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              {displayContact?.name || displayContact?.number}
            </Typography>
            {displayContact?.name && (
              <Typography variant="body1" color="textSecondary">
                {displayContact?.number}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 12, lineHeight: 1.5 }}>
          {i18n.t("ticketsHistory.step2Hint")}
        </Typography>
      </div>

      <div className={classes.modeToggle}>
        <Button
          fullWidth
          className={`${classes.modeButton} ${viewMode === "sessions" ? "active" : ""}`}
          onClick={() => setViewMode("sessions")}
          startIcon={<ViewListIcon color="primary" />}
        >
          <Box textAlign="left" ml={1}>
            <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
              {i18n.t("ticketsHistory.sessionsTabTitle")}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {i18n.t("ticketsHistory.sessionsTabDesc")}
            </Typography>
          </Box>
        </Button>
        <Button
          fullWidth
          className={`${classes.modeButton} ${viewMode === "timeline" ? "active" : ""}`}
          onClick={() => setViewMode("timeline")}
          startIcon={<TimelineIcon color="primary" />}
        >
          <Box textAlign="left" ml={1}>
            <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
              {i18n.t("ticketsHistory.timelineTabTitle")}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {i18n.t("ticketsHistory.timelineTabDesc")}
            </Typography>
          </Box>
        </Button>
      </div>

      <div className={classes.tabPanel}>
        {viewMode === "sessions" && (
          <div className={classes.list}>
            {loading ? (
              <Box p={3} display="flex" justifyContent="center">
                <CircularProgress size={32} />
              </Box>
            ) : sessions.length === 0 ? (
              <Typography
                color="textSecondary"
                align="center"
                style={{ padding: 24, lineHeight: 1.6 }}
              >
                {i18n.t("ticketsHistory.noSessions")}
              </Typography>
            ) : (
              sessions.map((session) => (
                <Card key={session.id} className={classes.sessionCard} variant="outlined">
                  <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar style={{ backgroundColor: "#25D366", width: 40, height: 40, marginRight: 12 }}>
                          <WhatsAppIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t("ticketsHistory.connection")}
                          </Typography>
                          <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                            {session.whatsapp?.name || "—"}
                          </Typography>
                        </Box>
                      </Box>
                      {session.user?.name && (
                        <Typography variant="body2" style={{ marginBottom: 4 }}>
                          <strong>{i18n.t("ticketsHistory.attendedBy")}:</strong> {session.user.name}
                        </Typography>
                      )}
                      {session.finishedAt && (
                        <Typography variant="body2" color="textSecondary">
                          <strong>{i18n.t("ticketsHistory.sessionEnded")}:</strong>{" "}
                          {formatDate(session.finishedAt)}
                        </Typography>
                      )}
                      {session.lastMessage && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{
                            marginTop: 8,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {session.lastMessage}
                        </Typography>
                      )}
                      <Box className={classes.sessionActions}>
                        <Button
                          size="small"
                          color="primary"
                          variant="contained"
                          className={classes.viewBtn}
                          style={{ marginTop: 0 }}
                          startIcon={<ChatBubbleOutlineIcon />}
                          onClick={() => openSession(session)}
                        >
                          {i18n.t("ticketsHistory.viewConversation")}
                        </Button>
                        {canReopenSession(session) && (
                          <Button
                            size="small"
                            color="secondary"
                            variant="outlined"
                            className={classes.viewBtn}
                            style={{ marginTop: 0 }}
                            startIcon={
                              reopeningId === session.id ? (
                                <CircularProgress size={18} />
                              ) : (
                                <ReplayIcon />
                              )
                            }
                            disabled={reopeningId === session.id}
                            onClick={() => handleReopenSession(session)}
                          >
                            {i18n.t("ticketsHistory.reopenConversation")}
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
        {viewMode === "timeline" && contactId && (
          <MergedTimelineView contactId={contactId} />
        )}
      </div>
    </div>
  );
};

export default ClosedContactPanel;
