import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  makeStyles,
  AppBar,
  Toolbar,
  useTheme,
} from "@material-ui/core";

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

import logo from "../assets/logo.png";
import { SocketContext } from "../context/Socket/SocketContext";
import ChatPopover from "../pages/Chat/ChatPopover";
import AiChatFloating from "../components/AiChatFloating";

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
    paddingRight: 24,
    paddingLeft: 16,
    color: theme.palette.dark.main,
    background: theme.palette.barraSuperior,
    display: 'flex',
    alignItems: 'center',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  logo: {
    height: "90px",
    width: "auto",
    maxWidth: 350,
    marginRight: theme.spacing(2),
    cursor: 'pointer',
    [theme.breakpoints.down("xs")]: {
      height: "80px",
      maxWidth: 300,
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
  },
}));

const LoggedInLayout = ({ children, themeToggle }) => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/";
  const classes = useStyles();
  const { handleLogout, loading } = useContext(AuthContext);
  const { user } = useContext(AuthContext);

  const theme = useTheme();

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const socketManager = useContext(SocketContext);

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
          {/* Logo à esquerda */}
          <img 
            src={logo} 
            className={classes.logo} 
            alt="logo"
            onClick={() => window.location.href = '/'}
          />

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

          <AnnouncementsPopover />

          <ChatPopover />

          {/* Menu de perfil do usuário (agora inclui todos os controles) */}
          <UserProfileMenu volume={volume} setVolume={setVolume} />
        </Toolbar>
      </AppBar>
      
      <main className={classes.content}>
        {children ? children : null}
      </main>
      
      {isDashboard && <AiChatFloating />}
      <TourGuide />
    </div>
  );
};

export default LoggedInLayout;
