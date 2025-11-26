import React, { useContext, useState, useEffect, useCallback } from "react";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import CallIcon from "@material-ui/icons/Call";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';
import RefreshIcon from "@material-ui/icons/Refresh";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import CampaignIcon from "@material-ui/icons/Send";
import AssignmentIcon from "@material-ui/icons/Assignment";
import WifiIcon from "@material-ui/icons/Wifi";
import PeopleIcon from "@material-ui/icons/People";
import MessageIcon from "@material-ui/icons/Message";

import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import StatCard from "../../components/Dashboard/StatCard";
import MiniStatCard from "../../components/Dashboard/MiniStatCard";
import FilterDropdown from "../../components/Dashboard/FilterDropdown";
import LineChartComponent from "../../components/Dashboard/LineChartComponent";
import PieChartComponent from "../../components/Dashboard/PieChartComponent";
import BarChartComponent from "../../components/Dashboard/BarChartComponent";
import { isArray } from "lodash";

import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import api from "../../services/api";

import { isEmpty } from "lodash";
import moment from "moment";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    background: theme.palette.type === "dark" 
      ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    paddingBottom: theme.spacing(4),
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  lastUpdate: {
    fontSize: "0.75rem",
    color: theme.palette.text.disabled,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  autoRefresh: {
    display: "flex",
    alignItems: "center",
    marginRight: theme.spacing(1),
    "& .MuiFormControlLabel-label": {
      fontSize: "0.8rem",
    },
  },
  refreshButton: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  statsSection: {
    marginBottom: theme.spacing(3),
  },
  secondaryStats: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  chartsSection: {
    marginBottom: theme.spacing(3),
  },
  spinning: {
    animation: "$spin 1s linear infinite",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [extendedData, setExtendedData] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(7);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { find } = useDashboard();

  const fetchData = useCallback(async () => {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = { days: period };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      params = { days: 7 };
    }

    try {
      // Fetch basic dashboard data
      const data = await find(params);
      setCounters(data.counters || {});
      if (isArray(data.attendants)) {
        setAttendants(data.attendants);
      } else {
        setAttendants([]);
      }

      // Fetch extended dashboard data
      const { data: extended } = await api.get("/dashboard/extended", { params });
      setExtendedData(extended || {});

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [period, dateFrom, dateTo, find]);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchData();
      }, 30000); // 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    }
    const { count } = useContacts(props);
    return count;
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="xl" className={classes.container}>
        {/* Header */}
        <Box className={classes.header}>
          <Box className={classes.titleSection}>
            <Typography className={classes.title}>
              Dashboard
            </Typography>
            <Typography className={classes.subtitle}>
              Visão geral das métricas e estatísticas do sistema
              <span className={classes.lastUpdate}>
                • Atualizado: {moment(lastUpdate).format("HH:mm:ss")}
              </span>
            </Typography>
          </Box>

          <Box className={classes.actions}>
            <FormControlLabel
              className={classes.autoRefresh}
              control={
                <Switch
                  size="small"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  color="primary"
                />
              }
              label="Auto"
            />

            <Tooltip title="Atualizar">
              <IconButton
                className={classes.refreshButton}
                onClick={fetchData}
                disabled={loading}
                size="small"
              >
                <RefreshIcon className={loading ? classes.spinning : ""} />
              </IconButton>
            </Tooltip>

            <FilterDropdown
              period={period}
              onPeriodChange={setPeriod}
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
              onApply={fetchData}
              loading={loading}
            />
          </Box>
        </Box>

        {/* Primary Stats */}
        <Grid container spacing={2} className={classes.statsSection}>
          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="Em Atendimento"
              value={counters.supportHappening || 0}
              icon={CallIcon}
              color="#0EA5E9"
              gradient={["#0EA5E9", "#3B82F6"]}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="Aguardando"
              value={counters.supportPending || 0}
              icon={HourglassEmptyIcon}
              color="#F59E0B"
              gradient={["#F59E0B", "#F97316"]}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="Finalizados"
              value={counters.supportFinished || 0}
              icon={CheckCircleIcon}
              color="#22C55E"
              gradient={["#22C55E", "#10B981"]}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="Contatos"
              value={GetContacts(true) || 0}
              icon={GroupAddIcon}
              color="#8B5CF6"
              gradient={["#8B5CF6", "#7C3AED"]}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="T. Atendimento"
              value={formatTime(counters.avgSupportTime || 0)}
              icon={AccessAlarmIcon}
              color="#EC4899"
              gradient={["#EC4899", "#DB2777"]}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="T. Espera"
              value={formatTime(counters.avgWaitTime || 0)}
              icon={TimerIcon}
              color="#06B6D4"
              gradient={["#06B6D4", "#0891B2"]}
            />
          </Grid>
        </Grid>

        {/* Secondary Stats */}
        <Grid container spacing={2} className={classes.secondaryStats}>
          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Tickets Hoje"
              value={extendedData.ticketsToday || 0}
              icon={AssignmentIcon}
              color="#3B82F6"
              subtext="criados hoje"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Taxa Resolução"
              value={extendedData.resolutionRate || 0}
              suffix="%"
              icon={TrendingUpIcon}
              color="#22C55E"
              subtext="no período"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Campanhas Ativas"
              value={extendedData.activeCampaigns || 0}
              icon={CampaignIcon}
              color="#F59E0B"
              subtext="em andamento"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Mensagens"
              value={extendedData.messagesSent || 0}
              icon={MessageIcon}
              color="#8B5CF6"
              subtext="enviadas no período"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Tarefas Pendentes"
              value={extendedData.pendingTasks || 0}
              icon={AssignmentIcon}
              color="#EF4444"
              subtext="aguardando"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Conexões"
              value={`${extendedData.onlineConnections || 0}/${extendedData.totalConnections || 0}`}
              icon={WifiIcon}
              color={extendedData.onlineConnections > 0 ? "#22C55E" : "#EF4444"}
              subtext="WhatsApp online"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Usuários Online"
              value={`${extendedData.onlineUsers || 0}/${extendedData.totalUsers || 0}`}
              icon={PeopleIcon}
              color="#3B82F6"
              subtext="atendentes"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Leads"
              value={counters.leads || 0}
              icon={GroupAddIcon}
              color="#EC4899"
              subtext="novos contatos"
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Typography className={classes.sectionTitle}>
          📊 Análises e Gráficos
        </Typography>
        <Grid container spacing={3} className={classes.chartsSection}>
          <Grid item xs={12} md={8}>
            <LineChartComponent
              data={extendedData.ticketsByDay || []}
              title="Tickets nos Últimos 7 Dias"
              subtitle="Evolução diária de tickets criados"
              xAxisKey="day"
              dataKey="count"
              color="#3B82F6"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <PieChartComponent
              data={extendedData.ticketsByStatus || []}
              title="Distribuição por Status"
              subtitle="Tickets ativos no momento"
              isStatusChart={true}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <BarChartComponent
              data={extendedData.topAttendants || []}
              title="Top Atendentes"
              subtitle="Tickets resolvidos no período"
              showAsList={true}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <PieChartComponent
              data={extendedData.ticketsByQueue || []}
              title="Tickets por Fila"
              subtitle="Distribuição por setor"
            />
          </Grid>
        </Grid>

        {/* Attendants Table */}
        {attendants.length > 0 && (
          <>
            <Typography className={classes.sectionTitle}>
              👥 Status dos Atendentes
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TableAttendantsStatus
                  attendants={attendants}
                  loading={loading}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
