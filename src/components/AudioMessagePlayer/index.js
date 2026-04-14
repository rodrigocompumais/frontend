import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IconButton,
  Typography,
  LinearProgress,
  Button,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import { PlayArrow, Pause } from "@material-ui/icons";
import { useAudioPlayer } from "../../context/AudioPlayer/AudioPlayerContext";
import { i18n } from "../../translate/i18n";

const formatTime = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 220,
    maxWidth: 320,
    padding: theme.spacing(0.5, 0),
  },
  rootCompact: {
    minWidth: 160,
    maxWidth: 240,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  playBtn: {
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
    padding: theme.spacing(0.75),
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
    },
  },
  progressWrap: {
    flex: 1,
    cursor: "pointer",
    padding: `${theme.spacing(0.5)}px 0`,
  },
  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
    "& .MuiLinearProgress-bar": {
      borderRadius: 2,
      backgroundColor: "#25D366",
    },
  },
  times: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    minWidth: 36,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  transcription: {
    marginTop: theme.spacing(0.75),
    fontSize: "0.8125rem",
    lineHeight: 1.45,
    color: theme.palette.text.primary,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  transcribing: {
    marginTop: theme.spacing(0.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  errorRow: {
    marginTop: theme.spacing(0.5),
    fontSize: "0.75rem",
    color: theme.palette.error.main,
  },
}));

/**
 * Player estilo WhatsApp (play + barra de progresso) + transcrição automática.
 */
const AudioMessagePlayer = ({
  messageId,
  mediaUrl,
  nextAudiosInQueue = [],
  transcription,
  transcriptionStatus,
  transcriptionError,
  onRetryTranscription,
  compact = false,
}) => {
  const classes = useStyles();
  const {
    playAudio,
    currentPlayingMessageId,
    isPlaying,
    currentTime,
    duration,
    seekAudio,
  } = useAudioPlayer();
  const isThisPlaying = currentPlayingMessageId === messageId && isPlaying;
  const isThisCurrent = currentPlayingMessageId === messageId;
  const trackRef = useRef(null);
  const [metaDuration, setMetaDuration] = useState(0);
  const [showFullTranscription, setShowFullTranscription] = useState(false);

  useEffect(() => {
    if (!mediaUrl) return undefined;
    const a = new Audio();
    const onMeta = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) {
        setMetaDuration(a.duration);
      }
    };
    a.preload = "metadata";
    a.src = mediaUrl;
    a.addEventListener("loadedmetadata", onMeta);
    a.load();
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.src = "";
    };
  }, [mediaUrl]);

  const displayDuration = isThisCurrent && duration > 0 ? duration : metaDuration;
  const displayCurrent = isThisCurrent ? currentTime : 0;
  const progress =
    displayDuration > 0 ? Math.min(1, Math.max(0, displayCurrent / displayDuration)) : 0;

  const handleTogglePlay = () => {
    playAudio(mediaUrl, messageId, nextAudiosInQueue);
  };

  const handleSeek = useCallback(
    (e) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = rect.width > 0 ? x / rect.width : 0;
      if (isThisCurrent) {
        seekAudio(ratio);
      } else {
        playAudio(mediaUrl, messageId, nextAudiosInQueue);
        setTimeout(() => seekAudio(ratio), 200);
      }
    },
    [isThisCurrent, mediaUrl, messageId, nextAudiosInQueue, playAudio, seekAudio]
  );

  const transcriptionText = transcription && String(transcription).trim();
  const longText = transcriptionText && transcriptionText.length > 200;

  const statusPending = transcriptionStatus === "pending";
  const statusFailed = transcriptionStatus === "failed";
  const statusDone = transcriptionStatus === "completed" && transcriptionText;

  const renderTranscription = () => {
    if (compact) return null;
    if (statusPending) {
      return (
        <div className={classes.transcribing}>
          <CircularProgress size={14} />
          <span>{i18n.t("messagesList.audio.transcribing")}</span>
        </div>
      );
    }
    if (statusFailed) {
      return (
        <div className={classes.errorRow}>
          <Typography variant="caption" component="span" display="block">
            {transcriptionError || i18n.t("messagesList.audio.transcriptionFailed")}
          </Typography>
          {onRetryTranscription && (
            <Button size="small" color="primary" onClick={() => onRetryTranscription(messageId)} style={{ marginTop: 4 }}>
              {i18n.t("messagesList.audio.retryTranscription")}
            </Button>
          )}
        </div>
      );
    }
    if (statusDone) {
      const text = transcriptionText;
      if (longText && !showFullTranscription) {
        return (
          <div>
            <Typography variant="body2" className={classes.transcription} component="div" color="textSecondary">
              {text.slice(0, 200)}…
            </Typography>
            <Button size="small" onClick={() => setShowFullTranscription(true)} style={{ padding: "0 4px", minWidth: 0 }}>
              {i18n.t("messagesList.audio.viewTranscription")}
            </Button>
          </div>
        );
      }
      return (
        <div>
          <Typography variant="body2" className={classes.transcription} component="div">
            {text}
          </Typography>
          {longText && (
            <Button size="small" onClick={() => setShowFullTranscription(false)} style={{ padding: "0 4px", minWidth: 0 }}>
              {i18n.t("messagesList.audio.hideTranscription")}
            </Button>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={compact ? `${classes.root} ${classes.rootCompact}` : classes.root}>
      <div className={classes.row}>
        <IconButton size="small" className={classes.playBtn} onClick={handleTogglePlay} aria-label={isThisPlaying ? "pause" : "play"}>
          {isThisPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
        </IconButton>
        <div
          ref={trackRef}
          className={classes.progressWrap}
          onClick={handleSeek}
          role="presentation"
        >
          <LinearProgress variant="determinate" value={progress * 100} className={classes.bar} />
        </div>
        <span className={classes.times}>
          {formatTime(displayCurrent)} / {formatTime(displayDuration)}
        </span>
      </div>
      {renderTranscription()}
    </div>
  );
};

export default AudioMessagePlayer;
