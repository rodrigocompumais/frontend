import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import useSettings from "../../hooks/useSettings";
import { toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { Select, MenuItem, InputLabel, FormHelperText } from "@material-ui/core";
import OptionsLanguage from "./OptionsLanguage";

const useStyles = makeStyles((theme) => ({
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    selectContainer: {
        width: "100%",
        textAlign: "left",
    },
}));

export default function OptionsAI(props) {
    const { settings } = props;
    const classes = useStyles();

    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [loadingGeminiApiKey, setLoadingGeminiApiKey] = useState(false);
    const [testingGeminiApiKey, setTestingGeminiApiKey] = useState(false);

    const [openaiApiKey, setOpenaiApiKey] = useState("");
    const [loadingOpenaiApiKey, setLoadingOpenaiApiKey] = useState(false);
    const [testingOpenaiApiKey, setTestingOpenaiApiKey] = useState(false);

    const [providerConfigs, setProviderConfigs] = useState(null);
    const [loadingProviderConfigs, setLoadingProviderConfigs] = useState(false);

    // Configurações do Chat IA
    const [chatConfig, setChatConfig] = useState({
        temperature: 0.3,
        maxHistoryMessages: 10,
        maxTokens: 4096,
        topP: 0.95
    });
    const [loadingChatConfig, setLoadingChatConfig] = useState(false);
    const [savingChatConfig, setSavingChatConfig] = useState(false);

    const { update } = useSettings();

    useEffect(() => {
        if (Array.isArray(settings) && settings.length) {
            const geminiKey = settings.find((s) => s.key === "geminiApiKey");
            if (geminiKey) {
                setGeminiApiKey(geminiKey.value);
            }

            const openaiKey = settings.find((s) => s.key === "openaiApiKey");
            if (openaiKey) {
                setOpenaiApiKey(openaiKey.value);
            }
        }

        // Carregar configurações quando settings mudar
        loadProviderConfigurations();
        loadChatConfig();
    }, [settings]);

    const loadChatConfig = async () => {
        setLoadingChatConfig(true);
        try {
            const { data } = await api.get("/ai/chat/config");
            setChatConfig(data);
        } catch (err) {
            console.error("Erro ao carregar configurações do chat:", err);
            // Usar valores padrão se houver erro
        } finally {
            setLoadingChatConfig(false);
        }
    };

    const handleSaveChatConfig = async () => {
        setSavingChatConfig(true);
        try {
            await api.post("/ai/chat/config", chatConfig);
            toast.success("Configurações do chat salvas com sucesso!");
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Erro ao salvar configurações";
            toast.error(errorMessage);
        } finally {
            setSavingChatConfig(false);
        }
    };

    async function handleGeminiApiKey(value) {
        setGeminiApiKey(value);
        setLoadingGeminiApiKey(true);
        await update({
            key: "geminiApiKey",
            value,
        });
        toast.success(i18n.t("settings.options.toasts.success"));
        setLoadingGeminiApiKey(false);
        
        // Recarregar configurações após salvar a chave
        setTimeout(() => {
            loadProviderConfigurations();
        }, 500);
    }

    async function handleTestGeminiApiKey() {
        if (!geminiApiKey || geminiApiKey.trim() === "") {
            toast.error("Por favor, insira uma chave da API do Gemini antes de testar.");
            return;
        }

        setTestingGeminiApiKey(true);
        try {
            const { data } = await api.get("/ai/test-key?provider=gemini");
            if (data.valid) {
                toast.success(data.message || "Chave da API do Gemini válida e funcionando!");
            } else {
                toast.error(data.message || "Chave da API do Gemini inválida.");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Erro ao testar chave da API";
            toast.error(errorMessage);
        } finally {
            setTestingGeminiApiKey(false);
        }
    }

    async function handleOpenaiApiKey(value) {
        setOpenaiApiKey(value);
        setLoadingOpenaiApiKey(true);
        await update({
            key: "openaiApiKey",
            value,
        });
        toast.success(i18n.t("settings.options.toasts.success"));
        setLoadingOpenaiApiKey(false);

        // Recarregar configurações após salvar a chave
        setTimeout(() => {
            loadProviderConfigurations();
        }, 500);
    }

    async function handleTestOpenaiApiKey() {
        if (!openaiApiKey || openaiApiKey.trim() === "") {
            toast.error("Por favor, insira uma chave da API do OpenAI antes de testar.");
            return;
        }

        setTestingOpenaiApiKey(true);
        try {
            const { data } = await api.get("/ai/test-key?provider=openai");
            if (data.valid) {
                toast.success(data.message || "Chave da API do OpenAI válida e funcionando!");
            } else {
                toast.error(data.message || "Chave da API do OpenAI inválida.");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Erro ao testar chave da API";
            toast.error(errorMessage);
        } finally {
            setTestingOpenaiApiKey(false);
        }
    }

    const loadProviderConfigurations = async () => {
        // Verificar se ambas as chaves estão configuradas
        const geminiKey = settings?.find((s) => s.key === "geminiApiKey");
        const openaiKey = settings?.find((s) => s.key === "openaiApiKey");

        if (!geminiKey?.value || !openaiKey?.value) {
            setProviderConfigs(null);
            return;
        }

        setLoadingProviderConfigs(true);
        try {
            const { data } = await api.get("/ai/providers/config");
            // O backend retorna { available: {...}, configured: {...} }
            setProviderConfigs(data);
        } catch (err) {
            console.error("Erro ao carregar configurações de providers:", err);
            toast.error("Erro ao carregar configurações de providers");
            setProviderConfigs(null);
        } finally {
            setLoadingProviderConfigs(false);
        }
    };

    async function handleProviderConfigChange(functionType, provider) {
        try {
            // Mapear os tipos do frontend para os tipos do backend
            const functionTypeMap = {
                "analyze": "chat",           // Analisar conversa -> Chat
                "transcribe": "transcription", // Transcrição -> Transcription
                "suggest": "messageImprovement" // Sugerir resposta -> Message Improvement
            };

            const backendFunctionType = functionTypeMap[functionType] || functionType;

            await api.post("/ai/providers/config", {
                functionType: backendFunctionType,
                provider
            });
            toast.success("Configuração de provider atualizada!");
            loadProviderConfigurations();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Erro ao atualizar configuração";
            toast.error(errorMessage);
        }
    }

    return (
        <>
            <Grid spacing={3} container style={{ marginBottom: 10 }}>
                <Grid xs={12} sm={6} md={6} item>
                    <FormControl className={classes.selectContainer} style={{ width: "100%" }}>
                        <TextField
                            id="geminiApiKey"
                            name="geminiApiKey"
                            margin="dense"
                            label={i18n.t("settings.options.fields.geminiApiKey.title")}
                            variant="outlined"
                            type="password"
                            value={geminiApiKey}
                            onChange={async (e) => {
                                handleGeminiApiKey(e.target.value);
                            }}
                            placeholder={i18n.t("settings.options.fields.geminiApiKey.placeholder")}
                            style={{ marginBottom: 8 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTestGeminiApiKey}
                            disabled={testingGeminiApiKey || loadingGeminiApiKey || !geminiApiKey}
                            startIcon={testingGeminiApiKey ? <CircularProgress size={16} /> : null}
                            style={{ marginTop: 8 }}
                        >
                            {testingGeminiApiKey ? "Testando..." : "Testar Chave"}
                        </Button>
                        <FormHelperText>
                            {loadingGeminiApiKey && i18n.t("settings.options.updating")}
                        </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={6} item>
                    <Typography variant="body2" color="textSecondary">
                        {i18n.t("settings.options.fields.geminiApiKey.helper")}
                    </Typography>
                </Grid>
                <Grid xs={12} sm={6} md={6} item>
                    <FormControl className={classes.selectContainer} style={{ width: "100%" }}>
                        <TextField
                            id="openaiApiKey"
                            name="openaiApiKey"
                            margin="dense"
                            label={i18n.t("settings.options.fields.openaiApiKey.title")}
                            variant="outlined"
                            type="password"
                            value={openaiApiKey}
                            onChange={async (e) => {
                                handleOpenaiApiKey(e.target.value);
                            }}
                            placeholder={i18n.t("settings.options.fields.openaiApiKey.placeholder")}
                            style={{ marginBottom: 8 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTestOpenaiApiKey}
                            disabled={testingOpenaiApiKey || loadingOpenaiApiKey || !openaiApiKey}
                            startIcon={testingOpenaiApiKey ? <CircularProgress size={16} /> : null}
                            style={{ marginTop: 8 }}
                        >
                            {testingOpenaiApiKey ? "Testando..." : "Testar Chave"}
                        </Button>
                        <FormHelperText>
                            {loadingOpenaiApiKey && i18n.t("settings.options.updating")}
                        </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={6} item>
                    <Typography variant="body2" color="textSecondary">
                        {i18n.t("settings.options.fields.openaiApiKey.helper")}
                    </Typography>
                </Grid>
            </Grid>

            {/* Configuração de Providers - Mostrar apenas quando ambas chaves estiverem configuradas */}
            {geminiApiKey && openaiApiKey && (
                <>
                    <Grid spacing={3} container style={{ marginTop: 20, marginBottom: 10 }}>
                        <Grid xs={12} item>
                            <Typography variant="h6" style={{ marginBottom: 10 }}>
                                {i18n.t("settings.options.fields.aiProviderConfig.title")}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 20 }}>
                                {i18n.t("settings.options.fields.aiProviderConfig.helper")}
                            </Typography>
                        </Grid>
                    </Grid>

                    {loadingProviderConfigs ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
                            <CircularProgress />
                        </div>
                    ) : providerConfigs ? (
                        <Grid spacing={3} container>
                            {/* Analisar conversa */}
                            <Grid xs={12} sm={6} md={4} item>
                                <FormControl className={classes.selectContainer}>
                                    <InputLabel id="provider-analyze-label">
                                        {i18n.t("settings.options.fields.aiProviderConfig.analyze")}
                                    </InputLabel>
                                    <Select
                                        labelId="provider-analyze-label"
                                        value={providerConfigs.configured?.chat || "gemini"}
                                        onChange={(e) => handleProviderConfigChange("analyze", e.target.value)}
                                    >
                                        <MenuItem value="openai">OpenAI</MenuItem>
                                        <MenuItem value="gemini">Gemini</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Resumir áudios */}
                            <Grid xs={12} sm={6} md={4} item>
                                <FormControl className={classes.selectContainer}>
                                    <InputLabel id="provider-transcribe-label">
                                        {i18n.t("settings.options.fields.aiProviderConfig.transcribe")}
                                    </InputLabel>
                                    <Select
                                        labelId="provider-transcribe-label"
                                        value={providerConfigs.configured?.transcription || "gemini"}
                                        onChange={(e) => handleProviderConfigChange("transcribe", e.target.value)}
                                    >
                                        <MenuItem value="openai">OpenAI (Whisper)</MenuItem>
                                        <MenuItem value="gemini">Gemini</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Sugerir resposta */}
                            <Grid xs={12} sm={6} md={4} item>
                                <FormControl className={classes.selectContainer}>
                                    <InputLabel id="provider-suggest-label">
                                        {i18n.t("settings.options.fields.aiProviderConfig.suggest")}
                                    </InputLabel>
                                    <Select
                                        labelId="provider-suggest-label"
                                        value={providerConfigs.configured?.messageImprovement || "gemini"}
                                        onChange={(e) => handleProviderConfigChange("suggest", e.target.value)}
                                    >
                                        <MenuItem value="openai">OpenAI</MenuItem>
                                        <MenuItem value="gemini">Gemini</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* COMPUCHAT (Chat Inteligente do Dashboard) */}
                            <Grid xs={12} sm={6} md={4} item>
                                <FormControl className={classes.selectContainer}>
                                    <InputLabel id="provider-compuchat-label">
                                        COMPUCHAT (Dashboard)
                                    </InputLabel>
                                    <Select
                                        labelId="provider-compuchat-label"
                                        value={providerConfigs.configured?.chat || "gemini"}
                                        onChange={(e) => handleProviderConfigChange("analyze", e.target.value)}
                                    >
                                        <MenuItem value="openai">OpenAI</MenuItem>
                                        <MenuItem value="gemini">Gemini</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        Provider para o chat inteligente do dashboard
                                    </FormHelperText>
                                </FormControl>
                            </Grid>

                            {/* Tradução */}
                            <Grid xs={12} sm={6} md={4} item>
                                <FormControl className={classes.selectContainer}>
                                    <InputLabel id="provider-translation-label">
                                        Tradução de Mensagens
                                    </InputLabel>
                                    <Select
                                        labelId="provider-translation-label"
                                        value={providerConfigs.configured?.chat || "gemini"}
                                        onChange={(e) => handleProviderConfigChange("analyze", e.target.value)}
                                    >
                                        <MenuItem value="openai">OpenAI</MenuItem>
                                        <MenuItem value="gemini">Gemini</MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        Provider para tradução automática de mensagens
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>
                    ) : null}
                </>
            )}

            {/* Configuração do Chat IA (Compuchat) */}
            <Grid spacing={3} container style={{ marginTop: 30, marginBottom: 10 }}>
                <Grid xs={12} item>
                    <Typography variant="h6" style={{ marginBottom: 10 }}>
                        Configurações do Chat IA (Compuchat)
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 20 }}>
                        Configure a temperatura, quantidade de contexto e outros parâmetros do chat inteligente do dashboard.
                    </Typography>
                </Grid>
            </Grid>

            {loadingChatConfig ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
                    <CircularProgress />
                </div>
            ) : (
                <Grid spacing={3} container>
                    {/* Temperatura */}
                    <Grid xs={12} sm={6} md={3} item>
                        <FormControl className={classes.selectContainer} style={{ width: "100%" }}>
                            <TextField
                                id="chatTemperature"
                                name="chatTemperature"
                                margin="dense"
                                label="Temperatura"
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 0, max: 2, step: 0.1 }}
                                value={chatConfig.temperature}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    setChatConfig({ ...chatConfig, temperature: Math.max(0, Math.min(2, value)) });
                                }}
                                helperText="Controla a criatividade (0.0-2.0). Valores menores = mais focado, maiores = mais criativo."
                            />
                        </FormControl>
                    </Grid>

                    {/* Histórico de Mensagens */}
                    <Grid xs={12} sm={6} md={3} item>
                        <FormControl className={classes.selectContainer} style={{ width: "100%" }}>
                            <TextField
                                id="chatMaxHistoryMessages"
                                name="chatMaxHistoryMessages"
                                margin="dense"
                                label="Histórico de Mensagens"
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 0, max: 100, step: 1 }}
                                value={chatConfig.maxHistoryMessages}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10) || 0;
                                    setChatConfig({ ...chatConfig, maxHistoryMessages: Math.max(0, Math.min(100, value)) });
                                }}
                                helperText="Quantidade de mensagens anteriores a considerar (0-100)."
                            />
                        </FormControl>
                    </Grid>

                    {/* Max Tokens */}
                    <Grid xs={12} sm={6} md={3} item>
                        <FormControl className={classes.selectContainer} style={{ width: "100%" }}>
                            <TextField
                                id="chatMaxTokens"
                                name="chatMaxTokens"
                                margin="dense"
                                label="Máximo de Tokens"
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 100, max: 32000, step: 100 }}
                                value={chatConfig.maxTokens}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10) || 4096;
                                    setChatConfig({ ...chatConfig, maxTokens: Math.max(100, Math.min(32000, value)) });
                                }}
                                helperText="Limite máximo de tokens na resposta (100-32000)."
                            />
                        </FormControl>
                    </Grid>

                    {/* Top P */}
                    <Grid xs={12} sm={6} md={3} item>
                        <FormControl className={classes.selectContainer} style={{ width: "100%" }}>
                            <TextField
                                id="chatTopP"
                                name="chatTopP"
                                margin="dense"
                                label="Top P"
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 0, max: 1, step: 0.05 }}
                                value={chatConfig.topP}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0.95;
                                    setChatConfig({ ...chatConfig, topP: Math.max(0, Math.min(1, value)) });
                                }}
                                helperText="Nucleus sampling (0.0-1.0). Controla diversidade das respostas."
                            />
                        </FormControl>
                    </Grid>

                    {/* Botão Salvar */}
                    <Grid xs={12} item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveChatConfig}
                            disabled={savingChatConfig}
                            startIcon={savingChatConfig ? <CircularProgress size={16} /> : null}
                            style={{ marginTop: 8 }}
                        >
                            {savingChatConfig ? "Salvando..." : "Salvar Configurações do Chat"}
                        </Button>
                    </Grid>
                </Grid>
            )}

            {/* Configuração de Idioma da Empresa */}
            <Grid spacing={3} container style={{ marginTop: 30 }}>
                <Grid xs={12} item>
                    <OptionsLanguage settings={settings} />
                </Grid>
            </Grid>
        </>
    );
}
