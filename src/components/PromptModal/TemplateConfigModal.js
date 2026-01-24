import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    CircularProgress
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    permissionsSection: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: "#f5f5f5",
        borderRadius: 8
    },
    permissionsTitle: {
        fontWeight: 600,
        marginBottom: theme.spacing(1),
        fontSize: 14
    },
    permissionsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: theme.spacing(1)
    },
    templateHeader: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: "#f0f7ff",
        borderRadius: 8
    },
    templateIcon: {
        fontSize: 48
    },
    templateInfo: {
        flex: 1
    },
    templateName: {
        fontSize: 20,
        fontWeight: 600,
        margin: 0
    },
    templateDescription: {
        fontSize: 14,
        color: "#666",
        margin: "4px 0 0 0"
    }
}));

const TemplateConfigModal = ({
    open,
    onClose,
    template,
    templateVariables,
    setTemplateVariables,
    useCustomAgentName,
    setUseCustomAgentName,
    selectedProvider,
    handleChangeProvider,
    apiKeyStatus,
    customPermissions,
    setCustomPermissions,
    onSave,
    isSubmitting
}) => {
    const classes = useStyles();

    if (!template) return null;

    const handleClose = () => {
        onClose();
    };

    const handleSave = () => {
        onSave();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle>
                Configurar Agente
            </DialogTitle>
            <DialogContent dividers>
                {/* Header com informações do template */}
                <div className={classes.templateHeader}>
                    <div className={classes.templateIcon}>{template.icon}</div>
                    <div className={classes.templateInfo}>
                        <h3 className={classes.templateName}>{template.nome}</h3>
                        <p className={classes.templateDescription}>{template.descricao}</p>
                    </div>
                </div>

                {/* Checkbox para nome personalizado */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useCustomAgentName}
                            onChange={(e) => {
                                setUseCustomAgentName(e.target.checked);
                                if (!e.target.checked) {
                                    setTemplateVariables({
                                        ...templateVariables,
                                        nome_agente: ""
                                    });
                                }
                            }}
                            color="primary"
                        />
                    }
                    label="Definir nome personalizado para o agente"
                />

                {/* Campo de nome (condicional) */}
                {useCustomAgentName && (
                    <TextField
                        label="Nome do Agente"
                        value={templateVariables.nome_agente}
                        onChange={(e) => setTemplateVariables({
                            ...templateVariables,
                            nome_agente: e.target.value
                        })}
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        helperText="Nome que será usado para identificar este agente"
                    />
                )}

                {/* Tom de Resposta */}
                <FormControl fullWidth margin="dense" variant="outlined">
                    <InputLabel id="tom-resposta-label">Tom de Resposta</InputLabel>
                    <Select
                        labelId="tom-resposta-label"
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

                {/* Observações */}
                <TextField
                    label="Observações Adicionais"
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

                {/* Provider */}
                <FormControl fullWidth margin="dense" variant="outlined">
                    <InputLabel id="provider-label">Provider</InputLabel>
                    <Select
                        labelId="provider-label"
                        value={selectedProvider}
                        onChange={handleChangeProvider}
                        label="Provider"
                    >
                        <MenuItem value="openai">OpenAI</MenuItem>
                        <MenuItem value="gemini">Gemini</MenuItem>
                    </Select>
                </FormControl>

                {/* API Key Status */}
                {selectedProvider === "openai" && (
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
                )}

                {selectedProvider === "gemini" && (
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
                )}

                {/* Permissões */}
                <div className={classes.permissionsSection}>
                    <div className={classes.permissionsTitle}>
                        Permissões do Agente
                    </div>
                    <div className={classes.permissionsGrid}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={customPermissions.canSendInternalMessages}
                                    onChange={(e) => setCustomPermissions({
                                        ...customPermissions,
                                        canSendInternalMessages: e.target.checked
                                    })}
                                    color="primary"
                                />
                            }
                            label="Enviar Mensagens Internas"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={customPermissions.canTransferToAgent}
                                    onChange={(e) => setCustomPermissions({
                                        ...customPermissions,
                                        canTransferToAgent: e.target.checked
                                    })}
                                    color="primary"
                                />
                            }
                            label="Transferir para Agente"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={customPermissions.canChangeTag}
                                    onChange={(e) => setCustomPermissions({
                                        ...customPermissions,
                                        canChangeTag: e.target.checked
                                    })}
                                    color="primary"
                                />
                            }
                            label="Alterar Tag"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={customPermissions.permitirCriarAgendamentos}
                                    onChange={(e) => setCustomPermissions({
                                        ...customPermissions,
                                        permitirCriarAgendamentos: e.target.checked
                                    })}
                                    color="primary"
                                />
                            }
                            label="Criar Agendamentos"
                        />
                    </div>
                    {customPermissions.permitirCriarAgendamentos && (
                        <div style={{ marginTop: 16, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Horário de Funcionamento</div>
                            <TextField
                                label="Segunda a Sexta"
                                value={customPermissions.businessHours?.mondayToFriday || "09:00 - 18:00"}
                                onChange={(e) => setCustomPermissions({
                                    ...customPermissions,
                                    businessHours: {
                                        ...customPermissions.businessHours,
                                        mondayToFriday: e.target.value
                                    }
                                })}
                                variant="outlined"
                                margin="dense"
                                fullWidth
                                helperText="Ex: 09:00 - 18:00"
                            />
                            <TextField
                                label="Sábado e Domingo"
                                value={customPermissions.businessHours?.saturdayAndSunday || "09:00 - 13:00"}
                                onChange={(e) => setCustomPermissions({
                                    ...customPermissions,
                                    businessHours: {
                                        ...customPermissions.businessHours,
                                        saturdayAndSunday: e.target.value
                                    }
                                })}
                                variant="outlined"
                                margin="dense"
                                fullWidth
                                helperText="Ex: 09:00 - 13:00 ou Fechado"
                            />
                        </div>
                    )}

                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    color="secondary"
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : "Criar Agente"}
                </Button>
            </DialogActions>
        </Dialog >
    );
};

export default TemplateConfigModal;
