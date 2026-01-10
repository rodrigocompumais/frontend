import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Select from "@material-ui/core/Select";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    minHeight: 'calc(100vh - 48px)',
    backgroundColor: theme.palette.type === 'dark' ? '#0f1419' : '#f5f7fa',
    display: "flex",
    alignItems: "flex-start",
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },

  container: {
    width: '100%',
    maxWidth: 800,
  },

  paper: {
    padding: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    borderRadius: 12,
    boxShadow: theme.palette.type === 'dark'
      ? '0 4px 20px rgba(0, 0, 0, 0.5)'
      : '0 2px 12px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  },

  settingOption: {
    marginLeft: "auto",
  },
  margin: {
    margin: theme.spacing(1),
  },
  
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary,
  },
}));

const Settings = () => {
  const classes = useStyles();

  const [settings, setSettings] = useState([]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-settings`, (data) => {
      if (data.action === "update") {
        setSettings((prevState) => {
          const aux = [...prevState];
          const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
          aux[settingIndex].value = data.setting.value;
          return aux;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  const handleChangeSetting = async (e) => {
    const selectedValue = e.target.value;
    const settingKey = e.target.name;

    try {
      await api.put(`/settings/${settingKey}`, {
        value: selectedValue,
      });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const getSettingValue = (key) => {
    const { value } = settings.find((s) => s.key === key);
    return value;
  };

  return (
    <div className={classes.root}>
      <Container className={classes.container} maxWidth={false} disableGutters>
        <Typography variant="h5" className={classes.title}>
          {i18n.t("settings.title")}
        </Typography>
        <Paper className={classes.paper}>
          <Typography variant="body1">
            {i18n.t("settings.settings.userCreation.name")}
          </Typography>
          <Select
            margin="dense"
            variant="outlined"
            native
            id="userCreation-setting"
            name="userCreation"
            value={
              settings && settings.length > 0 && getSettingValue("userCreation")
            }
            className={classes.settingOption}
            onChange={handleChangeSetting}
          >
            <option value="enabled">
              {i18n.t("settings.settings.userCreation.options.enabled")}
            </option>
            <option value="disabled">
              {i18n.t("settings.settings.userCreation.options.disabled")}
            </option>
          </Select>
        </Paper>
      </Container>
    </div>
  );
};

export default Settings;
