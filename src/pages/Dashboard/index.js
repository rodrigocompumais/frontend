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
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import DashboardIcon from "@material-ui/icons/Dashboard";
import BarChartIcon from "@material-ui/icons/BarChart";
import EventIcon from "@material-ui/icons/Event";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { toast } from "react-toastify";

import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import StatCard from "../../components/Dashboard/StatCard";
import MiniStatCard from "../../components/Dashboard/MiniStatCard";
import FilterDropdown from "../../components/Dashboard/FilterDropdown";
import LineChartComponent from "../../components/Dashboard/LineChartComponent";
import PieChartComponent from "../../components/Dashboard/PieChartComponent";
import BarChartComponent from "../../components/Dashboard/BarChartComponent";
import MarkdownWrapper from "../../components/MarkdownWrapper";
import Divider from "@material-ui/core/Divider";
import { isArray } from "lodash";

import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import useCompanyModules from "../../hooks/useCompanyModules";
import api from "../../services/api";

import RestaurantIcon from "@material-ui/icons/Restaurant";
import QueueIcon from "@material-ui/icons/Queue";
import HistoryIcon from "@material-ui/icons/History";
import ViewModuleIcon from "@material-ui/icons/ViewModule";

import { isEmpty } from "lodash";
import moment from "moment";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    minHeight: "calc(100vh - 48px)",
    background: theme.palette.type === "dark" 
      ? "#0F172A"
      : "#FAFBFC",
    paddingBottom: theme.spacing(6),
  },
  container: {
    maxWidth: '100%',
    width: '100%',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    backgroundColor: "transparent",
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      paddingTop: theme.spacing(3),
    },
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(4),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    lineHeight: 1.5,
    fontWeight: 400,
  },
  lastUpdate: {
    fontSize: "0.75rem",
    color: theme.palette.text.disabled,
    fontWeight: 400,
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
    backgroundColor: theme.palette.type === "dark" ? "#1E293B" : "#FFFFFF",
    border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
    boxShadow: theme.palette.type === "dark" ? "none" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" ? "#334155" : "#F9FAFB",
      borderColor: theme.palette.type === "dark" ? "#475569" : "#D1D5DB",
      transform: "translateY(-1px)",
      boxShadow: theme.palette.type === "dark" ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
  },
  statsSection: {
    marginBottom: theme.spacing(4),
    "& > *": {
      animation: "$fadeIn 0.4s ease-out",
      "&:nth-of-type(1)": { animationDelay: "0.05s" },
      "&:nth-of-type(2)": { animationDelay: "0.1s" },
      "&:nth-of-type(3)": { animationDelay: "0.15s" },
      "&:nth-of-type(4)": { animationDelay: "0.2s" },
      "&:nth-of-type(5)": { animationDelay: "0.25s" },
      "&:nth-of-type(6)": { animationDelay: "0.3s" },
    },
  },
  secondaryStats: {
    marginBottom: theme.spacing(4),
    "& > *": {
      animation: "$fadeIn 0.4s ease-out",
    },
  },
  sectionTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2.5),
    marginTop: theme.spacing(4),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    lineHeight: 1.2,
  },
  chartsSection: {
    marginBottom: theme.spacing(4),
  },
  spinning: {
    animation: "$spin 1s linear infinite",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(8px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "@keyframes slideIn": {
    "0%": {
      opacity: 0,
      transform: "translateX(-8px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
  cardAnimation: {
    animation: "$fadeIn 0.3s ease-out",
  },
  modernCard: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.type === "dark" ? "#1E293B" : "#FFFFFF",
    border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
    borderRadius: theme.spacing(2),
    boxShadow: theme.palette.type === "dark" 
      ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)" 
      : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: theme.palette.type === "dark"
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.4)"
        : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      borderColor: theme.palette.type === "dark" ? "#475569" : "#D1D5DB",
    },
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
  summaryBox: {
    backgroundColor: theme.palette.type === "dark" 
      ? "#1E293B" 
      : "#FFFFFF",
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
  },
  summarySection: {
    marginBottom: theme.spacing(3),
    "&:last-child": {
      marginBottom: 0,
    },
  },
  summaryTitle: {
    fontWeight: 600,
    fontSize: "1.1rem",
    marginBottom: theme.spacing(1.5),
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  summaryParagraph: {
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.7,
    color: theme.palette.text.primary,
  },
  summaryList: {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  summaryListItem: {
    marginBottom: theme.spacing(0.75),
    lineHeight: 1.6,
  },
  summaryHighlight: {
    backgroundColor: theme.palette.type === "dark"
      ? "rgba(14, 165, 233, 0.15)"
      : "rgba(14, 165, 233, 0.08)",
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    marginBottom: theme.spacing(2),
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
        ? "#334155" 
        : "#F9FAFB",
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
  summaryTitle: {
    fontWeight: 600,
    fontSize: "1.1rem",
    marginBottom: theme.spacing(1.5),
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  summaryParagraph: {
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.7,
    color: theme.palette.text.primary,
  },
  summaryList: {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  summaryListItem: {
    marginBottom: theme.spacing(0.75),
    lineHeight: 1.6,
  },
  summaryHighlight: {
    backgroundColor: theme.palette.type === "dark"
      ? "rgba(14, 165, 233, 0.15)"
      : "rgba(14, 165, 233, 0.08)",
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    marginBottom: theme.spacing(2),
  },
  tabsContainer: {
    backgroundColor: theme.palette.type === "dark" ? "#1E293B" : "#FFFFFF",
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(4),
    boxShadow: theme.palette.type === "dark" 
      ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)" 
      : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
    "& .MuiTabs-indicator": {
      height: 2,
      borderRadius: "2px 2px 0 0",
    },
    "& .MuiTab-root": {
      textTransform: "none",
      fontWeight: 500,
      fontSize: "0.875rem",
      minHeight: 48,
      padding: theme.spacing(1.5, 2),
      transition: "all 0.2s ease",
      "&:hover": {
        color: theme.palette.primary.main,
      },
    },
  },
  tabPanel: {
    paddingTop: theme.spacing(4),
    animation: "$fadeIn 0.3s ease-in",
  },
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(8px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

// Componente para formatar o resumo de forma mais visual
const FormattedSummary = ({ text, classes }) => {
  if (!text) return null;

  // Dividir o texto em linhas
  const lines = text.split('\n').filter(line => line.trim());
  const sections = [];
  let currentParagraph = [];
  let currentList = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Detectar títulos markdown (# ## ###)
    if (trimmed.match(/^#{1,3}\s+/)) {
      if (currentList.length > 0) {
        sections.push({ type: "list", content: currentList });
        currentList = [];
      }
      if (currentParagraph.length > 0) {
        sections.push({ type: "paragraph", content: currentParagraph.join(' ') });
        currentParagraph = [];
      }
      sections.push({ type: "title", content: trimmed.replace(/^#+\s*/, '') });
    }
    // Detectar separadores
    else if (trimmed.match(/^={3,}$/) || trimmed.match(/^-{3,}$/)) {
      if (currentList.length > 0) {
        sections.push({ type: "list", content: currentList });
        currentList = [];
      }
      if (currentParagraph.length > 0) {
        sections.push({ type: "paragraph", content: currentParagraph.join(' ') });
        currentParagraph = [];
      }
      sections.push({ type: "divider" });
    }
    // Detectar listas (- • ou números)
    else if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+[\.\)]\s/)) {
      if (currentParagraph.length > 0) {
        sections.push({ type: "paragraph", content: currentParagraph.join(' ') });
        currentParagraph = [];
      }
      currentList.push(trimmed.replace(/^[-•*]\s*/, '').replace(/^\d+[\.\)]\s*/, ''));
    }
    // Detectar subtítulos (negrito ou linha que termina com :)
    else if (trimmed.match(/^\*\*.*\*\*$/) || (trimmed.endsWith(':') && trimmed.length < 100)) {
      if (currentList.length > 0) {
        sections.push({ type: "list", content: currentList });
        currentList = [];
      }
      if (currentParagraph.length > 0) {
        sections.push({ type: "paragraph", content: currentParagraph.join(' ') });
        currentParagraph = [];
      }
      sections.push({ type: "subtitle", content: trimmed });
    }
    // Linha vazia - finalizar parágrafo ou lista
    else if (trimmed === '') {
      if (currentList.length > 0) {
        sections.push({ type: "list", content: currentList });
        currentList = [];
      }
      if (currentParagraph.length > 0) {
        sections.push({ type: "paragraph", content: currentParagraph.join(' ') });
        currentParagraph = [];
      }
    }
    // Texto normal
    else {
      if (currentList.length > 0) {
        sections.push({ type: "list", content: currentList });
        currentList = [];
      }
      currentParagraph.push(trimmed);
    }
  });
  
  // Finalizar últimos elementos
  if (currentList.length > 0) {
    sections.push({ type: "list", content: currentList });
  }
  if (currentParagraph.length > 0) {
    sections.push({ type: "paragraph", content: currentParagraph.join(' ') });
  }

  return (
    <Box style={{ padding: 8 }}>
      {sections.map((section, index) => {
        if (section.type === "title") {
          return (
            <Box key={index} className={classes.summarySection}>
              <Typography variant="h6" className={classes.summaryTitle}>
                {section.content}
              </Typography>
            </Box>
          );
        } else if (section.type === "subtitle") {
          return (
            <Box key={index} className={classes.summarySection}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12, marginTop: 16, color: "#0EA5E9" }}>
                <MarkdownWrapper>{section.content}</MarkdownWrapper>
              </Typography>
            </Box>
          );
        } else if (section.type === "list") {
          return (
            <Box key={index} className={classes.summarySection}>
              <Box component="ul" className={classes.summaryList} style={{ marginTop: 8, marginBottom: 16 }}>
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className={classes.summaryListItem}>
                    <MarkdownWrapper>{item}</MarkdownWrapper>
                  </li>
                ))}
              </Box>
            </Box>
          );
        } else if (section.type === "divider") {
          return <Divider key={index} style={{ margin: "16px 0" }} />;
        } else {
          // Parágrafo normal
          const content = section.content;
          const isHighlight = content.match(/(importante|destaque|atenção|recomenda|sugestão|conclusão)/i);
          
          if (isHighlight) {
            return (
              <Box key={index} className={classes.summaryHighlight}>
                <MarkdownWrapper>{content}</MarkdownWrapper>
              </Box>
            );
          }
          
          return (
            <Box key={index} className={classes.summarySection}>
              <Typography variant="body1" className={classes.summaryParagraph}>
                <MarkdownWrapper>{content}</MarkdownWrapper>
              </Typography>
            </Box>
          );
        }
      })}
    </Box>
  );
};

