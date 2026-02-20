import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Paper, Typography, Box, Avatar } from "@material-ui/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.type === "dark" ? "#1E293B" : "#FFFFFF",
    border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
    height: "100%",
    boxShadow: theme.palette.type === "dark" 
      ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)" 
      : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: theme.palette.type === "dark"
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.4)"
        : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  title: {
    fontWeight: 600,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    lineHeight: 1.2,
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    fontWeight: 400,
  },
  chartContainer: {
    height: 280,
    [theme.breakpoints.down('sm')]: {
      height: 240,
    },
  },
  tooltip: {
    backgroundColor: theme.palette.type === "dark" ? "#1E293B" : "#FFFFFF",
    border: `1px solid ${theme.palette.type === "dark" ? "#334155" : "#E5E7EB"}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1.5),
    boxShadow: theme.palette.type === "dark"
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.4)"
      : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.type === "dark" 
        ? "rgba(255, 255, 255, 0.05)" 
        : "rgba(0, 0, 0, 0.02)",
    },
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "0.75rem",
    flexShrink: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    fontSize: "0.875rem",
    backgroundColor: theme.palette.primary.main,
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    lineHeight: 1.4,
    marginBottom: theme.spacing(0.25),
  },
  itemValue: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
  },
  progressBar: {
    height: 6,
    borderRadius: theme.spacing(0.75),
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.1)" 
      : "rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    marginTop: theme.spacing(0.75),
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.spacing(0.75),
    transition: "width 0.5s ease",
  },
}));

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"];

const CustomTooltip = ({ active, payload, classes }) => {
  if (active && payload && payload.length) {
    return (
      <div className={classes.tooltip}>
        <Typography style={{ fontWeight: 600, marginBottom: 4 }}>
          {payload[0].payload.name}
        </Typography>
        <Typography style={{ color: payload[0].fill }}>
          {payload[0].value} tickets resolvidos
        </Typography>
      </div>
    );
  }
  return null;
};

const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const BarChartComponent = ({ 
  data = [], 
  title, 
  subtitle,
  showAsList = false,
  horizontal = false,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const maxValue = Math.max(...data.map(d => d.count), 1);

  if (showAsList) {
    return (
      <Paper className={classes.container} elevation={0}>
        <Box className={classes.header}>
          <Typography className={classes.title}>{title}</Typography>
          {subtitle && (
            <Typography className={classes.subtitle}>{subtitle}</Typography>
          )}
        </Box>
        <Box className={classes.listContainer}>
          {data.slice(0, 5).map((item, index) => (
            <Box key={index} className={classes.listItem}>
              <Box 
                className={classes.rank}
                style={{ 
                  backgroundColor: index < 3 ? COLORS[index] : theme.palette.action.hover,
                  color: index < 3 ? "#fff" : theme.palette.text.secondary,
                }}
              >
                {index + 1}
              </Box>
              <Avatar className={classes.avatar}>
                {getInitials(item.name)}
              </Avatar>
              <Box className={classes.itemInfo}>
                <Typography className={classes.itemName}>
                  {item.name}
                </Typography>
                <Typography className={classes.itemValue}>
                  {item.count} tickets
                </Typography>
                <Box className={classes.progressBar}>
                  <Box 
                    className={classes.progressFill}
                    style={{ 
                      width: `${(item.count / maxValue) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
          {data.length === 0 && (
            <Typography color="textSecondary" align="center" style={{ padding: 16 }}>
              Nenhum dado disponível
            </Typography>
          )}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={classes.container} elevation={0}>
      <Box className={classes.header}>
        <Typography className={classes.title}>{title}</Typography>
        {subtitle && (
          <Typography className={classes.subtitle}>{subtitle}</Typography>
        )}
      </Box>
      <Box className={classes.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 10, right: 10, left: horizontal ? 60 : -10, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme.palette.divider}
              horizontal={!horizontal}
              vertical={horizontal}
            />
            {horizontal ? (
              <>
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  width={50}
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                />
              </>
            )}
            <Tooltip content={<CustomTooltip classes={classes} />} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default BarChartComponent;

