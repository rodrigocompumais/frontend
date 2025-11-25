import React, { useContext, useState, useEffect } from "react";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import CallIcon from "@material-ui/icons/Call";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';

import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import StatCard from "../../components/Dashboard/StatCard";
import ChartCard from "../../components/Dashboard/ChartCard";
import FilterBar from "../../components/Dashboard/FilterBar";
import { isArray } from "lodash";

import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import { ChatsUser } from "./ChartsUser"

import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.5rem",
    },
  },
  subtitle: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8125rem",
    },
  },
  statsGrid: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [period, setPeriod] = useState(0);
  const [filterType, setFilterType] = useState(1);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
    async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
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
      toast.error(i18n.t("dashboard.toasts.selectFilterError"));
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

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
    <div>
      <Container maxWidth="lg" className={classes.container}>
        {/* Header */}
        <Box className={classes.header}>
          <Typography className={classes.title}>
            Dashboard
          </Typography>
          <Typography className={classes.subtitle}>
            Visão geral das métricas e estatísticas do sistema
          </Typography>
        </Box>

        {/* Filtros */}
        <FilterBar
          filterType={filterType}
          onFilterTypeChange={handleChangeFilterType}
          period={period}
          onPeriodChange={handleChangePeriod}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onApply={fetchData}
          loading={loading}
        />

        {/* Cards de Métricas */}
        <Grid container spacing={3} className={classes.statsGrid}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title={i18n.t("dashboard.counters.inTalk")}
              value={counters.supportHappening || 0}
              icon={CallIcon}
              color="#0EA5E9"
              gradient={["#0EA5E9", "#3B82F6"]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title={i18n.t("dashboard.counters.waiting")}
              value={counters.supportPending || 0}
              icon={HourglassEmptyIcon}
              color="#F59E0B"
              gradient={["#F59E0B", "#F97316"]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title={i18n.t("dashboard.counters.finished")}
              value={counters.supportFinished || 0}
              icon={CheckCircleIcon}
              color="#22C55E"
              gradient={["#22C55E", "#10B981"]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title={i18n.t("dashboard.counters.newContacts")}
              value={GetContacts(true) || 0}
              icon={GroupAddIcon}
              color="#8B5CF6"
              gradient={["#8B5CF6", "#7C3AED"]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title={i18n.t("dashboard.counters.averageTalkTime")}
              value={formatTime(counters.avgSupportTime || 0)}
              icon={AccessAlarmIcon}
              color="#EC4899"
              gradient={["#EC4899", "#DB2777"]}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title={i18n.t("dashboard.counters.averageWaitTime")}
              value={formatTime(counters.avgWaitTime || 0)}
              icon={TimerIcon}
              color="#06B6D4"
              gradient={["#06B6D4", "#0891B2"]}
            />
          </Grid>
        </Grid>

        {/* Tabela de Atendentes */}
        {attendants.length > 0 && (
          <>
            <Typography className={classes.sectionTitle}>
              Status dos Atendentes
            </Typography>
            <Grid container spacing={3} style={{ marginBottom: 24 }}>
              <Grid item xs={12}>
                <TableAttendantsStatus
                  attendants={attendants}
                  loading={loading}
                />
              </Grid>
            </Grid>
          </>
        )}

        {/* Gráficos */}
        <Typography className={classes.sectionTitle}>
          Análises e Relatórios
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <ChartCard
              title={i18n.t("dashboard.charts.user.title")}
              subtitle="Atendimentos por usuário no período selecionado"
            >
              <ChatsUser />
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <ChartCard
              title={i18n.t("dashboard.charts.date.title")}
              subtitle="Distribuição de atendimentos ao longo do tempo"
            >
              <ChartsDate />
            </ChartCard>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
