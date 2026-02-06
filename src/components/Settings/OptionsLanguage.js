import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  makeStyles,
  Paper,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  formControl: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
}));

export default function OptionsLanguage({ settings }) {
  const classes = useStyles();
  const [companyLanguage, setCompanyLanguage] = useState("pt");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const languageSetting = settings.find((s) => s.key === "companyLanguage");
      if (languageSetting) {
        setCompanyLanguage(languageSetting.value);
      }
    }
  }, [settings]);

  const handleChangeLanguage = async (value) => {
    setCompanyLanguage(value);
    setLoading(true);

    try {
      await api.put("/settings/companyLanguage", {
        value,
      });
      toast.success(i18n.t("settings.options.toasts.success"));
    } catch (err) {
      console.error("Erro ao atualizar idioma da empresa:", err);
      toast.error(err.response?.data?.error || "Erro ao atualizar idioma");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6" className={classes.title}>
        {i18n.t("settings.options.fields.companyLanguage.title")}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {i18n.t("settings.options.fields.companyLanguage.helper")}
      </Typography>

      <FormControl className={classes.formControl} disabled={loading}>
        <InputLabel id="company-language-label">
          {i18n.t("settings.options.fields.companyLanguage.title")}
        </InputLabel>
        <Select
          labelId="company-language-label"
          value={companyLanguage}
          onChange={(e) => handleChangeLanguage(e.target.value)}
        >
          <MenuItem value="pt">
            🇧🇷 {i18n.t("settings.options.fields.companyLanguage.portuguese")}
          </MenuItem>
          <MenuItem value="en">
            🇺🇸 {i18n.t("settings.options.fields.companyLanguage.english")}
          </MenuItem>
          <MenuItem value="es">
            🇪🇸 {i18n.t("settings.options.fields.companyLanguage.spanish")}
          </MenuItem>
        </Select>
        <FormHelperText>
          {loading && <CircularProgress size={14} />}
          {!loading && i18n.t("settings.options.fields.companyLanguage.helper")}
        </FormHelperText>
      </FormControl>
    </Paper>
  );
}
