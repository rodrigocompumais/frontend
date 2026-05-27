import React, { useEffect, useReducer, useState, useContext, useCallback, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import toastError from "../../errors/toastError";
import Popover from "@material-ui/core/Popover";
import Notifications from "@material-ui/icons/Notifications";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import AnnouncementIcon from "@material-ui/icons/Announcement";

import {
  Avatar,
  Badge,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  Paper,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  useTheme,
} from "@material-ui/core";
import api from "../../services/api";
import { isArray } from "lodash";
import moment from "moment";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import {
  getPriorityColor,
  getPriorityLabel,
  getPriorityBorderLeft,
  getHighestPriority,
  normalizePriority,
  PRIORITY_HIGH,
  filterUnseenAnnouncements,
  markAnnouncementsSeen,
} from "../../utils/announcementPriority";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    maxHeight: 3000,
    maxWidth: 5000,
    padding: theme.spacing(1),
    overflowY: "scroll",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
    ...theme.scrollbarStyles,
  },
  listItem: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.04)",
    },
  },
  listItemText: {
    color: theme.palette.text.primary,
    "& .MuiListItemText-primary": {
      color: theme.palette.text.primary,
    },
    "& .MuiListItemText-secondary": {
      color: theme.palette.text.secondary,
    },
  },
  badgeHigh: {
    "& .MuiBadge-badge": {
      backgroundColor: "#d32f2f",
      color: "#fff",
      fontWeight: 700,
      minWidth: 20,
      height: 20,
    },
  },
  badgeMedium: {
    "& .MuiBadge-badge": {
      backgroundColor: "#ed6c02",
      color: "#fff",
      fontWeight: 700,
      minWidth: 20,
      height: 20,
    },
  },
  badgeLow: {
    "& .MuiBadge-badge": {
      backgroundColor: "#757575",
      color: "#fff",
      fontWeight: 700,
      minWidth: 20,
      height: 20,
    },
  },
  loginDialogPaper: {
    overflow: "hidden",
    borderRadius: 12,
  },
  loginDialogHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5, 3),
    color: "#fff",
  },
  loginDialogIcon: {
    fontSize: 40,
    opacity: 0.95,
  },
  loginDialogContent: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(2),
  },
  loginMedia: {
    border: `1px solid ${theme.palette.divider}`,
    margin: "0 auto 20px",
    textAlign: "center",
    width: "100%",
    maxWidth: 480,
    height: 280,
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "center",
    borderRadius: 8,
  },
  loginActions: {
    padding: theme.spacing(2, 3, 3),
    justifyContent: "center",
  },
  loginConfirmBtn: {
    minWidth: 200,
    fontWeight: 700,
    textTransform: "none",
    fontSize: "1rem",
    padding: theme.spacing(1.25, 4),
  },
}));

const getMediaPath = (filename) =>
  `${process.env.REACT_APP_BACKEND_URL}/public/${filename}`;

