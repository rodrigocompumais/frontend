import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minWidth: 400,
  },
}));

const ScheduleModal = ({ open, onClose, contact }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    body: "",
    sendAt: "",
    contactId: null,
  });

  useEffect(() => {
    if (open && contact) {
      // Pre-fill contact
      setFormData({
        body: "",
        sendAt: "",
        contactId: contact.id,
      });
    }
  }, [open, contact]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.body.trim()) {
      toast.error("A mensagem é obrigatória");
      return;
    }
    if (!formData.sendAt) {
      toast.error("A data e hora de envio são obrigatórias");
      return;
    }

    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      await api.post("/schedules", {
        body: formData.body,
        sendAt: formData.sendAt,
        contactId: formData.contactId,
        userId: user?.id,
      });
      toast.success("Agendamento criado com sucesso!");
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{i18n.t("quickActions.createSchedule")}</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
          label={i18n.t("quickActions.contact")}
          value={contact?.name || ""}
          fullWidth
          disabled
          helperText={contact?.number || ""}
        />
        <TextField
          label={i18n.t("quickActions.message")}
          value={formData.body}
          onChange={handleChange("body")}
          fullWidth
          multiline
          rows={4}
          required
          disabled={loading}
        />
        <TextField
          label={i18n.t("quickActions.sendAt")}
          type="datetime-local"
          value={formData.sendAt}
          onChange={handleChange("sendAt")}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {i18n.t("quickActions.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : i18n.t("quickActions.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleModal;
