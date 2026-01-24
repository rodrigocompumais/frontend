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
import TemplateConfigModal from "./TemplateConfigModal";

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
    // Estilos para grid de cards
    cardsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: theme.spacing(2),
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(3),
    },
    templateCard: {
        padding: theme.spacing(3),
        border: "2px solid #e0e0e0",
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.3s ease",
        background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            borderColor: theme.palette.primary.light,
        },
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            opacity: 0,
            transition: "opacity 0.3s ease",
        },
    },
    templateCardSelected: {
        borderColor: theme.palette.primary.main,
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        boxShadow: "0 8px 24px rgba(33,150,243,0.3)",
        "&::before": {
            opacity: 1,
        },
    },
    cardIcon: {
        fontSize: 48,
        marginBottom: theme.spacing(1),
        textAlign: "center",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 600,
        marginBottom: theme.spacing(1),
        color: theme.palette.text.primary,
        textAlign: "center",
    },
    cardDescription: {
        fontSize: 14,
        color: theme.palette.text.secondary,
        textAlign: "center",
        lineHeight: 1.5,
        minHeight: 60,
    },
    permissionsSection: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(2),
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        border: "1px solid #e0e0e0",
    },
    permissionsTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: theme.spacing(2),
        color: theme.palette.text.primary,
    },
    permissionsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: theme.spacing(1),
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
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [templateVariables, setTemplateVariables] = useState({
        nome_agente: "",
        tom_resposta: "neutro",
        observacoes: ""
    });
    const [customPermissions, setCustomPermissions] = useState({
        canSendInternalMessages: false,
        canTransferToAgent: false,
        canChangeTag: false,
        permitirCriarAgendamentos: false
    });
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [useCustomAgentName, setUseCustomAgentName] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isManualMode, setIsManualMode] = useState(false);

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

    // Templates built-in com mais opções de agentes
    const builtInTemplates = [
        {
            id: "personalizado",
            tipo: "personalizado",
            nome: "Prompt Personalizado",
            descricao: "Crie seu próprio agente do zero com configurações avançadas",
            icon: "⚙️",
            permissoes: {
                canSendInternalMessages: false,
                canTransferToAgent: false,
                canChangeTag: false,
                permitirCriarAgendamentos: false
            }
        },
        {
            id: "atendimento",
            tipo: "atendimento",
            nome: "Atendimento ao Cliente",
            descricao: "Agente especializado em atender clientes com cordialidade e eficiência",
            icon: "👤",
            promptBase: "Você é um assistente de atendimento ao cliente profissional e cordial. Sua missão é ajudar os clientes de forma clara, educada e eficiente. Sempre mantenha um tom {tom_resposta} e seja prestativo. {observacoes}",
            permissoes: {
                canSendInternalMessages: true,
                canTransferToAgent: true,
                canChangeTag: true,
                permitirCriarAgendamentos: false
            }
        },
        {
            id: "vendas",
            tipo: "vendas",
            nome: "Consultor de Vendas",
            descricao: "Agente focado em converter leads e fechar vendas com persuasão",
            icon: "💼",
            promptBase: "Você é um consultor de vendas experiente e persuasivo. Seu objetivo é entender as necessidades do cliente e apresentar soluções que agreguem valor. Use um tom {tom_resposta} e seja convincente sem ser invasivo. {observacoes}",
            permissoes: {
                canSendInternalMessages: true,
                canTransferToAgent: true,
                canChangeTag: true,
                permitirCriarAgendamentos: true
            }
        },
        {
            id: "suporte",
            tipo: "suporte",
            nome: "Suporte Técnico",
            descricao: "Especialista em resolver problemas técnicos e orientar usuários",
            icon: "🔧",
            promptBase: "Você é um especialista em suporte técnico. Sua função é diagnosticar problemas, fornecer soluções claras e orientar os usuários passo a passo. Mantenha um tom {tom_resposta} e seja paciente e didático. {observacoes}",
            permissoes: {
                canSendInternalMessages: true,
                canTransferToAgent: true,
                canChangeTag: true,
                permitirCriarAgendamentos: false
            }
        },
        {
            id: "agendador",
            tipo: "agendador",
            nome: "Agendador de Compromissos",
            descricao: "Gerencia agendamentos e organiza compromissos automaticamente",
            icon: "📅",
            promptBase: "Você é um assistente de agendamentos. Sua função é ajudar a marcar, remarcar e gerenciar compromissos de forma organizada. Use um tom {tom_resposta} e seja preciso com datas e horários. {observacoes}",
            permissoes: {
                canSendInternalMessages: true,
                canTransferToAgent: false,
                canChangeTag: true,
                permitirCriarAgendamentos: true
            }
        },
        {
            id: "faq",
            tipo: "faq",
            nome: "Respondedor de FAQ",
            descricao: "Responde perguntas frequentes de forma rápida e precisa",
            icon: "❓",
            promptBase: "Você é um assistente especializado em responder perguntas frequentes. Forneça respostas claras, diretas e precisas. Use um tom {tom_resposta} e seja objetivo. {observacoes}",
            permissoes: {
                canSendInternalMessages: false,
                canTransferToAgent: true,
                canChangeTag: false,
                permitirCriarAgendamentos: false
            }
        },
        {
            id: "triagem",
            tipo: "triagem",
            nome: "Triagem Inteligente",
            descricao: "Classifica e direciona conversas para os setores corretos",
            icon: "🎯",
            promptBase: "Você é um assistente de triagem. Sua função é entender a necessidade do cliente e direcioná-lo para o setor ou pessoa adequada. Use um tom {tom_resposta} e seja eficiente na classificação. {observacoes}",
            permissoes: {
                canSendInternalMessages: true,
                canTransferToAgent: true,
                canChangeTag: true,
                permitirCriarAgendamentos: false
            }
        },
        {
            id: "cobranca",
            tipo: "cobranca",
            nome: "Assistente de Cobrança",
            descricao: "Gerencia cobranças e pagamentos com profissionalismo",
            icon: "💰",
            promptBase: "Você é um assistente de cobrança profissional. Sua função é lembrar sobre pagamentos pendentes de forma educada e ajudar com dúvidas sobre faturas. Use um tom {tom_resposta} e seja firme mas respeitoso. {observacoes}",
            permissoes: {
                canSendInternalMessages: true,
                canTransferToAgent: true,
                canChangeTag: true,
                permitirCriarAgendamentos: false
            }
        },
        {
            id: "feedback",
            tipo: "feedback",
            nome: "Coletor de Feedback",
            descricao: "Coleta avaliações e sugestões dos clientes",
            icon: "⭐",
            promptBase: "Você é um assistente de feedback. Sua função é coletar avaliações, opiniões e sugestões dos clientes de forma amigável. Use um tom {tom_resposta} e incentive respostas honestas. {observacoes}",
            permissoes: {
                canSendInternalMessages: true,
                canTransferToAgent: false,
                canChangeTag: true,
                permitirCriarAgendamentos: false
            }
        }
    ];

    useEffect(() => {
        const fetchPrompt = async () => {
            if (!promptId) {
                setPrompt(initialState);
                setSelectedProvider("openai");
                setSelectedModel("gpt-3.5-turbo-1106");
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
        // Verificar se hÃ¡ API key configurada para o provider selecionado
        if (selectedProvider === "openai" && !apiKeyStatus.openai) {
            toast.error(
                "Para usar OpenAI, configure a API Key em ConfiguraÃ§Ãµes â†’ IntegraÃ§Ãµes â†’ Chave da API do OpenAI"
            );
            return;
        }

        if (selectedProvider === "gemini" && !apiKeyStatus.gemini) {
            toast.error(
                "Para usar Gemini, configure a API Key em ConfiguraÃ§Ãµes â†’ IntegraÃ§Ãµes â†’ Chave da API do Gemini"
            );
            return;
        }

        const promptData = {
            ...values,
            model: selectedModel,
            provider: selectedProvider
        };

        // NÃ£o enviar apiKey - serÃ¡ buscada das Settings
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
                                {!promptId && !isManualMode && (
                                    <>
                                        <div style={{ marginBottom: 16 }}>
                                            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 600 }}>
                                                Escolha o tipo de agente
                                            </h3>
                                            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                                                Selecione um template pré-definido ou crie um prompt personalizado
                                            </p>
                                        </div>

                                        <div className={classes.cardsGrid}>
                                            {builtInTemplates.map((template) => (
                                                <div
                                                    key={template.id}
                                                    className={`${classes.templateCard} ${selectedTemplate?.id === template.id
                                                        ? classes.templateCardSelected
                                                        : ""
                                                        }`}
                                                    onClick={() => {
                                                        if (template.id === "personalizado") {
                                                            setIsManualMode(true);
                                                            setSelectedTemplate(null);
                                                        } else {
                                                            setSelectedTemplate(template);
                                                            setCustomPermissions({ ...template.permissoes });
                                                            setTemplateVariables({
                                                                nome_agente: "",
                                                                tom_resposta: "neutro",
                                                                observacoes: ""
                                                            });
                                                            setTemplateModalOpen(true);
                                                        }
                                                    }}
                                                >
                                                    <div className={classes.cardIcon}>{template.icon}</div>
                                                    <div className={classes.cardTitle}>{template.nome}</div>
                                                    <div className={classes.cardDescription}>
                                                        {template.descricao}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </>
                                )}

                                {(promptId || isManualMode) && (
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
                                {promptId && (
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                        variant="contained"
                                        className={classes.btnWrapper}
                                    >
                                        {i18n.t("promptModal.buttons.okEdit")}
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
            </Dialog >
            <TemplateConfigModal
                open={templateModalOpen}
                onClose={() => setTemplateModalOpen(false)}
                template={selectedTemplate}
                templateVariables={templateVariables}
                setTemplateVariables={setTemplateVariables}
                useCustomAgentName={useCustomAgentName}
                setUseCustomAgentName={setUseCustomAgentName}
                selectedProvider={selectedProvider}
                handleChangeProvider={handleChangeProvider}
                apiKeyStatus={apiKeyStatus}
                customPermissions={customPermissions}
                setCustomPermissions={setCustomPermissions}
                onSave={handleSaveTemplate}
                isSubmitting={isSavingTemplate}
            />
        </div >
    );
};

export default PromptModal;
