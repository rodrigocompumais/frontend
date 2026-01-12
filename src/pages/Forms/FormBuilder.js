import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  TextField,
  Paper,
  Typography,
  Box,
  makeStyles,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import SaveIcon from "@material-ui/icons/Save";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  fieldItem: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    position: "relative",
  },
  fieldHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  fieldTypeChip: {
    marginLeft: theme.spacing(1),
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  preview: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    minHeight: 200,
  },
}));

const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
  { value: "number", label: "Número" },
  { value: "textarea", label: "Texto Longo" },
  { value: "select", label: "Lista Suspensa" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Data" },
  { value: "file", label: "Arquivo" },
  { value: "rating", label: "Avaliação (1-5)" },
];

const FormBuilder = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const isEdit = id && id !== "new" && !isNaN(Number(id));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newOption, setNewOption] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    primaryColor: "#1976d2",
    secondaryColor: "#424242",
    logoPosition: "top",
    logoUrl: "",
    successMessage: "Obrigado! Sua resposta foi enviada com sucesso.",
    successRedirectUrl: "",
    requireAuth: false,
    allowMultipleSubmissions: false,
    isAnonymous: false,
    createContact: false,
    createTicket: false,
    sendWebhook: false,
    webhookUrl: "",
    fields: [],
  });

  const [fieldForm, setFieldForm] = useState({
    label: "",
    fieldType: "text",
    placeholder: "",
    isRequired: false,
    order: 0,
    options: [],
    helpText: "",
    hasConditional: false,
    conditionalFieldId: null,
    conditionalRules: {},
  });

  useEffect(() => {
    if (isEdit && id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/forms/${id}`);
      // Filtrar campos automáticos (nome e telefone) da visualização
      const customFields = (data.fields || []).filter(
        (field) => !field.metadata?.isAutoField
      );
      
      setFormData({
        name: data.name || "",
        description: data.description || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        primaryColor: data.primaryColor || "#1976d2",
        secondaryColor: data.secondaryColor || "#424242",
        logoPosition: data.logoPosition || "top",
        logoUrl: data.logoUrl || "",
        successMessage: data.successMessage || "Obrigado! Sua resposta foi enviada com sucesso.",
        successRedirectUrl: data.successRedirectUrl || "",
        requireAuth: data.requireAuth || false,
        allowMultipleSubmissions: data.allowMultipleSubmissions || false,
        isAnonymous: data.isAnonymous || false,
        createContact: data.createContact || false,
        createTicket: data.createTicket || false,
        sendWebhook: data.sendWebhook || false,
        webhookUrl: data.webhookUrl || "",
        fields: customFields.sort((a, b) => a.order - b.order),
      });
    } catch (err) {
      toastError(err);
      history.push("/forms");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fieldsToSend = formData.fields.map((field, index) => ({
        ...field,
        order: index,
      }));

      const payload = {
        ...formData,
        fields: fieldsToSend,
      };

      if (isEdit) {
        await api.put(`/forms/${id}`, payload);
        toast.success("Formulário atualizado com sucesso!");
      } else {
        await api.post("/forms", payload);
        toast.success("Formulário criado com sucesso!");
      }

      history.push("/forms");
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    setNewOption("");
    setFieldForm({
      label: "",
      fieldType: "text",
      placeholder: "",
      isRequired: false,
      order: formData.fields.length,
      options: [],
      helpText: "",
      hasConditional: false,
      conditionalFieldId: null,
      conditionalRules: {},
    });
    setFieldModalOpen(true);
  };

  const handleEditField = (field, index) => {
    setEditingField(index);
    setNewOption("");
    setFieldForm({
      ...field,
      options: field.options || [],
    });
    setFieldModalOpen(true);
  };

  const handleSaveField = () => {
    const newFields = [...formData.fields];
    if (editingField !== null) {
      newFields[editingField] = { ...fieldForm, id: formData.fields[editingField].id };
    } else {
      newFields.push({ ...fieldForm });
    }
    setFormData({ ...formData, fields: newFields });
    setFieldModalOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (index) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      const updatedOptions = [...(fieldForm.options || []), newOption.trim()];
      setFieldForm({ ...fieldForm, options: updatedOptions });
      setNewOption("");
    }
  };

  const handleRemoveOption = (indexToRemove) => {
    const updatedOptions = fieldForm.options.filter((_, index) => index !== indexToRemove);
    setFieldForm({ ...fieldForm, options: updatedOptions });
  };

  const handleKeyPressOption = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => history.push("/forms")}>
            <ArrowBackIcon />
          </IconButton>
          <Title>{isEdit ? "Editar Formulário" : "Novo Formulário"}</Title>
        </Box>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving || !formData.name}
            startIcon={<SaveIcon />}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.content}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Configurações Gerais" />
          <Tab label="Campos" />
          <Tab label="Aparência" />
          <Tab label="Integrações" />
        </Tabs>

        {tabValue === 0 && (
          <Box className={classes.section} style={{ marginTop: 24 }}>
            <Typography className={classes.sectionTitle}>
              Informações Básicas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nome do Formulário *"
                  fullWidth
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                  }
                  label="Formulário Ativo"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Mensagem de Sucesso"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.successMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, successMessage: e.target.value })
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="URL de Redirecionamento (opcional)"
                  fullWidth
                  value={formData.successRedirectUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      successRedirectUrl: e.target.value,
                    })
                  }
                  variant="outlined"
                  placeholder="https://exemplo.com/obrigado"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.allowMultipleSubmissions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowMultipleSubmissions: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Permitir Múltiplas Submissões"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isAnonymous}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isAnonymous: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Formulário Anônimo (não coleta nome e telefone)"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box className={classes.section} style={{ marginTop: 24 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              marginBottom={2}
            >
              <Typography className={classes.sectionTitle}>Campos</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddField}
              >
                Adicionar Campo
              </Button>
            </Box>

            {formData.fields.length === 0 && (
              <Box
                padding={4}
                textAlign="center"
                style={{
                  border: `1px dashed #ccc`,
                  borderRadius: 4,
                }}
              >
                <Typography color="textSecondary">
                  Nenhum campo adicionado. Clique em "Adicionar Campo" para
                  começar.
                </Typography>
              </Box>
            )}

            {formData.fields.map((field, index) => (
              <Paper key={index} className={classes.fieldItem}>
                <Box className={classes.fieldHeader}>
                  <Box display="flex" alignItems="center">
                    <DragIndicatorIcon style={{ marginRight: 8 }} />
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {field.label || "Campo sem nome"}
                    </Typography>
                    <Chip
                      label={
                        fieldTypes.find((ft) => ft.value === field.fieldType)
                          ?.label || field.fieldType
                      }
                      size="small"
                      className={classes.fieldTypeChip}
                    />
                    {field.isRequired && (
                      <Chip
                        label="Obrigatório"
                        size="small"
                        color="primary"
                        className={classes.fieldTypeChip}
                      />
                    )}
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditField(field, index)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteField(index)}
                      color="secondary"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                {field.helpText && (
                  <Typography variant="caption" color="textSecondary">
                    {field.helpText}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}

        {tabValue === 2 && (
          <Box className={classes.section} style={{ marginTop: 24 }}>
            <Typography className={classes.sectionTitle}>Aparência</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Cor Primária"
                  type="color"
                  fullWidth
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Cor Secundária"
                  type="color"
                  fullWidth
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, secondaryColor: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="URL do Logo (opcional)"
                  fullWidth
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                  }
                  variant="outlined"
                  placeholder="https://exemplo.com/logo.png"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Posição do Logo</InputLabel>
                  <Select
                    value={formData.logoPosition}
                    onChange={(e) =>
                      setFormData({ ...formData, logoPosition: e.target.value })
                    }
                    label="Posição do Logo"
                  >
                    <MenuItem value="top">Topo</MenuItem>
                    <MenuItem value="center">Centro</MenuItem>
                    <MenuItem value="bottom">Rodapé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 3 && (
          <Box className={classes.section} style={{ marginTop: 24 }}>
            <Typography className={classes.sectionTitle}>Integrações</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.createContact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          createContact: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Criar Contato Automaticamente"
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Um contato será criado/atualizado quando o formulário for
                  preenchido
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.createTicket}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          createTicket: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Criar Ticket Automaticamente"
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Um ticket será criado quando o formulário for preenchido (requer criar contato)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.sendWebhook}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sendWebhook: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Enviar Webhook"
                />
              </Grid>
              {formData.sendWebhook && (
                <Grid item xs={12}>
                  <TextField
                    label="URL do Webhook"
                    fullWidth
                    value={formData.webhookUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, webhookUrl: e.target.value })
                    }
                    variant="outlined"
                    placeholder="https://exemplo.com/webhook"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Modal de Campo */}
      <Dialog
        open={fieldModalOpen}
        onClose={() => setFieldModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingField !== null ? "Editar Campo" : "Novo Campo"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                label="Label do Campo *"
                fullWidth
                value={fieldForm.label}
                onChange={(e) =>
                  setFieldForm({ ...fieldForm, label: e.target.value })
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Tipo de Campo *</InputLabel>
                <Select
                  value={fieldForm.fieldType}
                  onChange={(e) =>
                    setFieldForm({ ...fieldForm, fieldType: e.target.value })
                  }
                  label="Tipo de Campo *"
                >
                  {fieldTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.isRequired}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        isRequired: e.target.checked,
                      })
                    }
                  />
                }
                label="Campo Obrigatório"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Placeholder"
                fullWidth
                value={fieldForm.placeholder}
                onChange={(e) =>
                  setFieldForm({ ...fieldForm, placeholder: e.target.value })
                }
                variant="outlined"
              />
            </Grid>
            {(fieldForm.fieldType === "select" ||
              fieldForm.fieldType === "radio" ||
              fieldForm.fieldType === "checkbox") && (
              <Grid item xs={12}>
                <Typography variant="body2" style={{ marginBottom: 8, fontWeight: 500 }}>
                  Opções
                </Typography>
                {fieldForm.options && fieldForm.options.length > 0 && (
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={1}
                    style={{ marginBottom: 12 }}
                  >
                    {fieldForm.options.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        onDelete={() => handleRemoveOption(index)}
                        deleteIcon={<CloseIcon />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
                <Box display="flex" gap={1}>
                  <TextField
                    label="Adicionar Opção"
                    fullWidth
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={handleKeyPressOption}
                    variant="outlined"
                    size="small"
                    placeholder="Digite a opção e clique em Adicionar"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                    startIcon={<AddIcon />}
                    style={{ minWidth: 120 }}
                  >
                    Adicionar
                  </Button>
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="Texto de Ajuda (opcional)"
                fullWidth
                value={fieldForm.helpText}
                onChange={(e) =>
                  setFieldForm({ ...fieldForm, helpText: e.target.value })
                }
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveField}
            color="primary"
            variant="contained"
            disabled={!fieldForm.label}
          >
            {editingField !== null ? "Salvar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default FormBuilder;
