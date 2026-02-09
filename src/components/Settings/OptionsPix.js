import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import useSettings from "../../hooks/useSettings";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  fullWidth: {
    width: "100%",
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

function getSetting(settings, key) {
  if (!Array.isArray(settings)) return "";
  const item = settings.find((s) => s.key === key);
  return item ? (item.value || "") : "";
}

export default function OptionsPix({ settings }) {
  const classes = useStyles();
  const { update } = useSettings();
  const [pixKey, setPixKey] = useState("");
  const [pixReceiverName, setPixReceiverName] = useState("");
  const [pixReceiverCity, setPixReceiverCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPixKey(getSetting(settings, "pixKey"));
    setPixReceiverName(getSetting(settings, "pixReceiverName"));
    setPixReceiverCity(getSetting(settings, "pixReceiverCity"));
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await update({ key: "pixKey", value: pixKey.trim() });
      await update({ key: "pixReceiverName", value: pixReceiverName.trim() });
      await update({ key: "pixReceiverCity", value: pixReceiverCity.trim() });
      toast.success(i18n.t("settings.optionsPix.toastSuccess"));
    } catch (e) {
      toast.error(e?.message || i18n.t("settings.optionsPix.toastError"));
    }
    setSaving(false);
  };

  return (
    <div className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            className={classes.fullWidth}
            label={i18n.t("settings.optionsPix.pixKey")}
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            className={classes.fullWidth}
            label={i18n.t("settings.optionsPix.receiverName")}
            value={pixReceiverName}
            onChange={(e) => setPixReceiverName(e.target.value)}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            className={classes.fullWidth}
            label={i18n.t("settings.optionsPix.receiverCity")}
            value={pixReceiverCity}
            onChange={(e) => setPixReceiverCity(e.target.value)}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? i18n.t("settings.optionsPix.saving") : i18n.t("settings.optionsPix.save")}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
