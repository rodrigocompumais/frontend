import React, { useState, useMemo } from "react";
import {
  makeStyles,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  CircularProgress,
  Tooltip,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import RefreshIcon from "@material-ui/icons/Refresh";
import CloseIcon from "@material-ui/icons/Close";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import GroupIcon from "@material-ui/icons/Group";
import PersonIcon from "@material-ui/icons/Person";

import { i18n } from "../../translate/i18n";
import useTicketsOverview from "../../hooks/useTicketsOverview";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
  },
  header: {
    padding: theme.spacing(2, 2, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
  },
  headerTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing(1),
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
    flexShrink: 0,
  },
  search: {
    flex: 1,
    minWidth: 120,
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: theme.spacing(1.5),
    padding: theme.spacing(0, 2, 2),
    flexShrink: 0,
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
  kpiCard: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    textAlign: "center",
  },
  kpiValue: {
    fontWeight: 700,
    fontSize: "1.75rem",
    lineHeight: 1.1,
  },
  kpiLabel: {
    fontSize: "0.75rem",
    fontWeight: 500,
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    padding: theme.spacing(0, 2, 1.5),
    flexShrink: 0,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    padding: theme.spacing(0, 2, 2),
    ...theme.scrollbarStyles,
  },
  sectionBlock: {
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    fontSize: "0.8rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    padding: theme.spacing(1.5, 0, 1),
  },
  tableHeadCell: {
    fontWeight: 600,
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
    whiteSpace: "nowrap",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  metricCell: {
    textAlign: "center",
    padding: theme.spacing(0.75, 1),
  },
  badgeGreen: {
    backgroundColor: "#22C55E",
    color: "#fff",
    fontWeight: 600,
    minWidth: 28,
    height: 24,
  },
  badgeBlue: {
    backgroundColor: "#3B82F6",
    color: "#fff",
    fontWeight: 600,
    minWidth: 28,
    height: 24,
  },
  badgeOrange: {
    backgroundColor: "#F97316",
    color: "#fff",
    fontWeight: 600,
    minWidth: 28,
    height: 24,
  },
  badgeRed: {
    backgroundColor: "#EF4444",
    color: "#fff",
    fontWeight: 600,
    minWidth: 28,
    height: 24,
  },
  zeroText: {
    color: theme.palette.text.disabled,
    fontSize: "0.875rem",
  },
  queueDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
}));

const MetricBadge = ({ value, colorClass, classes }) => {
  if (!value || value === 0) {
    return <span className={classes.zeroText}>0</span>;
  }
  return <Chip size="small" label={value} className={colorClass} />;
};

