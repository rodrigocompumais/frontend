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
} from '@material-ui/core';
import {
  Person as PersonIcon,
  ExitToApp as ExitIcon,
} from '@material-ui/icons';
import { AuthContext } from '../../context/Auth/AuthContext';
import UserModal from '../UserModal';
import { i18n } from '../../translate/i18n';

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
    minWidth: 180,
  },
}));

const UserProfileMenu = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const { user, handleLogout } = useContext(AuthContext);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    setUserModalOpen(true);
    handleClose();
  };

  const handleLogoutClick = () => {
    handleClose();
    handleLogout();
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
        <MenuItem onClick={handleOpenProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={i18n.t("mainDrawer.appBar.user.profile")} />
        </MenuItem>
        <MenuItem onClick={handleLogoutClick}>
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
