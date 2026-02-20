import React from "react";
import { Paper, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(3),
    height: "100%",
    minHeight: "140px",
    position: "relative",
    overflow: "hidden",
    borderRadius: theme.spacing(2.5),
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: theme.palette.type === "dark" ? "#1E293B" : "#FFFFFF",
    border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
    boxShadow: theme.palette.type === "dark" 
      ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)" 
      : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2.5),
      minHeight: "120px",
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
      minHeight: "110px",
    },
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.palette.type === "dark"
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)"
        : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      borderColor: theme.palette.type === "dark" ? "#475569" : "#D1D5DB",
    },
  },
  content: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    lineHeight: 1.4,
    [theme.breakpoints.down('sm')]: {
      fontSize: "0.7rem",
    },
  },
  value: {
    fontSize: "2.25rem",
    fontWeight: 700,
    lineHeight: 1.2,
    color: theme.palette.text.primary,
    letterSpacing: "-0.02em",
    [theme.breakpoints.down('sm')]: {
      fontSize: "1.875rem",
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: "1.5rem",
    },
  },
  iconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    "& svg": {
      fontSize: "24px",
      [theme.breakpoints.down('sm')]: {
        fontSize: "20px",
      },
    },
    [theme.breakpoints.down('sm')]: {
      width: "40px",
      height: "40px",
    },
  },
  trendIndicator: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1.5),
    fontSize: "0.75rem",
    fontWeight: 500,
    gap: theme.spacing(0.5),
  },
}));

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "#0EA5E9",
  trend,
  trendValue,
  gradient,
  onClick,
}) => {
  const classes = useStyles();

  const iconBgColor = `${color}15`;
  const iconColor = color;

  return (
    <Paper
      className={classes.card}
      elevation={0}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <Box className={classes.content}>
        <Box className={classes.header}>
          <Typography className={classes.title}>
            {title}
          </Typography>
          {Icon && (
            <Box
              className={classes.iconContainer}
              style={{
                backgroundColor: iconBgColor,
              }}
            >
              <Icon style={{ color: iconColor }} />
            </Box>
          )}
        </Box>
        
        <Box>
          <Typography className={classes.value}>
            {value}
          </Typography>

          {trend && trendValue && (
            <Box className={classes.trendIndicator}>
              <span style={{ 
                color: trend === "up" ? "#22C55E" : "#EF4444",
                fontSize: "0.875rem"
              }}>
                {trend === "up" ? "↑" : "↓"}
              </span>
              <span style={{ 
                color: trend === "up" ? "#22C55E" : "#EF4444",
              }}>
                {trendValue}
              </span>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;