const Dashboard = () => {
  const classes = useStyles();
  const theme = useTheme();
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
  const [generalSummary, setGeneralSummary] = useState("");
  const [generalSummaryLoading, setGeneralSummaryLoading] = useState(false);
  // Estados para modal de tickets por status
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketModalTitle, setTicketModalTitle] = useState("");
  const [ticketModalStatus, setTicketModalStatus] = useState("");
  const [ticketModalData, setTicketModalData] = useState([]);
  const [ticketModalLoading, setTicketModalLoading] = useState(false);
  // Estados para tarefas pendentes
  const [pendingTasks, setPendingTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  // Estados para aba de tarefas
  const [allTasks, setAllTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tasksTabLoading, setTasksTabLoading] = useState(false);
  // Estado para aba ativa
  const [activeTab, setActiveTab] = useState(0);
  const { find } = useDashboard();
  const { count: contactsCount } = useContacts({});
  const { modules: companyModuleSlugs, hasLanchonetes } = useCompanyModules();
  const history = useHistory();
  const [ordersStats, setOrdersStats] = useState({ pedidosHoje: 0, pedidosEmAndamento: 0, pedidosConfirmados: 0, firstCardapioFormId: null });
  const [modulesWithDetails, setModulesWithDetails] = useState([]);

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

      // Fetch orders stats quando módulo lanchonetes ativo
      if (hasLanchonetes) {
        try {
          const { data: ordersData } = await api.get("/dashboard/orders-stats");
          setOrdersStats(ordersData || { pedidosHoje: 0, pedidosEmAndamento: 0, pedidosConfirmados: 0, firstCardapioFormId: null });
        } catch (err) {
          setOrdersStats({ pedidosHoje: 0, pedidosEmAndamento: 0, pedidosConfirmados: 0, firstCardapioFormId: null });
        }
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [period, dateFrom, dateTo, find, hasLanchonetes]);

  useEffect(() => {
    fetchData();
  }, []);

  // Módulos da empresa com nome e descrição (funcionalidades)
  useEffect(() => {
    const loadModulesWithDetails = async () => {
      if (!companyModuleSlugs?.length) {
        setModulesWithDetails([]);
        return;
      }
      try {
        const { data } = await api.get("/company/modules/available");
        const available = data.modules || [];
        const list = available.filter((m) => companyModuleSlugs.includes(m.id));
        setModulesWithDetails(list);
      } catch (err) {
        setModulesWithDetails([]);
      }
    };
    loadModulesWithDetails();
  }, [companyModuleSlugs]);

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


  // Buscar tarefas e agendamentos quando a aba Tarefas for aberta
  useEffect(() => {
    if (activeTab === 4) {
      fetchTasksAndAppointments();
    }
  }, [activeTab]); // eslint-disable-line

  const fetchTasksAndAppointments = async () => {
    setTasksTabLoading(true);
    try {
      // Buscar todas as tarefas
      const { data: tasksData } = await api.get("/tasks", {
        params: {
          showAll: true,
          limit: 100,
        },
      });
      setAllTasks(tasksData.tasks || []);

      // Buscar agendamentos
      try {
        const { data: appointmentsData } = await api.get("/user-appointments", {
          params: {
            pageNumber: 1,
            filterType: "all",
          },
        });
        setAppointments(appointmentsData.appointments || []);
      } catch (err) {
        console.log("Agendamentos não disponíveis");
        setAppointments([]);
      }
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
      setAllTasks([]);
    } finally {
      setTasksTabLoading(false);
    }
  };

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const handleGenerateSummary = async () => {
    // Gerar resumo por atendente
    setSummaryLoading(true);
    setSummaryText("");
    
    const selectedAgent = attendants.find((a) => a.id === Number(selectedAgentId));
    setSummaryAgentName(selectedAgent?.name || "Atendente");
    setSummaryModalOpen(true);

    try {
      const params = {
        maxMessages: 200,
        agentId: Number(selectedAgentId),
      };

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
      setSummaryModalOpen(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateGeneralSummary = async () => {
    setGeneralSummaryLoading(true);
    setGeneralSummary("");
    try {
      const params = {
        maxMessages: 200,
      };

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
      setGeneralSummary(data.summary || "Nenhum resumo disponível.");
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "GEMINI_KEY_MISSING") {
        toast.error("Configure a API Key do Gemini em Configurações → Integrações");
      } else {
        toastError(err);
      }
    } finally {
      setGeneralSummaryLoading(false);
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
              label={<Typography variant="caption" style={{ fontSize: "0.75rem" }}>Auto</Typography>}
            />

            <Tooltip title="Atualizar dados">
              <IconButton
                className={classes.refreshButton}
                onClick={fetchData}
                disabled={loading}
                size="small"
              >
                <RefreshIcon className={loading ? classes.spinning : ""} style={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Configurações">
              <IconButton
                onClick={() => history.push("/quick-access-buttons-settings")}
                size="small"
                className={classes.refreshButton}
              >
                <SettingsIcon style={{ fontSize: 18 }} />
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

        {/* Tabs */}
        <Paper className={classes.tabsContainer} elevation={0}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<DashboardIcon />} label="Visão Geral" />
            <Tab icon={<BarChartIcon />} label="Análises" />
            <Tab icon={<PeopleIcon />} label="Atendentes" />
            <Tab icon={<GeminiIcon />} label="IA" />
            <Tab icon={<AssignmentIcon />} label="Tarefas" />
          </Tabs>
        </Paper>

        {/* Tab Panel - Visão Geral */}
        {activeTab === 0 && (
          <Box className={classes.tabPanel}>
            {/* Primary Stats */}
            <Grid container spacing={3} className={classes.statsSection}>
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
        <Grid container spacing={3} className={classes.secondaryStats}>
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


          {hasLanchonetes && (
            <>
              <Grid item xs={6} sm={4} md={3}>
                <MiniStatCard
                  title="Pedidos Hoje"
                  value={ordersStats.pedidosHoje || 0}
                  icon={RestaurantIcon}
                  color="#F59E0B"
                  subtext="cardápio"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <MiniStatCard
                  title="Pedidos Em Andamento"
                  value={ordersStats.pedidosEmAndamento || 0}
                  icon={QueueIcon}
                  color="#F59E0B"
                  subtext="novo + confirmado + em preparo"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <MiniStatCard
                  title="Pedidos Confirmados"
                  value={ordersStats.pedidosConfirmados || 0}
                  icon={CheckCircleIcon}
                  color="#22C55E"
                  subtext="status confirmado"
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={2} flexWrap="wrap" marginTop={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AssignmentIcon />}
                    onClick={() => history.push("/pedidos")}
                    style={{ textTransform: "none", borderRadius: 8 }}
                  >
                    Kanban de Pedidos
                  </Button>
                  {ordersStats.firstCardapioFormId && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<QueueIcon />}
                        onClick={() => history.push(`/forms/${ordersStats.firstCardapioFormId}/fila-pedidos`)}
                        style={{ textTransform: "none", borderRadius: 8 }}
                      >
                        Fila de Pedidos
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => history.push(`/forms/${ordersStats.firstCardapioFormId}/historico-pedidos`)}
                        style={{ textTransform: "none", borderRadius: 8 }}
                      >
                        Histórico de Pedidos
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<RestaurantIcon />}
                    onClick={() => history.push("/forms")}
                    style={{ textTransform: "none", borderRadius: 8 }}
                  >
                    Formulários
                  </Button>
                </Box>
              </Grid>
            </>
          )}

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
          </Box>
        )}

        {/* Tab Panel - Análises */}
        {activeTab === 1 && (
          <Box className={classes.tabPanel}>
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
          </Box>
        )}

        {/* Tab Panel - Atendentes */}
        {activeTab === 2 && (
          <Box className={classes.tabPanel}>
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
            {attendants.length === 0 && (
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="textSecondary">
                  Nenhum atendente encontrado
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab Panel - IA */}
        {activeTab === 3 && (
          <Box className={classes.tabPanel}>
            {/* Geração de Resumos com IA */}
            <Typography className={classes.sectionTitle}>
              🤖 Resumos Automáticos com IA
            </Typography>
            <Grid container spacing={3}>
              {/* Resumo por Atendente */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  className={classes.modernCard}
                >
                  <Box display="flex" alignItems="center" gap={2} marginBottom={2}>
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: "rgba(139, 92, 246, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PeopleIcon style={{ fontSize: 24, color: "#8B5CF6" }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 4, fontSize: "1rem" }}>
                        Resumo por Atendente
                      </Typography>
                      <Typography variant="body2" color="textSecondary" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                        Gere resumos específicos para cada atendente
                      </Typography>
                    </Box>
                  </Box>
                  <FormControl fullWidth style={{ marginTop: 16 }}>
                    <InputLabel>Selecione o Atendente</InputLabel>
                    <Select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      label="Selecione o Atendente"
                    >
                      {attendants.map((attendant) => (
                        <MenuItem key={attendant.id} value={String(attendant.id)}>
                          {attendant.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading || !selectedAgentId}
                    startIcon={summaryLoading ? <CircularProgress size={20} /> : <PeopleIcon />}
                    style={{ marginTop: 16, textTransform: "none", borderRadius: 8, padding: "10px 16px" }}
                  >
                    {summaryLoading ? "Gerando..." : "Gerar Resumo do Atendente"}
                  </Button>
                  {summaryText && (
                    <Box marginTop={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                        <Typography variant="h6" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                          📄 Resumo: {summaryAgentName}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleDownloadSummary}
                            startIcon={<GetAppIcon />}
                            style={{ textTransform: "none", borderRadius: 8 }}
                          >
                            Baixar
                          </Button>
                          <IconButton 
                            size="small" 
                            onClick={() => setSummaryText("")}
                            style={{ 
                              backgroundColor: "transparent",
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box 
                        style={{ 
                          maxHeight: "400px", 
                          overflowY: "auto", 
                          padding: 16,
                          backgroundColor: theme.palette.type === "dark" 
                            ? "#1E293B" 
                            : "#FFFFFF",
                          borderRadius: 12,
                          border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
                          ...classes.scrollbarStyles
                        }}
                      >
                        <FormattedSummary text={summaryText} classes={classes} />
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Resumo Geral */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  className={classes.modernCard}
                >
                  <Box display="flex" alignItems="center" gap={2} marginBottom={2}>
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: "rgba(14, 165, 233, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <GeminiIcon style={{ fontSize: 24, color: "#0EA5E9" }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 4, fontSize: "1rem" }}>
                        Resumo Geral da Operação
                      </Typography>
                      <Typography variant="body2" color="textSecondary" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                        Gere um resumo completo das conversas e atividades do período selecionado
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleGenerateGeneralSummary}
                    disabled={generalSummaryLoading}
                    startIcon={generalSummaryLoading ? <CircularProgress size={20} /> : <GeminiIcon />}
                    style={{ marginTop: 16, textTransform: "none", borderRadius: 8, padding: "10px 16px" }}
                  >
                    {generalSummaryLoading ? "Gerando Resumo..." : "Gerar Resumo Geral"}
                  </Button>
                  {generalSummary && (
                    <Box marginTop={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                        <Typography variant="h6" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                          📄 Resumo Geral
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              const blob = new Blob([generalSummary], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `resumo-geral-${moment().format("YYYY-MM-DD")}.txt`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }}
                            startIcon={<GetAppIcon />}
                            style={{ textTransform: "none", borderRadius: 8 }}
                          >
                            Baixar
                          </Button>
                          <IconButton 
                            size="small" 
                            onClick={() => setGeneralSummary("")}
                            style={{ 
                              backgroundColor: "transparent",
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box 
                        style={{ 
                          maxHeight: "400px", 
                          overflowY: "auto", 
                          padding: 16,
                          backgroundColor: theme.palette.type === "dark" 
                            ? "#1E293B" 
                            : "#FFFFFF",
                          borderRadius: 12,
                          border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
                          ...classes.scrollbarStyles
                        }}
                      >
                        <FormattedSummary text={generalSummary} classes={classes} />
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab Panel - Tarefas */}
        {activeTab === 4 && (
          <Box className={classes.tabPanel}>
            <Typography className={classes.sectionTitle}>
              📋 Tarefas e Agendamentos
            </Typography>
            
            {tasksTabLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {/* Seção de Tarefas */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} className={classes.modernCard}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <AssignmentIcon style={{ fontSize: 24, color: "#0EA5E9" }} />
                        <Typography variant="h6" style={{ fontWeight: 600, fontSize: "1rem" }}>
                          Tarefas
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => history.push("/todolist")}
                        endIcon={<OpenInNewIcon />}
                        style={{ textTransform: "none", borderRadius: 8 }}
                      >
                        Ver todas
                      </Button>
                    </Box>
                    {allTasks.length > 0 ? (
                      <Box>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ fontWeight: 500, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: theme.palette.text.secondary, padding: "8px 16px" }}>
                                Tarefa
                              </TableCell>
                              <TableCell style={{ fontWeight: 500, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: theme.palette.text.secondary, padding: "8px 16px" }}>
                                Status
                              </TableCell>
                              <TableCell style={{ fontWeight: 500, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: theme.palette.text.secondary, padding: "8px 16px" }}>
                                Prioridade
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {allTasks.slice(0, 10).map((task) => (
                              <TableRow
                                key={task.id}
                                className={classes.taskRow}
                                onClick={() => history.push("/todolist")}
                                style={{ cursor: "pointer" }}
                              >
                                <TableCell style={{ padding: "12px 16px" }}>
                                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                                    {task.title || "Sem título"}
                                  </Typography>
                                  {task.description && (
                                    <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 4 }}>
                                      {task.description.length > 50 
                                        ? `${task.description.substring(0, 50)}...` 
                                        : task.description}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell style={{ padding: "12px 16px" }}>
                                  <Chip
                                    label={task.status === "pending" ? "Pendente" : task.status === "inProgress" ? "Em Progresso" : task.status === "completed" ? "Concluída" : "Cancelada"}
                                    size="small"
                                    style={{
                                      backgroundColor: task.status === "completed" 
                                        ? "rgba(34, 197, 94, 0.1)" 
                                        : task.status === "inProgress"
                                        ? "rgba(59, 130, 246, 0.1)"
                                        : task.status === "cancelled"
                                        ? "rgba(239, 68, 68, 0.1)"
                                        : "rgba(245, 158, 11, 0.1)",
                                      color: task.status === "completed" 
                                        ? "#22C55E" 
                                        : task.status === "inProgress"
                                        ? "#3B82F6"
                                        : task.status === "cancelled"
                                        ? "#EF4444"
                                        : "#F59E0B",
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                </TableCell>
                                <TableCell style={{ padding: "12px 16px" }}>
                                  <Chip
                                    label={task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                                    size="small"
                                    style={{
                                      backgroundColor: task.priority === "high" 
                                        ? "rgba(239, 68, 68, 0.1)" 
                                        : task.priority === "medium" 
                                        ? "rgba(245, 158, 11, 0.1)" 
                                        : "rgba(34, 197, 94, 0.1)",
                                      color: task.priority === "high" 
                                        ? "#EF4444" 
                                        : task.priority === "medium" 
                                        ? "#F59E0B" 
                                        : "#22C55E",
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {allTasks.length > 10 && (
                          <Box p={2} textAlign="center">
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => history.push("/todolist")}
                              endIcon={<OpenInNewIcon />}
                              style={{ textTransform: "none", borderRadius: 8 }}
                            >
                              Ver todas as tarefas ({allTasks.length})
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box py={4} textAlign="center">
                        <AssignmentIcon style={{ fontSize: 48, color: theme.palette.text.disabled, marginBottom: 2 }} />
                        <Typography variant="body2" color="textSecondary">
                          Nenhuma tarefa encontrada
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Seção de Agendamentos */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} className={classes.modernCard}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <EventIcon style={{ fontSize: 24, color: "#8B5CF6" }} />
                        <Typography variant="h6" style={{ fontWeight: 600, fontSize: "1rem" }}>
                          Agendamentos
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => history.push("/schedules")}
                        endIcon={<OpenInNewIcon />}
                        style={{ textTransform: "none", borderRadius: 8 }}
                      >
                        Ver todos
                      </Button>
                    </Box>
                    {appointments.length > 0 ? (
                      <Box>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ fontWeight: 500, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: theme.palette.text.secondary, padding: "8px 16px" }}>
                                Agendamento
                              </TableCell>
                              <TableCell style={{ fontWeight: 500, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: theme.palette.text.secondary, padding: "8px 16px" }}>
                                Data/Hora
                              </TableCell>
                              <TableCell style={{ fontWeight: 500, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: theme.palette.text.secondary, padding: "8px 16px" }}>
                                Contato
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {appointments.slice(0, 10).map((appointment) => (
                              <TableRow
                                key={appointment.id}
                                className={classes.taskRow}
                                onClick={() => history.push("/schedules")}
                                style={{ cursor: "pointer" }}
                              >
                                <TableCell style={{ padding: "12px 16px" }}>
                                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                                    {appointment.title || appointment.contact?.name || "Sem título"}
                                  </Typography>
                                  {appointment.description && (
                                    <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 4 }}>
                                      {appointment.description.length > 50 
                                        ? `${appointment.description.substring(0, 50)}...` 
                                        : appointment.description}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell style={{ padding: "12px 16px" }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {appointment.startDate 
                                      ? moment(appointment.startDate).format("DD/MM/YYYY HH:mm")
                                      : "-"}
                                  </Typography>
                                  {appointment.endDate && (
                                    <Typography variant="caption" color="textSecondary" style={{ display: "block" }}>
                                      até {moment(appointment.endDate).format("HH:mm")}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell style={{ padding: "12px 16px" }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {appointment.contact?.name || "-"}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {appointments.length > 10 && (
                          <Box p={2} textAlign="center">
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => history.push("/schedules")}
                              endIcon={<OpenInNewIcon />}
                              style={{ textTransform: "none", borderRadius: 8 }}
                            >
                              Ver todos os agendamentos ({appointments.length})
                            </Button>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box py={4} textAlign="center">
                        <EventIcon style={{ fontSize: 48, color: theme.palette.text.disabled, marginBottom: 2 }} />
                        <Typography variant="body2" color="textSecondary">
                          Nenhum agendamento encontrado
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
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
              <Box style={{ maxHeight: "60vh", overflowY: "auto", ...classes.scrollbarStyles }}>
                {summaryText ? (
                  <FormattedSummary text={summaryText} classes={classes} />
                ) : (
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: "center", padding: 24 }}>
                    Nenhum resumo disponível.
                  </Typography>
                )}
              </Box>
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
