import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, useMediaQuery, useTheme } from '@material-ui/core';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import { makeStyles } from '@material-ui/core/styles';
import { i18n } from '../../translate/i18n';

const useStyles = makeStyles((theme) => ({
  quickAction: {
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.success.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
    fontWeight: 'bold',
    textTransform: 'none',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderRadius: theme.spacing(3),
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    [theme.breakpoints.down('xs')]: {
      minWidth: 'auto',
      padding: theme.spacing(1),
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      marginRight: theme.spacing(1),
    },
  },
}));

const QuickActionButton = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  const handleClick = () => {
    history.push('/tickets');
  };

  return (
    <Button
      variant="contained"
      className={classes.quickAction}
      startIcon={<WhatsAppIcon />}
      onClick={handleClick}
    >
      {!isMobile && i18n.t("navigation.quickAction")}
    </Button>
  );
};

export default QuickActionButton;
