import React, { useCallback, useEffect, useState } from "react";

import {

  Box,

  Button,

  Chip,

  CircularProgress,

  FormControl,

  FormHelperText,

  Grid,

  InputLabel,

  MenuItem,

  Paper,

  Select,

  TextField,

  Typography

} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import { toast } from "react-toastify";

import api from "../../services/api";

import { i18n } from "../../translate/i18n";

import toastError from "../../errors/toastError";

import useSettings from "../../hooks/useSettings";



const useStyles = makeStyles((theme) => ({

  section: {

    padding: theme.spacing(2),

    marginBottom: theme.spacing(2),

    width: "100%"

  },

  row: {

    marginBottom: theme.spacing(2)

  },

  statusRow: {

    display: "flex",

    gap: theme.spacing(1),

    flexWrap: "wrap",

    marginBottom: theme.spacing(2)

  },

  keyActions: {

    display: "flex",

    gap: theme.spacing(1),

    flexWrap: "wrap",

    marginTop: theme.spacing(1)

  }

}));



const FUNCTION_KEYS = [

  "summaries",

  "chat",

  "messageImprovement",

  "transcription",

  "campaigns"

];



const labelForFunction = (key) => {

  const map = {

    summaries: i18n.t("settings.options.fields.aiProviderConfig.summaries"),

    chat: i18n.t("settings.options.fields.aiProviderConfig.chat"),

    messageImprovement: i18n.t(

      "settings.options.fields.aiProviderConfig.messageImprovement"

    ),

    transcription: i18n.t(

      "settings.options.fields.aiProviderConfig.transcription"

    ),

    campaigns: i18n.t("settings.options.fields.aiProviderConfig.campaigns")

  };

  return map[key] || key;

};



function getSetting(settings, key) {

  if (!Array.isArray(settings)) return "";

  const item = settings.find((s) => s.key === key);

  return item ? item.value || "" : "";

}



