// Lista de rotas disponíveis para botões de acesso rápido
// Cada rota tem: path, label, defaultIcon

export const AVAILABLE_ROUTES = [
  { path: "/dashboard", label: "Dashboard", defaultIcon: "DashboardIcon" },
  { path: "/tickets", label: "Tickets", defaultIcon: "ChatIcon" },
  { path: "/contacts", label: "Contatos", defaultIcon: "PeopleIcon" },
  { path: "/todolist", label: "Tarefas", defaultIcon: "AssignmentIcon" },
  { path: "/kanban", label: "Kanban", defaultIcon: "ViewKanbanIcon" },
  { path: "/queues", label: "Filas", defaultIcon: "QueueIcon" },
  { path: "/users", label: "Usuários", defaultIcon: "PeopleIcon" },
  { path: "/settings", label: "Configurações", defaultIcon: "SettingsIcon" },
  { path: "/prompts", label: "Prompts", defaultIcon: "ChatBubbleIcon" },
  { path: "/files", label: "Arquivos", defaultIcon: "FolderIcon" },
  { path: "/tags", label: "Tags", defaultIcon: "LabelIcon" },
  { path: "/schedules", label: "Agendamentos", defaultIcon: "ScheduleIcon" },
  { path: "/quick-messages", label: "Mensagens Rápidas", defaultIcon: "MessageIcon" },
  { path: "/connections", label: "Conexões", defaultIcon: "LinkIcon" },
  { path: "/chats", label: "Chats", defaultIcon: "ChatIcon" },
  { path: "/helps", label: "Ajuda", defaultIcon: "HelpIcon" },
  { path: "/messages-api", label: "API de Mensagens", defaultIcon: "ApiIcon" },
  { path: "/queue-integration", label: "Integração de Filas", defaultIcon: "ExtensionIcon" },
  { path: "/financeiro", label: "Financeiro", defaultIcon: "AccountBalanceIcon" },
  { path: "/announcements", label: "Anúncios", defaultIcon: "AnnouncementIcon" },
  { path: "/subscription", label: "Assinatura", defaultIcon: "CardMembershipIcon" },
  { path: "/contact-lists", label: "Listas de Contatos", defaultIcon: "ListIcon" },
  { path: "/campaigns", label: "Campanhas", defaultIcon: "CampaignIcon" },
  { path: "/campaigns-config", label: "Config. Campanhas", defaultIcon: "SettingsIcon" },
  { path: "/phrase-lists", label: "Listas de Frases", defaultIcon: "FormatQuoteIcon" },
  { path: "/flowbuilders", label: "Flow Builders", defaultIcon: "AccountTreeIcon" },
  { path: "/forms", label: "Formulários", defaultIcon: "DescriptionIcon" },
];

// Ícones Material-UI disponíveis
export const AVAILABLE_ICONS = [
  "DashboardIcon",
  "ChatIcon",
  "PeopleIcon",
  "AssignmentIcon",
  "ViewKanbanIcon",
  "QueueIcon",
  "SettingsIcon",
  "ChatBubbleIcon",
  "FolderIcon",
  "LabelIcon",
  "ScheduleIcon",
  "MessageIcon",
  "LinkIcon",
  "HelpIcon",
  "ApiIcon",
  "ExtensionIcon",
  "AccountBalanceIcon",
  "AnnouncementIcon",
  "CardMembershipIcon",
  "ListIcon",
  "CampaignIcon",
  "FormatQuoteIcon",
  "AccountTreeIcon",
  "DescriptionIcon",
  "HomeIcon",
  "StarIcon",
  "FavoriteIcon",
  "BookmarkIcon",
  "NotificationsIcon",
  "EmailIcon",
  "PhoneIcon",
  "LocationOnIcon",
  "BusinessIcon",
  "WorkIcon",
  "SchoolIcon",
  "ShoppingCartIcon",
  "PaymentIcon",
  "CreditCardIcon",
  "ReceiptIcon",
  "BarChartIcon",
  "PieChartIcon",
  "TimelineIcon",
  "HistoryIcon",
  "CalendarTodayIcon",
  "EventIcon",
  "AccessTimeIcon",
  "AlarmIcon",
  "CheckCircleIcon",
  "CancelIcon",
  "AddCircleIcon",
  "RemoveCircleIcon",
  "EditIcon",
  "DeleteIcon",
  "SearchIcon",
  "FilterListIcon",
  "SortIcon",
  "ArrowUpwardIcon",
  "ArrowDownwardIcon",
  "ArrowForwardIcon",
  "ArrowBackIcon",
  "RefreshIcon",
  "SyncIcon",
  "CloudUploadIcon",
  "CloudDownloadIcon",
  "DownloadIcon",
  "UploadIcon",
  "FileCopyIcon",
  "PrintIcon",
  "ShareIcon",
  "LockIcon",
  "LockOpenIcon",
  "VisibilityIcon",
  "VisibilityOffIcon",
  "InfoIcon",
  "WarningIcon",
  "ErrorIcon",
  "CheckIcon",
  "CloseIcon",
  "MenuIcon",
  "MoreVertIcon",
  "MoreHorizIcon",
];

// Cores padrão para botões
export const DEFAULT_COLORS = [
  "#1976d2", // Azul
  "#388e3c", // Verde
  "#f57c00", // Laranja
  "#d32f2f", // Vermelho
  "#7b1fa2", // Roxo
  "#0288d1", // Azul claro
  "#c2185b", // Rosa
  "#00796b", // Verde água
  "#5d4037", // Marrom
  "#455a64", // Cinza azulado
  "#e64a19", // Laranja escuro
  "#303f9f", // Índigo
];

// Função helper para obter informações de uma rota
export const getRouteInfo = (path) => {
  return AVAILABLE_ROUTES.find((route) => route.path === path) || {
    path,
    label: path,
    defaultIcon: "LinkIcon",
  };
};
