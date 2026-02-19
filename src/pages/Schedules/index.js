import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Chip from "@material-ui/core/Chip";
import Box from "@material-ui/core/Box";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import UserAppointmentModal from "../../components/UserAppointmentModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SearchIcon from "@material-ui/icons/Search";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import "./Schedules.css";
import { createMomentLocalizer } from "../../translate/calendar-locale";

function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const eventTitleStyle = {
  fontSize: "14px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

var defaultMessages = {
  date: i18n.t("schedules.messages.date"),
  time: i18n.t("schedules.messages.time"),
  event: i18n.t("schedules.messages.event"),
  allDay: i18n.t("schedules.messages.allDay"),
  week: i18n.t("schedules.messages.week"),
  work_week: i18n.t("schedules.messages.work_week"),
  day: i18n.t("schedules.messages.day"),
  month: i18n.t("schedules.messages.month"),
  previous: i18n.t("schedules.messages.previous"),
  next: i18n.t("schedules.messages.next"),
  yesterday: i18n.t("schedules.messages.yesterday"),
  tomorrow: i18n.t("schedules.messages.tomorrow"),
  today: i18n.t("schedules.messages.today"),
  agenda: i18n.t("schedules.messages.agenda"),
  noEventsInRange: i18n.t("schedules.messages.noEventsInRange"),
  showMore: function showMore(total) {
    return "+" + total + " " + i18n.t("schedules.messages.showMore");
  }
};

const reducer = (state, action) => {
  if (action.type === "LOAD_SCHEDULES") {
    return [...state, ...action.payload];
  }

  if (action.type === "UPDATE_SCHEDULES") {
    const schedule = action.payload;
    const scheduleIndex = state.findIndex((s) => s.id === schedule.id);

    if (scheduleIndex !== -1) {
      state[scheduleIndex] = schedule;
      return [...state];
    } else {
      return [schedule, ...state];
    }
  }

  if (action.type === "DELETE_SCHEDULE") {
    const scheduleId = action.payload;
    return state.filter((s) => s.id !== scheduleId);
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

const appointmentsReducer = (state, action) => {
  if (action.type === "LOAD_APPOINTMENTS") {
    return [...state, ...action.payload];
  }

  if (action.type === "UPDATE_APPOINTMENT") {
    const appointment = action.payload;
    const appointmentIndex = state.findIndex((a) => a.id === appointment.id);

    if (appointmentIndex !== -1) {
      state[appointmentIndex] = appointment;
      return [...state];
    } else {
      return [appointment, ...state];
    }
  }

  if (action.type === "DELETE_APPOINTMENT") {
    const appointmentId = action.payload;
    return state.filter((a) => a.id !== appointmentId);
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  filterChip: {
    margin: theme.spacing(0.5),
  },
  filterContainer: {
    display: "flex",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1),
  },
}));

const Schedules = () => {
  const localizer = createMomentLocalizer();
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [appointments, appointmentsDispatch] = useReducer(appointmentsReducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState(0); // 0 = appointment, 1 = dispatch
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));
  const [filterType, setFilterType] = useState("all"); // all, dispatches, appointments, myAppointments

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules/", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await api.get("/user-appointments", {
        params: {
          searchParam,
          pageNumber,
          filterType: filterType === "myAppointments" ? "myAppointments" : "all",
        },
      });

      appointmentsDispatch({ type: "LOAD_APPOINTMENTS", payload: data.appointments });
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber, filterType]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      setModalTab(1); // Open dispatch tab
      handleOpenScheduleModal();
    }
  }, [contactId]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    appointmentsDispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
      fetchAppointments();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    pageNumber,
    contactId,
    fetchSchedules,
    fetchAppointments,
    handleOpenScheduleModalFromContactId,
  ]);

  useEffect(() => {
    handleOpenScheduleModalFromContactId();
    const socket = socketManager.getSocket(user.companyId);

    // Listen for schedule events
    socket.on(`company${user.companyId}-schedule`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    });

    // Listen for user appointment events
    socket.on(`company-${user.companyId}-user-appointment`, (data) => {
      if (data.action === "update" || data.action === "create") {
        appointmentsDispatch({ type: "UPDATE_APPOINTMENT", payload: data.appointment });
      }

      if (data.action === "delete") {
        appointmentsDispatch({ type: "DELETE_APPOINTMENT", payload: +data.appointmentId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [handleOpenScheduleModalFromContactId, socketManager, user]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = (tab = 0) => {
    setSelectedSchedule(null);
    setSelectedAppointment(null);
    setModalTab(tab);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setSelectedAppointment(null);
    setScheduleModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedAppointment(null);
    setModalTab(1); // Dispatch tab
    setScheduleModalOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedSchedule(null);
    setModalTab(0); // Appointment tab
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await api.delete(`/user-appointments/${appointmentId}`);
      toast.success("Agendamento excluído com sucesso!");
    } catch (err) {
      toastError(err);
    }
    await fetchAppointments();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const truncate = (str, len) => {
    if (str.length > len) {
      return str.substring(0, len) + "...";
    }
    return str;
  };

  // Merge and filter events
  const getFilteredEvents = () => {
    let events = [];

    // Add schedule dispatches
    if (filterType === "all" || filterType === "dispatches") {
      const scheduleEvents = schedules.map((schedule) => ({
        id: `schedule-${schedule.id}`,
        title: (
          <div className="event-container">
            <div style={eventTitleStyle}>{schedule.contact?.name || "Sem contato"}</div>
            <DeleteOutlineIcon
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSchedule(schedule.id);
              }}
              className="delete-icon"
            />
            <EditIcon
              onClick={(e) => {
                e.stopPropagation();
                handleEditSchedule(schedule);
              }}
              className="edit-icon"
            />
          </div>
        ),
        start: new Date(schedule.sendAt),
        end: new Date(schedule.sendAt),
        type: "dispatch",
        resource: schedule,
      }));
      events = [...events, ...scheduleEvents];
    }

    // Add user appointments
    if (filterType === "all" || filterType === "appointments" || filterType === "myAppointments") {
      let filteredAppointments = appointments;

      if (filterType === "myAppointments") {
        filteredAppointments = appointments.filter(
          (apt) => apt.userId === user.id || apt.assignedUserId === user.id
        );
      }

      const appointmentEvents = filteredAppointments.map((appointment) => ({
        id: `appointment-${appointment.id}`,
        title: (
          <div className="event-container">
            <div style={eventTitleStyle}>{appointment.title}</div>
            <DeleteOutlineIcon
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAppointment(appointment.id);
              }}
              className="delete-icon"
            />
            <EditIcon
              onClick={(e) => {
                e.stopPropagation();
                handleEditAppointment(appointment);
              }}
              className="edit-icon"
            />
          </div>
        ),
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
        type: "appointment",
        resource: appointment,
      }));
      events = [...events, ...appointmentEvents];
    }

    return events;
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad"; // Default blue

    if (event.type === "dispatch") {
      backgroundColor = "#3174ad"; // Blue for dispatches
    } else if (event.type === "appointment") {
      // Check if it's my appointment
      const appointment = event.resource;
      if (appointment.userId === user.id || appointment.assignedUserId === user.id) {
        backgroundColor = "#ff9800"; // Orange for my appointments
      } else {
        backgroundColor = "#4caf50"; // Green for other appointments
      }
    }

    return {
      style: {
        backgroundColor,
      },
    };
  };

  const reload = async () => {
    dispatch({ type: "RESET" });
    appointmentsDispatch({ type: "RESET" });
    await fetchSchedules();
    await fetchAppointments();
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingSchedule &&
          `${i18n.t("schedules.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserAppointmentModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        reload={reload}
        initialTab={modalTab}
        appointmentId={selectedAppointment?.id}
        scheduleId={selectedSchedule?.id}
        contactId={contactId}
        cleanContact={cleanContact}
      />
      <MainHeader>
        <Title>
          {i18n.t("schedules.title")} ({schedules.length + appointments.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenScheduleModal(0)}
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <Box className={classes.filterContainer}>
          <Chip
            label={i18n.t("userAppointmentModal.filters.all") || "Todos"}
            className={classes.filterChip}
            color={filterType === "all" ? "primary" : "default"}
            onClick={() => setFilterType("all")}
          />
          <Chip
            label={i18n.t("userAppointmentModal.filters.dispatches") || "Disparos"}
            className={classes.filterChip}
            color={filterType === "dispatches" ? "primary" : "default"}
            onClick={() => setFilterType("dispatches")}
          />
          <Chip
            label={i18n.t("userAppointmentModal.filters.appointments") || "Agendamentos"}
            className={classes.filterChip}
            color={filterType === "appointments" ? "primary" : "default"}
            onClick={() => setFilterType("appointments")}
          />
          <Chip
            label={i18n.t("userAppointmentModal.filters.myAppointments") || "Meus Agendamentos"}
            className={classes.filterChip}
            color={filterType === "myAppointments" ? "primary" : "default"}
            onClick={() => setFilterType("myAppointments")}
          />
        </Box>
        <Calendar
          messages={defaultMessages}
          formats={{
            agendaDateFormat: "DD/MM ddd",
            weekdayFormat: "dddd"
          }}
          localizer={localizer}
          events={getFilteredEvents()}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => {
            if (event.type === "appointment" && event.resource) {
              handleEditAppointment(event.resource);
            } else if (event.type === "dispatch" && event.resource) {
              handleEditSchedule(event.resource);
            }
          }}
        />
      </Paper>
    </MainContainer>
  );
};

export default Schedules;