import React, { useContext, useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";

import CallIcon from "@material-ui/icons/Call";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';
import RefreshIcon from "@material-ui/icons/Refresh";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import SendIcon from "@material-ui/icons/Send";
import AssignmentIcon from "@material-ui/icons/Assignment";
import WifiIcon from "@material-ui/icons/Wifi";
import PeopleIcon from "@material-ui/icons/People";
import ChatIcon from "@material-ui/icons/Chat";
import ExtensionIcon from "@material-ui/icons/Extension";
import GeminiIcon from "../../components/GeminiIcon";
import GetAppIcon from "@material-ui/icons/GetApp";
import CloseIcon from "@material-ui/icons/Close";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import toastError from "../../errors/toastError";
import SettingsIcon from "@material-ui/icons/Settings";

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
    width: '100%',
    minHeight: "calc(100vh - 48px)",
    background: theme.palette.type === "dark" 
      ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    paddingBottom: theme.spacing(4),
  },
  container: {
    maxWidth: '100%',
    width: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
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
  summaryButton: {
    background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    color: "#FFFFFF",
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    "&:hover": {
      background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
    },
  },
  summaryModal: {
    "& .MuiDialog-paper": {
      maxWidth: "800px",
      width: "90%",
    },
  },
  summaryContent: {
    padding: theme.spacing(2),
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
    maxHeight: "60vh",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  summaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  tasksSection: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  tasksTable: {
    marginTop: theme.spacing(2),
  },
  taskRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.05)" 
        : "rgba(0, 0, 0, 0.02)",
    },
  },
  taskPriority: {
    fontWeight: 600,
  },
  taskPriorityHigh: {
    color: "#EF4444",
  },
  taskPriorityMedium: {
    color: "#F59E0B",
  },
  taskPriorityLow: {
    color: "#22C55E",
  },
  summaryLoadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    gap: theme.spacing(2),
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
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryAgentName, setSummaryAgentName] = useState("");
  // Estados para modal de tickets por status
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketModalTitle, setTicketModalTitle] = useState("");
  const [ticketModalStatus, setTicketModalStatus] = useState("");
  const [ticketModalData, setTicketModalData] = useState([]);
  const [ticketModalLoading, setTicketModalLoading] = useState(false);
  // Estados para tarefas pendentes
  const [pendingTasks, setPendingTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const { find } = useDashboard();
  const { count: contactsCount } = useContacts({});
  const history = useHistory();

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

      // Fetch pending tasks
      try {
        const { data: tasksData } = await api.get("/tasks", {
          params: {
            status: "pending",
            limit: 10,
            showAll: false,
          },
        });
        setPendingTasks(tasksData.tasks || []);
      } catch (err) {
        // Se a API de tarefas não existir, apenas ignora
        console.log("Tarefas não disponíveis");
        setPendingTasks([]);
      }

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

  // Listener para abrir resumo IA via evento customizado
  useEffect(() => {
    const handleOpenSummary = () => {
      // Gerar resumo geral automaticamente
      handleGenerateSummary();
    };
    
    window.addEventListener("openAiSummary", handleOpenSummary);
    return () => {
      window.removeEventListener("openAiSummary", handleOpenSummary);
    };
  }, [attendants, period, dateFrom, dateTo]); // eslint-disable-line

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

  const handleGenerateSummary = async () => {
    // Abrir o modal primeiro para mostrar a tela de carregamento
    setSummaryLoading(true);
    setSummaryText("");
    
    // Se tiver atendente selecionado, buscar nome dele, senão é resumo geral
    if (selectedAgentId) {
      const selectedAgent = attendants.find((a) => a.id === Number(selectedAgentId));
      setSummaryAgentName(selectedAgent?.name || "Atendente");
    } else {
      setSummaryAgentName("Resumo Geral da Operação");
    }
    
    // Abrir o modal imediatamente para mostrar o loading
    setSummaryModalOpen(true);

    try {
      const params = {
        maxMessages: 200,
      };

      // Só enviar agentId se tiver selecionado
      if (selectedAgentId) {
        params.agentId = Number(selectedAgentId);
      }

      if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
        params.dateStart = moment(dateFrom).format("YYYY-MM-DD");
      }

      if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
        params.dateEnd = moment(dateTo).format("YYYY-MM-DD");
      }

      if (period > 0 && isEmpty(dateFrom) && isEmpty(dateTo)) {
        const startDate = moment().subtract(period, "days");
        params.dateStart = startDate.format("YYYY-MM-DD");
        params.dateEnd = moment().format("YYYY-MM-DD");
      }

      const { data } = await api.post("/ai/summary/agent", params);
      setSummaryText(data.summary || "Nenhum resumo disponível.");
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações");
      } else {
        toastError(err);
      }
      // Fechar o modal em caso de erro
      setSummaryModalOpen(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleDownloadSummary = () => {
    const agentName = summaryAgentName.replace(/\s+/g, "-");
    const dateStr = moment().format("YYYY-MM-DD");
    const filename = `resumo-ia-${agentName}-${dateStr}.txt`;

    const content = `Resumo IA das Conversas - ${summaryAgentName}\n` +
      `Gerado em: ${moment().format("DD/MM/YYYY HH:mm:ss")}\n` +
      `Período: ${dateFrom || "Últimos " + period + " dias"} até ${dateTo || moment().format("DD/MM/YYYY")}\n\n` +
      `========================================\n\n${summaryText}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Função para lidar com clique nos cards de status
  const handleCardClick = async (status, title) => {
    setTicketModalTitle(title);
    setTicketModalStatus(status);
    setTicketModalOpen(true);
    setTicketModalLoading(true);
    setTicketModalData([]);

    try {
      const { data } = await api.get("/tickets", {
        params: {
          status,
          showAll: "true",
          withUnreadMessages: "false",
        },
      });

      // Extrair tickets da resposta
      const tickets = data.tickets || data || [];
      setTicketModalData(Array.isArray(tickets) ? tickets : []);
    } catch (err) {
      console.error("Erro ao buscar tickets:", err);
      toastError(err);
    } finally {
      setTicketModalLoading(false);
    }
  };

  // Função para abrir um ticket
  const handleOpenTicket = (ticketId) => {
    setTicketModalOpen(false);
    history.push(`/tickets/${ticketId}`);
  };

  // Função para formatar tempo relativo
  const formatRelativeTime = (date) => {
    if (!date) return "-";
    return moment(date).fromNow();
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

            <Tooltip title="Configurar Botões de Acesso Rápido">
              <IconButton
                onClick={() => history.push("/quick-access-buttons-settings")}
                size="small"
              >
                <SettingsIcon />
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
              onClick={() => handleCardClick("open", "Em Atendimento")}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="Aguardando"
              value={counters.supportPending || 0}
              icon={HourglassEmptyIcon}
              color="#F59E0B"
              gradient={["#F59E0B", "#F97316"]}
              onClick={() => handleCardClick("pending", "Aguardando")}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="Finalizados"
              value={counters.supportFinished || 0}
              icon={CheckCircleIcon}
              color="#22C55E"
              gradient={["#22C55E", "#10B981"]}
              onClick={() => handleCardClick("closed", "Finalizados")}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <StatCard
              title="Contatos"
              value={contactsCount || 0}
              icon={GroupAddIcon}
              color="#8B5CF6"
              gradient={["#8B5CF6", "#7C3AED"]}
              onClick={() => history.push("/contacts")}
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
              icon={SendIcon}
              color="#F59E0B"
              subtext="em andamento"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <MiniStatCard
              title="Mensagens"
              value={extendedData.messagesSent || 0}
              icon={ChatIcon}
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

        {/* Pending Tasks Section */}
        {pendingTasks.length > 0 && (
          <>
            <Typography className={classes.sectionTitle}>
              📋 Tarefas Pendentes
            </Typography>
            <Grid container spacing={3} className={classes.tasksSection}>
              <Grid item xs={12}>
                <Paper elevation={2} className={classes.tasksTable}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Tarefa</strong></TableCell>
                        <TableCell><strong>Prioridade</strong></TableCell>
                        <TableCell><strong>Categoria</strong></TableCell>
                        <TableCell><strong>Prazo</strong></TableCell>
                        <TableCell><strong>Responsável</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingTasks.map((task) => (
                        <TableRow
                          key={task.id}
                          className={classes.taskRow}
                          onClick={() => history.push("/todolist")}
                        >
                          <TableCell>
                            <Typography variant="body2" style={{ fontWeight: 500 }}>
                              {task.title || "Sem título"}
                            </Typography>
                            {task.description && (
                              <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 4 }}>
                                {task.description.length > 60 
                                  ? `${task.description.substring(0, 60)}...` 
                                  : task.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                              size="small"
                              className={`${classes.taskPriority} ${
                                task.priority === "high" 
                                  ? classes.taskPriorityHigh 
                                  : task.priority === "medium" 
                                  ? classes.taskPriorityMedium 
                                  : classes.taskPriorityLow
                              }`}
                              style={{
                                backgroundColor: task.priority === "high" 
                                  ? "rgba(239, 68, 68, 0.1)" 
                                  : task.priority === "medium" 
                                  ? "rgba(245, 158, 11, 0.1)" 
                                  : "rgba(34, 197, 94, 0.1)",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {task.category || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {task.dueDate 
                                ? moment(task.dueDate).format("DD/MM/YYYY")
                                : "-"}
                            </Typography>
                            {task.dueDate && moment(task.dueDate).isBefore(moment(), 'day') && (
                              <Chip
                                label="Atrasada"
                                size="small"
                                style={{
                                  backgroundColor: "#EF4444",
                                  color: "#FFFFFF",
                                  marginTop: 4,
                                  fontSize: "0.7rem",
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {task.user?.name || "Não atribuída"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {pendingTasks.length >= 10 && (
                    <Box p={2} textAlign="center">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => history.push("/todolist")}
                        endIcon={<OpenInNewIcon />}
                      >
                        Ver todas as tarefas
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

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

        {/* Summary Modal */}
        <Dialog
          open={summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          className={classes.summaryModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🤖 Compuchat - {summaryAgentName}</span>
              <IconButton size="small" onClick={() => setSummaryModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {summaryLoading ? (
              <Box className={classes.summaryLoadingBox}>
                <CircularProgress size={48} />
                <Typography variant="body1" color="textSecondary">
                  Gerando resumo com IA...
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ textAlign: "center", maxWidth: 400 }}>
                  Isso pode levar alguns segundos. Por favor, aguarde.
                </Typography>
              </Box>
            ) : (
              <Typography className={classes.summaryContent}>
                {summaryText || "Nenhum resumo disponível."}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSummaryModalOpen(false)} color="secondary">
              Fechar
            </Button>
            <Button
              onClick={handleDownloadSummary}
              color="primary"
              variant="contained"
              startIcon={<GetAppIcon />}
              disabled={!summaryText}
            >
              Baixar Relatório
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Tickets por Status */}
        <Dialog
          open={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>📋 {ticketModalTitle}</span>
                <Chip 
                  label={`${ticketModalData.length} tickets`} 
                  size="small" 
                  color="primary"
                />
              </Box>
              <IconButton size="small" onClick={() => setTicketModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent style={{ padding: 0 }}>
            {ticketModalLoading ? (
              <Box style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                <CircularProgress />
              </Box>
            ) : ticketModalData.length === 0 ? (
              <Box style={{ textAlign: "center", padding: 40, color: "#666" }}>
                <Typography variant="body1">
                  Nenhum ticket encontrado com status "{ticketModalTitle}"
                </Typography>
              </Box>
            ) : (
              <Paper style={{ maxHeight: 400, overflow: "auto" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 600 }}>#ID</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>Contato</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>Atendente</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>Fila</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>Atualizado</TableCell>
                      <TableCell style={{ fontWeight: 600 }} align="center">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ticketModalData.map((ticket) => (
                      <TableRow 
                        key={ticket.id} 
                        hover
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenTicket(ticket.id)}
                      >
                        <TableCell>
                          <Typography variant="body2" style={{ fontWeight: 500 }}>
                            #{ticket.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" style={{ fontWeight: 500 }}>
                              {ticket.contact?.name || "Sem nome"}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {ticket.contact?.number || "-"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {ticket.user?.name || (
                            <Chip label="Sem atendente" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          {ticket.queue?.name || (
                            <Chip label="Sem fila" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={moment(ticket.updatedAt).format("DD/MM/YYYY HH:mm")}>
                            <Typography variant="body2">
                              {formatRelativeTime(ticket.updatedAt)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Abrir ticket">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTicket(ticket.id);
                              }}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTicketModalOpen(false)} color="secondary">
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default Dashboard;
