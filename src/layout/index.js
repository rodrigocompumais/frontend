import React, { useState, useContext, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  makeStyles,
  AppBar,
  Toolbar,
  useTheme,
  IconButton,
} from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";

import NotificationsPopOver from "../components/NotificationsPopOver";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import NavigationMenus from "../components/NavigationMenus";
import QuickActionButton from "../components/QuickActionButton";
import UserProfileMenu from "../components/UserProfileMenu";
import MobileNavigationMenu from "../components/MobileNavigationMenu";
import TourGuide from "../components/TourGuide";
import TasksNotification from "../components/TasksNotification";
import QuickAccessButtons from "../components/QuickAccessButtons";

import { SocketContext } from "../context/Socket/SocketContext";
import ChatPopover from "../pages/Chat/ChatPopover";
import AiChatFloating from "../components/AiChatFloating";
import useChatNotifications from "../hooks/useChatNotifications";
import useTicketNotifications from "../hooks/useTicketNotifications";

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
    padding: theme.spacing(1),
    color: theme.palette.dark.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(0.75),
    },
  },
  dashboardIcon: {
    fontSize: "28px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "24px",
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
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";
  const isChatPage = location.pathname.startsWith("/chats");
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
      <AppBar
        position="static"
        className={classes.appBar}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          {/* Botão Dashboard à esquerda */}
          <IconButton
            className={classes.dashboardButton}
            onClick={() => history.push('/dashboard')}
            aria-label="Ir para Dashboard"
            title="Dashboard"
          >
            <DashboardIcon className={classes.dashboardIcon} />
          </IconButton>

          {/* Menus de navegação dropdown (desktop) */}
          <div className="tour-menu-navigation">
            <NavigationMenus />
          </div>

          {/* Menu mobile (hamburguer) */}
          <MobileNavigationMenu />

          {/* Espaçador flexível */}
          <div className={classes.grow} />

          {/* Botão de ação rápida */}
          <QuickActionButton />

          {/* Notificações e popovers */}
          {user.id && <NotificationsPopOver volume={volume} />}

          {user.id && <TasksNotification />}

          <AnnouncementsPopover />

          <ChatPopover />

          {/* Menu de perfil do usuário (agora inclui todos os controles) */}
          <UserProfileMenu volume={volume} setVolume={setVolume} />
        </Toolbar>
      </AppBar>
      
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
