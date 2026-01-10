import React, { useState, useContext } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  makeStyles,
  useTheme,
  Switch,
} from '@material-ui/core';
import {
  Person as PersonIcon,
  ExitToApp as ExitIcon,
  Language as LanguageIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  VolumeUp as VolumeIcon,
  Cached as CachedIcon,
} from '@material-ui/icons';
import { AuthContext } from '../../context/Auth/AuthContext';
import UserModal from '../UserModal';
import { i18n } from '../../translate/i18n';
import NotificationsVolume from '../NotificationsVolume';
import LanguageControl from '../LanguageControl';
import ColorModeContext from '../../layout/themeContext';

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: 32,
    height: 32,
    fontSize: '1rem',
    backgroundColor: theme.palette.primary.main,
  },
  userName: {
    padding: theme.spacing(1.5, 2),
    fontWeight: 600,
    minWidth: 220,
  },
  menuItem: {
    minWidth: 220,
  },
  nestedItem: {
    paddingLeft: theme.spacing(4),
  },
}));

const UserProfileMenu = ({ volume, setVolume }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { user, handleLogout } = useContext(AuthContext);
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setLanguageMenuOpen(false);
  };

  const handleOpenProfile = () => {
    setUserModalOpen(true);
    handleClose();
  };

  const handleLogoutClick = () => {
    handleClose();
    handleLogout();
  };

  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleMenu} style={{ color: 'white' }}>
        <Avatar alt={user.name} src={user.avatar} className={classes.avatar}>
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled className={classes.userName}>
          <Typography variant="body2">
            {user.name}
          </Typography>
        </MenuItem>
        <Divider />
        
        <MenuItem onClick={handleOpenProfile} className={classes.menuItem}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.appBar.user.profile")} />
        </MenuItem>

        <Divider />

        {/* Idioma */}
        <MenuItem 
          onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
          className={classes.menuItem}
        >
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Idioma" />
        </MenuItem>
        {languageMenuOpen && (
          <MenuItem className={classes.nestedItem}>
            <LanguageControl />
          </MenuItem>
        )}

        {/* Dark Mode */}
        <MenuItem onClick={toggleColorMode} className={classes.menuItem}>
          <ListItemIcon>
            {theme.mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={theme.mode === 'dark' ? 'Modo Claro' : 'Modo Escuro'} />
        </MenuItem>

        {/* Volume */}
        <MenuItem className={classes.menuItem}>
          <ListItemIcon>
            <VolumeIcon fontSize="small" />
          </ListItemIcon>
          <div style={{ flex: 1, marginRight: 8 }}>
            <NotificationsVolume
              setVolume={setVolume}
              volume={volume}
            />
          </div>
        </MenuItem>

        {/* Refresh */}
        <MenuItem onClick={handleRefreshPage} className={classes.menuItem}>
          <ListItemIcon>
            <CachedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Recarregar Página" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogoutClick} className={classes.menuItem}>
          <ListItemIcon>
            <ExitIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.appBar.user.logout")} />
        </MenuItem>
      </Menu>

      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
    </>
  );
};

export default UserProfileMenu;
