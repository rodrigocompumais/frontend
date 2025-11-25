import React from "react";
import { Paper, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(3),
    height: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: theme.spacing(2),
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[8],
    },
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    opacity: 0.1,
    filter: "blur(40px)",
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.7)" 
      : "rgba(0, 0, 0, 0.6)",
    marginBottom: theme.spacing(1),
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: theme.spacing(0.5),
  },
  iconContainer: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },
  trendIndicator: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
    fontSize: "0.75rem",
    fontWeight: 500,
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
}) => {
  const classes = useStyles();

  const gradientColors = gradient || [color, color];

  return (
    <Paper
      className={classes.card}
      style={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: "#FFFFFF",
      }}
      elevation={2}
    >
      <Box
        className={classes.gradientOverlay}
        style={{
          background: color,
        }}
      />
      
      <Box className={classes.content}>
        <Typography className={classes.title} variant="body2">
          {title}
        </Typography>
        
        <Typography className={classes.value} variant="h4">
          {value}
        </Typography>

        {trend && trendValue && (
          <Box className={classes.trendIndicator}>
            <span style={{ marginRight: 4 }}>
              {trend === "up" ? "↑" : "↓"}
            </span>
            <span>{trendValue}</span>
          </Box>
        )}
      </Box>

      {Icon && (
        <Box
          className={classes.iconContainer}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Icon style={{ fontSize: 28, color: "#FFFFFF" }} />
        </Box>
      )}
    </Paper>
  );
};

export default StatCard;

