import React, { useState, useEffect } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select, Menu, Grid, FormControlLabel, Checkbox } from "@material-ui/core";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
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
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
    },
}));

// Schema será criado dinamicamente baseado no provider
const getPromptSchema = (provider) => {
    const baseSchema = {
        name: Yup.string().min(5, i18n.t("promptModal.formErrors.name.short")).max(100, i18n.t("promptModal.formErrors.name.long")).required(i18n.t("promptModal.formErrors.name.required")),
        prompt: Yup.string().min(50, i18n.t("promptModal.formErrors.prompt.short")).required(i18n.t("promptModal.formErrors.prompt.required")),
        model: Yup.string().required(i18n.t("promptModal.formErrors.modal.required")),
        maxTokens: Yup.number().required(i18n.t("promptModal.formErrors.maxTokens.required")),
        temperature: Yup.number().required(i18n.t("promptModal.formErrors.temperature.required")),
        maxMessages: Yup.number().required(i18n.t("promptModal.formErrors.maxMessages.required"))
    };

    // Não validar apiKey aqui - será validado nas Settings
    // queueId agora é opcional
    return Yup.object().shape(baseSchema);
};

const PromptModal = ({ open, onClose, promptId, refreshPrompts }) => {
    const classes = useStyles();
    const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo-1106");
    const [selectedProvider, setSelectedProvider] = useState("openai");
    const [apiKeyStatus, setApiKeyStatus] = useState({ gemini: false, openai: false });
    const [loadingApiKeyStatus, setLoadingApiKeyStatus] = useState(false);
    const [creationMode, setCreationMode] = useState("personalizado"); // "personalizado" ou "template"
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [templateVariables, setTemplateVariables] = useState({
        nome_agente: "",
        tom_resposta: "neutro",
        observacoes: ""
    });

    const initialState = {
        name: "",
        prompt: "",
        model: "gpt-3.5-turbo-1106",
        provider: "openai",
        maxTokens: 100,
        temperature: 1,
        maxMessages: 10,
        canSendInternalMessages: false,
        canTransferToAgent: false,
        canChangeTag: false,
        permitirCriarAgendamentos: false
    };

    const [prompt, setPrompt] = useState(initialState);

    // Carregar templates disponíveis
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const { data } = await api.get("/prompt-templates");
                setTemplates(data.templates || []);
            } catch (err) {
                console.error("Erro ao carregar templates:", err);
            }
        };
        if (!promptId) {
            fetchTemplates();
        }
    }, [promptId]);

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                setSelectedProvider("openai");
                setSelectedModel("gpt-3.5-turbo-1106");
                setCreationMode("personalizado");
                setSelectedTemplate(null);
                setTemplateVariables({
                    nome_agente: "",
                    tom_resposta: "neutro",
                    observacoes: ""
                });
            } else {
                try {
                    const { data } = await api.get(`/prompt/${promptId}`);
                    setPrompt({
                        name: data.name || "",
                        prompt: data.prompt || "",
                        model: data.model || "gpt-3.5-turbo-1106",
                        provider: data.provider || "openai",
                        maxTokens: data.maxTokens || 100,
                        temperature: data.temperature !== undefined ? data.temperature : 1,
                        maxMessages: data.maxMessages || 10,
                        canSendInternalMessages: data.canSendInternalMessages === true,
                        canTransferToAgent: data.canTransferToAgent === true,
                        canChangeTag: data.canChangeTag === true,
                        permitirCriarAgendamentos: data.permitirCriarAgendamentos === true
                    });

                    setSelectedModel(data.model || "gpt-3.5-turbo-1106");
                    setSelectedProvider(data.provider || "openai");
                } catch (err) {
                    toastError(err);
                }
            }
        };

        const checkApiKeys = async () => {
            setLoadingApiKeyStatus(true);
            try {
                const { data } = await api.get("/settings");
                const geminiKey = data.find(s => s.key === "geminiApiKey");
                const openaiKey = data.find(s => s.key === "openaiApiKey");

                setApiKeyStatus({
                    gemini: !!geminiKey?.value,
                    openai: !!openaiKey?.value
                });
            } catch (err) {
                console.error("Erro ao verificar API keys:", err);
            } finally {
                setLoadingApiKeyStatus(false);
            }
        };

        if (open) {
            fetchPrompt();
            checkApiKeys();
        }
    }, [promptId, open]);

    const handleClose = () => {
        setPrompt(initialState);
        setSelectedModel("gpt-3.5-turbo-1106");
        setSelectedProvider("openai");
        onClose();
    };

    const handleChangeModel = (e) => {
        const newModel = e.target.value;
        setSelectedModel(newModel);
        // Atualizar também no estado do prompt para sincronizar com Formik
        setPrompt(prev => ({ ...prev, model: newModel }));
    };

    const handleChangeProvider = (e) => {
        const newProvider = e.target.value;
        setSelectedProvider(newProvider);
        // Se mudar para Gemini, resetar modelo para o padrão do Gemini
        let defaultModel;
        if (newProvider === "gemini") {
            defaultModel = "gemini-2.5-flash";
        } else {
            defaultModel = "gpt-3.5-turbo-1106";
        }
        setSelectedModel(defaultModel);
        // Atualizar também no estado do prompt
        setPrompt(prev => ({ ...prev, provider: newProvider, model: defaultModel }));
    };

    const handleSaveTemplate = async () => {
        if (!selectedTemplate) {
            toast.error("Selecione um template");
            return;
        }

        const promptData = {
            tipoAgente: selectedTemplate.tipo,
            model: selectedModel,
            provider: selectedProvider,
            maxMessages: 10,
            maxTokens: 100,
            temperature: 1,
            variables: {
                ...templateVariables,
                permitir_criar_agendamentos: selectedTemplate.tipo === "agendador"
            }
        };

        try {
            await api.post("/prompt-templates/create", promptData);
            toast.success(i18n.t("promptModal.success"));
            refreshPrompts();
            handleClose();
        } catch (err) {
            toastError(err);
        }
    };

    const handleSavePrompt = async values => {
        // Verificar se há API key configurada para o provider selecionado
        if (selectedProvider === "openai" && !apiKeyStatus.openai) {
            toast.error(
                "Para usar OpenAI, configure a API Key em Configurações → Integrações → Chave da API do OpenAI"
            );
            return;
        }

        if (selectedProvider === "gemini" && !apiKeyStatus.gemini) {
            toast.error(
                "Para usar Gemini, configure a API Key em Configurações → Integrações → Chave da API do Gemini"
            );
            return;
        }

        const promptData = {
            ...values,
            model: selectedModel,
            provider: selectedProvider
        };

        // Não enviar apiKey - será buscada das Settings
        delete promptData.apiKey;
        try {
            if (promptId) {
                await api.put(`/prompt/${promptId}`, promptData);
            } else {
                await api.post("/prompt", promptData);
            }
            toast.success(i18n.t("promptModal.success"));
            refreshPrompts();
        } catch (err) {
            toastError(err);
        }
        handleClose();
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                scroll="paper"
                fullWidth
            >
                <DialogTitle id="form-dialog-title">
                    {promptId
                        ? `${i18n.t("promptModal.title.edit")}`
                        : `${i18n.t("promptModal.title.add")}`}
                </DialogTitle>
                <Formik
                    initialValues={prompt}
                    enableReinitialize={true}
                    validationSchema={getPromptSchema(selectedProvider)}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSavePrompt(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form style={{ width: "100%" }}>
                            <DialogContent dividers>
                                {!promptId && (
                                    <FormControl fullWidth margin="dense" variant="outlined">
                                        <InputLabel id="creation-mode-label">Modo de Criação</InputLabel>
                                        <Select
                                            labelId="creation-mode-label"
                                            id="creation-mode-select"
                                            value={creationMode}
                                            onChange={(e) => {
                                                setCreationMode(e.target.value);
                                                if (e.target.value === "template") {
                                                    setSelectedTemplate(null);
                                                }
                                            }}
                                            label="Modo de Criação"
                                        >
                                            <MenuItem value="personalizado">Personalizado (Avançado)</MenuItem>
                                            <MenuItem value="template">Template Pré-definido</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}

                                {creationMode === "template" && !promptId && (
                                    <>
                                        <FormControl fullWidth margin="dense" variant="outlined">
                                            <InputLabel id="template-select-label">Tipo de Agente</InputLabel>
                                            <Select
                                                labelId="template-select-label"
                                                id="template-select"
                                                value={selectedTemplate?.tipo || ""}
                                                onChange={(e) => {
                                                    const template = templates.find(t => t.tipo === e.target.value);
                                                    setSelectedTemplate(template);
                                                    if (template) {
                                                        setTemplateVariables({
                                                            nome_agente: template.defaultVariables.nome_agente || "",
                                                            tom_resposta: template.defaultVariables.tom_resposta || "neutro",
                                                            observacoes: ""
                                                        });
                                                    }
                                                }}
                                                label="Tipo de Agente"
                                            >
                                                {templates.map((template) => (
                                                    <MenuItem key={template.tipo} value={template.tipo}>
                                                        {template.nome} - {template.descricao}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {selectedTemplate && (
                                            <>
                                                <Field
                                                    as={TextField}
                                                    label="Nome do Agente"
                                                    name="nome_agente"
                                                    value={templateVariables.nome_agente}
                                                    onChange={(e) => setTemplateVariables({
                                                        ...templateVariables,
                                                        nome_agente: e.target.value
                                                    })}
                                                    variant="outlined"
                                                    margin="dense"
                                                    fullWidth
                                                />

                                                <FormControl fullWidth margin="dense" variant="outlined">
                                                    <InputLabel id="tom-resposta-label">Tom de Resposta</InputLabel>
                                                    <Select
                                                        labelId="tom-resposta-label"
                                                        id="tom-resposta-select"
                                                        value={templateVariables.tom_resposta}
                                                        onChange={(e) => setTemplateVariables({
                                                            ...templateVariables,
                                                            tom_resposta: e.target.value
                                                        })}
                                                        label="Tom de Resposta"
                                                    >
                                                        <MenuItem value="formal">Formal</MenuItem>
                                                        <MenuItem value="neutro">Neutro</MenuItem>
                                                        <MenuItem value="informal">Informal</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <Field
                                                    as={TextField}
                                                    label="Observações Adicionais"
                                                    name="observacoes"
                                                    value={templateVariables.observacoes}
                                                    onChange={(e) => setTemplateVariables({
                                                        ...templateVariables,
                                                        observacoes: e.target.value
                                                    })}
                                                    variant="outlined"
                                                    margin="dense"
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    helperText="Observações específicas que serão adicionadas ao prompt base"
                                                />

                                                <FormControl fullWidth margin="dense" variant="outlined">
                                                    <InputLabel id="provider-select-label">Provider</InputLabel>
                                                    <Select
                                                        labelId="provider-select-label"
                                                        id="provider-select"
                                                        value={selectedProvider}
                                                        onChange={handleChangeProvider}
                                                        label="Provider"
                                                    >
                                                        <MenuItem value="openai">OpenAI</MenuItem>
                                                        <MenuItem value="gemini">Gemini</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                {selectedProvider === "openai" && (
                                                    <FormControl fullWidth margin="dense" variant="outlined">
                                                        <TextField
                                                            label="API Key do OpenAI"
                                                            value={apiKeyStatus.openai
                                                                ? "✓ API Key configurada em Configurações → Integrações"
                                                                : "⚠ API Key não configurada"}
                                                            variant="outlined"
                                                            margin="dense"
                                                            fullWidth
                                                            disabled
                                                            error={!apiKeyStatus.openai}
                                                            helperText={apiKeyStatus.openai
                                                                ? "A API Key será obtida das configurações da empresa"
                                                                : "Configure a API Key em Configurações → Integrações → Chave da API do OpenAI"}
                                                        />
                                                    </FormControl>
                                                )}

                                                {selectedProvider === "gemini" && (
                                                    <FormControl fullWidth margin="dense" variant="outlined">
                                                        <TextField
                                                            label="API Key do Gemini"
                                                            value={apiKeyStatus.gemini
                                                                ? "✓ API Key configurada em Configurações → Integrações"
                                                                : "⚠ API Key não configurada"}
                                                            variant="outlined"
                                                            margin="dense"
                                                            fullWidth
                                                            disabled
                                                            error={!apiKeyStatus.gemini}
                                                            helperText={apiKeyStatus.gemini
                                                                ? "A API Key será obtida das configurações da empresa"
                                                                : "Configure a API Key em Configurações → Integrações → Chave da API do Gemini"}
                                                        />
                                                    </FormControl>
                                                )}

                                                {selectedTemplate.tipo === "agendador" && (
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={templateVariables.permitir_criar_agendamentos || false}
                                                                onChange={(e) => setTemplateVariables({
                                                                    ...templateVariables,
                                                                    permitir_criar_agendamentos: e.target.checked
                                                                })}
                                                                color="primary"
                                                            />
                                                        }
                                                        label="Permitir criar agendamentos"
                                                    />
                                                )}

                                                <div style={{ marginTop: 16, padding: 12, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
                                                    <strong>Permissões do Template:</strong>
                                                    <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                                                        <li>Mensagens Internas: {selectedTemplate.permissoes.canSendInternalMessages ? "Sim" : "Não"}</li>
                                                        <li>Transferir para Agente: {selectedTemplate.permissoes.canTransferToAgent ? "Sim" : "Não"}</li>
                                                        <li>Alterar Tag: {selectedTemplate.permissoes.canChangeTag ? "Sim" : "Não"}</li>
                                                        <li>Criar Agendamentos: {selectedTemplate.permissoes.permitirCriarAgendamentos ? "Sim" : "Não"}</li>
                                                    </ul>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {creationMode === "personalizado" && (
                                    <>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.name")}
                                            name="name"
                                            error={touched.name && Boolean(errors.name)}
                                            helperText={touched.name && errors.name}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                        <FormControl fullWidth margin="dense" variant="outlined">
                                            <InputLabel id="provider-select-label">Provider</InputLabel>
                                            <Select
                                                labelId="provider-select-label"
                                                id="provider-select"
                                                value={selectedProvider}
                                                onChange={handleChangeProvider}
                                                label="Provider"
                                            >
                                                <MenuItem value="openai">OpenAI</MenuItem>
                                                <MenuItem value="gemini">Gemini</MenuItem>
                                            </Select>
                                        </FormControl>
                                        {selectedProvider === "openai" && (
                                            <FormControl fullWidth margin="dense" variant="outlined">
                                                <TextField
                                                    label="API Key do OpenAI"
                                                    value={apiKeyStatus.openai
                                                        ? "✓ API Key configurada em Configurações → Integrações"
                                                        : "⚠ API Key não configurada"}
                                                    variant="outlined"
                                                    margin="dense"
                                                    fullWidth
                                                    disabled
                                                    error={!apiKeyStatus.openai}
                                                    helperText={apiKeyStatus.openai
                                                        ? "A API Key será obtida das configurações da empresa"
                                                        : "Configure a API Key em Configurações → Integrações → Chave da API do OpenAI"}
                                                />
                                            </FormControl>
                                        )}
                                        {selectedProvider === "gemini" && (
                                            <FormControl fullWidth margin="dense" variant="outlined">
                                                <TextField
                                                    label="API Key do Gemini"
                                                    value={apiKeyStatus.gemini
                                                        ? "✓ API Key configurada em Configurações → Integrações"
                                                        : "⚠ API Key não configurada"}
                                                    variant="outlined"
                                                    margin="dense"
                                                    fullWidth
                                                    disabled
                                                    error={!apiKeyStatus.gemini}
                                                    helperText={apiKeyStatus.gemini
                                                        ? "A API Key será obtida das configurações da empresa"
                                                        : "Configure a API Key em Configurações → Integrações → Chave da API do Gemini"}
                                                />
                                            </FormControl>
                                        )}
                                        <Field
                                            as={TextField}
                                            label={i18n.t("promptModal.form.prompt")}
                                            name="prompt"
                                            error={touched.prompt && Boolean(errors.prompt)}
                                            helperText={touched.prompt && errors.prompt}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                            rows={10}
                                            multiline={true}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Field
                                                    as={Checkbox}
                                                    name="canSendInternalMessages"
                                                    color="primary"
                                                />
                                            }
                                            label={i18n.t("promptModal.form.canSendInternalMessages")}
                                        />

                                        <FormControlLabel
                                            control={
                                                <Field
                                                    as={Checkbox}
                                                    name="canTransferToAgent"
                                                    color="primary"
                                                />
                                            }
                                            label={i18n.t("promptModal.form.canTransferToAgent")}
                                        />

                                        <FormControlLabel
                                            control={
                                                <Field
                                                    as={Checkbox}
                                                    name="canChangeTag"
                                                    color="primary"
                                                />
                                            }
                                            label={i18n.t("promptModal.form.canChangeTag")}
                                        />

                                        <FormControlLabel
                                            control={
                                                <Field
                                                    as={Checkbox}
                                                    name="permitirCriarAgendamentos"
                                                    color="primary"
                                                />
                                            }
                                            label={i18n.t("promptModal.form.permitirCriarAgendamentos")}
                                        />

                                        <div className={classes.multFieldLine}>
                                            <FormControl fullWidth margin="dense" variant="outlined">
                                                <InputLabel id="model-select-label" shrink={!!selectedModel}>
                                                    {i18n.t("promptModal.form.model")}
                                                </InputLabel>
                                                <Select
                                                    labelId="model-select-label"
                                                    id="model-select"
                                                    value={selectedModel}
                                                    onChange={handleChangeModel}
                                                    displayEmpty={false}
                                                >
                                                    {selectedProvider === "openai" ? (
                                                        <>
                                                            <MenuItem value="gpt-3.5-turbo-1106">
                                                                GPT 3.5 turbo
                                                            </MenuItem>
                                                            <MenuItem value="gpt-4o-mini">
                                                                GPT 4.0 Mini
                                                            </MenuItem>
                                                            <MenuItem value="gpt-4o">
                                                                GPT 4.0
                                                            </MenuItem>
                                                        </>
                                                    ) : (
                                                        <MenuItem value="gemini-2.5-flash">
                                                            Gemini 2.5 Flash
                                                        </MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("promptModal.form.temperature")}
                                                name="temperature"
                                                error={touched.temperature && Boolean(errors.temperature)}
                                                helperText={touched.temperature && errors.temperature}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                                type="number"
                                                inputProps={{
                                                    step: "0.1",
                                                    min: "0",
                                                    max: "1"
                                                }}
                                            />
                                        </div>

                                        <div className={classes.multFieldLine}>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("promptModal.form.max_tokens")}
                                                name="maxTokens"
                                                error={touched.maxTokens && Boolean(errors.maxTokens)}
                                                helperText={touched.maxTokens && errors.maxTokens}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                            />
                                            <Field
                                                as={TextField}
                                                label={i18n.t("promptModal.form.max_messages")}
                                                name="maxMessages"
                                                error={touched.maxMessages && Boolean(errors.maxMessages)}
                                                helperText={touched.maxMessages && errors.maxMessages}
                                                variant="outlined"
                                                margin="dense"
                                                fullWidth
                                            />
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    {i18n.t("promptModal.buttons.cancel")}
                                </Button>
                                {creationMode === "template" && !promptId ? (
                                    <Button
                                        onClick={handleSaveTemplate}
                                        color="primary"
                                        disabled={!selectedTemplate || isSubmitting}
                                        variant="contained"
                                        className={classes.btnWrapper}
                                    >
                                        {i18n.t("promptModal.buttons.okAdd")}
                                        {isSubmitting && (
                                            <CircularProgress
                                                size={24}
                                                className={classes.buttonProgress}
                                            />
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="contained"
                                        className={classes.btnWrapper}
                                    >
                                        {promptId
                                            ? `${i18n.t("promptModal.buttons.okEdit")}`
                                            : `${i18n.t("promptModal.buttons.okAdd")}`}
                                        {isSubmitting && (
                                            <CircularProgress
                                                size={24}
                                                className={classes.buttonProgress}
                                            />
                                        )}
                                    </Button>
                                )}
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
};

export default PromptModal;