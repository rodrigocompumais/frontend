import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Grid,
  Paper,
  Divider,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  dayCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  timeFields: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
}));

const dayNames = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const UserAvailabilitySettings = ({ userId }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    weekdays: {
      monday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      thursday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      friday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      saturday: { enabled: false, startTime: "09:00", endTime: "18:00" },
      sunday: { enabled: false, startTime: "09:00", endTime: "18:00" },
    },
  });

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get(`/users/${userId}/availability-settings`);
      if (data.availabilitySettings) {
        setSettings(data.availabilitySettings);
      }
    } catch (err) {
      // Se não houver configurações, usar padrão
      console.log("Nenhuma configuração encontrada, usando padrão");
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await api.put(`/users/${userId}/availability-settings`, {
        availabilitySettings: settings,
      });
      toast.success("Configurações de disponibilidade salvas com sucesso!");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = (event) => {
    setSettings((prev) => ({
      ...prev,
      enabled: event.target.checked,
    }));
    // Salvar automaticamente
    setTimeout(() => {
      if (userId) {
        handleSave();
      }
    }, 100);
  };

  const handleDayToggle = (day, enabled) => {
    setSettings((prev) => ({
      ...prev,
      weekdays: {
        ...prev.weekdays,
        [day]: {
          ...prev.weekdays[day],
          enabled,
        },
      },
    }));
    // Salvar automaticamente
    setTimeout(() => {
      if (userId) {
        handleSave();
      }
    }, 100);
  };

  const handleTimeChange = (day, field, value) => {
    setSettings((prev) => ({
      ...prev,
      weekdays: {
        ...prev.weekdays,
        [day]: {
          ...prev.weekdays[day],
          [field]: value,
        },
      },
    }));
    // Salvar automaticamente após um pequeno delay
    setTimeout(() => {
      if (userId) {
        handleSave();
      }
    }, 500);
  };

  return (
    <Box className={classes.root}>
      <Divider style={{ marginBottom: 16 }} />
      <Typography variant="h6" className={classes.sectionTitle}>
        Períodos Disponíveis para Agendamentos
      </Typography>
      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
        Configure os horários em que este usuário pode receber agendamentos.
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={settings.enabled}
            onChange={handleToggleEnabled}
            color="primary"
            disabled={loading}
          />
        }
        label="Ativar limitação de horários"
      />

      {settings.enabled && (
        <Box style={{ marginTop: 16 }}>
          {Object.entries(dayNames).map(([dayKey, dayLabel]) => {
            const dayConfig = settings.weekdays[dayKey];
            return (
              <Paper key={dayKey} className={classes.dayCard} variant="outlined">
                <FormControlLabel
                  control={
                    <Switch
                      checked={dayConfig.enabled}
                      onChange={(e) => handleDayToggle(dayKey, e.target.checked)}
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label={dayLabel}
                />
                {dayConfig.enabled && (
                  <Box className={classes.timeFields}>
                    <TextField
                      label="Início"
                      type="time"
                      value={dayConfig.startTime}
                      onChange={(e) => handleTimeChange(dayKey, "startTime", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }} // 5 minutos
                      disabled={loading}
                      size="small"
                    />
                    <Typography variant="body2" style={{ margin: "0 8px" }}>
                      até
                    </Typography>
                    <TextField
                      label="Fim"
                      type="time"
                      value={dayConfig.endTime}
                      onChange={(e) => handleTimeChange(dayKey, "endTime", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }} // 5 minutos
                      disabled={loading}
                      size="small"
                    />
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default UserAvailabilitySettings;