const OverviewSectionTable = ({
  rows,
  type,
  hideOffline,
  onDrillDown,
  classes,
}) => {
  const filtered =
    type === "user" && hideOffline ? rows.filter((r) => r.online) : rows;

  const colNew = i18n.t("tickets.tabs.overview.colShort.new");
  const colActive = i18n.t("tickets.tabs.overview.colShort.active");
  const colPending = i18n.t("tickets.tabs.overview.colShort.pending");
  const colReturns = i18n.t("tickets.tabs.overview.colShort.returns");

  if (filtered.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" style={{ padding: 8 }}>
        {i18n.t("tickets.tabs.overview.empty")}
      </Typography>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell className={classes.tableHeadCell}>
            {i18n.t("tickets.tabs.overview.col.name")}
          </TableCell>
          <TableCell className={classes.tableHeadCell} align="center">
            <Tooltip title={i18n.t("tickets.tabs.overview.col.newMessages")}>
              <span>{colNew}</span>
            </Tooltip>
          </TableCell>
          <TableCell className={classes.tableHeadCell} align="center">
            <Tooltip title={i18n.t("tickets.tabs.overview.col.active")}>
              <span>{colActive}</span>
            </Tooltip>
          </TableCell>
          <TableCell className={classes.tableHeadCell} align="center">
            <Tooltip title={i18n.t("tickets.tabs.overview.col.pending")}>
              <span>{colPending}</span>
            </Tooltip>
          </TableCell>
          <TableCell className={classes.tableHeadCell} align="center">
            <Tooltip title={i18n.t("tickets.tabs.overview.col.returns")}>
              <span>{colReturns}</span>
            </Tooltip>
          </TableCell>
          <TableCell className={classes.tableHeadCell} align="right" />
        </TableRow>
      </TableHead>
      <TableBody>
        {filtered.map((row) => (
          <TableRow key={`${type}-${row.id}`} hover>
            <TableCell>
              <Box className={classes.nameCell}>
                {type === "queue" ? (
                  <>
                    <span
                      className={classes.queueDot}
                      style={{ backgroundColor: row.color || "#9CA3AF" }}
                    />
                    <Typography variant="body2" style={{ fontWeight: 500 }}>
                      {row.name}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Avatar
                      src={row.avatar || undefined}
                      style={{ width: 32, height: 32 }}
                    >
                      {(row.name || "?").charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" style={{ fontWeight: 500 }}>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {row.online
                          ? i18n.t("tickets.tabs.overview.attendantOnline")
                          : i18n.t("tickets.tabs.overview.attendantOffline")}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </TableCell>
            <TableCell className={classes.metricCell} align="center">
              <MetricBadge
                value={row.newMessages}
                colorClass={classes.badgeGreen}
                classes={classes}
              />
            </TableCell>
            <TableCell className={classes.metricCell} align="center">
              <MetricBadge
                value={row.active}
                colorClass={classes.badgeBlue}
                classes={classes}
              />
            </TableCell>
            <TableCell className={classes.metricCell} align="center">
              <MetricBadge
                value={row.pending}
                colorClass={classes.badgeOrange}
                classes={classes}
              />
            </TableCell>
            <TableCell className={classes.metricCell} align="center">
              <MetricBadge
                value={row.returns}
                colorClass={classes.badgeRed}
                classes={classes}
              />
            </TableCell>
            <TableCell align="right" padding="checkbox">
              <Tooltip title={i18n.t("tickets.tabs.overview.openList")}>
                <IconButton
                  size="small"
                  onClick={() => onDrillDown(type, row, "open")}
                  aria-label="open"
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const TicketsOverview = ({
  showAllTickets,
  selectedQueueIds,
  onDrillDown,
  onClose,
}) => {
  const classes = useStyles();
  const [search, setSearch] = useState("");
  const [hideOffline, setHideOffline] = useState(true);

  const { data, loading, refresh } = useTicketsOverview({
    showAllTickets,
    selectedQueueIds,
    enabled: true,
  });

  const { summary, queues, users } = data;

  const filteredQueues = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return queues;
    return queues.filter((r) => (r.name || "").toLowerCase().includes(q));
  }, [queues, search]);

  const filteredUsers = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return users;
    return users.filter((r) => (r.name || "").toLowerCase().includes(q));
  }, [users, search]);

  const handleDrillDown = (type, row, metric) => {
    if (onDrillDown) {
      onDrillDown({ type, row, metric });
    }
  };

  const kpiCards = [
    {
      key: "newMessages",
      label: i18n.t("tickets.tabs.overview.kpiShort.newMessages"),
      value: summary.newMessages,
    },
    {
      key: "active",
      label: i18n.t("tickets.tabs.overview.kpiShort.active"),
      value: summary.active,
    },
    {
      key: "pending",
      label: i18n.t("tickets.tabs.overview.kpiShort.pending"),
      value: summary.pending,
    },
    {
      key: "online",
      label: i18n.t("tickets.tabs.overview.kpiShort.online"),
      value: summary.onlineAttendants,
    },
  ];

  const legendItems = [
    { color: "#22C55E", label: i18n.t("tickets.tabs.overview.legend.new") },
    { color: "#3B82F6", label: i18n.t("tickets.tabs.overview.legend.active") },
    { color: "#F97316", label: i18n.t("tickets.tabs.overview.legend.pending") },
    { color: "#EF4444", label: i18n.t("tickets.tabs.overview.legend.returns") },
  ];

  return (
    <Paper elevation={0} className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.headerTop}>
          <Box>
            <Typography variant="h6" style={{ fontWeight: 600 }}>
              {i18n.t("tickets.tabs.overview.title")}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {i18n.t("tickets.tabs.overview.subtitle")}
            </Typography>
          </Box>
          {onClose && (
            <Tooltip title={i18n.t("tickets.tabs.overview.close")}>
              <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box className={classes.toolbar}>
        <TextField
          className={classes.search}
          variant="outlined"
          size="small"
          placeholder={i18n.t("tickets.tabs.overview.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip
          title={
            hideOffline
              ? i18n.t("tickets.tabs.overview.showOffline")
              : i18n.t("tickets.tabs.overview.hideOffline")
          }
        >
          <IconButton size="small" onClick={() => setHideOffline((v) => !v)}>
            {hideOffline ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title={i18n.t("tickets.tabs.overview.refresh")}>
          <IconButton size="small" onClick={refresh} disabled={loading}>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <RefreshIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Box className={classes.kpiRow}>
        {kpiCards.map((kpi) => (
          <Paper key={kpi.key} elevation={0} className={classes.kpiCard}>
            <Typography className={classes.kpiValue}>{kpi.value}</Typography>
            <Typography className={classes.kpiLabel}>{kpi.label}</Typography>
          </Paper>
        ))}
      </Box>

      <Box className={classes.legend}>
        {legendItems.map((item) => (
          <span key={item.label} className={classes.legendItem}>
            <span
              className={classes.legendDot}
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </Box>

      <Box className={classes.scrollArea}>
        <Box className={classes.sectionBlock}>
          <Typography className={classes.sectionTitle}>
            <GroupIcon fontSize="small" />
            {i18n.t("tickets.tabs.overview.sections.queues")}
          </Typography>
          <OverviewSectionTable
            rows={filteredQueues}
            type="queue"
            hideOffline={hideOffline}
            onDrillDown={handleDrillDown}
            classes={classes}
          />
        </Box>

        <Box className={classes.sectionBlock}>
          <Typography className={classes.sectionTitle}>
            <PersonIcon fontSize="small" />
            {i18n.t("tickets.tabs.overview.sections.attendants")}
          </Typography>
          <OverviewSectionTable
            rows={filteredUsers}
            type="user"
            hideOffline={hideOffline}
            onDrillDown={handleDrillDown}
            classes={classes}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default TicketsOverview;
