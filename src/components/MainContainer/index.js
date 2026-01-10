import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container as MuiContainer, Paper, Typography, Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    minHeight: 'calc(100vh - 48px)',
    backgroundColor: theme.palette.type === 'dark' 
      ? '#0f1419'
      : '#f5f7fa',
    padding: 0,
    margin: 0,
  },
  container: {
    maxWidth: '100%',
    width: '100%',
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: 12,
    boxShadow: theme.palette.type === 'dark'
      ? '0 4px 20px rgba(0, 0, 0, 0.5)'
      : '0 2px 12px rgba(0, 0, 0, 0.08)',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  header: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
    },
  },
  noPaper: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
}));

const MainContainer = ({ 
  children, 
  maxWidth = false, 
  usePaper = true,
  title,
  actions,
  headerContent,
  ...props 
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <MuiContainer 
        className={classes.container} 
        maxWidth={maxWidth}
        disableGutters={!maxWidth}
      >
        {(title || headerContent) && (
          <Box className={classes.header}>
            {title && (
              <Typography component="h1" className={classes.title}>
                {title}
              </Typography>
            )}
            {headerContent}
            {actions && <Box>{actions}</Box>}
          </Box>
        )}
        
        {usePaper ? (
          <Paper className={classes.paper} {...props}>
            {children}
          </Paper>
        ) : (
          <div className={classes.noPaper} {...props}>
            {children}
          </div>
        )}
      </MuiContainer>
    </div>
  );
};

export default MainContainer;
