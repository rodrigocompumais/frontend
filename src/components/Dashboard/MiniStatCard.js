import React from "react";
import { Paper, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2),
    height: "100%",
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
      borderColor: theme.palette.primary.main,
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(1),
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  valueContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: theme.spacing(0.5),
  },
  value: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  suffix: {
    fontSize: "0.85rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  trend: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: 4,
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
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1),
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