function AnnouncementDetailDialog({
  announcement,
  open,
  handleClose,
  variant = "default",
  onConfirm,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const isLogin = variant === "login";
  const priority = normalizePriority(announcement?.priority);
  const priorityColor = getPriorityColor(priority);
  const isHigh = priority === PRIORITY_HIGH;

  if (!announcement?.id) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isLogin ? "sm" : "md"}
      fullWidth
      aria-labelledby="announcement-dialog-title"
      PaperProps={{
        className: isLogin ? classes.loginDialogPaper : undefined,
        style: isLogin
          ? {
              border: `3px solid ${priorityColor}`,
              boxShadow: isHigh
                ? `0 0 0 4px ${priorityColor}33, 0 12px 40px rgba(0,0,0,0.35)`
                : `0 8px 32px rgba(0,0,0,0.25)`,
            }
          : undefined,
      }}
    >
      {isLogin ? (
        <Box
          className={classes.loginDialogHeader}
          style={{ backgroundColor: priorityColor }}
        >
          {isHigh ? (
            <PriorityHighIcon className={classes.loginDialogIcon} />
          ) : (
            <AnnouncementIcon className={classes.loginDialogIcon} />
          )}
          <Box>
            <Typography variant="overline" style={{ opacity: 0.9, lineHeight: 1.2 }}>
              {getPriorityLabel(priority)}
            </Typography>
            <Typography variant="h5" id="announcement-dialog-title" style={{ fontWeight: 700 }}>
              {announcement.title}
            </Typography>
          </Box>
        </Box>
      ) : (
        <DialogTitle id="announcement-dialog-title">
          <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
            <span>{announcement.title}</span>
            <Chip
              size="small"
              label={getPriorityLabel(priority)}
              style={{
                backgroundColor: priorityColor,
                color: "#fff",
                fontWeight: 600,
              }}
            />
          </Box>
        </DialogTitle>
      )}

      <DialogContent className={isLogin ? classes.loginDialogContent : undefined}>
        {announcement.mediaPath && (
          <div
            className={isLogin ? classes.loginMedia : undefined}
            style={
              isLogin
                ? { backgroundImage: `url(${getMediaPath(announcement.mediaPath)})` }
                : {
                    border: `1px solid ${theme.palette.divider}`,
                    margin: "0 auto 20px",
                    textAlign: "center",
                    width: "400px",
                    maxWidth: "100%",
                    height: 300,
                    backgroundImage: `url(${getMediaPath(announcement.mediaPath)})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                  }
            }
          />
        )}
        <DialogContentText
          id="announcement-dialog-description"
          style={{
            fontSize: isLogin ? "1.05rem" : undefined,
            lineHeight: 1.6,
            color: theme.palette.text.primary,
          }}
        >
          {announcement.text}
        </DialogContentText>
      </DialogContent>

      <DialogActions className={isLogin ? classes.loginActions : undefined}>
        <Button
          onClick={() => {
            if (onConfirm) onConfirm(announcement);
            handleClose();
          }}
          variant="contained"
          className={isLogin ? classes.loginConfirmBtn : undefined}
          style={
            isLogin
              ? { backgroundColor: priorityColor, color: "#fff" }
              : undefined
          }
          color={isLogin ? undefined : "primary"}
          autoFocus
          size={isLogin ? "large" : "medium"}
        >
          {isLogin
            ? i18n.t("announcements.loginPopup.understood")
            : i18n.t("announcements.dialog.buttons.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newAnnouncements = [];

    if (isArray(announcements)) {
      announcements.forEach((announcement) => {
        const announcementIndex = state.findIndex((u) => u.id === announcement.id);
        if (announcementIndex !== -1) {
          state[announcementIndex] = announcement;
        } else {
          newAnnouncements.push(announcement);
        }
      });
    }

    return [...state, ...newAnnouncements];
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const announcement = action.payload;
    const announcementIndex = state.findIndex((u) => u.id === announcement.id);

    if (announcementIndex !== -1) {
      state[announcementIndex] = announcement;
      return [...state];
    }
    return [announcement, ...state];
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    const announcementId = action.payload;
    const announcementIndex = state.findIndex((u) => u.id === announcementId);
    if (announcementIndex !== -1) {
      state.splice(announcementIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

export default function AnnouncementsPopover() {
  const theme = useTheme();
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);
  const [badgeDismissed, setBadgeDismissed] = useState(false);
  const [announcement, setAnnouncement] = useState({});
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [loginPopupItem, setLoginPopupItem] = useState(null);
  const loginQueueRef = useRef([]);
  const loginShownRef = useRef(false);

  const socketManager = useContext(SocketContext);

  const showNextLoginPopup = useCallback(() => {
    if (loginQueueRef.current.length === 0) {
      setLoginPopupItem(null);
      return;
    }
    const next = loginQueueRef.current.shift();
    setLoginPopupItem(next);
  }, []);

  const queueLoginPopups = useCallback(
    (records) => {
      if (!user?.id || !isArray(records)) return;
      const unseen = filterUnseenAnnouncements(records, user.id);
      if (unseen.length === 0) return;

      loginQueueRef.current = unseen;

      if (!loginShownRef.current && !loginPopupItem) {
        loginShownRef.current = true;
        showNextLoginPopup();
      }
    },
    [user?.id, loginPopupItem, showNextLoginPopup]
  );

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    loginShownRef.current = false;
    loginQueueRef.current = [];
    setLoginPopupItem(null);
  }, [searchParam, user?.id]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchAnnouncements = async () => {
        try {
          const { data } = await api.get("/announcements/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
          setHasMore(data.hasMore);
          if (pageNumber === 1) {
            queueLoginPopups(data.records);
          }
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnnouncements();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, queueLoginPopups]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    if (!socket) {
      return () => {};
    }

    const handler = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
        setBadgeDismissed(false);
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
      }
    };

    socket.on(`company-announcement`, handler);
    return () => {
      socket.off(`company-announcement`, handler);
    };
  }, [socketManager]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setBadgeDismissed(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleShowAnnouncementDialog = (record) => {
    setAnnouncement(record);
    setShowAnnouncementDialog(true);
    setAnchorEl(null);
  };

  const handleLoginPopupConfirm = (record) => {
    markAnnouncementsSeen(user?.id, [record.id]);
    showNextLoginPopup();
  };

  const activeAnnouncements = announcements.filter((a) => a.status !== false);
  const highestPriority = getHighestPriority(activeAnnouncements);
  const badgeClass =
    highestPriority === PRIORITY_HIGH
      ? classes.badgeHigh
      : highestPriority === 2
        ? classes.badgeMedium
        : classes.badgeLow;

  const showBadge = !badgeDismissed && activeAnnouncements.length > 0;
  const open = Boolean(anchorEl);
  const id = open ? "announcements-popover" : undefined;

  return (
    <div>
      <AnnouncementDetailDialog
        announcement={loginPopupItem || {}}
        open={Boolean(loginPopupItem)}
        handleClose={() => {
          if (loginPopupItem) {
            markAnnouncementsSeen(user?.id, [loginPopupItem.id]);
          }
          showNextLoginPopup();
        }}
        variant="login"
        onConfirm={handleLoginPopupConfirm}
      />

      <AnnouncementDetailDialog
        announcement={announcement}
        open={showAnnouncementDialog}
        handleClose={() => setShowAnnouncementDialog(false)}
        variant="default"
      />

      <IconButton
        variant="contained"
        aria-describedby={id}
        onClick={handleClick}
        style={{ color: "white" }}
        aria-label={i18n.t("announcements.title")}
      >
        <Badge
          badgeContent={showBadge ? activeAnnouncements.length : 0}
          invisible={!showBadge}
          className={showBadge ? badgeClass : undefined}
          overlap="rectangular"
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          style: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <Paper
          variant="outlined"
          onScroll={handleScroll}
          className={classes.mainPaper}
          elevation={0}
        >
          <List
            component="nav"
            aria-label="announcements-list"
            style={{ minWidth: 300 }}
          >
            {isArray(announcements) &&
              announcements.map((item) => (
                <ListItem
                  key={item.id}
                  className={classes.listItem}
                  style={{
                    border: `1px solid ${
                      theme.palette.type === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)"
                    }`,
                    borderLeft: getPriorityBorderLeft(item.priority),
                    cursor: "pointer",
                    marginBottom: theme.spacing(0.5),
                    borderRadius: theme.spacing(0.5),
                  }}
                  onClick={() => handleShowAnnouncementDialog(item)}
                >
                  {item.mediaPath && (
                    <ListItemAvatar>
                      <Avatar alt={item.mediaName} src={getMediaPath(item.mediaPath)} />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    className={classes.listItemText}
                    primary={
                      <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 6 }}>
                        <span>{item.title}</span>
                        <Chip
                          size="small"
                          label={getPriorityLabel(item.priority)}
                          style={{
                            backgroundColor: getPriorityColor(item.priority),
                            color: "#fff",
                            height: 22,
                            fontSize: "0.7rem",
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          style={{ fontSize: 12, color: theme.palette.text.secondary }}
                        >
                          {moment(item.createdAt).format("DD/MM/YYYY")}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          display="block"
                          style={{ marginTop: 4, color: theme.palette.text.secondary }}
                        >
                          {item.text}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            {isArray(announcements) && announcements.length === 0 && (
              <ListItem>
                <ListItemText
                  className={classes.listItemText}
                  primary={i18n.t("announcements.empty")}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}
