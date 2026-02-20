import React from "react";
import { Paper, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2.5),
    height: "100%",
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
    backgroundColor: theme.palette.type === "dark" ? "#1E293B" : "#FFFFFF",
    transition: "all 0.2s ease",
    boxShadow: theme.palette.type === "dark" 
      ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)" 
      : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.palette.type === "dark"
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)"
        : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      borderColor: theme.palette.type === "dark" ? "#475569" : "#D1D5DB",
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(1.5),
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    lineHeight: 1.4,
  },
  valueContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  value: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  suffix: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
  trend: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: `${theme.spacing(0.25)} ${theme.spacing(0.75)}`,
    borderRadius: theme.spacing(0.5),
  },
  trendUp: {
    color: "#22C55E",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  trendDown: {
    color: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  subtext: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
  },
}));

const MiniStatCard = ({
  title,
  value,
  suffix,
  icon: Icon,
  color = "#3B82F6",
  trend,
  trendValue,
  subtext,
}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.card} elevation={0}>
      <Box className={classes.header}>
        <Typography className={classes.title}>{title}</Typography>
        {Icon && (
          <Box
            className={classes.iconWrapper}
            style={{
              backgroundColor: `${color}15`,
            }}
          >
            <Icon style={{ fontSize: 20, color }} />
          </Box>
        )}
      </Box>

      <Box className={classes.valueContainer}>
        <Typography className={classes.value}>{value}</Typography>
        {suffix && <Typography className={classes.suffix}>{suffix}</Typography>}
      </Box>

      {(trend || subtext) && (
        <Box className={classes.footer}>
          {trend && (
            <Box className={`${classes.trend} ${trend === "up" ? classes.trendUp : classes.trendDown}`}>
              {trend === "up" ? (
                <TrendingUpIcon style={{ fontSize: 14 }} />
              ) : (
                <TrendingDownIcon style={{ fontSize: 14 }} />
              )}
              {trendValue}
            </Box>
          )}
          {subtext && (
            <Typography className={classes.subtext}>{subtext}</Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default MiniStatCard;

