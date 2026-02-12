import React, { useState, useEffect } from "react";
import { Box, Button, Typography, makeStyles, CircularProgress } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#121212",
    color: "#e0e0e0",
  },
  container: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    border: "1px solid #333",
  },
  title: { fontWeight: 600, color: "#fff", marginBottom: theme.spacing(2) },
  summary: { color: "#b0b0b0", fontSize: "0.9rem", marginBottom: theme.spacing(2) },
  actions: { marginTop: theme.spacing(2), display: "flex", gap: theme.spacing(2) },
}));

const PublicAgendamentoCancelar = () => {
  const classes = useStyles();
  const { slug } = useParams();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Link inválido. Use o link recebido por WhatsApp.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const { data: res } = await api.get(`/public/forms/${slug}/appointments/by-token`, {
          params: { token },
        });
        setData(res);
      } catch (err) {
        toastError(err);
        setError(err.response?.data?.message || "Não foi possível carregar o agendamento.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, token]);

  const handleCancel = async () => {
    if (!token || !data) return;
    setSubmitting(true);
    try {
      await api.put(`/public/forms/${slug}/appointments/cancel`, { token });
      toast.success("Agendamento cancelado com sucesso.");
      setDone(true);
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box className={classes.root}>
        <Box className={classes.container} display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress style={{ color: "#1976d2" }} />
        </Box>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className={classes.root}>
        <Box className={classes.container}>
          <div className={classes.paper}>
            <Alert severity="error">{error || "Agendamento não encontrado."}</Alert>
          </div>
        </Box>
      </Box>
    );
  }

  if (done) {
    return (
      <Box className={classes.root}>
        <Box className={classes.container}>
          <div className={classes.paper}>
            <Alert severity="success">Seu agendamento foi cancelado. Qualquer dúvida, entre em contato.</Alert>
          </div>
        </Box>
      </Box>
    );
  }

  const apt = data.appointment;
  const startDate = apt.startTime ? new Date(apt.startTime) : null;
  const dateStr = startDate ? startDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
  const timeStr = startDate ? startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
  const endTime = apt.endTime ? new Date(apt.endTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        <div className={classes.paper}>
          <Typography className={classes.title}>Cancelar agendamento</Typography>
          <Typography className={classes.summary}>
            {data.form?.name && <strong>{data.form.name}</strong>}
            <br />
            Serviço: {apt.appointmentService?.name || "—"}
            <br />
            Profissional: {apt.assignedUser?.name || "—"}
            <br />
            Data: {dateStr}
            <br />
            Horário: {timeStr} às {endTime}
          </Typography>
          {data.form?.cancellationPolicyHours != null && (
            <Typography variant="body2" style={{ color: "#9e9e9e", marginBottom: 8 }}>
              Política: cancelamento gratuito até {data.form.cancellationPolicyHours} hora(s) antes do horário.
              {data.form.cancellationFee > 0 && ` Após isso pode haver taxa de R$ ${Number(data.form.cancellationFee).toFixed(2)}.`}
            </Typography>
          )}
          <Typography style={{ color: "#9e9e9e", marginBottom: 16 }}>
            Tem certeza que deseja cancelar este agendamento?
          </Typography>
          <div className={classes.actions}>
            <Button variant="outlined" style={{ color: "#9e9e9e" }} href={`/f/${slug}`} disabled={submitting}>
              Voltar
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCancel} disabled={submitting}>
              {submitting ? <CircularProgress size={24} style={{ color: "#fff" }} /> : "Sim, cancelar"}
            </Button>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default PublicAgendamentoCancelar;
