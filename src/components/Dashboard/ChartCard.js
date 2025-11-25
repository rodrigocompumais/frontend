import React from "react";
import { Paper, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(3),
    height: "100%",
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  title: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  content: {
    marginTop: theme.spacing(2),
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
  },
}));

const ChartCard = ({
  title,
  subtitle,
  children,
  actions,
  className,
}) => {
  const classes = useStyles();

  return (
    <Paper className={`${classes.card} ${className || ""}`} elevation={0}>
      <Box className={classes.header}>
        <Box>
          <Typography className={classes.title} variant="h6">
            {title}
          </Typography>
          {subtitle && (
            <Typography className={classes.subtitle} variant="body2">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box className={classes.actions}>
            {actions}
          </Box>
        )}
      </Box>
      <Box className={classes.content}>
        {children}
      </Box>
    </Paper>
  );
};

export default ChartCard;

