import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Paper, Typography, Box } from "@material-ui/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
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
  tooltipLabel: {
    fontWeight: 500,
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  tooltipValue: {
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: "0.875rem",
  },
}));

const CustomTooltip = ({ active, payload, label, classes, tooltipSuffix = " tickets", formatCurrency = false }) => {
  if (active && payload && payload.length) {
    const raw = payload[0].value;
    const value = formatCurrency
      ? `R$ ${Number(raw).toFixed(2).replace(".", ",")}`
      : `${raw}${tooltipSuffix}`;
    return (
      <div className={classes.tooltip}>
        <p className={classes.tooltipLabel}>{label}</p>
        <p className={classes.tooltipValue}>{value}</p>
      </div>
    );
  }
  return null;
};

const LineChartComponent = ({ 
  data = [], 
  title, 
  subtitle,
  dataKey = "count",
  xAxisKey = "hour",
  color = "#3B82F6",
  gradient = true,
  tooltipSuffix = " tickets",
  formatCurrency = false,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const gradientId = `gradient-${dataKey}`;
  const chartData = Array.isArray(data) && data.length > 0 ? data : [];

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
          {gradient ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.divider}
                vertical={false}
              />
              <XAxis 
                dataKey={xAxisKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                domain={chartData.length ? [0, "auto"] : [0, 100]}
              />
              <Tooltip content={<CustomTooltip classes={classes} tooltipSuffix={tooltipSuffix} formatCurrency={formatCurrency} />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.divider}
                vertical={false}
              />
              <XAxis 
                dataKey={xAxisKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomTooltip classes={classes} />} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default LineChartComponent;

