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
    fbPageId: Yup.string().required("ID da Página é obrigatório para Instagram"),
    facebookUserToken: Yup.string().required("Token de Usuário Facebook é obrigatório"),
    token: Yup.string().required("Token do Webhook é obrigatório"),
});

const InstagramModal = ({ open, onClose, whatsAppId }) => {
    const classes = useStyles();
    const initialState = {
        name: "",
        greetingMessage: "",
        complationMessage: "",
        outOfHoursMessage: "",
        ratingMessage: "",
        isDefault: false,
        token: "",
        provider: "instagram", // Fixo
        type: "instagram", // Fixo
        fbPageId: "",
        facebookUserToken: "",
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

                // Ajuste para garantir que estamos editando apenas se for Instagram ?
                // Se a logica de controle de modal estiver certa lá fora, ok.

                setWhatsApp({
                    ...data,
                    provider: "instagram",
                    type: "instagram"
                });

                setSelectedPrompt(data.promptId);
                setSelectedIntegration(data.integrationId);
                setSelectedFlowIdWelcome(data.flowIdWelcome);
                setSelectedFlowIdNotPhrase(data.flowIdNotPhrase);

                const whatsQueueIds = data.queues?.map((queue) => queue.id);
                setSelectedQueueIds(whatsQueueIds);
                setSelectedQueueId(data.transferQueueId);
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
            flowIdNotPhrase: selectedFlowIdNotPhrase || null,
            provider: "instagram", // Força
            type: "instagram" // Força
        };
        delete whatsappData["queues"];
        delete whatsappData["session"];

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
                        ? "Editar Conexão Instagram"
                        : "Adicionar Conexão Instagram"}
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
                                {/* Linha 1: Nome e Padrão */}
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

                                {/* Linha 2: Campos de Credenciais do Instagram/Facebook */}
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
                                        label="Token de Usuário Facebook (Page Access Token)"
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
                                <div>
                                    <Field
                                        as={TextField}
                                        label="Token de Verificação (Webhook)"
                                        type="text"
                                        fullWidth
                                        name="token"
                                        variant="outlined"
                                        margin="dense"
                                        required
                                        error={touched.token && Boolean(errors.token)}
                                        helperText={touched.token && errors.token}
                                    />
                                    <FormHelperText>
                                        Defina um token secreto para configurar no Webhook do Facebook Developers
                                    </FormHelperText>
                                </div>

                                {/* Mensagens (Opcionais para Instagram, mas mantidas se o usuário quiser configurar respostas automáticas do sistema) */}
                                <div>
                                    <br />
                                    <h3>Mensagens Automáticas</h3>
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
                                        error={touched.greetingMessage && Boolean(errors.greetingMessage)}
                                        helperText={touched.greetingMessage && errors.greetingMessage}
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
                                        error={touched.outOfHoursMessage && Boolean(errors.outOfHoursMessage)}
                                        helperText={touched.outOfHoursMessage && errors.outOfHoursMessage}
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
                                        error={touched.complationMessage && Boolean(errors.complationMessage)}
                                        helperText={touched.complationMessage && errors.complationMessage}
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
                                        error={touched.ratingMessage && Boolean(errors.ratingMessage)}
                                        helperText={touched.ratingMessage && errors.ratingMessage}
                                        variant="outlined"
                                        margin="dense"
                                    />
                                </div>

                                {/* Filas */}
                                <QueueSelect
                                    selectedQueueIds={selectedQueueIds}
                                    onChange={(selectedIds) => handleChangeQueue(selectedIds)}
                                />

                                {/* Integrações (Prompts, Flow, Etc) */}
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
                                </FormControl>

                                {/* Expiração e Transferência */}
                                <div>
                                    <h3>Configurações de Fila e Expiração</h3>
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
                                                selectedQueueIds={selectedQueueId || undefined}
                                                onChange={(selectedId) => {
                                                    setSelectedQueueId(selectedId || null)
                                                }}
                                                multiple={false}
                                                title={i18n.t("whatsappModal.form.queue")}
                                            />
                                        </Grid>

                                    </Grid>
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

export default React.memo(InstagramModal);
