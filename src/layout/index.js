import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  makeStyles,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
} from "@material-ui/core";

import CachedIcon from "@material-ui/icons/Cached";

import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import NavigationMenus from "../components/NavigationMenus";
import QuickActionButton from "../components/QuickActionButton";
import UserProfileMenu from "../components/UserProfileMenu";
import MobileNavigationMenu from "../components/MobileNavigationMenu";

import logo from "../assets/logo.png";
import { SocketContext } from "../context/Socket/SocketContext";
import ChatPopover from "../pages/Chat/ChatPopover";
import AiChatFloating from "../components/AiChatFloating";

import ColorModeContext from "../layout/themeContext";
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import LanguageControl from "../components/LanguageControl";
import { LanguageOutlined } from "@material-ui/icons";

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
    height: "36px",
    width: "auto",
    maxWidth: 150,
    marginRight: theme.spacing(2),
    cursor: 'pointer',
    [theme.breakpoints.down("xs")]: {
      height: "32px",
      maxWidth: 120,
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
  const { colorMode } = useContext(ColorModeContext);

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  // Languages
  const [anchorElLanguage, setAnchorElLanguage] = useState(null);
  const [menuLanguageOpen, setMenuLanguageOpen] = useState(false);

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

  const handlemenuLanguage = (event) => {
    setAnchorElLanguage(event.currentTarget);
    setMenuLanguageOpen(true);
  };

  const handleCloseMenuLanguage = () => {
    setAnchorElLanguage(null);
    setMenuLanguageOpen(false);
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  };

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
          <NavigationMenus />

          {/* Menu mobile (hamburguer) */}
          <MobileNavigationMenu />

          {/* Espaçador flexível */}
          <div className={classes.grow} />

          {/* Botão de ação rápida */}
          <QuickActionButton />

          {/* Ações rápidas existentes */}
          <div>
            <IconButton edge="start">
              <LanguageOutlined
                aria-label="select language"
                aria-controls="menu-appbar-language"
                aria-haspopup="true"
                onClick={handlemenuLanguage}
                variant="contained"
                style={{ color: "white", marginRight: 10 }}
              />
            </IconButton>
            <Menu
              id="menu-appbar-language"
              anchorEl={anchorElLanguage}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuLanguageOpen}
              onClose={handleCloseMenuLanguage}
            >
              <MenuItem>
                <LanguageControl />
              </MenuItem>
            </Menu>
          </div>

          <IconButton edge="start" onClick={toggleColorMode}>
            {theme.mode === 'dark' ? <Brightness7Icon style={{ color: "white" }} /> : <Brightness4Icon style={{ color: "white" }} />}
          </IconButton>

          <NotificationsVolume
            setVolume={setVolume}
            volume={volume}
          />

          <IconButton
            onClick={handleRefreshPage}
            aria-label={i18n.t("mainDrawer.appBar.refresh")}
            color="inherit"
          >
            <CachedIcon style={{ color: "white" }} />
          </IconButton>

          {user.id && <NotificationsPopOver volume={volume} />}

          <AnnouncementsPopover />

          <ChatPopover />

          {/* Menu de perfil do usuário */}
          <UserProfileMenu />
        </Toolbar>
      </AppBar>
      
      <main className={classes.content}>
        {children ? children : null}
      </main>
      
      {isDashboard && <AiChatFloating />}
    </div>
  );
};

export default LoggedInLayout;
