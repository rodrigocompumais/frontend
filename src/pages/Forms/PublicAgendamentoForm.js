import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  makeStyles,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  CardActionArea,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

const getAvatarUrl = (user) => {
  if (!user?.avatar) return null;
  return `${BACKEND_URL}/public/${user.avatar}`;
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const useStyles = makeStyles((theme) => ({
  root: ({ isLight }) => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: isLight ? "#f5f5f5" : "#121212",
    color: isLight ? "#212121" : "#e0e0e0",
  }),
  container: {
    width: "100%",
    maxWidth: 640,
    margin: "0 auto",
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    flex: 1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
    marginBottom: theme.spacing(2),
    minHeight: 48,
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: "1.1rem",
    color: "#fff",
  },
  logo: {
    maxWidth: 140,
    maxHeight: 72,
    marginBottom: theme.spacing(2),
    display: "block",
  },
  formName: {
    fontWeight: 600,
    fontSize: "1.25rem",
    color: "#fff",
    marginBottom: theme.spacing(0.5),
  },
  formDescription: {
    color: "#9e9e9e",
    fontSize: "0.875rem",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#fff",
    marginBottom: theme.spacing(1.5),
  },
  serviceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    marginBottom: theme.spacing(1.5),
    border: "1px solid #333",
  },
  serviceName: {
    fontWeight: 600,
    color: "#fff",
  },
  serviceMeta: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    color: "#9e9e9e",
    fontSize: "0.875rem",
    marginTop: 4,
  },
  priceGreen: {
    color: "#4caf50",
    fontWeight: 600,
  },
  btnAgendar: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 2),
  },
  professionalCard: {
    flex: "0 0 auto",
    width: 140,
    padding: theme.spacing(1.5),
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    border: "1px solid #333",
    textAlign: "center",
  },
  professionalCardSelected: {
    borderColor: "#1976d2",
    backgroundColor: "rgba(25, 118, 210, 0.12)",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto",
    display: "block",
    backgroundColor: "#333",
  },
  professionalName: {
    fontWeight: 600,
    color: "#1976d2",
    marginTop: theme.spacing(1),
    fontSize: "0.9rem",
  },
  professionalMeta: {
    color: "#9e9e9e",
    fontSize: "0.75rem",
    marginTop: 4,
  },
  weekStrip: {
    display: "flex",
    overflowX: "auto",
    gap: 8,
    padding: theme.spacing(2, 0),
    marginBottom: theme.spacing(2),
    "&::-webkit-scrollbar": { height: 4 },
  },
  dayCell: {
    flex: "0 0 44px",
    textAlign: "center",
    padding: theme.spacing(1),
    borderRadius: 12,
    cursor: "pointer",
    backgroundColor: "#1e1e1e",
    border: "2px solid transparent",
  },
  dayCellSelected: {
    backgroundColor: "#1976d2",
    borderColor: "#1976d2",
    color: "#fff",
  },
  dayName: {
    fontSize: "0.7rem",
    color: "#9e9e9e",
    display: "block",
  },
  dayCellSelected_dayName: {
    color: "rgba(255,255,255,0.9)",
  },
  dayNum: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#fff",
    display: "block",
    marginTop: 2,
  },
  slotGroup: {
    marginBottom: theme.spacing(2),
  },
  slotGroupTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
    color: "#9e9e9e",
    fontSize: "0.875rem",
  },
  slotButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  slotBtn: {
    borderRadius: 8,
    minWidth: 72,
    textTransform: "none",
    border: "1px solid #444",
    color: "#e0e0e0",
    "&.selected": {
      borderColor: "#1976d2",
      backgroundColor: "rgba(25, 118, 210, 0.2)",
      color: "#90caf9",
    },
  },
  emptySlots: {
    textAlign: "center",
    padding: theme.spacing(4, 2),
  },
  emptySlotsTitle: {
    fontWeight: 600,
    color: "#fff",
    marginBottom: theme.spacing(1),
  },
  emptySlotsText: {
    color: "#9e9e9e",
    fontSize: "0.875rem",
    marginBottom: theme.spacing(2),
    maxWidth: 320,
    marginLeft: "auto",
    marginRight: "auto",
  },
  btnListaEspera: {
    borderRadius: 8,
    textTransform: "none",
    fontWeight: 600,
  },
  fieldContainer: {
    marginBottom: theme.spacing(2),
  },
  fieldLabel: {
    marginBottom: theme.spacing(0.5),
    fontWeight: 500,
    color: "#e0e0e0",
  },
  required: { color: "#f44336" },
  inputDark: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#1e1e1e",
      color: "#e0e0e0",
      "& fieldset": { borderColor: "#444" },
      "&:hover fieldset": { borderColor: "#666" },
      "&.Mui-focused fieldset": { borderColor: "#1976d2" },
    },
    "& .MuiInputLabel-root": { color: "#9e9e9e" },
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  successPaper: {
    padding: theme.spacing(3),
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    border: "1px solid #333",
  },
}));