export default function OptionsAI({ settings }) {

  const classes = useStyles();

  const { update } = useSettings();

  const [loading, setLoading] = useState(true);

  const [testing, setTesting] = useState(false);

  const [testingGemini, setTestingGemini] = useState(false);

  const [savingGeminiKey, setSavingGeminiKey] = useState(false);

  const [savingKey, setSavingKey] = useState(null);

  const [available, setAvailable] = useState({ gemini: false, openai: false });

  const [configured, setConfigured] = useState({});

  const [geminiKeySource, setGeminiKeySource] = useState(null);

  const [hasStoredGeminiKey, setHasStoredGeminiKey] = useState(false);

  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState("");

  const [tests, setTests] = useState({

    openai: { valid: false, message: "" },

    gemini: { valid: false, message: "" }

  });



  const syncGeminiKeyFromSettings = useCallback(() => {

    const stored = getSetting(settings, "geminiApiKey");

    setHasStoredGeminiKey(!!stored?.trim());

    setGeminiApiKeyInput("");

  }, [settings]);



  const loadAll = useCallback(async () => {

    setLoading(true);

    try {

      const { data } = await api.get("/ai/providers/status");

      setAvailable(data.available || { gemini: false, openai: false });

      setConfigured(data.configured || {});

      setGeminiKeySource(data.geminiKeySource || null);

      setHasStoredGeminiKey(

        data.geminiKeyConfigured === true || !!getSetting(settings, "geminiApiKey")

      );

      setTests(

        data.tests || {

          openai: { valid: false, message: "" },

          gemini: { valid: false, message: "" }

        }

      );

    } catch (err) {

      toastError(err);

    } finally {

      setLoading(false);

    }

  }, [settings]);



  useEffect(() => {

    syncGeminiKeyFromSettings();

  }, [syncGeminiKeyFromSettings]);



  useEffect(() => {

    loadAll();

  }, [loadAll]);



  const handleProviderChange = async (functionType, provider) => {

    setSavingKey(functionType);

    try {

      await api.post("/ai/providers/config", { functionType, provider });

      setConfigured((prev) => ({ ...prev, [functionType]: provider }));

      toast.success(i18n.t("settings.options.fields.apiKeys.configUpdated"));

    } catch (err) {

      toastError(err);

    } finally {

      setSavingKey(null);

    }

  };



  const handleSaveGeminiKey = async () => {

    const value = geminiApiKeyInput.trim();

    if (!value) {

      toast.error(i18n.t("settings.options.fields.apiKeys.testGeminiError"));

      return;

    }

    setSavingGeminiKey(true);

    try {

      await update({ key: "geminiApiKey", value });

      setHasStoredGeminiKey(true);

      setGeminiApiKeyInput("");

      setGeminiKeySource("company");

      toast.success(i18n.t("settings.options.fields.geminiApiKey.saveSuccess"));

      await loadAll();

    } catch (err) {

      toastError(err);

    } finally {

      setSavingGeminiKey(false);

    }

  };



  const handleTestGeminiKey = async () => {

    const value = geminiApiKeyInput.trim();

    if (!value && !hasStoredGeminiKey && geminiKeySource !== "env") {

      toast.error(i18n.t("settings.options.fields.apiKeys.testGeminiError"));

      return;

    }

    setTestingGemini(true);

    try {

      const { data } = await api.post("/ai/providers/test-gemini", {

        ...(value ? { apiKey: value } : {})

      });

      if (data.valid) {

        toast.success(

          data.message || i18n.t("settings.options.fields.apiKeys.testSuccess")

        );

      } else {

        toast.error(

          data.message || i18n.t("settings.options.fields.apiKeys.testError")

        );

      }

      await loadAll();

    } catch (err) {

      toastError(err);

    } finally {

      setTestingGemini(false);

    }

  };



  const handleTestConnections = async () => {

    setTesting(true);

    try {

      await loadAll();

      toast.success(i18n.t("settings.options.fields.apiKeys.testSuccess"));

    } catch (err) {

      toastError(err);

    } finally {

      setTesting(false);

    }

  };



  if (loading) {

    return (

      <Box display="flex" justifyContent="center" p={4}>

        <CircularProgress />

      </Box>

    );

  }



  return (

    <Grid container spacing={2}>

      <Grid item xs={12}>

        <Paper className={classes.section} elevation={0}>

          <Typography variant="h6" gutterBottom>

            {i18n.t("settings.options.fields.geminiApiKey.title")}

          </Typography>

          <Typography variant="body2" color="textSecondary" paragraph>

            {i18n.t("settings.options.fields.geminiApiKey.helper")}

          </Typography>

          {hasStoredGeminiKey && geminiKeySource === "company" && (

            <Typography variant="body2" color="primary" paragraph>

              {i18n.t("settings.options.fields.geminiApiKey.configuredHint")}

            </Typography>

          )}

          {geminiKeySource === "env" && !hasStoredGeminiKey && (

            <Typography variant="body2" color="textSecondary" paragraph>

              {i18n.t("settings.options.fields.geminiApiKey.envFallbackHint")}

            </Typography>

          )}

          <TextField

            fullWidth

            variant="outlined"

            margin="dense"

            type="password"

            label={i18n.t("settings.options.fields.geminiApiKey.placeholder")}

            placeholder={

              hasStoredGeminiKey

                ? i18n.t("settings.options.fields.geminiApiKey.keepPlaceholder")

                : ""

            }

            value={geminiApiKeyInput}

            onChange={(e) => setGeminiApiKeyInput(e.target.value)}

            autoComplete="off"

          />

          <div className={classes.keyActions}>

            <Button

              variant="contained"

              color="primary"

              onClick={handleSaveGeminiKey}

              disabled={savingGeminiKey || !geminiApiKeyInput.trim()}

            >

              {savingGeminiKey ? (

                <CircularProgress size={22} color="inherit" />

              ) : (

                i18n.t("settings.options.fields.geminiApiKey.saveButton")

              )}

            </Button>

            <Button

              variant="outlined"

              color="primary"

              onClick={handleTestGeminiKey}

              disabled={testingGemini}

            >

              {testingGemini ? (

                <CircularProgress size={22} />

              ) : (

                i18n.t("settings.options.fields.apiKeys.testButton")

              )}

            </Button>

          </div>

        </Paper>

      </Grid>



      <Grid item xs={12}>

        <Paper className={classes.section} elevation={0}>

          <Typography variant="h6" gutterBottom>

            {i18n.t("settings.options.fields.aiProviderConfig.title")}

          </Typography>

          <Typography variant="body2" color="textSecondary" paragraph>

            {i18n.t("settings.options.fields.aiProviderConfig.helper")}

          </Typography>

          <Typography variant="body2" color="textSecondary" paragraph>

            {i18n.t("settings.options.fields.lmStudioInfra.description")}

          </Typography>



          <div className={classes.statusRow}>

            <Chip

              label={`LM Studio: ${available.openai ? "configurado" : "indisponível"}`}

              color={available.openai ? "primary" : "default"}

              size="small"

            />

            <Chip

              label={`Gemini: ${available.gemini ? "configurado" : "indisponível"}`}

              color={available.gemini ? "primary" : "default"}

              size="small"

            />

            {available.openai && (

              <Chip

                label={

                  tests.openai?.valid

                    ? "LM Studio: OK"

                    : `LM Studio: ${tests.openai?.message || "falha"}`

                }

                color={tests.openai?.valid ? "primary" : "secondary"}

                size="small"

              />

            )}

            {available.gemini && (

              <Chip

                label={

                  tests.gemini?.valid

                    ? "Gemini: OK"

                    : `Gemini: ${tests.gemini?.message || "falha"}`

                }

                color={tests.gemini?.valid ? "primary" : "secondary"}

                size="small"

              />

            )}

          </div>



          <Button

            variant="outlined"

            color="primary"

            onClick={handleTestConnections}

            disabled={testing}

            style={{ marginBottom: 16 }}

          >

            {testing ? (

              <CircularProgress size={22} />

            ) : (

              i18n.t("settings.options.fields.lmStudioInfra.testButton")

            )}

          </Button>

        </Paper>

      </Grid>



      {FUNCTION_KEYS.map((functionType) => {

        const isTranscription = functionType === "transcription";

        const value = configured[functionType] || "openai";

        return (

          <Grid item xs={12} md={6} key={functionType}>

            <Paper className={classes.section} elevation={0}>

              <FormControl

                variant="outlined"

                fullWidth

                className={classes.row}

                disabled={!!savingKey}

              >

                <InputLabel>{labelForFunction(functionType)}</InputLabel>

                <Select

                  label={labelForFunction(functionType)}

                  value={value}

                  onChange={(e) =>

                    handleProviderChange(functionType, e.target.value)

                  }

                >

                  <MenuItem value="openai" disabled={!available.openai}>

                    OpenAI (LM Studio)

                  </MenuItem>

                  <MenuItem

                    value="gemini"

                    disabled={!available.gemini || isTranscription}

                  >

                    Gemini

                  </MenuItem>

                </Select>

                {isTranscription && (

                  <FormHelperText>

                    Transcrição usa apenas LM Studio/Whisper no servidor.

                  </FormHelperText>

                )}

                {savingKey === functionType && (

                  <FormHelperText>Salvando...</FormHelperText>

                )}

              </FormControl>

            </Paper>

          </Grid>

        );

      })}

    </Grid>

  );

}


