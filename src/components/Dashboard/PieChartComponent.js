import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Paper, Typography, Box } from "@material-ui/core";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: theme.spacing(0.5),
    flexShrink: 0,
  },
}));

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const statusColors = {
  open: "#3B82F6",
  pending: "#F59E0B",
  closed: "#22C55E",
};

const statusLabels = {
  open: "Em Atendimento",
  pending: "Aguardando",
  closed: "Finalizado",
};

const CustomTooltip = ({ active, payload, classes }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={classes.tooltip}>
        <Typography style={{ fontWeight: 600, marginBottom: 4 }}>
          {data.name}
        </Typography>
        <Typography style={{ color: data.payload.fill }}>
          {data.value} ({((data.value / data.payload.total) * 100).toFixed(1)}%)
        </Typography>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload, classes }) => {
  return (
    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={1}>
      {payload.map((entry, index) => (
        <Box key={index} className={classes.legendItem}>
          <Box 
            className={classes.legendColor} 
            style={{ backgroundColor: entry.color }} 
          />
          <span>{entry.value}</span>
        </Box>
      ))}
    </Box>
  );
};

const PieChartComponent = ({ 
  data = [], 
  title, 
  subtitle,
  isStatusChart = false,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Format data for chart
  const chartData = data.map((item, index) => ({
    name: isStatusChart 
      ? (statusLabels[item.status] || item.status)
      : (item.name || item.status),
    value: item.count,
    fill: isStatusChart 
      ? (statusColors[item.status] || COLORS[index % COLORS.length])
      : (item.color || COLORS[index % COLORS.length]),
    total,
  }));

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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip classes={classes} />} />
            <Legend content={<CustomLegend classes={classes} />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default PieChartComponent;