function groupServicesByName(services) {
  const byName = {};
  (services || []).forEach((srv) => {
    const name = srv.name || "";
    if (!byName[name]) {
      byName[name] = { name, minPrice: null, minDuration: null, items: [] };
    }
    byName[name].items.push(srv);
    const val = srv.value != null && srv.value !== "" ? Number(srv.value) : null;
    if (val != null && (byName[name].minPrice == null || val < byName[name].minPrice)) {
      byName[name].minPrice = val;
    }
    const dur = srv.durationMinutes;
    if (dur != null && (byName[name].minDuration == null || dur < byName[name].minDuration)) {
      byName[name].minDuration = dur;
    }
  });
  return Object.values(byName);
}

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

function partitionSlots(slots) {
  const manha = [];
  const tarde = [];
  (slots || []).forEach((slot) => {
    const hour = parseInt(String(slot.startTime).slice(0, 2), 10);
    if (hour < 12) manha.push(slot);
    else tarde.push(slot);
  });
  return { manha, tarde };
}

const PublicAgendamentoForm = ({ form, slug: publicId }) => {
  const isLight = useMemo(() => {
    const t = form?.settings?.agendamento?.theme;
    if (t === "light") return true;
    if (t === "auto") return !window.matchMedia("(prefers-color-scheme: dark)").matches;
    return false;
  }, [form?.settings?.agendamento?.theme]);
  const classes = useStyles({ isLight });
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceNameSelected, setServiceNameSelected] = useState(null);
  const [selectedAppointmentService, setSelectedAppointmentService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResponse, setSubmitResponse] = useState(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistPhone, setWaitlistPhone] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  
  // Filtrar dias da semana baseado nos horários da empresa
  const weekDays = useMemo(() => {
    const allDays = getWeekDays(new Date(), 14);
    const scheduleType = form?.scheduleType;
    const companySchedules = form?.companySchedules || [];
    
    // Se scheduleType for "company" e houver horários configurados, filtrar dias
    if (scheduleType === "company" && companySchedules.length > 0) {
      const weekdayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      
      return allDays.filter((day) => {
        const dayOfWeek = day.getDay();
        const weekdayName = weekdayNames[dayOfWeek];
        const daySchedule = companySchedules.find(
          (s) => s?.weekdayEn?.toLowerCase() === weekdayName
        );
        
        // Incluir dia se tiver horário configurado e não estiver vazio
        return daySchedule && 
               daySchedule.startTime && 
               daySchedule.endTime && 
               daySchedule.startTime !== "" && 
               daySchedule.endTime !== "" &&
               !(daySchedule.startTime === "00:00" && daySchedule.endTime === "00:00");
      });
    }
    
    return allDays;
  }, [form?.scheduleType, form?.companySchedules]);

  const serviceGroupsAll = useMemo(() => groupServicesByName(services), [services]);
  const serviceGroups = useMemo(() => {
    const q = (serviceSearch || "").trim().toLowerCase();
    if (!q) return serviceGroupsAll;
    return serviceGroupsAll.filter((g) => (g.name || "").toLowerCase().includes(q));
  }, [serviceGroupsAll, serviceSearch]);
  const professionalsForService = useMemo(
    () => (services || []).filter((s) => (s.name || "") === serviceNameSelected),
    [services, serviceNameSelected]
  );
  const { manha: slotsManha, tarde: slotsTarde } = useMemo(() => partitionSlots(slots), [slots]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const { data } = await api.get(`/public/forms/${publicId}/appointment-services`);
        setServices(data.services || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [publicId]);

  useEffect(() => {
    if (!selectedAppointmentService || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlots([]);
      setSelectedSlot(null);
      try {
        const { data } = await api.get(`/public/forms/${publicId}/availability`, {
          params: {
            serviceId: selectedAppointmentService.id,
            userId: selectedAppointmentService.userId,
            date: selectedDate,
          },
        });
        setSlots(data.slots || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [publicId, selectedAppointmentService, selectedDate]);

  useEffect(() => {
    const initial = {};
    (form.fields || []).forEach((f) => {
      if (f.fieldType === "checkbox") initial[f.id] = [];
      else initial[f.id] = "";
    });
    setAnswers((prev) => ({ ...initial, ...prev }));
  }, [form.fields]);

  const handleFieldChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedAppointmentService || !selectedSlot) return;
    const answersArray = (form.fields || [])
      .filter((f) => answers[f.id] !== undefined && String(answers[f.id]).trim() !== "")
      .map((f) => ({
        fieldId: f.id,
        answer: Array.isArray(answers[f.id]) ? answers[f.id].join(", ") : String(answers[f.id]),
      }));
    setSubmitting(true);
    try {
      const { data } = await api.post(`/public/forms/${publicId}/submit`, {
        answers: answersArray,
        metadata: {
          appointmentServiceId: selectedAppointmentService.id,
          assignedUserId: selectedAppointmentService.userId,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
        },
      });
      setSubmitResponse(data);
      setSubmitted(true);
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackStep2 = () => {
    setServiceNameSelected(null);
    setSelectedAppointmentService(null);
    setStep(1);
  };

  const handleBackStep3 = () => {
    setSelectedDate("");
    setSelectedSlot(null);
    setStep(2);
  };

  const handleBackStep4 = () => setStep(3);

  const handleOpenListaEspera = () => {
    setWaitlistName("");
    setWaitlistPhone("");
    setWaitlistOpen(true);
  };

  const handleListaEsperaSubmit = async () => {
    const name = (waitlistName || "").trim();
    const phone = (waitlistPhone || "").trim().replace(/\D/g, "");
    if (phone.length < 10) {
      toast.error("Informe um telefone válido.");
      return;
    }
    if (!selectedAppointmentService || !selectedDate) return;
    setWaitlistSubmitting(true);
    try {
      await api.post(`/public/forms/${publicId}/waitlist`, {
        appointmentServiceId: selectedAppointmentService.id,
        assignedUserId: selectedAppointmentService.userId,
        preferredDate: selectedDate,
        responderName: name || "Cliente",
        responderPhone: waitlistPhone.trim(),
      });
      toast.success("Você foi adicionado à lista de espera. Avisaremos por WhatsApp quando houver vaga.");
      setWaitlistOpen(false);
    } catch (err) {
      toastError(err);
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  const selectedDayDate = selectedDate ? weekDays.find((d) => d.toISOString().slice(0, 10) === selectedDate) : null;
  const headerMonthYear = selectedDayDate
    ? `${MONTH_NAMES[selectedDayDate.getMonth()]} ${selectedDayDate.getFullYear()}`
    : MONTH_NAMES[new Date().getMonth()] + " " + new Date().getFullYear();

  if (submitted) {
    const token = submitResponse?.appointmentToken;
    const icalUrl = token ? `${process.env.REACT_APP_BACKEND_URL || ""}/public/forms/${publicId}/appointments/ical?token=${encodeURIComponent(token)}` : null;
    const rescheduleUrl = token ? `${window.location.origin}/f/${publicId}/reagendar?token=${encodeURIComponent(token)}` : null;
    const cancelUrl = token ? `${window.location.origin}/f/${publicId}/cancelar?token=${encodeURIComponent(token)}` : null;
    const startDate = selectedSlot ? new Date(selectedSlot.start) : null;
    const successDateStr = startDate ? startDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
    const successTimeStr = startDate ? startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
    const successEndStr = selectedSlot && selectedSlot.end ? new Date(selectedSlot.end).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

    return (
      <Box className={classes.root}>
        <Box className={classes.container}>
          <div className={classes.successPaper}>
            <Alert severity="success" style={{ marginBottom: 16 }}>
              {form.successMessage || "Agendamento realizado com sucesso! Em breve você receberá uma confirmação."}
            </Alert>
            <Typography className={classes.sectionTitle} style={{ marginTop: 16 }}>Resumo do agendamento</Typography>
            <Typography style={{ color: "#b0b0b0", marginBottom: 8 }}>
              {selectedAppointmentService?.name} com {selectedAppointmentService?.user?.name}
              <br />
              {successDateStr} — {successTimeStr} às {successEndStr}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1} marginTop={2}>
              {icalUrl && (
                <Button variant="outlined" size="small" href={icalUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#4caf50", borderColor: "#4caf50" }}>
                  Adicionar ao calendário
                </Button>
              )}
              {rescheduleUrl && (
                <Button variant="outlined" size="small" href={rescheduleUrl} style={{ color: "#1976d2", borderColor: "#1976d2" }}>
                  Reagendar
                </Button>
              )}
              {cancelUrl && (
                <Button variant="outlined" size="small" href={cancelUrl} style={{ color: "#9e9e9e" }}>
                  Cancelar agendamento
                </Button>
              )}
            </Box>
            {form.successRedirectUrl && (
              <Typography variant="body2" style={{ color: "#9e9e9e", marginTop: 16 }}>
                Redirecionando...
              </Typography>
            )}

            {/* Link para CompuChat na mensagem de sucesso */}
            <Box style={{ marginTop: 24, textAlign: "center", paddingTop: 16, borderTop: "1px solid #333" }}>
              <Typography variant="body2" style={{ color: "#9e9e9e", marginBottom: 8 }}>
                Formulário criado com
              </Typography>
              <Button
                href="https://www.compuchat.cloud"
                target="_blank"
                rel="noopener noreferrer"
                variant="text"
                size="small"
                style={{ textTransform: "none", color: "#4caf50" }}
              >
                CompuChat
              </Button>
            </Box>
          </div>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        {/* Step 1: Lista de serviços */}
        {step === 1 && (
          <>
            {form.logoUrl && (
              <img src={form.logoUrl} alt="Logo" className={classes.logo} />
            )}
            <Typography className={classes.formName}>{form.name}</Typography>
            {form.description && (
              <Typography className={classes.formDescription}>{form.description}</Typography>
            )}

            <Typography className={classes.sectionTitle}>Serviços</Typography>
            {serviceGroupsAll.length > 3 && (
              <TextField
                fullWidth
                placeholder="Buscar serviço..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                variant="outlined"
                size="small"
                className={classes.inputDark}
                style={{ marginBottom: 16 }}
                InputProps={{
                  style: { color: isLight ? "#212121" : "#e0e0e0" },
                  startAdornment: (
                    <InputAdornment position="start">
                      <span style={{ color: "#9e9e9e" }}>🔍</span>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            {loadingServices ? (
              <Box display="flex" justifyContent="center" padding={4}>
                <CircularProgress style={{ color: "#1976d2" }} />
              </Box>
            ) : serviceGroups.length === 0 ? (
              <Typography style={{ color: "#9e9e9e" }}>Nenhum serviço disponível no momento.</Typography>
            ) : (
              serviceGroups.map((group) => (
                <div key={group.name} className={classes.serviceRow}>
                  <Box>
                    <Typography className={classes.serviceName}>{group.name}</Typography>
                    <div className={classes.serviceMeta}>
                      {group.minPrice != null && (
                        <span className={classes.priceGreen}>R$ {Number(group.minPrice).toFixed(2)}</span>
                      )}
                      {group.minDuration != null && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <AccessTimeIcon style={{ fontSize: 16 }} />
                          {group.minDuration} min
                        </span>
                      )}
                    </div>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.btnAgendar}
                    onClick={() => {
                      setServiceNameSelected(group.name);
                      setStep(2);
                    }}
                  >
                    Agendar
                  </Button>
                </div>
              ))
            )}
          </>
        )}

        {/* Step 2: Selecione o profissional */}
        {step === 2 && (
          <>
            <div className={classes.header}>
              <IconButton onClick={handleBackStep2} style={{ color: "#fff" }} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Typography className={classes.headerTitle}>
                {serviceNameSelected || "Selecione o profissional"}
              </Typography>
              <Box width={40} />
            </div>
            <Typography className={classes.sectionTitle}>Selecione o profissional</Typography>
            <Box display="flex" overflow="auto" gap={2} paddingBottom={1} style={{ minHeight: 140 }}>
              {professionalsForService.map((srv) => (
                <Card
                  key={srv.id}
                  className={`${classes.professionalCard} ${
                    selectedAppointmentService?.id === srv.id ? classes.professionalCardSelected : ""
                  }`}
                  elevation={0}
                >
                  <CardActionArea
                    onClick={() => {
                      setSelectedAppointmentService(srv);
                      setSelectedDate(todayStr);
                      setStep(3);
                    }}
                    style={{ padding: 8 }}
                  >
                    {getAvatarUrl(srv.user) ? (
                      <img
                        src={getAvatarUrl(srv.user)}
                        alt=""
                        className={classes.avatar}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          const fallback = e.target.nextSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={classes.avatar}
                      style={{
                        display: getAvatarUrl(srv.user) ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                      }}
                    >
                      {srv.user?.name?.charAt(0) || "?"}
                    </div>
                    <Typography className={classes.professionalName}>{srv.user?.name || "—"}</Typography>
                    <Typography className={classes.professionalMeta}>
                      {srv.durationMinutes} min
                      {srv.value != null && srv.value !== "" ? ` · R$ ${Number(srv.value).toFixed(2)}` : ""}
                    </Typography>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </>
        )}

        {/* Step 3: Data e horário */}
        {step === 3 && selectedAppointmentService && (
          <>
            <div className={classes.header}>
              <IconButton onClick={handleBackStep3} style={{ color: "#fff" }} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Typography className={classes.headerTitle}>{headerMonthYear}</Typography>
              <IconButton style={{ color: "#fff" }} size="small">
                <CalendarTodayIcon />
              </IconButton>
            </div>

            <Typography className={classes.sectionTitle}>Data</Typography>
            <Box className={classes.weekStrip}>
              {weekDays.map((d) => {
                const dateStr = d.toISOString().slice(0, 10);
                const isSelected = selectedDate === dateStr;
                const dayNum = d.getDate();
                const dayName = DAY_NAMES[d.getDay()];
                return (
                  <div
                    key={dateStr}
                    className={`${classes.dayCell} ${isSelected ? classes.dayCellSelected : ""}`}
                    onClick={() => setSelectedDate(dateStr)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedDate(dateStr)}
                  >
                    <span className={`${classes.dayName} ${isSelected ? classes.dayCellSelected_dayName : ""}`}>
                      {dayName}
                    </span>
                    <span className={classes.dayNum}>{dayNum}</span>
                  </div>
                );
              })}
            </Box>

            <Typography className={classes.sectionTitle}>Horários disponíveis</Typography>
            {loadingSlots ? (
              <Box display="flex" justifyContent="center" padding={3}>
                <CircularProgress style={{ color: "#1976d2" }} />
              </Box>
            ) : slots.length === 0 ? (
              <div className={classes.emptySlots}>
                <Typography className={classes.emptySlotsTitle}>Nenhum horário disponível</Typography>
                <Typography className={classes.emptySlotsText}>
                  Não encontramos nenhum horário disponível neste dia com este profissional. Tente escolher outra data
                  ou entre na lista de espera.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.btnListaEspera}
                  onClick={handleOpenListaEspera}
                  style={{ marginRight: 8 }}
                >
                  Lista de espera
                </Button>
                <Button onClick={() => setSelectedDate("")} style={{ color: "#9e9e9e" }}>
                  Trocar data
                </Button>
              </div>
            ) : (
              <>
                <div className={classes.slotGroup}>
                  <div className={classes.slotGroupTitle}>
                    <span>Manhã</span>
                    <span>{slotsManha.length} horário{slotsManha.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className={classes.slotButtons}>
                    {slotsManha.map((slot, idx) => {
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
                  </div>
                </div>
                <div className={classes.slotGroup}>
                  <div className={classes.slotGroupTitle}>
                    <span>Tarde</span>
                    <span>{slotsTarde.length} horário{slotsTarde.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className={classes.slotButtons}>
                    {slotsTarde.map((slot, idx) => {
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
                  </div>
                </div>
                <div className={classes.actions}>
                  <Button onClick={handleBackStep3} style={{ color: "#9e9e9e" }}>
                    Voltar
                  </Button>
                  {selectedSlot && (
                    <Button variant="contained" color="primary" onClick={() => setStep(4)} className={classes.btnAgendar}>
                      Continuar
                    </Button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        <Dialog open={waitlistOpen} onClose={() => !waitlistSubmitting && setWaitlistOpen(false)} PaperProps={{ style: { backgroundColor: "#1e1e1e", color: "#e0e0e0" } }}>
          <DialogTitle style={{ color: "#fff" }}>Entrar na lista de espera</DialogTitle>
          <DialogContent>
            <Typography variant="body2" style={{ color: "#9e9e9e", marginBottom: 16 }}>
              Informe seu nome e telefone. Avisaremos por WhatsApp quando houver vaga para esta data e profissional.
            </Typography>
            <TextField
              fullWidth
              label="Nome"
              value={waitlistName}
              onChange={(e) => setWaitlistName(e.target.value)}
              variant="outlined"
              size="small"
              style={{ marginBottom: 16 }}
              className={classes.inputDark}
              InputProps={{ style: { color: "#e0e0e0" } }}
              InputLabelProps={{ style: { color: "#9e9e9e" } }}
            />
            <InputMask
              mask="55(99)99999-9999"
              maskChar={null}
              value={waitlistPhone}
              onChange={(e) => setWaitlistPhone(e.target.value)}
            >
              {(inputProps) => (
                <TextField
                  {...inputProps}
                  fullWidth
                  label="Telefone"
                  variant="outlined"
                  size="small"
                  placeholder="55(99)99999-9999"
                  className={classes.inputDark}
                  InputProps={{ style: { color: "#e0e0e0" } }}
                  InputLabelProps={{ style: { color: "#9e9e9e" } }}
                />
              )}
            </InputMask>
          </DialogContent>
          <DialogActions style={{ padding: 16 }}>
            <Button onClick={() => setWaitlistOpen(false)} disabled={waitlistSubmitting} style={{ color: "#9e9e9e" }}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleListaEsperaSubmit} disabled={waitlistSubmitting}>
              {waitlistSubmitting ? <CircularProgress size={24} style={{ color: "#fff" }} /> : "Entrar na lista"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Step 4: Seus dados */}
        {step === 4 && selectedAppointmentService && selectedSlot && (
          <>
            <div className={classes.header}>
              <IconButton onClick={handleBackStep4} style={{ color: "#fff" }} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Typography className={classes.headerTitle}>Seus dados</Typography>
              <Box width={40} />
            </div>

            <div className={classes.serviceRow} style={{ marginBottom: 24 }}>
              <Box>
                <Typography className={classes.sectionTitle} style={{ marginBottom: 4 }}>Resumo</Typography>
                <Typography className={classes.serviceName}>{selectedAppointmentService?.name}</Typography>
                <div className={classes.serviceMeta}>
                  <span>{selectedAppointmentService?.user?.name}</span>
                  <span>{selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}</span>
                  <span>{selectedSlot?.startTime} às {selectedSlot?.endTime}</span>
                  {selectedAppointmentService?.value != null && selectedAppointmentService?.value !== "" && (
                    <span className={classes.priceGreen}>R$ {Number(selectedAppointmentService.value).toFixed(2)}</span>
                  )}
                </div>
                {(form.settings?.agendamento?.cancellationPolicyHours != null || form.settings?.agendamento?.cancellationFee > 0) && (
                  <Typography variant="caption" style={{ display: "block", color: "#9e9e9e", marginTop: 8 }}>
                    Cancelamento gratuito até {form.settings?.agendamento?.cancellationPolicyHours ?? 24} h antes.
                    {form.settings?.agendamento?.cancellationFee > 0 && ` Após isso pode haver taxa de R$ ${Number(form.settings.agendamento.cancellationFee).toFixed(2)}.`}
                  </Typography>
                )}
              </Box>
            </div>
            <Typography className={classes.sectionTitle}>Preencha para confirmar</Typography>
            {(form.fields || [])
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((field) => (
                <Box key={field.id} className={classes.fieldContainer}>
                  <Typography className={classes.fieldLabel}>
                    {field.label}
                    {field.isRequired && <span className={classes.required}> *</span>}
                  </Typography>
                  {field.fieldType === "phone" ? (
                    <InputMask
                      mask="55(99)99999-9999"
                      maskChar={null}
                      value={answers[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    >
                      {(inputProps) => (
                        <TextField
                          {...inputProps}
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="55(99)99999-9999"
                          className={classes.inputDark}
                        />
                      )}
                    </InputMask>
                  ) : field.fieldType === "email" ? (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="email"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className={classes.inputDark}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      multiline={field.fieldType === "textarea"}
                      rows={field.fieldType === "textarea" ? 3 : 1}
                      className={classes.inputDark}
                    />
                  )}
                </Box>
              ))}
            <div className={classes.actions}>
              <Button onClick={handleBackStep4} style={{ color: "#9e9e9e" }}>
                Voltar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitting}
                className={classes.btnAgendar}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={20} style={{ marginRight: 8, color: "#fff" }} />
                    Enviando...
                  </>
                ) : (
                  "Confirmar agendamento"
                )}
              </Button>
            </div>

            {/* Link para CompuChat no final do formulário */}
            <Box style={{ marginTop: 24, textAlign: "center", paddingTop: 16, borderTop: "1px solid #333" }}>
              <Typography variant="body2" style={{ color: "#9e9e9e", marginBottom: 8 }}>
                Formulário criado com
              </Typography>
              <Button
                href="https://www.compuchat.cloud"
                target="_blank"
                rel="noopener noreferrer"
                variant="text"
                size="small"
                style={{ textTransform: "none", color: "#4caf50" }}
              >
                CompuChat
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PublicAgendamentoForm;
