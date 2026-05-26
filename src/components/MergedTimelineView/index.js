import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  makeStyles,
  CircularProgress,
  Paper,
} from "@material-ui/core";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { format, parseISO, isValid } from "date-fns";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(2),
    ...theme.scrollbarStyles,
  },
  scrollHint: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(2),
    borderRadius: 10,
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(33, 150, 243, 0.12)"
        : "rgba(33, 150, 243, 0.08)",
    border: `1px solid ${theme.palette.info.light}`,
  },
  sessionDivider: {
    margin: theme.spacing(2, 0, 1.5),
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.default,
    borderRadius: 10,
    border: `2px solid ${theme.palette.primary.light}`,
  },
  dividerTitle: {
    fontWeight: 700,
    fontSize: "0.95rem",
  },
  bubbleOut: {
    alignSelf: "flex-end",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: 12,
    padding: theme.spacing(1.25, 1.75),
    marginBottom: theme.spacing(0.75),
    maxWidth: "85%",
    marginLeft: "auto",
  },
  bubbleIn: {
    alignSelf: "flex-start",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    padding: theme.spacing(1.25, 1.75),
    marginBottom: theme.spacing(0.75),
    maxWidth: "85%",
  },
  bubbleLabel: {
    fontSize: "0.7rem",
    opacity: 0.85,
    marginBottom: 4,
    fontWeight: 600,
  },
  messagesCol: {
    display: "flex",
    flexDirection: "column",
  },
}));

const formatDateTime = (value) => {
  if (!value) return "";
  try {
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    return isValid(d) ? format(d, "dd/MM/yyyy 'às' HH:mm") : "";
  } catch {
    return "";
  }
};

const formatTime = (value) => {
  if (!value) return "";
  try {
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    return isValid(d) ? format(d, "HH:mm") : "";
  } catch {
    return "";
  }
};

const MergedTimelineView = ({ contactId }) => {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const listRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const fetchTimeline = useCallback(
    async (older = false) => {
      if (!contactId) return;
      const params = { limit: 40 };
      if (older && messages.length > 0) {
        const first = messages[0];
        params.beforeCreatedAt = first.createdAt;
        params.beforeId = first.id;
      }

      try {
        if (older) setLoadingMore(true);
        else setLoading(true);

        const { data } = await api.get(
          `/tickets/history/contact/${contactId}/timeline`,
          { params }
        );

        const batch = data.messages || [];
        setHasMore(Boolean(data.hasMore));

        if (older) {
          setMessages((prev) => [...batch, ...prev]);
        } else {
          setMessages(batch);
        }
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [contactId, messages]
  );

  useEffect(() => {
    setMessages([]);
    fetchTimeline(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loadingMoreRef.current || !hasMore) return;
    if (el.scrollTop < 80) {
      loadingMoreRef.current = true;
      fetchTimeline(true);
    }
  };

  const renderMessage = (msg, index) => {
    const prev = messages[index - 1];
    const showDivider =
      !prev ||
      prev.ticketId !== msg.ticketId ||
      (msg.whatsappName && prev.whatsappName !== msg.whatsappName);

    const senderLabel = msg.fromMe
      ? i18n.t("ticketsHistory.messageFromCompany")
      : i18n.t("ticketsHistory.messageFromClient");

    return (
      <React.Fragment key={`${msg.id}-${index}`}>
        {showDivider && (
          <div className={classes.sessionDivider}>
            <Typography className={classes.dividerTitle} color="primary">
              {i18n.t("ticketsHistory.timelineBlockLabel")}
            </Typography>
            <Typography variant="body2" style={{ marginTop: 4 }}>
              {msg.whatsappName && (
                <>
                  <strong>{i18n.t("ticketsHistory.connection")}:</strong> {msg.whatsappName}
                  <br />
                </>
              )}
              {msg.createdAt && formatDateTime(msg.createdAt)}
            </Typography>
          </div>
        )}
        <div className={msg.fromMe ? classes.bubbleOut : classes.bubbleIn}>
          <Typography className={classes.bubbleLabel}>{senderLabel}</Typography>
          <Typography variant="body1" style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
            {msg.body || `[${msg.mediaType || "mídia"}]`}
          </Typography>
          <Typography variant="caption" style={{ opacity: 0.85, display: "block", marginTop: 4 }}>
            {formatTime(msg.createdAt)}
          </Typography>
        </div>
      </React.Fragment>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Paper className={classes.root} ref={listRef} onScroll={handleScroll} elevation={0}>
      <div className={classes.scrollHint}>
        <InfoOutlinedIcon color="primary" fontSize="small" />
        <Typography variant="body2" style={{ lineHeight: 1.5 }}>
          {i18n.t("ticketsHistory.timelineScrollHint")}
        </Typography>
      </div>

      {loadingMore && (
        <Box display="flex" justifyContent="center" p={1}>
          <CircularProgress size={24} />
        </Box>
      )}
      {messages.length === 0 ? (
        <Typography color="textSecondary" align="center" style={{ lineHeight: 1.6, padding: 16 }}>
          {i18n.t("ticketsHistory.noMessages")}
        </Typography>
      ) : (
        <div className={classes.messagesCol}>{messages.map(renderMessage)}</div>
      )}
    </Paper>
  );
};

export default MergedTimelineView;
