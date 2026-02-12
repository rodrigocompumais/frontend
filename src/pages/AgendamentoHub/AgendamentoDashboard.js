import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Grid, Typography, CircularProgress, Paper } from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const AgendamentoDashboard = () => {
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    agendamentosSemana: 0,
    pendentesConfirmacao: 0,
    concluidosHoje: 0,
    noShowCount: 0,
    porStatus: [],
    porProfissional: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/dashboard/agendamento-stats");
        setStats((prev) => ({ ...prev, ...(data || {}) }));
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {i18n.t("agendamento.agendamentosHoje")}
              </Typography>
              <Typography variant="h4">{stats.agendamentosHoje}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Agendamentos da semana
              </Typography>
              <Typography variant="h4">{stats.agendamentosSemana}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {i18n.t("agendamento.pendentesConfirmacao")}
              </Typography>
              <Typography variant="h4">{stats.pendentesConfirmacao}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Concluídos hoje
              </Typography>
              <Typography variant="h4">{stats.concluidosHoje}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                No-show (confirmados no passado sem conclusão)
              </Typography>
              <Typography variant="h4">{stats.noShowCount ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {(stats.porStatus?.length > 0 || stats.porProfissional?.length > 0) && (
        <Grid container spacing={2} style={{ marginTop: 16 }}>
          {stats.porStatus?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 16 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Por status
                </Typography>
                <Box display="flex" flexWrap="wrap" style={{ gap: 8 }}>
                  {stats.porStatus.map(({ status, quantidade }) => (
                    <Typography key={status} variant="body2">
                      {status}: <strong>{quantidade}</strong>
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
          {stats.porProfissional?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper style={{ padding: 16 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Por profissional
                </Typography>
                <Box display="flex" flexDirection="column" style={{ gap: 4 }}>
                  {stats.porProfissional.map(({ nome, quantidade }) => (
                    <Typography key={nome} variant="body2">
                      {nome}: <strong>{quantidade}</strong>
                    </Typography>
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default AgendamentoDashboard;
