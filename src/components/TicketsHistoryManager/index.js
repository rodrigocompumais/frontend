import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Paper,
  Typography,
  TextField,
  InputAdornment,
  makeStyles,
  Box,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  Button,
  Collapse,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import HistoryIcon from "@material-ui/icons/History";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { format, parseISO, isValid } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import useTicketsHistory from "../../hooks/useTicketsHistory";
import { i18n } from "../../translate/i18n";
import TicketsQueueSelect from "../TicketsQueueSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    borderRadius: 12,
  },
  header: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
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
  title: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 700,
    fontSize: "1.15rem",
  },
  hint: {
    marginTop: theme.spacing(0.5),
    lineHeight: 1.5,
    fontSize: "0.95rem",
  },
  searchBlock: {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  searchLabel: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.75),
    fontSize: "0.95rem",
  },
  filters: {
    padding: theme.spacing(1.5, 2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.background.default
        : "#FAFAFA",
  },
  filterToggle: {
    textTransform: "none",
    justifyContent: "space-between",
    fontWeight: 600,
    padding: theme.spacing(1, 0),
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(1),
    ...theme.scrollbarStyles,
  },
  groupCard: {
    cursor: "pointer",
    borderRadius: 12,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
    border: `2px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:hover": {
      borderColor: theme.palette.primary.light,
      boxShadow: theme.shadows[2],
    },
  },
  selected: {
    borderColor: `${theme.palette.primary.main} !important`,
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(249, 115, 22, 0.12)"
        : "rgba(249, 115, 22, 0.08)",
  },
  sessionBadge: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    fontWeight: 700,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    padding: "0 8px",
  },
  tapHint: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: "0.85rem",
    marginTop: theme.spacing(0.5),
  },
  loadMoreBtn: {
    margin: theme.spacing(2, 1),
    textTransform: "none",
    fontWeight: 600,
  },
}));

const formatFinishedAt = (value) => {
  if (!value) return "";
  try {
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    return isValid(d) ? format(d, "dd/MM/yyyy 'às' HH:mm") : "";
  } catch {
    return "";
  }
};

const TicketsHistoryManager = ({ selectedContactId, onSelectContact, compactIntro }) => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { whatsApps } = useContext(WhatsAppsContext);

  const [searchParam, setSearchParam] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQueueIds, setSelectedQueueIds] = useState(
    (user?.queues || []).map((q) => q.id)
  );
  const [selectedWhatsappIds, setSelectedWhatsappIds] = useState([]);

  const { groups, loading, hasMore, loadMore, count } = useTicketsHistory({
    searchParam,
    dateFrom,
    dateTo,
    queueIds: selectedQueueIds,
    whatsappIds: selectedWhatsappIds,
  });

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 80) {
      loadMore();
    }
  };

  return (
    <Paper className={classes.root} elevation={0} variant="outlined">
      <div className={classes.header}>
        <span className={classes.stepBadge}>{i18n.t("ticketsHistory.step1Label")}</span>
        <Typography component="h2" className={classes.title}>
          <HistoryIcon color="primary" fontSize="large" />
          {i18n.t("tickets.tabs.finalizadas.title")}
        </Typography>
        <Typography className={classes.hint} color="textSecondary">
          {compactIntro
            ? i18n.t("ticketsHistory.pageSubtitle")
            : i18n.t("ticketsHistory.step1Hint")}
        </Typography>
        {count > 0 && (
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
            <strong>{count}</strong> {i18n.t("ticketsHistory.contactsCount")}
          </Typography>
        )}
      </div>

      <div className={classes.searchBlock}>
        <Typography className={classes.searchLabel} component="label" htmlFor="history-search">
          {i18n.t("ticketsHistory.searchLabel")}
        </Typography>
        <TextField
          id="history-search"
          size="medium"
          fullWidth
          variant="outlined"
          placeholder={i18n.t("ticketsHistory.searchPlaceholder")}
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <Box px={2} pb={0.5}>
        <Button
          fullWidth
          className={classes.filterToggle}
          onClick={() => setShowFilters((v) => !v)}
          endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          color="default"
        >
          {showFilters
            ? i18n.t("ticketsHistory.filtersHide")
            : i18n.t("ticketsHistory.filtersShow")}
        </Button>
      </Box>

      <Collapse in={showFilters}>
        <div className={classes.filters}>
          <Typography variant="body2" color="textSecondary" style={{ lineHeight: 1.5 }}>
            {i18n.t("ticketsHistory.dateFilterHint")}
          </Typography>
          <Box display="flex" style={{ gap: 8 }}>
            <TextField
              size="small"
              type="date"
              label={i18n.t("ticketsHistory.dateFrom")}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
            />
            <TextField
              size="small"
              type="date"
              label={i18n.t("ticketsHistory.dateTo")}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
            />
          </Box>
          <TicketsQueueSelect
            selectedQueueIds={selectedQueueIds}
            userQueues={user?.queues}
            onChange={setSelectedQueueIds}
          />
          {whatsApps?.length > 0 && (
            <Box>
              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 4 }}>
                {i18n.t("ticketsHistory.filterWhatsappLabel")}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                {i18n.t("ticketsHistory.filterWhatsappHint")}
              </Typography>
              <Box display="flex" flexWrap="wrap" style={{ gap: 6 }}>
                {whatsApps.map((w) => {
                  const selected = selectedWhatsappIds.includes(w.id);
                  return (
                    <Chip
                      key={w.id}
                      label={w.name}
                      color={selected ? "primary" : "default"}
                      variant={selected ? "default" : "outlined"}
                      onClick={() => {
                        setSelectedWhatsappIds((prev) =>
                          selected ? prev.filter((id) => id !== w.id) : [...prev, w.id]
                        );
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </div>
      </Collapse>

      <List className={classes.list} onScroll={handleScroll} disablePadding>
        {groups.map((group) => {
          const contact = group.contact;
          const isSelected = selectedContactId === contact?.id;
          const finishedLabel = formatFinishedAt(group.lastFinishedAt);
          return (
            <ListItem key={contact?.id} disableGutters style={{ padding: 0 }}>
              <Box
                className={`${classes.groupCard} ${isSelected ? classes.selected : ""}`}
                width="100%"
                display="flex"
                alignItems="center"
                onClick={() => {
                  onSelectContact(group);
                  history.push("/tickets/finalizadas");
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectContact(group);
                    history.push("/tickets/finalizadas");
                  }
                }}
              >
                <Avatar
                  src={contact?.profilePicUrl}
                  imgProps={{
                    onError: (e) => {
                      e.currentTarget.style.display = "none";
                    },
                  }}
                  style={{ width: 52, height: 52, marginRight: 12 }}
                >
                  {contact?.name?.charAt(0)}
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Typography variant="subtitle1" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                    {contact?.name || contact?.number}
                  </Typography>
                  {contact?.name && contact?.number && (
                    <Typography variant="body2" color="textSecondary">
                      {contact.number}
                    </Typography>
                  )}
                  <Box display="flex" alignItems="center" flexWrap="wrap" mt={0.5} style={{ gap: 6 }}>
                    <span className={classes.sessionBadge}>{group.totalSessions}</span>
                    <Typography variant="body2" color="textSecondary">
                      {group.totalSessions === 1
                        ? i18n.t("ticketsHistory.session")
                        : i18n.t("ticketsHistory.sessions")}
                    </Typography>
                    {finishedLabel && (
                      <Typography variant="caption" color="textSecondary">
                        · {finishedLabel}
                      </Typography>
                    )}
                  </Box>
                  {group.whatsappNames?.length > 0 && (
                    <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 4 }}>
                      {i18n.t("ticketsHistory.connection")}: {group.whatsappNames.join(", ")}
                    </Typography>
                  )}
                  <Typography className={classes.tapHint}>
                    {i18n.t("ticketsHistory.tapToOpen")} →
                  </Typography>
                </Box>
                <ChevronRightIcon color="action" />
              </Box>
            </ListItem>
          );
        })}
        {loading && (
          <Box p={3} display="flex" justifyContent="center">
            <CircularProgress size={32} />
          </Box>
        )}
        {!loading && groups.length === 0 && (
          <Typography
            color="textSecondary"
            align="center"
            style={{ padding: 24, lineHeight: 1.6, fontSize: "1rem" }}
          >
            {i18n.t("ticketsHistory.empty")}
          </Typography>
        )}
        {hasMore && !loading && (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            className={classes.loadMoreBtn}
            onClick={loadMore}
          >
            {i18n.t("ticketsHistory.loadMore")}
          </Button>
        )}
      </List>
    </Paper>
  );
};

export default TicketsHistoryManager;
