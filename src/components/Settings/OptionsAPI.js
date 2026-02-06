import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
  makeStyles,
} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import PrintDevicesManager from "./PrintDevicesManager";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: 900,
  },
  field: {
    marginBottom: theme.spacing(3),
  },
  label: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  helper: {
    marginTop: theme.spacing(1),
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
  },
}));

export default function OptionsAPI() {
  const classes = useStyles();
  const companyId = localStorage.getItem("companyId") || "";
  const tokenRaw = localStorage.getItem("token");
  let token = "";
  try {
    token = tokenRaw ? JSON.parse(tokenRaw) : "";
  } catch {
    token = tokenRaw || "";
  }

  const [showToken, setShowToken] = useState(false);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(i18n.t("settings.options.fields.apiCredentials.copied", { label }));
    } catch (err) {
      toast.error(i18n.t("settings.options.fields.apiCredentials.copyError"));
    }
  };

  return (
    <Box className={classes.root}>
      <Typography variant="h6" gutterBottom>
        {i18n.t("settings.options.fields.apiCredentials.title")}
      </Typography>
      <Typography variant="body2" color="textSecondary" style={{ marginBottom: 24 }}>
        {i18n.t("settings.options.fields.apiCredentials.helper")}
      </Typography>

      <div className={classes.field}>
        <Typography className={classes.label}>
          {i18n.t("settings.options.fields.apiCredentials.companyId")}
        </Typography>
        <TextField
          fullWidth
          value={companyId}
          variant="outlined"
          size="small"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleCopy(companyId, "ID da Empresa")}
                  edge="end"
                  size="small"
                  title={i18n.t("settings.options.fields.apiCredentials.copy")}
                >
                  <FileCopyIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>

      <div className={classes.field}>
        <Typography className={classes.label}>
          {i18n.t("settings.options.fields.apiCredentials.jwtToken")}
        </Typography>
        <Box display="flex" alignItems="flex-start" gap={1}>
          <TextField
            fullWidth
            type={showToken ? "text" : "password"}
            value={token}
            variant="outlined"
            size="small"
            multiline
            rows={3}
            InputProps={{ readOnly: true }}
            onClick={() => setShowToken(!showToken)}
            style={{ cursor: "pointer", flex: 1 }}
          />
          <IconButton
            onClick={() => handleCopy(token, "Token JWT")}
            size="small"
            title={i18n.t("settings.options.fields.apiCredentials.copy")}
          >
            <FileCopyIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography className={classes.helper}>
          {i18n.t("settings.options.fields.apiCredentials.tokenHelper")}
        </Typography>
      </div>

      <PrintDevicesManager />
    </Box>
  );
}
