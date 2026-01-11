import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Paper,
  Typography,
  Box,
  makeStyles,
  IconButton,
  Grid,
  CircularProgress,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: theme.spacing(3),
  },
  statCard: {
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    height: "100%",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    marginTop: theme.spacing(1),
  },
  statLabel: {
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chartContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
  },
  fieldAnalytics: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
  },
  optionBar: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.type === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.02)",
    borderRadius: theme.shape.borderRadius,
  },
  optionLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(0.5),
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.type === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.palette.primary.main,
    transition: "width 0.3s ease",
  },
}));

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const FormAnalytics = () => {
  const classes = useStyles();
  const { formId } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadForm();
    loadAnalytics();
  }, [formId]);

  const loadForm = async () => {
    try {
      const { data } = await api.get(`/forms/${formId}`);
      setForm(data);
    } catch (err) {
      toastError(err);
      history.push("/forms");
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/forms/${formId}/analytics`);
      setAnalytics(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const prepareDateData = () => {
    if (!analytics?.responsesByDate) return [];
    
    return Object.keys(analytics.responsesByDate)
      .sort()
      .map((date) => ({
        date: new Date(date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        respostas: analytics.responsesByDate[date],
      }));
  };

  if (loading) {
    return (
      <MainContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  const dateData = prepareDateData();

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => history.push(`/forms/${formId}/responses`)}>
            <ArrowBackIcon />
          </IconButton>
          <Title>
            {form?.name || "Formulário"} - Analytics
          </Title>
        </Box>
      </MainHeader>

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statCard}>
            <Typography className={classes.statLabel}>Total de Respostas</Typography>
            <Typography className={classes.statValue}>
              {analytics?.responseCount || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statCard}>
            <Typography className={classes.statLabel}>Taxa de Conversão</Typography>
            <Typography className={classes.statValue}>
              {analytics?.responseCount > 0 ? "100%" : "0%"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statCard}>
            <Typography className={classes.statLabel}>Média por Dia</Typography>
            <Typography className={classes.statValue}>
              {dateData.length > 0
                ? Math.round(analytics?.responseCount / dateData.length)
                : 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statCard}>
            <Typography className={classes.statLabel}>Campos Preenchidos</Typography>
            <Typography className={classes.statValue}>
              {form?.fields?.length || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Gráfico de Respostas por Data */}
        {dateData.length > 0 && (
          <Grid item xs={12}>
            <Paper className={classes.chartContainer}>
              <Typography variant="h6" gutterBottom>
                Respostas ao Longo do Tempo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="respostas"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Respostas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Analytics por Campo */}
        {analytics?.fieldAnalytics?.map((fieldAnalytic) => (
          <Grid item xs={12} md={6} key={fieldAnalytic.fieldId}>
            <Paper className={classes.fieldAnalytics}>
              <Typography variant="h6" gutterBottom>
                {fieldAnalytic.fieldLabel}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {fieldAnalytic.fieldType} • {fieldAnalytic.totalAnswers} respostas
              </Typography>

              {fieldAnalytic.fieldType === "select" ||
              fieldAnalytic.fieldType === "radio" ? (
                <Box marginTop={2}>
                  {fieldAnalytic.options?.map((option, index) => (
                    <Box key={index} className={classes.optionBar}>
                      <Box className={classes.optionLabel}>
                        <Typography variant="body2">{option.option}</Typography>
                        <Typography variant="body2" style={{ fontWeight: 600 }}>
                          {option.count} ({option.percentage}%)
                        </Typography>
                      </Box>
                      <Box className={classes.progressBar}>
                        <Box
                          className={classes.progressFill}
                          style={{ width: `${option.percentage}%` }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : fieldAnalytic.fieldType === "rating" ? (
                <Box marginTop={2}>
                  <Typography variant="h6" color="primary">
                    Média: {fieldAnalytic.average || "0"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Mín: {fieldAnalytic.min || 0} • Máx: {fieldAnalytic.max || 0}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" marginTop={2}>
                  {fieldAnalytic.totalAnswers} respostas recebidas
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </MainContainer>
  );
};

export default FormAnalytics;
