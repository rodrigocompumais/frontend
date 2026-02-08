import React, { useState, useContext, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  makeStyles,
  AppBar,
  Toolbar,
  useTheme,
  Button,
} from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";

import NotificationsPopOver from "../components/NotificationsPopOver";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import NavigationMenus from "../components/NavigationMenus";
import UserProfileMenu from "../components/UserProfileMenu";
import MobileNavigationMenu from "../components/MobileNavigationMenu";
import TourGuide from "../components/TourGuide";
import TasksNotification from "../components/TasksNotification";
import QuickAccessButtons from "../components/QuickAccessButtons";
import TrialBanner from "../components/TrialBanner";

import { SocketContext } from "../context/Socket/SocketContext";
import ChatPopover from "../pages/Chat/ChatPopover";
import AiChatFloating from "../components/AiChatFloating";
import useChatNotifications from "../hooks/useChatNotifications";
import useTicketNotifications from "../hooks/useTicketNotifications";
import useCompanyModules from "../hooks/useCompanyModules";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: theme.palette.fancyBackground,
    '& .MuiButton-outlinedPrimary': {
      color: theme.mode === 'light' ? '#FFF' : '#FFF',
      backgroundColor: theme.mode === 'light' ? theme.palette.primary.main : '#1c1c1c',
    },
    '& .MuiTab-textColorPrimary.Mui-selected': {
      color: theme.mode === 'light' ? 'Primary' : '#FFF',
    }
  },
  toolbar: {
    paddingRight: 16,
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 4,
    minHeight: 56,
    color: theme.palette.dark.main,
    background: theme.palette.barraSuperior,
    display: 'flex',
    alignItems: 'center',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  dashboardButton: {
    marginRight: theme.spacing(1.5),
    padding: theme.spacing(1, 2),
    color: '#FFF',
    textTransform: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0.75, 1.5),
    },
  },
  dashboardIcon: {
    fontSize: "20px",
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: "18px",
      marginRight: theme.spacing(0.5),
    },
  },
  grow: {
    flexGrow: 1,
  },
  appBarSpacer: {
    minHeight: "48px",
    height: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
    width: '100%',
    display: "flex",
    flexDirection: "column",
  },
  contentNoScroll: {
    flex: 1,
    overflow: "hidden",
    width: '100%',
    display: "flex",
    flexDirection: "column",
  },
}));

const LoggedInLayout = ({ children, themeToggle }) => {
  const location = useLocation();
  const history = useHistory();
  const { hasLanchonetes } = useCompanyModules();
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";
  const isChatPage = location.pathname.startsWith("/chats");
  const isGarcomPage = location.pathname === "/garcom";
  const isCozinhaPage = location.pathname === "/cozinha";
  const isEntregadorPage = location.pathname === "/entregador";
  const classes = useStyles();
  const { handleLogout, loading } = useContext(AuthContext);
  const { user } = useContext(AuthContext);

  const theme = useTheme();

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const socketManager = useContext(SocketContext);

  // Hooks de notificação de chats
  useChatNotifications();
  useTicketNotifications();

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");

    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [socketManager]);

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      {/* Banner de período de teste */}
      <TrialBanner />
      
      {!isGarcomPage && !isCozinhaPage && !isEntregadorPage && (
      <AppBar
        position="static"
        className={classes.appBar}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          {/* Botão Dashboard à esquerda */}
          <Button
            className={classes.dashboardButton}
            onClick={() => history.push('/dashboard')}
            startIcon={<DashboardIcon className={classes.dashboardIcon} />}
            aria-label={hasLanchonetes ? "Ir para Lanchonetes" : "Ir para Dashboard"}
          >
            {hasLanchonetes ? "Lanchonetes" : "Dashboard"}
          </Button>

          {/* Menus de navegação dropdown (desktop) */}
          <div className="tour-menu-navigation">
            <NavigationMenus />
          </div>

          {/* Menu mobile (hamburguer) */}
          <MobileNavigationMenu />

          {/* Espaçador flexível */}
          <div className={classes.grow} />

          {/* Notificações e popovers */}
          {user.id && <NotificationsPopOver volume={volume} />}

          {user.id && <TasksNotification />}

          <AnnouncementsPopover />

          <ChatPopover />

          {/* Menu de perfil do usuário (agora inclui todos os controles) */}
          <UserProfileMenu volume={volume} setVolume={setVolume} />
        </Toolbar>
      </AppBar>
      )}
      
      <main className={isChatPage ? classes.contentNoScroll : classes.content}>
        {children ? children : null}
        <QuickAccessButtons />
      </main>
      
      {isDashboard && <AiChatFloating />}
      <TourGuide />
    </div>
  );
};

export default LoggedInLayout;
