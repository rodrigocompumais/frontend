import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("whatsappModal.formErrors.name.short"))
    .max(50, i18n.t("whatsappModal.formErrors.name.long"))
    .required(i18n.t("whatsappModal.formErrors.name.required")),
  provider: Yup.string(),
  gupshupApiKey: Yup.string().when("provider", {
    is: (val) => val === "gupshup",
    then: Yup.string().required("API Key é obrigatória para Gupshup"),
    otherwise: Yup.string().nullable()
  }),
  gupshupAppName: Yup.string().when("provider", {
    is: (val) => val === "gupshup",
    then: Yup.string().required("App Name é obrigatório para Gupshup"),
    otherwise: Yup.string().nullable()
  }),
  fbPageId: Yup.string().when("provider", {
    is: (val) => val === "instagram",
    then: Yup.string().required("ID da Página é obrigatório para Instagram"),
    otherwise: Yup.string().nullable()
  }),
  facebookUserToken: Yup.string().when("provider", {
    is: (val) => val === "instagram",
    then: Yup.string().required("Token de Usuário Facebook é obrigatório para Instagram"),
    otherwise: Yup.string().nullable()
  }),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {

  const classes = useStyles();
  const initialState = {
    name: "",
    greetingMessage: "",
    complationMessage: "",
    outOfHoursMessage: "",
    ratingMessage: "",
    isDefault: false,
    token: "",
    provider: "baileys",
    gupshupApiKey: "",
    gupshupAppName: "",
    fbPageId: "",
    facebookUserToken: "",
    //timeSendQueue: 0,
    //sendIdQueue: 0,
    expiresInactiveMessage: "",
    expiresTicket: 0,
    timeUseBotQueues: 0,
    maxUseBotQueues: 3,
    integration: null
  };

  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [, setQueues] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(null)
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [flowBuilders, setFlowBuilders] = useState([]);
  const [selectedFlowIdWelcome, setSelectedFlowIdWelcome] = useState(null);
  const [selectedFlowIdNotPhrase, setSelectedFlowIdNotPhrase] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {

        const { data } = await api.get(`whatsapp/${whatsAppId}?session=0`);

        setWhatsApp(data);
        setSelectedPrompt(data.promptId);
        setSelectedIntegration(data.integrationId);
        setSelectedFlowIdWelcome(data.flowIdWelcome);
        setSelectedFlowIdNotPhrase(data.flowIdNotPhrase);

        const whatsQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(whatsQueueIds);
        setSelectedQueueId(data.transferQueueId);

        // Garantir que provider tenha valor padrão se não existir
        if (!data.provider) {
          setWhatsApp(prev => ({ ...prev, provider: "baileys" }));
        }
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/prompt");
        setPrompts(data.prompts);

        const { data: dataIntegration } = await api.get("/queueIntegration");
        setIntegrations(dataIntegration.queueIntegrations);

        const { data: dataFlowBuilder } = await api.get("/flowbuilder");
        setFlowBuilders(Array.isArray(dataFlowBuilder?.flows) ? dataFlowBuilder.flows : []);

      } catch (err) {
        toastError(err);
      }
    })();
  }, [whatsAppId]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  const handleSaveWhatsApp = async (values) => {
    const whatsappData = {
      ...values,
      queueIds: selectedQueueIds,
      transferQueueId: selectedQueueId,
      promptId: selectedPrompt ? selectedPrompt : null,
      integrationId: selectedIntegration,
      flowIdWelcome: selectedFlowIdWelcome || null,
      flowIdNotPhrase: selectedFlowIdNotPhrase || null
    };
    delete whatsappData["queues"];
    delete whatsappData["session"];

    // Se não for Gupshup, remover campos Gupshup
    if (whatsappData.provider !== "gupshup") {
      delete whatsappData["gupshupApiKey"];
      delete whatsappData["gupshupAppName"];
    }

    // Se for Instagram
    if (whatsappData.provider === "instagram") {
      whatsappData.type = "instagram";
      // Mantém provider como "instagram" ou muda para algo que o backend espere como "graph_api" se necessário
      // Por consistência com o CreateWhatsAppService que espera type="whatsapp" por padrão, vamos forçar aqui
    } else {
      whatsappData.type = "whatsapp";
    }

    if (whatsappData.provider !== "instagram") {
      delete whatsappData["fbPageId"];
      delete whatsappData["facebookUserToken"];
    }

    try {
      if (whatsAppId) {
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
      } else {
        await api.post("/whatsapp", whatsappData);
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleChangeQueue = (e) => {
    setSelectedQueueIds(e);
    setSelectedPrompt(null);
  };

  const handleChangePrompt = (e) => {
    const value = e.target.value === "" ? null : e.target.value;
    setSelectedPrompt(value);
    setSelectedQueueIds([]);
  };

  const handleChangeIntegration = (e) => {
    const value = e.target.value === "" ? null : e.target.value;
    setSelectedIntegration(value);
  }

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);
    setSelectedQueueId(null);
    setSelectedQueueIds([]);
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {whatsAppId
            ? i18n.t("whatsappModal.title.edit")
            : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Grid spacing={2} container>
                    <Grid item>
                      <Field
                        as={TextField}
                        label={i18n.t("whatsappModal.form.name")}
                        autoFocus
                        name="name"
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined"
                        margin="dense"
                        className={classes.textField}
                      />
                    </Grid>
                    <Grid style={{ paddingTop: 15 }} item>
                      <FormControlLabel
                        control={
                          <Field
                            as={Switch}
                            color="primary"
                            name="isDefault"
                            checked={values.isDefault}
                          />
                        }
                        label={i18n.t("whatsappModal.form.default")}
                      />
                    </Grid>
                  </Grid>
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("queueModal.form.greetingMessage")}
                    type="greetingMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="greetingMessage"
                    error={
                      touched.greetingMessage && Boolean(errors.greetingMessage)
                    }
                    helperText={
                      touched.greetingMessage && errors.greetingMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("queueModal.form.complationMessage")}
                    type="complationMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="complationMessage"
                    error={
                      touched.complationMessage &&
                      Boolean(errors.complationMessage)
                    }
                    helperText={
                      touched.complationMessage && errors.complationMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("queueModal.form.outOfHoursMessage")}
                    type="outOfHoursMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="outOfHoursMessage"
                    error={
                      touched.outOfHoursMessage &&
                      Boolean(errors.outOfHoursMessage)
                    }
                    helperText={
                      touched.outOfHoursMessage && errors.outOfHoursMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("queueModal.form.ratingMessage")}
                    type="ratingMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="ratingMessage"
                    error={
                      touched.ratingMessage && Boolean(errors.ratingMessage)
                    }
                    helperText={touched.ratingMessage && errors.ratingMessage}
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("queueModal.form.token")}
                    type="token"
                    fullWidth
                    name="token"
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <FormControl
                  margin="dense"
                  variant="outlined"
                  fullWidth
                >
                  <InputLabel>
                    Provider
                  </InputLabel>
                  <Select
                    labelId="dialog-select-provider-label"
                    id="dialog-select-provider"
                    name="provider"
                    value={values.provider || "baileys"}
                    onChange={(e) => {
                      setFieldValue("provider", e.target.value);
                    }}
                    label="Provider"
                    fullWidth
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    <MenuItem value="baileys">Baileys</MenuItem>
                    <MenuItem value="gupshup">Gupshup (API Oficial)</MenuItem>
                    <MenuItem value="instagram">Instagram</MenuItem>
                  </Select>
                </FormControl>
                {values.provider === "gupshup" && (
                  <>
                    <div>
                      <Field
                        as={TextField}
                        label="Gupshup API Key"
                        type="text"
                        fullWidth
                        name="gupshupApiKey"
                        variant="outlined"
                        margin="dense"
                        required
                        error={touched.gupshupApiKey && Boolean(errors.gupshupApiKey)}
                        helperText={touched.gupshupApiKey && errors.gupshupApiKey}
                      />
                    </div>
                    <div>
                      <Field
                        as={TextField}
                        label="Gupshup App Name"
                        type="text"
                        fullWidth
                        name="gupshupAppName"
                        variant="outlined"
                        margin="dense"
                        required
                        error={touched.gupshupAppName && Boolean(errors.gupshupAppName)}
                        helperText={touched.gupshupAppName && errors.gupshupAppName}
                      />
                    </div>
                  </>
                )}
                {values.provider === "instagram" && (
                  <>
                    <div>
                      <Field
                        as={TextField}
                        label="ID da Página do Facebook"
                        type="text"
                        fullWidth
                        name="fbPageId"
                        variant="outlined"
                        margin="dense"
                        required
                        error={touched.fbPageId && Boolean(errors.fbPageId)}
                        helperText={touched.fbPageId && errors.fbPageId}
                      />
                    </div>
                    <div>
                      <Field
                        as={TextField}
                        label="Token de Usuário Facebook"
                        type="text"
                        fullWidth
                        name="facebookUserToken"
                        variant="outlined"
                        margin="dense"
                        required
                        error={touched.facebookUserToken && Boolean(errors.facebookUserToken)}
                        helperText={touched.facebookUserToken && errors.facebookUserToken}
                      />
                    </div>
                  </>
                )}
                <QueueSelect
                  selectedQueueIds={selectedQueueIds}
                  onChange={(selectedIds) => handleChangeQueue(selectedIds)}
                />
                <FormControl
                  margin="dense"
                  variant="outlined"
                  fullWidth
                >
                  <InputLabel>
                    {i18n.t("whatsappModal.form.prompt")}
                  </InputLabel>
                  <Select
                    labelId="dialog-select-prompt-label"
                    id="dialog-select-prompt"
                    name="promptId"
                    value={selectedPrompt || ""}
                    onChange={handleChangePrompt}
                    label={i18n.t("whatsappModal.form.prompt")}
                    fullWidth
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    <MenuItem value="">
                      <em style={{ color: '#999' }}>Nenhum (Remover Prompt)</em>
                    </MenuItem>
                    {prompts.map((prompt) => (
                      <MenuItem
                        key={prompt.id}
                        value={prompt.id}
                      >
                        {prompt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  margin="dense"
                  variant="outlined"
                  fullWidth
                >
                  <InputLabel>
                    {i18n.t("whatsappModal.form.integration")}
                  </InputLabel>
                  <Select
                    labelId="dialog-select-integration-label"
                    id="dialog-select-integration"
                    name="promptId"
                    value={selectedIntegration || ""}
                    onChange={handleChangeIntegration}
                    label={i18n.t("whatsappModal.form.integration")}
                    fullWidth
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    <MenuItem value="">
                      <em style={{ color: '#999' }}>Nenhuma (Remover Integração)</em>
                    </MenuItem>
                    {integrations.map((integration) => (
                      <MenuItem
                        key={integration.id}
                        value={integration.id}
                      >
                        {integration.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* FlowBuilder - Fluxo de Boas-vindas */}
                <FormControl
                  margin="dense"
                  variant="outlined"
                  fullWidth
                >
                  <InputLabel>
                    {i18n.t("whatsappModal.form.flowWelcome") || "Fluxo de Boas-vindas"}
                  </InputLabel>
                  <Select
                    labelId="dialog-select-flow-welcome-label"
                    id="dialog-select-flow-welcome"
                    name="flowIdWelcome"
                    value={selectedFlowIdWelcome || ""}
                    onChange={(e) => setSelectedFlowIdWelcome(e.target.value === "" ? null : e.target.value)}
                    label={i18n.t("whatsappModal.form.flowWelcome") || "Fluxo de Boas-vindas"}
                    fullWidth
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    <MenuItem value="">
                      <em style={{ color: '#999' }}>Nenhum</em>
                    </MenuItem>
                    {flowBuilders.map((flow) => (
                      <MenuItem
                        key={flow.id}
                        value={flow.id}
                      >
                        {flow.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Executado na primeira mensagem do contato
                  </FormHelperText>
                </FormControl>

                {/* FlowBuilder - Fluxo Padrão */}
                <FormControl
                  margin="dense"
                  variant="outlined"
                  fullWidth
                >
                  <InputLabel>
                    {i18n.t("whatsappModal.form.flowNotPhrase") || "Fluxo Padrão"}
                  </InputLabel>
                  <Select
                    labelId="dialog-select-flow-notphrase-label"
                    id="dialog-select-flow-notphrase"
                    name="flowIdNotPhrase"
                    value={selectedFlowIdNotPhrase || ""}
                    onChange={(e) => setSelectedFlowIdNotPhrase(e.target.value === "" ? null : e.target.value)}
                    label={i18n.t("whatsappModal.form.flowNotPhrase") || "Fluxo Padrão"}
                    fullWidth
                    MenuProps={{
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    <MenuItem value="">
                      <em style={{ color: '#999' }}>Nenhum</em>
                    </MenuItem>
                    {flowBuilders.map((flow) => (
                      <MenuItem
                        key={flow.id}
                        value={flow.id}
                      >
                        {flow.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Executado quando não reconhece comando/frase
                  </FormHelperText>
                </FormControl>

                <div>
                  <h3>{i18n.t("whatsappModal.form.queueRedirection")}</h3>
                  <p>{i18n.t("whatsappModal.form.queueRedirectionDesc")}</p>
                  <Grid container spacing={2}>
                    <Grid item sm={6} >
                      <Field
                        fullWidth
                        type="number"
                        as={TextField}
                        label={i18n.t("whatsappModal.form.timeToTransfer")}
                        name="timeToTransfer"
                        error={touched.timeToTransfer && Boolean(errors.timeToTransfer)}
                        helperText={touched.timeToTransfer && errors.timeToTransfer}
                        variant="outlined"
                        margin="dense"
                        className={classes.textField}
                        InputLabelProps={{ shrink: values.timeToTransfer ? true : false }}
                      />

                    </Grid>

                    <Grid item sm={6}>
                      <QueueSelect
                        selectedQueueIds={selectedQueueId}
                        onChange={(selectedId) => {
                          setSelectedQueueId(selectedId)
                        }}
                        multiple={false}
                        title={i18n.t("whatsappModal.form.queue")}
                      />
                    </Grid>

                  </Grid>
                  <Grid spacing={2} container>
                    {/* ENCERRAR CHATS ABERTOS APÓS X HORAS */}
                    <Grid xs={12} md={12} item>
                      <Field
                        as={TextField}
                        label={i18n.t("whatsappModal.form.expiresTicket")}
                        fullWidth
                        name="expiresTicket"
                        variant="outlined"
                        margin="dense"
                        error={touched.expiresTicket && Boolean(errors.expiresTicket)}
                        helperText={touched.expiresTicket && errors.expiresTicket}
                      />
                    </Grid>
                  </Grid>
                  {/* MENSAGEM POR INATIVIDADE*/}
                  <div>
                    <Field
                      as={TextField}
                      label={i18n.t("whatsappModal.form.expiresInactiveMessage")}
                      multiline
                      rows={4}
                      fullWidth
                      name="expiresInactiveMessage"
                      error={touched.expiresInactiveMessage && Boolean(errors.expiresInactiveMessage)}
                      helperText={touched.expiresInactiveMessage && errors.expiresInactiveMessage}
                      variant="outlined"
                      margin="dense"
                    />
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default React.memo(WhatsAppModal);
