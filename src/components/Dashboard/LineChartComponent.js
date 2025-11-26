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
    padding: theme.spacing(2),
    borderRadius: 16,
    background: theme.palette.background.paper,
    height: "100%",
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    fontSize: "1rem",
    color: theme.palette.text.primary,
  },
  subtitle: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
  chartContainer: {
    height: 250,
  },
  tooltip: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    padding: theme.spacing(1),
    boxShadow: theme.shadows[4],
  },
  tooltipLabel: {
    fontWeight: 600,
    marginBottom: 4,
  },
  tooltipValue: {
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

const CustomTooltip = ({ active, payload, label, classes }) => {
  if (active && payload && payload.length) {
    return (
      <div className={classes.tooltip}>
        <p className={classes.tooltipLabel}>{label}</p>
        <p className={classes.tooltipValue}>
          {payload[0].value} tickets
        </p>
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
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const gradientId = `gradient-${dataKey}`;

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
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              />
              <Tooltip content={<CustomTooltip classes={classes} />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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

