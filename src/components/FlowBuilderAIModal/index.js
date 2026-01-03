import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";

const FlowBuilderAIModal = ({ open, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setPrompt("");
            setLoading(false);
        }
    }, [open]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            await onGenerate(prompt);
            onClose();
        } catch (error) {
            // Error handling is usually done in the parent component
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="form-dialog-title"
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle id="form-dialog-title">Criar Fluxo com IA (Gemini)</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Descreva como você quer que seja o fluxo. Ex: "Crie um fluxo de atendimento para uma pizzaria, com menu de pedidos, status e falar com atendente."
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="prompt"
                    label="Descrição do Fluxo"
                    type="text"
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={loading}>
                    {i18n.t("common.cancel")}
                </Button>
                <Button
                    onClick={handleGenerate}
                    color="primary"
                    variant="contained"
                    disabled={loading || !prompt.trim()}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Gerar Fluxo"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FlowBuilderAIModal;
