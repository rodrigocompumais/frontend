import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  makeStyles,
  CircularProgress,
  IconButton,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#121212",
    color: "#e0e0e0",
  },
  container: { width: "100%", maxWidth: 480, margin: "0 auto", padding: theme.spacing(3) },
  paper: {
    padding: theme.spacing(3),
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    border: "1px solid #333",
  },
  title: { fontWeight: 600, color: "#fff", marginBottom: theme.spacing(2) },
  summary: { color: "#b0b0b0", fontSize: "0.9rem", marginBottom: theme.spacing(2) },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: { fontWeight: 600, color: "#fff", marginBottom: theme.spacing(1.5) },
  weekStrip: {
    display: "flex",
    gap: 8,
    overflow: "auto",
    paddingBottom: 8,
    marginBottom: theme.spacing(2),
  },
  dayCell: {
    flex: "0 0 auto",
    padding: theme.spacing(1.5),
    borderRadius: 8,
    textAlign: "center",
    cursor: "pointer",
    border: "1px solid #333",
    backgroundColor: "#2a2a2a",
    minWidth: 56,
  },
  dayCellSelected: { borderColor: "#1976d2", backgroundColor: "rgba(25, 118, 210, 0.2)" },
  dayName: { fontSize: "0.75rem", color: "#9e9e9e", display: "block" },
  dayNum: { fontSize: "1rem", fontWeight: 600, color: "#fff" },
  slotBtn: {
    margin: 4,
    color: "#e0e0e0",
    borderColor: "#444",
    "&.selected": { borderColor: "#1976d2", backgroundColor: "rgba(25, 118, 210, 0.2)" },
  },
  actions: { marginTop: theme.spacing(2), display: "flex", gap: theme.spacing(2) },
}));

function getWeekDays(fromDate, count = 14) {
  const days = [];
  const d = new Date(fromDate);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const PublicAgendamentoReagendar = () => {
  const classes = useStyles();
  const { slug } = useParams();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const weekDays = useMemo(() => getWeekDays(new Date(), 14), []);
  const selectedDayDate = selectedDate ? weekDays.find((d) => d.toISOString().slice(0, 10) === selectedDate) : null;
  const headerMonthYear = selectedDayDate
    ? `${MONTH_NAMES[selectedDayDate.getMonth()]} ${selectedDayDate.getFullYear()}`
    : MONTH_NAMES[new Date().getMonth()] + " " + new Date().getFullYear();

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

  useEffect(() => {
    if (!data?.appointment || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    const apt = data.appointment;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlots([]);
      setSelectedSlot(null);
      try {
        const { data: slotData } = await api.get(`/public/forms/${slug}/availability`, {
          params: {
            serviceId: apt.appointmentService?.id,
            userId: apt.assignedUser?.id,
            date: selectedDate,
          },
        });
        setSlots(slotData.slots || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [data, slug, selectedDate]);

  const handleReschedule = async () => {
    if (!token || !data || !selectedSlot) return;
    setSubmitting(true);
    try {
      await api.put(`/public/forms/${slug}/appointments/reschedule`, {
        token,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      });
      toast.success("Agendamento reagendado com sucesso.");
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
            <Alert severity="success">Seu agendamento foi reagendado. Você receberá uma confirmação por WhatsApp.</Alert>
            <Button variant="contained" color="primary" href={`/f/${slug}`} style={{ marginTop: 16 }}>
              Novo agendamento
            </Button>
          </div>
        </Box>
      </Box>
    );
  }

  const apt = data.appointment;
  const startDate = apt.startTime ? new Date(apt.startTime) : null;
  const dateStr = startDate ? startDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
  const timeStr = startDate ? startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
  const endTimeStr = apt.endTime ? new Date(apt.endTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        <div className={classes.paper}>
          <Typography className={classes.title}>Reagendar agendamento</Typography>
          <Typography className={classes.summary}>
            Atual: {apt.appointmentService?.name || "—"} com {apt.assignedUser?.name || "—"} — {dateStr}, {timeStr} às {endTimeStr}
          </Typography>

          <div className={classes.header}>
            <IconButton style={{ color: "#fff" }} size="small" href={`/f/${slug}/cancelar?token=${token}`}>
              <ArrowBackIcon />
            </IconButton>
            <Typography style={{ color: "#fff", fontWeight: 600 }}>{headerMonthYear}</Typography>
            <Box width={40} />
          </div>
          <Typography className={classes.sectionTitle}>Escolha a nova data</Typography>
          <Box className={classes.weekStrip}>
            {weekDays.map((d) => {
              const dateStr = d.toISOString().slice(0, 10);
              const isSelected = selectedDate === dateStr;
              return (
                <div
                  key={dateStr}
                  className={`${classes.dayCell} ${isSelected ? classes.dayCellSelected : ""}`}
                  onClick={() => setSelectedDate(dateStr)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedDate(dateStr)}
                >
                  <span className={classes.dayName}>{DAY_NAMES[d.getDay()]}</span>
                  <span className={classes.dayNum}>{d.getDate()}</span>
                </div>
              );
            })}
          </Box>

          <Typography className={classes.sectionTitle}>Horários disponíveis</Typography>
          {loadingSlots ? (
            <Box display="flex" justifyContent="center" padding={2}>
              <CircularProgress size={24} style={{ color: "#1976d2" }} />
            </Box>
          ) : slots.length === 0 ? (
            <Typography style={{ color: "#9e9e9e" }}>
              {selectedDate ? "Nenhum horário disponível neste dia. Escolha outra data." : "Selecione uma data."}
            </Typography>
          ) : (
            <Box display="flex" flexWrap="wrap" marginBottom={2}>
              {slots.map((slot, idx) => {
                const isSelected = selectedSlot && selectedSlot.start === slot.start;
                return (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="small"
                    className={`${classes.slotBtn} ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.startTime}
                  </Button>
                );
              })}
            </Box>
          )}

          <div className={classes.actions}>
            <Button variant="outlined" style={{ color: "#9e9e9e" }} href={`/f/${slug}/cancelar?token=${token}`} disabled={submitting}>
              Cancelar agendamento
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReschedule}
              disabled={!selectedSlot || submitting}
            >
              {submitting ? <CircularProgress size={24} style={{ color: "#fff" }} /> : "Confirmar novo horário"}
            </Button>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default PublicAgendamentoReagendar;
