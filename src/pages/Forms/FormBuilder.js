import React, { useState, useEffect, useRef } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import useWhatsApps from "../../hooks/useWhatsApps";
import useCompanyModules from "../../hooks/useCompanyModules";

import SaveIcon from "@material-ui/icons/Save";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import CloseIcon from "@material-ui/icons/Close";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

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
  logoPreview: {
    maxWidth: 200,
    maxHeight: 100,
    objectFit: "contain",
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  },
  logoUploadBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(2),
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
  const formLoadedRef = useRef(false);
  const currentIdRef = useRef(null);
  const initializedRef = useRef(false);
  const { whatsApps } = useWhatsApps();
  const { hasLanchonetes, hasAgendamento } = useCompanyModules();
  const [printDevices, setPrintDevices] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

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
    settings: {
      formType: "normal", // "normal", "quotation" ou "cardapio"
      quotationItems: [], // Array de { productName: string, quantity: number }
      whatsAppMessage: "", // Mensagem pré-definida para envio via WhatsApp
      finalizeFields: [], // Campos customizados para aba finalizar do cardápio
      whatsappId: null, // ID da conexão WhatsApp para envio de confirmação do pedido
      printDeviceId: null, // ID do dispositivo de impressão para impressão de pedidos
      mesaPrintConfig: [], // [{ printDeviceId, groupNames }] para pedidos mesa/garçom
      deliveryPrintDeviceIds: [], // IDs das impressoras para pedidos delivery
      autoConfirmMinutes: 0, // Avançar novo->confirmado após X minutos (0=desativado)
      averageDeliveryTime: "", // Tempo médio de entrega (ex: "30-45 minutos")
      enablePieceAgain: false, // Habilita "Peça de novo" por telefone + auto-preenchimento
      pieceAgainMaxOrders: 5, // Últimos N pedidos para agregação
      pieceAgainMaxItems: 6, // Máx. itens exibidos na seção
      showMesaField: false, // Exibir campo Número da mesa no cardápio
      mesaFieldMode: "select", // select = dropdown com mesas, input = campo livre
      appearance: {
        fontFamily: "inherit",
        borderRadius: "12",
        backgroundColor: "",
        backgroundStyle: "solid",
        pageBackground: "",
        boxShadow: "medium",
        fieldStyle: "outlined",
        fieldBorderRadius: "8",
        buttonStyle: "rounded",
        maxWidth: "600",
        titleSize: "default",
        spacing: "default",
      },
    },
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
    const fetchPrintDevices = async () => {
      try {
        const { data } = await api.get("/print-devices");
        setPrintDevices(data || []);
      } catch (err) {
        console.error("Erro ao carregar dispositivos de impressão:", err);
      }
    };
    fetchPrintDevices();
  }, []);

  useEffect(() => {
    if (!hasLanchonetes) return;
    const fetchGroups = async () => {
      try {
        const { data } = await api.get("/products", { params: { pageNumber: "1" } });
        const groups = data?.groups || [];
        const list = ["Outros", ...(Array.isArray(groups) ? groups : [])].filter(Boolean);
        setProductGroups([...new Set(list)].sort());
      } catch (err) {
        setProductGroups(["Outros"]);
      }
    };
    fetchGroups();
  }, [hasLanchonetes]);

  useEffect(() => {
    // Se o ID mudou, resetar todas as flags
    const idChanged = currentIdRef.current !== id;
    if (idChanged) {
      formLoadedRef.current = false;
      initializedRef.current = false;
      currentIdRef.current = id;
    }
    
    if (isEdit && id && !formLoadedRef.current) {
      loadForm();
    } else if (!isEdit && !initializedRef.current) {
      // Reset quando não for edição - apenas uma vez
      initializedRef.current = true;
      formLoadedRef.current = true;
      setFormData({
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
        settings: {
          formType: "normal",
          quotationItems: [],
          finalizeFields: [],
          whatsAppMessage: "",
          whatsappId: null,
          printDeviceId: null,
          averageDeliveryTime: "",
          appearance: {
            fontFamily: "inherit",
            borderRadius: "12",
            backgroundColor: "",
            backgroundStyle: "solid",
            pageBackground: "default",
            boxShadow: "medium",
            fieldStyle: "outlined",
            fieldBorderRadius: "8",
            buttonStyle: "rounded",
            maxWidth: "600",
            titleSize: "default",
            spacing: "default",
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadForm = async () => {
    if (formLoadedRef.current || loading || !id) return; // Evitar múltiplas chamadas
    
    setLoading(true);
    formLoadedRef.current = true; // Marcar como carregado antes da chamada para evitar duplicação
    try {
      const { data } = await api.get(`/forms/${id}`);
      const isMenuForm = data.settings?.formType === "cardapio";
      
      // Filtrar campos automáticos (nome e telefone) da visualização
      const customFields = (data.fields || []).filter(
        (field) => !field.metadata?.isAutoField
      );
      // Evitar duplicação de campos (por id)
      const uniqueFields = customFields.filter(
        (f, i, arr) => !f.id || arr.findIndex((x) => x.id === f.id) === i
      );

      const mergedSettings = {
        ...data.settings,
        finalizeFields: isMenuForm ? uniqueFields.sort((a, b) => a.order - b.order) : (data.settings?.finalizeFields || []),
        whatsappId: data.settings?.whatsappId || null,
        printDeviceId: data.settings?.printDeviceId || null,
        mesaPrintConfig: data.settings?.mesaPrintConfig ?? (data.settings?.printDeviceId ? [{ printDeviceId: data.settings.printDeviceId, groupNames: ["*"] }] : []),
        deliveryPrintDeviceIds: Array.isArray(data.settings?.deliveryPrintDeviceIds) ? data.settings.deliveryPrintDeviceIds : (data.settings?.printDeviceId ? [data.settings.printDeviceId] : []),
      };
      // Garantir defaults do cardápio para mesa (evitar que mesaFieldMode ausente mostre input em vez de select)
      if (isMenuForm) {
        if (mergedSettings.showMesaField && mergedSettings.mesaFieldMode === undefined) {
          mergedSettings.mesaFieldMode = "select";
        }
      }

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
        createContact: isMenuForm ? (data.createContact !== false) : (data.createContact || false),
        createTicket: isMenuForm ? (data.createTicket !== false) : (data.createTicket || false),
        sendWebhook: data.sendWebhook || false,
        webhookUrl: data.webhookUrl || "",
        fields: isMenuForm ? [] : uniqueFields.sort((a, b) => a.order - b.order),
        settings: mergedSettings,
      });
    } catch (err) {
      formLoadedRef.current = false; // Reset em caso de erro
      toastError(err);
      history.push("/forms");
    } finally {
      setLoading(false);
    }
  };

  const prepareFieldsForPayload = (fields) => {
    return (fields || []).map((field, index) => {
      const f = { ...field, order: index };
      if (typeof f.conditionalFieldId === "string" && f.conditionalFieldId.startsWith("idx-")) {
        const idx = parseInt(f.conditionalFieldId.replace("idx-", ""), 10);
        delete f.conditionalFieldId;
        f.conditionalFieldIndex = idx;
      }
      return f;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isQuotation = formData.settings?.formType === "quotation";
      const isMenuForm = formData.settings?.formType === "cardapio";
      
      // Se for cotação ou cardápio, enviar campos customizados (finalizeFields para cardápio)
      const fieldsToSend = isQuotation || isMenuForm
        ? (isMenuForm ? prepareFieldsForPayload(formData.settings?.finalizeFields) : [])
        : prepareFieldsForPayload(formData.fields);

      // Preparar mesaPrintConfig - filtrar apenas linhas completamente configuradas
      const mesaPrintConfig = Array.isArray(formData.settings?.mesaPrintConfig) 
        ? formData.settings.mesaPrintConfig.filter(row => {
            // Manter apenas linhas com printDeviceId válido E grupos configurados
            const hasValidDevice = row.printDeviceId && row.printDeviceId > 0;
            const hasValidGroups = Array.isArray(row.groupNames) && row.groupNames.length > 0;
            return hasValidDevice && hasValidGroups;
          })
        : [];

      const payload = {
        ...formData,
        fields: fieldsToSend,
        // Garantir que settings seja um objeto válido e inclua formType, mesaPrintConfig, etc.
        settings: {
          ...(formData.settings || {}),
          // Garantir que formType seja sempre enviado (agendamento, cardapio, quotation, normal)
          formType: formData.settings?.formType ?? "normal",
          // Incluir mesaPrintConfig mesmo que vazio (para substituir o valor do banco)
          mesaPrintConfig: mesaPrintConfig,
          // Garantir que deliveryPrintDeviceIds seja um array válido
          deliveryPrintDeviceIds: Array.isArray(formData.settings?.deliveryPrintDeviceIds)
            ? formData.settings.deliveryPrintDeviceIds.filter(id => id && id > 0)
            : [],
        },
      };

      // Log para debug
      console.log("FormBuilder: Saving form with mesaPrintConfig:", payload.settings.mesaPrintConfig);
      console.log("FormBuilder: Saving form with deliveryPrintDeviceIds:", payload.settings.deliveryPrintDeviceIds);
      console.log("FormBuilder: Full settings being sent:", JSON.stringify(payload.settings, null, 2));

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
    // Se for cardápio, usar finalizeFields.length, senão usar fields.length
    const currentOrder = isMenuForm 
      ? (formData.settings?.finalizeFields?.length || 0)
      : formData.fields.length;
    setFieldForm({
      label: "",
      fieldType: "text",
      placeholder: "",
      isRequired: false,
      order: currentOrder,
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
  
  const handleEditFinalizeField = (index) => {
    const fields = formData.settings?.finalizeFields || [];
    setEditingField(index);
    setNewOption("");
    setFieldForm({
      ...fields[index],
      options: fields[index].options || [],
    });
    setFieldModalOpen(true);
  };

  const handleSaveField = () => {
    if (isMenuForm) {
      // Se for cardápio, salvar em finalizeFields
      const finalizeFields = formData.settings?.finalizeFields || [];
      const newFields = [...finalizeFields];
      if (editingField !== null) {
        newFields[editingField] = { ...fieldForm };
      } else {
        newFields.push({ ...fieldForm });
      }
      setFormData({
        ...formData,
        settings: {
          ...formData.settings,
          finalizeFields: newFields,
        },
      });
    } else {
      // Se não for cardápio, salvar em fields normal
      const newFields = [...formData.fields];
      if (editingField !== null) {
        newFields[editingField] = { ...fieldForm, id: formData.fields[editingField]?.id };
      } else {
        newFields.push({ ...fieldForm });
      }
      setFormData({ ...formData, fields: newFields });
    }
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

  // Funções para gerenciar itens de cotação
  const handleAddQuotationItem = () => {
    const items = formData.settings?.quotationItems || [];
    const newItems = [
      ...items,
      {
        productName: "",
        quantity: 1,
      },
    ];
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        quotationItems: newItems,
      },
    });
  };

  const handleRemoveQuotationItem = (index) => {
    const items = formData.settings?.quotationItems || [];
    const newItems = items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        quotationItems: newItems,
      },
    });
  };

  const handleUpdateQuotationItem = (index, field, value) => {
    const items = formData.settings?.quotationItems || [];
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        quotationItems: newItems,
      },
    });
  };

  const isQuotationForm = formData.settings?.formType === "quotation";
  const isMenuForm = formData.settings?.formType === "cardapio";
  const deliveryConditionFields = isMenuForm
    ? (formData.settings?.finalizeFields || []).filter((f) => f && f.id)
    : [];

  const tabKeys = isMenuForm
    ? ["gerais", "campos", "impressao", "quadro", "aparencia", "integracoes"]
    : ["gerais", "campos", "aparencia", "integracoes"];
  const currentTabKey = tabKeys[Math.min(tabValue, tabKeys.length - 1)];

  // Ao trocar para um tipo que não é cardápio, ajustar índice para não ultrapassar as abas visíveis
  useEffect(() => {
    if (!isMenuForm && tabValue >= tabKeys.length) {
      setTabValue(tabKeys.length - 1);
    }
  }, [isMenuForm, tabKeys.length, tabValue]);

  const DEFAULT_ORDER_STAGES = [
    { id: "novo", label: "Novo", color: "#6366F1" },
    { id: "confirmado", label: "Confirmado", color: "#3B82F6" },
    { id: "em_preparo", label: "Em preparo", color: "#F59E0B" },
    { id: "pronto", label: "Pronto", color: "#22C55E" },
    { id: "saiu_entrega", label: "Saiu para entrega", color: "#8B5CF6" },
    { id: "entregue", label: "Entregue", color: "#10B981" },
    { id: "cancelado", label: "Cancelado", color: "#6B7280" },
  ];

  return (
    <MainContainer usePaper={false}>
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
          value={Math.min(tabValue, tabKeys.length - 1)}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          {tabKeys.map((key) => (
            <Tab
              key={key}
              label={
                key === "gerais"
                  ? "Configurações Gerais"
                  : key === "campos"
                  ? "Campos"
                  : key === "impressao"
                  ? "Impressão"
                  : key === "quadro"
                  ? "Quadro (estágios do pedido)"
                  : key === "aparencia"
                  ? "Aparência"
                  : "Integrações"
              }
            />
          ))}
        </Tabs>

        {currentTabKey === "gerais" && (
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
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tipo de Formulário</InputLabel>
                  <Select
                    value={formData.settings?.formType || "normal"}
                    onChange={(e) => {
                      const isCardapio = e.target.value === "cardapio";
                      const isAgendamento = e.target.value === "agendamento";
                      setFormData({
                        ...formData,
                        createContact: isCardapio || isAgendamento ? true : formData.createContact,
                        createTicket: isCardapio ? true : formData.createTicket,
                        settings: {
                          ...formData.settings,
                          formType: e.target.value,
                          quotationItems: e.target.value === "quotation"
                            ? (formData.settings?.quotationItems || [])
                            : [],
                          finalizeFields: e.target.value === "cardapio"
                            ? (formData.settings?.finalizeFields || [])
                            : [],
                          mesas: e.target.value === "cardapio" ? (formData.settings?.mesas !== false) : undefined,
                          delivery: e.target.value === "cardapio" ? (formData.settings?.delivery !== false) : undefined,
                        },
                      });
                    }}
                    label="Tipo de Formulário"
                  >
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="quotation">Cotação</MenuItem>
                    {hasLanchonetes && (
                      <MenuItem value="cardapio">Cardápio (Módulo Lanchonetes)</MenuItem>
                    )}
                    {hasAgendamento && (
                      <MenuItem value="agendamento">Agendamento</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {formData.settings?.formType === "agendamento" && (
                <Grid container spacing={2} style={{ marginTop: 16 }}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{ marginBottom: 8 }}>Configurações do agendamento</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Hora início (ex: 8)"
                      value={formData.settings?.agendamento?.startHour ?? 8}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            agendamento: {
                              ...formData.settings?.agendamento,
                              startHour: parseInt(e.target.value, 10) || 8,
                            },
                          },
                        })
                      }
                      inputProps={{ min: 0, max: 23 }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Hora fim (ex: 18)"
                      value={formData.settings?.agendamento?.endHour ?? 18}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            agendamento: {
                              ...formData.settings?.agendamento,
                              endHour: parseInt(e.target.value, 10) || 18,
                            },
                          },
                        })
                      }
                      inputProps={{ min: 0, max: 23 }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Buffer entre agendamentos (min)"
                      value={formData.settings?.agendamento?.bufferMinutes ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            agendamento: {
                              ...formData.settings?.agendamento,
                              bufferMinutes: Math.max(0, parseInt(e.target.value, 10) || 0),
                            },
                          },
                        })
                      }
                      inputProps={{ min: 0 }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Lembretes (horas antes, ex: 24, 1)"
                      placeholder="24, 1"
                      value={Array.isArray(formData.settings?.agendamento?.reminderHours) ? formData.settings.agendamento.reminderHours.join(", ") : "24, 1"}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\s/g, "");
                        const arr = raw ? raw.split(",").map((n) => parseInt(n, 10)).filter((n) => !isNaN(n) && n > 0) : [24, 1];
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            agendamento: {
                              ...formData.settings?.agendamento,
                              reminderHours: arr.length ? arr : [24, 1],
                            },
                          },
                        });
                      }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Cancelamento gratuito até (horas antes)"
                      value={formData.settings?.agendamento?.cancellationPolicyHours ?? 24}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            agendamento: {
                              ...formData.settings?.agendamento,
                              cancellationPolicyHours: Math.max(0, parseInt(e.target.value, 10) || 24),
                            },
                          },
                        })
                      }
                      inputProps={{ min: 0 }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Taxa de cancelamento após prazo (R$)"
                      value={formData.settings?.agendamento?.cancellationFee ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            agendamento: {
                              ...formData.settings?.agendamento,
                              cancellationFee: Math.max(0, parseFloat(e.target.value) || 0),
                            },
                          },
                        })
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Tema do formulário público</InputLabel>
                      <Select
                        value={formData.settings?.agendamento?.theme ?? "dark"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              agendamento: {
                                ...formData.settings?.agendamento,
                                theme: e.target.value,
                              },
                            },
                          })
                        }
                        label="Tema do formulário público"
                      >
                        <MenuItem value="dark">Escuro</MenuItem>
                        <MenuItem value="light">Claro</MenuItem>
                        <MenuItem value="auto">Automático (sistema)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}

              {formData.settings?.formType === "cardapio" && (
                <Grid container spacing={2} style={{ marginTop: 24 }}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                      Conexão para envio de notificações
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 12 }}>
                      Defina qual conexão WhatsApp será usada para enviar confirmações e notificações de status do pedido ao cliente.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Conexão WhatsApp para Envio</InputLabel>
                      <Select
                        value={formData.settings?.whatsappId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              whatsappId: e.target.value ? Number(e.target.value) : null,
                            },
                          })
                        }
                        label="Conexão WhatsApp para Envio"
                      >
                        <MenuItem value="">
                          <em>Usar conexão padrão</em>
                        </MenuItem>
                        {whatsApps
                          .filter((w) => w.status === "CONNECTED")
                          .map((whatsapp) => (
                            <MenuItem key={whatsapp.id} value={whatsapp.id}>
                              {whatsapp.name} {whatsapp.isDefault && "(Padrão)"}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: "block" }}>
                      Selecione qual conexão será usada para enviar a confirmação do pedido e mensagens de status. Se não selecionar, será usada a conexão padrão.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.settings?.mesas !== false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                mesas: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="Aceita pedidos de mesa"
                    />
                    <Typography variant="caption" display="block" color="textSecondary">
                      Permite que clientes façam pedidos para consumo na mesa.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.settings?.delivery !== false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                delivery: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="Aceita pedidos de delivery"
                    />
                    <Typography variant="caption" display="block" color="textSecondary">
                      Permite que clientes façam pedidos para entrega.
                    </Typography>
                  </Grid>

                  {/* Peça de novo (Configurações Gerais) */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600, marginTop: 8, marginBottom: 8 }}>
                      Peça de novo
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!formData.settings?.enablePieceAgain}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                enablePieceAgain: e.target.checked,
                                pieceAgainMaxOrders: formData.settings?.pieceAgainMaxOrders ?? 5,
                                pieceAgainMaxItems: formData.settings?.pieceAgainMaxItems ?? 6,
                              },
                            })
                          }
                        />
                      }
                      label="Ativar “Peça de novo” (por telefone) e auto-preenchimento"
                    />
                    <Typography variant="caption" display="block" color="textSecondary">
                      Quando ativo, o cardápio pede o telefone ao abrir, sugere itens dos últimos pedidos e salva dados para preencher automaticamente os campos nas próximas compras.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      inputProps={{ min: 1, max: 30, step: 1 }}
                      label="Buscar últimos pedidos (N)"
                      value={formData.settings?.pieceAgainMaxOrders ?? 5}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1));
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, pieceAgainMaxOrders: val },
                        });
                      }}
                      helperText="Quantos pedidos anteriores usar para montar a seção"
                      disabled={!formData.settings?.enablePieceAgain}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      inputProps={{ min: 1, max: 50, step: 1 }}
                      label="Máximo de itens na seção"
                      value={formData.settings?.pieceAgainMaxItems ?? 6}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, pieceAgainMaxItems: val },
                        });
                      }}
                      helperText="Quantos produtos mostrar no “Peça de novo”"
                      disabled={!formData.settings?.enablePieceAgain}
                    />
                  </Grid>

                  {/* Taxa de entrega e condição (Configurações Gerais) */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600, marginTop: 8, marginBottom: 8 }}>
                      Taxa de entrega
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          label="Tempo Médio de Entrega"
                          placeholder="Ex: 30-45 minutos"
                          value={formData.settings?.averageDeliveryTime || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                averageDeliveryTime: e.target.value,
                              },
                            })
                          }
                          helperText="Exibido na tela de confirmação do pedido"
                          disabled={formData.settings?.delivery === false}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          type="number"
                          inputProps={{ min: 0, step: 0.01 }}
                          label="Taxa de Entrega (R$)"
                          placeholder="0.00"
                          value={formData.settings?.deliveryFee || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : parseFloat(e.target.value) || 0;
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                deliveryFee: val,
                              },
                            });
                          }}
                          helperText="Valor adicionado ao total quando a condição de delivery for verdadeira"
                          disabled={formData.settings?.delivery === false}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2" style={{ fontWeight: 600, marginTop: 8 }}>
                          Condição para aplicar a taxa de entrega
                        </Typography>
                        <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 12 }}>
                          A taxa só será somada quando a condição abaixo for verdadeira (ex.: campo “Entrega?” = “Sim”). Funciona como campos condicionais.
                          Dica: se você acabou de criar o formulário, salve primeiro para os campos ganharem ID.
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth variant="outlined">
                              <InputLabel>Campo</InputLabel>
                              <Select
                                value={formData.settings?.deliveryFeeCondition?.fieldId || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    settings: {
                                      ...formData.settings,
                                      deliveryFeeCondition: {
                                        ...(formData.settings?.deliveryFeeCondition || {}),
                                        fieldId: e.target.value ? Number(e.target.value) : "",
                                        operator: (formData.settings?.deliveryFeeCondition?.operator || "equals"),
                                        value: (formData.settings?.deliveryFeeCondition?.value ?? ""),
                                      },
                                    },
                                  })
                                }
                                label="Campo"
                                disabled={formData.settings?.delivery === false}
                              >
                                <MenuItem value="">
                                  <em>Nenhum (aplica em todo delivery)</em>
                                </MenuItem>
                                {deliveryConditionFields.map((f) => (
                                  <MenuItem key={f.id} value={f.id}>
                                    {f.label} ({f.fieldType})
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth variant="outlined">
                              <InputLabel>Operador</InputLabel>
                              <Select
                                value={formData.settings?.deliveryFeeCondition?.operator || "equals"}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    settings: {
                                      ...formData.settings,
                                      deliveryFeeCondition: {
                                        ...(formData.settings?.deliveryFeeCondition || {}),
                                        operator: e.target.value,
                                        fieldId: (formData.settings?.deliveryFeeCondition?.fieldId || ""),
                                        value: (formData.settings?.deliveryFeeCondition?.value ?? ""),
                                      },
                                    },
                                  })
                                }
                                label="Operador"
                                disabled={formData.settings?.delivery === false}
                              >
                                <MenuItem value="equals">Igual a</MenuItem>
                                <MenuItem value="notEquals">Diferente de</MenuItem>
                                <MenuItem value="contains">Contém</MenuItem>
                                <MenuItem value="isEmpty">Está vazio</MenuItem>
                                <MenuItem value="isNotEmpty">Não está vazio</MenuItem>
                                <MenuItem value="isTrue">É verdadeiro (Sim/True/1)</MenuItem>
                                <MenuItem value="isFalse">É falso (Não/False/0)</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            {(() => {
                              const operator = formData.settings?.deliveryFeeCondition?.operator || "equals";
                              const fieldId = formData.settings?.deliveryFeeCondition?.fieldId;
                              const selectedField = deliveryConditionFields.find((f) => Number(f.id) === Number(fieldId));
                              const needsValue = !["isEmpty", "isNotEmpty", "isTrue", "isFalse"].includes(operator);
                              if (!needsValue) {
                                return (
                                  <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Valor"
                                    value="—"
                                    disabled
                                    helperText="Este operador não precisa de valor"
                                  />
                                );
                              }
                              if (selectedField?.options?.length) {
                                return (
                                  <FormControl fullWidth variant="outlined">
                                    <InputLabel>Valor</InputLabel>
                                    <Select
                                      value={formData.settings?.deliveryFeeCondition?.value ?? ""}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          settings: {
                                            ...formData.settings,
                                            deliveryFeeCondition: {
                                              ...(formData.settings?.deliveryFeeCondition || {}),
                                              value: e.target.value,
                                            },
                                          },
                                        })
                                      }
                                      label="Valor"
                                      disabled={formData.settings?.delivery === false}
                                    >
                                      {(selectedField.options || []).map((opt, idx) => (
                                        <MenuItem key={idx} value={opt}>
                                          {opt}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                );
                              }
                              return (
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  label="Valor"
                                  placeholder='Ex.: "Sim"'
                                  value={formData.settings?.deliveryFeeCondition?.value ?? ""}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      settings: {
                                        ...formData.settings,
                                        deliveryFeeCondition: {
                                          ...(formData.settings?.deliveryFeeCondition || {}),
                                          value: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  helperText="Valor comparado com a resposta do campo"
                                  disabled={formData.settings?.delivery === false}
                                />
                              );
                            })()}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!formData.settings?.showMesaField}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                showMesaField: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="Exibir campo Número da mesa"
                    />
                    <Typography variant="caption" display="block" color="textSecondary">
                      Permite que o cliente selecione ou digite a mesa ao finalizar o pedido.
                    </Typography>
                  </Grid>
                  {formData.settings?.showMesaField && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Modo do campo mesa</InputLabel>
                        <Select
                          value={formData.settings?.mesaFieldMode || "select"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                mesaFieldMode: e.target.value,
                              },
                            })
                          }
                          label="Modo do campo mesa"
                        >
                          <MenuItem value="select">Select (lista de mesas)</MenuItem>
                          <MenuItem value="input">Input livre (texto)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {currentTabKey === "campos" && (
          <Box className={classes.section} style={{ marginTop: 24 }}>
            {isQuotationForm ? (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom={2}
                >
                  <Typography className={classes.sectionTitle}>
                    Itens de Cotação
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddQuotationItem}
                  >
                    Adicionar Item
                  </Button>
                </Box>

                {(!formData.settings?.quotationItems ||
                  formData.settings.quotationItems.length === 0) && (
                  <Box
                    padding={4}
                    textAlign="center"
                    style={{
                      border: `1px dashed #ccc`,
                      borderRadius: 4,
                    }}
                  >
                    <Typography color="textSecondary">
                      Nenhum item adicionado. Clique em "Adicionar Item" para
                      começar.
                    </Typography>
                  </Box>
                )}

                {formData.settings?.quotationItems &&
                  formData.settings.quotationItems.length > 0 && (
                    <Paper style={{ overflowX: "auto", marginBottom: 16 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Nome do Produto</TableCell>
                            <TableCell align="center" style={{ width: 120 }}>
                              Quantidade
                            </TableCell>
                            <TableCell align="center" style={{ width: 100 }}>
                              Ações
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formData.settings.quotationItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  value={item.productName || ""}
                                  onChange={(e) =>
                                    handleUpdateQuotationItem(
                                      index,
                                      "productName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nome do produto"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <TextField
                                  type="number"
                                  variant="outlined"
                                  size="small"
                                  value={item.quantity || 1}
                                  onChange={(e) =>
                                    handleUpdateQuotationItem(
                                      index,
                                      "quantity",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  inputProps={{ min: 1 }}
                                  style={{ width: 100 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveQuotationItem(index)}
                                  color="secondary"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  )}

                <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
                  * Para cada item, o respondente poderá preencher: Valor Unitário, Valor Total e Observações
                </Typography>
              </>
            ) : isMenuForm ? (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom={2}
                >
                  <Typography className={classes.sectionTitle}>
                    Campos da Aba Finalizar
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddField}
                  >
                    Adicionar Campo
                  </Button>
                </Box>

                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                  Estes campos aparecerão na aba "Finalizar" do formulário de cardápio, após o cliente selecionar os produtos.
                </Typography>

                {(!formData.settings?.finalizeFields ||
                  formData.settings.finalizeFields.length === 0) && (
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

                {formData.settings?.finalizeFields &&
                  formData.settings.finalizeFields.length > 0 && (
                    <Box>
                      {formData.settings.finalizeFields.map((field, index) => (
                        <Paper
                          key={field.id ?? `finalize-${index}`}
                          style={{
                            padding: 16,
                            marginBottom: 16,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box flex={1}>
                            <Typography variant="subtitle1">
                              {field.label || "Campo sem nome"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Tipo: {field.fieldType} |{" "}
                              {field.isRequired ? "Obrigatório" : "Opcional"}
                              {field.hasConditional && " | Condicional"}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              onClick={() => handleEditFinalizeField(index)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                const fields = formData.settings?.finalizeFields || [];
                                const newFields = fields.filter((_, i) => i !== index);
                                setFormData({
                                  ...formData,
                                  settings: {
                                    ...formData.settings,
                                    finalizeFields: newFields,
                                  },
                                });
                              }}
                              color="secondary"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
              </>
            ) : (
              <>
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
                  <Paper key={field.id ?? `field-${index}`} className={classes.fieldItem}>
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
                        {field.hasConditional && (
                          <Chip
                            label="Condicional"
                            size="small"
                            color="secondary"
                            variant="outlined"
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
              </>
            )}
          </Box>
        )}

        {currentTabKey === "impressao" && (
          <Box className={classes.section} style={{ marginTop: 24 }}>
            <Typography className={classes.sectionTitle}>Configurações de impressão</Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                  Configure as impressoras para pedidos de mesa e delivery. Essas configurações aplicam-se apenas a formulários do tipo Cardápio.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                      {i18n.t("formBuilder.printConfig.mesaTitle")}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 12 }}>
                      {i18n.t("formBuilder.printConfig.mesaHint")}
                    </Typography>
                    {(formData.settings?.mesaPrintConfig || []).map((row, idx) => {
                      const groupNames = Array.isArray(row.groupNames) ? row.groupNames : [];
                      return (
                        <Box key={`mesa-print-${idx}-${row.printDeviceId || "new"}`} display="flex" alignItems="flex-start" flexWrap="wrap" gap={2} style={{ marginBottom: 12 }}>
                          <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
                            <InputLabel>{i18n.t("formBuilder.printConfig.printer")}</InputLabel>
                            <Select
                              value={row.printDeviceId || ""}
                              onChange={(e) => {
                                const next = [...(formData.settings?.mesaPrintConfig || [])];
                                next[idx] = { ...next[idx], printDeviceId: e.target.value ? Number(e.target.value) : "" };
                                setFormData({ ...formData, settings: { ...formData.settings, mesaPrintConfig: next } });
                              }}
                              label={i18n.t("formBuilder.printConfig.printer")}
                            >
                              <MenuItem value="">
                                <em>{i18n.t("formBuilder.printConfig.none")}</em>
                              </MenuItem>
                              {printDevices.map((device) => (
                                <MenuItem key={device.id} value={device.id}>
                                  {device.name || device.deviceId}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl variant="outlined" size="small" style={{ minWidth: 220 }}>
                            <InputLabel>{i18n.t("formBuilder.printConfig.groups")}</InputLabel>
                            <Select
                              multiple
                              value={groupNames}
                              onChange={(e) => {
                                const next = [...(formData.settings?.mesaPrintConfig || [])];
                                const val = Array.isArray(e.target.value) ? e.target.value : [];
                                const hasAllGroups = val.includes("*");
                                next[idx] = {
                                  ...next[idx],
                                  groupNames: hasAllGroups ? ["*"] : val.filter((v) => v !== "*"),
                                };
                                setFormData({ ...formData, settings: { ...formData.settings, mesaPrintConfig: next } });
                              }}
                              label={i18n.t("formBuilder.printConfig.groups")}
                              renderValue={(sel) => {
                                if (!sel || sel.length === 0) return "";
                                return sel.includes("*") ? i18n.t("formBuilder.printConfig.allGroups") : sel.join(", ");
                              }}
                            >
                              <MenuItem value="*">
                                <Checkbox checked={groupNames.includes("*")} />
                                <span>{i18n.t("formBuilder.printConfig.allGroups")}</span>
                              </MenuItem>
                              {productGroups && productGroups.length > 0
                                ? productGroups.map((g) => (
                                    <MenuItem key={g} value={g}>
                                      <Checkbox checked={groupNames.includes(g)} />
                                      <span>{g}</span>
                                    </MenuItem>
                                  ))
                                : (
                                    <MenuItem disabled>Nenhum grupo disponível</MenuItem>
                                  )}
                            </Select>
                          </FormControl>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const next = (formData.settings?.mesaPrintConfig || []).filter((_, i) => i !== idx);
                              setFormData({ ...formData, settings: { ...formData.settings, mesaPrintConfig: next } });
                            }}
                            aria-label={i18n.t("formBuilder.printConfig.remove")}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const next = [...(formData.settings?.mesaPrintConfig || []), { printDeviceId: "", groupNames: [] }];
                        setFormData({ ...formData, settings: { ...formData.settings, mesaPrintConfig: next } });
                      }}
                    >
                      {i18n.t("formBuilder.printConfig.addPrinter")}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                      {i18n.t("formBuilder.printConfig.deliveryTitle")}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 8 }}>
                      {i18n.t("formBuilder.printConfig.deliveryHint")}
                    </Typography>
                    <FormGroup row>
                      {printDevices.map((device) => (
                        <FormControlLabel
                          key={device.id}
                          control={
                            <Checkbox
                              checked={((formData.settings?.deliveryPrintDeviceIds) || []).indexOf(device.id) > -1}
                              onChange={(e) => {
                                const prev = formData.settings?.deliveryPrintDeviceIds || [];
                                const next = e.target.checked ? [...prev, device.id] : prev.filter((id) => id !== device.id);
                                setFormData({ ...formData, settings: { ...formData.settings, deliveryPrintDeviceIds: next } });
                              }}
                            />
                          }
                          label={device.name || device.deviceId}
                        />
                      ))}
                      {printDevices.length === 0 && (
                        <Typography variant="body2" color="textSecondary">
                          {i18n.t("formBuilder.printConfig.noDevices")}
                        </Typography>
                      )}
                    </FormGroup>
                  </Grid>
                </Grid>
          </Box>
        )}

        {currentTabKey === "quadro" && (
          <Box className={classes.section} style={{ marginTop: 24 }}>
            <Typography className={classes.sectionTitle}>Quadro – estágios do pedido</Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                  Personalize os estágios exibidos no Kanban de pedidos e as mensagens enviadas ao cliente quando o status mudar.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      inputProps={{ min: 0, step: 1 }}
                      label="Avançar para 'Confirmado' automaticamente após (minutos)"
                      placeholder="0 = desativado"
                      value={formData.settings?.autoConfirmMinutes ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0;
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            autoConfirmMinutes: val,
                          },
                        });
                      }}
                      helperText="0 = desativado. Pedidos em 'Novo' avançam automaticamente para 'Confirmado' após X minutos."
                    />
                  </Grid>
                </Grid>
                <Typography variant="subtitle2" style={{ marginTop: 24, marginBottom: 12 }}>
                  Mensagens de notificação WhatsApp (ao alterar status do pedido)
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                  Deixe em branco para usar a mensagem padrão.
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { key: "em_preparo", label: "Status: Em preparo", placeholder: "Ex: Seu pedido está em preparo! Em breve estará pronto." },
                    { key: "pronto", label: "Status: Pronto", placeholder: "Ex: Seu pedido está pronto para retirada!" },
                    { key: "saiu_entrega", label: "Status: Saiu para entrega", placeholder: "Ex: Seu pedido saiu para entrega!" },
                    { key: "entregue", label: "Status: Entregue", placeholder: "Ex: Obrigado! Seu pedido foi entregue." },
                  ].map(({ key, label, placeholder }) => (
                    <Grid item xs={12} key={key}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label={label}
                        placeholder={placeholder}
                        value={formData.settings?.orderStatusMessages?.[key] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              orderStatusMessages: {
                                ...(formData.settings?.orderStatusMessages || {}),
                                [key]: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
                <Typography variant="subtitle2" style={{ marginTop: 24, marginBottom: 12 }}>
                  Estágios do pedido (Kanban)
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                  Personalize os estágios exibidos no Kanban de pedidos. O ID deve ser único (ex: novo, em_preparo).
                </Typography>
                {((formData.settings?.orderStages?.length > 0)
                  ? formData.settings.orderStages
                  : DEFAULT_ORDER_STAGES
                ).map((stage, idx) => (
                  <Box key={stage.id || idx} display="flex" gap={2} alignItems="center" style={{ marginBottom: 8 }}>
                    <TextField
                      size="small"
                      label="ID"
                      value={stage.id || ""}
                      onChange={(e) => {
                        const stages = formData.settings?.orderStages || DEFAULT_ORDER_STAGES;
                        const next = [...stages];
                        next[idx] = { ...next[idx], id: e.target.value };
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, orderStages: next },
                        });
                      }}
                      style={{ width: 120 }}
                    />
                    <TextField
                      size="small"
                      label="Label"
                      value={stage.label || ""}
                      onChange={(e) => {
                        const stages = formData.settings?.orderStages || DEFAULT_ORDER_STAGES;
                        const next = [...stages];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, orderStages: next },
                        });
                      }}
                      style={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      label="Cor"
                      type="color"
                      value={stage.color || "#6366F1"}
                      onChange={(e) => {
                        const stages = formData.settings?.orderStages || DEFAULT_ORDER_STAGES;
                        const next = [...stages];
                        next[idx] = { ...next[idx], color: e.target.value };
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, orderStages: next },
                        });
                      }}
                      InputProps={{ style: { height: 40, padding: 4 } }}
                      style={{ width: 80 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const stages = (formData.settings?.orderStages || DEFAULT_ORDER_STAGES).filter((_, i) => i !== idx);
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, orderStages: stages },
                        });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const stages = formData.settings?.orderStages || DEFAULT_ORDER_STAGES;
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        orderStages: [...stages, { id: "novo_estagio", label: "Novo estágio", color: "#6B7280" }],
                      },
                    });
                  }}
                >
                  Adicionar estágio
                </Button>
          </Box>
        )}

        {currentTabKey === "aparencia" && (
          <Box className={classes.section} style={{ marginTop: 24 }}>
            {isMenuForm && (
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                Estilo padrão do cardápio (igual ao Anota Aí). Apenas logo, banner e cor primária.
              </Typography>
            )}
            <Typography className={classes.sectionTitle}>Cores e logo</Typography>
            <Grid container spacing={2}>
              {!isMenuForm && (
                <>
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
                </>
              )}
              {isMenuForm && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Cor primária (botões e destaques)"
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
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary" style={{ marginBottom: 8 }}>
                  Logo do formulário (opcional)
                </Typography>
                <Box className={classes.logoUploadBox}>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoUploading(true);
                      try {
                        const data = new FormData();
                        data.append("logo", file);
                        const { data: res } = await api.post("/forms/upload-logo", data);
                        setFormData({ ...formData, logoUrl: res.logoUrl });
                        toast.success("Logo enviada com sucesso.");
                      } catch (err) {
                        toastError(err);
                      } finally {
                        setLogoUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  {formData.logoUrl ? (
                    <>
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className={classes.logoPreview}
                      />
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CloudUploadIcon />}
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                        >
                          {logoUploading ? "Enviando…" : "Alterar logo"}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="secondary"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => setFormData({ ...formData, logoUrl: "" })}
                        >
                          Remover logo
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => logoInputRef.current?.click()}
                      disabled={logoUploading}
                    >
                      {logoUploading ? "Enviando…" : "Enviar logo"}
                    </Button>
                  )}
                </Box>
              </Grid>
              {isMenuForm && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" style={{ marginBottom: 8 }}>
                    Banner do cardápio (imagem no topo, estilo Anota Aí)
                  </Typography>
                  <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 12 }}>
                    Tamanho sugerido: <strong>1200×360</strong> (proporção 10:3). Alternativa: <strong>1080×320</strong>. Máx. 2MB (JPG/PNG/WEBP).
                  </Typography>
                  <Box className={classes.logoUploadBox}>
                    <input
                      type="file"
                      ref={bannerInputRef}
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setBannerUploading(true);
                        try {
                          const data = new FormData();
                          data.append("logo", file);
                          const { data: res } = await api.post("/forms/upload-logo", data);
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              bannerUrl: res.logoUrl,
                            },
                          });
                          toast.success("Banner enviado com sucesso.");
                        } catch (err) {
                          toastError(err);
                        } finally {
                          setBannerUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    {(formData.settings?.bannerUrl) ? (
                      <>
                        <img
                          src={formData.settings.bannerUrl}
                          alt="Banner"
                          className={classes.logoPreview}
                          style={{ maxHeight: 120 }}
                        />
                        <Box display="flex" gap={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={bannerUploading}
                          >
                            {bannerUploading ? "Enviando…" : "Alterar banner"}
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="secondary"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => setFormData({
                              ...formData,
                              settings: { ...formData.settings, bannerUrl: "" },
                            })}
                          >
                            Remover banner
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={bannerUploading}
                      >
                        {bannerUploading ? "Enviando…" : "Enviar banner"}
                      </Button>
                    )}
                  </Box>
                </Grid>
              )}
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

            {!isMenuForm && (
              <>
            <Typography className={classes.sectionTitle} style={{ marginTop: 32 }}>
              Personalização visual
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
              Ajuste a aparência do formulário para combinar com sua marca
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Fonte</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.fontFamily || "inherit"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            fontFamily: e.target.value,
                          },
                        },
                      })
                    }
                    label="Fonte"
                  >
                    <MenuItem value="inherit">Padrão do sistema</MenuItem>
                    <MenuItem value="'Inter', sans-serif">Inter</MenuItem>
                    <MenuItem value="'Poppins', sans-serif">Poppins</MenuItem>
                    <MenuItem value="'Montserrat', sans-serif">Montserrat</MenuItem>
                    <MenuItem value="'Open Sans', sans-serif">Open Sans</MenuItem>
                    <MenuItem value="'Playfair Display', serif">Playfair Display</MenuItem>
                    <MenuItem value="'Source Serif 4', serif">Source Serif 4</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Largura máxima</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.maxWidth || "600"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            maxWidth: e.target.value,
                          },
                        },
                      })
                    }
                    label="Largura máxima"
                  >
                    <MenuItem value="480">Compacto (480px)</MenuItem>
                    <MenuItem value="560">Médio (560px)</MenuItem>
                    <MenuItem value="600">Padrão (600px)</MenuItem>
                    <MenuItem value="720">Amplo (720px)</MenuItem>
                    <MenuItem value="900">Extra amplo (900px)</MenuItem>
                    <MenuItem value="full">Largura total</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Bordas do card</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.borderRadius || "12"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            borderRadius: e.target.value,
                          },
                        },
                      })
                    }
                    label="Bordas do card"
                  >
                    <MenuItem value="0">Reto</MenuItem>
                    <MenuItem value="8">Suave (8px)</MenuItem>
                    <MenuItem value="12">Padrão (12px)</MenuItem>
                    <MenuItem value="16">Arredondado (16px)</MenuItem>
                    <MenuItem value="24">Bem arredondado (24px)</MenuItem>
                    <MenuItem value="9999">Pílula</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Sombra</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.boxShadow || "medium"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            boxShadow: e.target.value,
                          },
                        },
                      })
                    }
                    label="Sombra"
                  >
                    <MenuItem value="none">Nenhuma</MenuItem>
                    <MenuItem value="soft">Suave</MenuItem>
                    <MenuItem value="medium">Média</MenuItem>
                    <MenuItem value="strong">Forte</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Estilo dos campos</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.fieldStyle || "outlined"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            fieldStyle: e.target.value,
                          },
                        },
                      })
                    }
                    label="Estilo dos campos"
                  >
                    <MenuItem value="outlined">Contornado</MenuItem>
                    <MenuItem value="filled">Preenchido</MenuItem>
                    <MenuItem value="standard">Sublinhado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Estilo do botão</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.buttonStyle || "rounded"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            buttonStyle: e.target.value,
                          },
                        },
                      })
                    }
                    label="Estilo do botão"
                  >
                    <MenuItem value="rounded">Arredondado</MenuItem>
                    <MenuItem value="pill">Pílula</MenuItem>
                    <MenuItem value="sharp">Reto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Fundo do card</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.backgroundStyle || "solid"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            backgroundStyle: e.target.value,
                          },
                        },
                      })
                    }
                    label="Fundo do card"
                  >
                    <MenuItem value="solid">Sólido (cor primária clara)</MenuItem>
                    <MenuItem value="white">Branco</MenuItem>
                    <MenuItem value="gradient">Gradiente sutil</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Fundo da página</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.pageBackground || "default"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            pageBackground: e.target.value,
                          },
                        },
                      })
                    }
                    label="Fundo da página"
                  >
                    <MenuItem value="default">Cinza claro</MenuItem>
                    <MenuItem value="white">Branco</MenuItem>
                    <MenuItem value="dark">Escuro</MenuItem>
                    <MenuItem value="gradient">Gradiente</MenuItem>
                    <MenuItem value="pattern">Padrão sutil</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tamanho do título</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.titleSize || "default"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            titleSize: e.target.value,
                          },
                        },
                      })
                    }
                    label="Tamanho do título"
                  >
                    <MenuItem value="small">Pequeno</MenuItem>
                    <MenuItem value="default">Padrão</MenuItem>
                    <MenuItem value="large">Grande</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Espaçamento</InputLabel>
                  <Select
                    value={formData.settings?.appearance?.spacing || "default"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          appearance: {
                            ...(formData.settings?.appearance || {}),
                            spacing: e.target.value,
                          },
                        },
                      })
                    }
                    label="Espaçamento"
                  >
                    <MenuItem value="compact">Compacto</MenuItem>
                    <MenuItem value="default">Padrão</MenuItem>
                    <MenuItem value="relaxed">Amplo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
              </>
            )}
          </Box>
        )}

        {currentTabKey === "integracoes" && (
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
              {formData.settings?.formType === "cardapio" &&
                formData.settings?.showMesaField &&
                formData.settings?.mesas !== false &&
                !formData.createContact && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="error">
                      Com "Exibir campo Número da mesa" ativo, é recomendável manter "Criar Contato" ativado para que a mesa seja ocupada automaticamente quando o cliente pedir pelo cardápio.
                    </Typography>
                  </Grid>
                )}
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
              <Grid item xs={12}>
                <TextField
                  label="Mensagem WhatsApp (pré-definida)"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.settings?.whatsAppMessage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        whatsAppMessage: e.target.value,
                      },
                    })
                  }
                  variant="outlined"
                  placeholder="Digite a mensagem que será enviada automaticamente quando o botão WhatsApp for clicado"
                  helperText="Esta mensagem será enviada diretamente através da plataforma quando o botão WhatsApp for clicado nas respostas do formulário. Requer que 'Criar Ticket' esteja ativado."
                />
              </Grid>
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

            {/* Condições de exibição */}
            <Grid item xs={12}>
              <Divider style={{ margin: "16px 0" }} />
              <Typography variant="subtitle2" style={{ marginBottom: 8, fontWeight: 600 }}>
                Exibição condicional
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={fieldForm.hasConditional || false}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        hasConditional: e.target.checked,
                        conditionalFieldId: e.target.checked ? fieldForm.conditionalFieldId : null,
                        conditionalRules: e.target.checked ? (fieldForm.conditionalRules || { operator: "equals", value: "" }) : {},
                      })
                    }
                  />
                }
                label="Exibir este campo apenas quando outra resposta atender à condição"
              />
              {fieldForm.hasConditional && (() => {
                const availableFields = isMenuForm
                  ? (formData.settings?.finalizeFields || [])
                  : formData.fields;
                const fieldsBeforeCurrent = availableFields.filter((f, idx) =>
                  editingField !== null ? idx < editingField : idx < availableFields.length
                );
                const getSourceField = () => {
                  const id = fieldForm.conditionalFieldId;
                  if (id == null || id === "") return null;
                  const byId = availableFields.find((f) => f.id === id);
                  if (byId) return byId;
                  const byIdx = availableFields[Number(id)];
                  return byIdx || null;
                };
                const sourceField = getSourceField();
                const rules = fieldForm.conditionalRules || {};
                const needsValue = !["isEmpty", "isNotEmpty", "isTrue", "isFalse"].includes(rules.operator);
                const hasOptions = sourceField && ["select", "radio", "checkbox"].includes(sourceField.fieldType);
                return (
                  <Box style={{ marginTop: 16, padding: 16, backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 8 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>Campo que determina a visibilidade</InputLabel>
                          <Select
                            value={fieldForm.conditionalFieldId ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const isIndex = typeof val === "string" && val.startsWith("idx-");
                              setFieldForm({
                                ...fieldForm,
                                conditionalFieldId: val !== "" ? (isIndex ? val : (typeof val === "number" ? val : Number(val))) : null,
                                conditionalFieldIndex: isIndex ? parseInt(val.replace("idx-", ""), 10) : undefined,
                                conditionalRules: { ...rules, operator: rules.operator || "equals", value: rules.value ?? "" },
                              });
                            }}
                            label="Campo que determina a visibilidade"
                          >
                            <MenuItem value="">
                              <em>Selecione um campo</em>
                            </MenuItem>
                            {availableFields
                              .filter((f, idx) => editingField === null || idx < editingField)
                              .map((f, idx) => {
                                const val = f.id != null ? f.id : `idx-${idx}`;
                                return (
                                  <MenuItem key={val} value={val}>
                                    {f.label || `Campo ${idx + 1}`}
                                  </MenuItem>
                                );
                              })}
                          </Select>
                        </FormControl>
                      </Grid>
                      {fieldForm.conditionalFieldId != null && fieldForm.conditionalFieldId !== "" && (
                        <>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined" size="small">
                              <InputLabel>Condição</InputLabel>
                              <Select
                                value={rules.operator || "equals"}
                                onChange={(e) =>
                                  setFieldForm({
                                    ...fieldForm,
                                    conditionalRules: { ...rules, operator: e.target.value, value: rules.value ?? "" },
                                  })
                                }
                                label="Condição"
                              >
                                <MenuItem value="equals">é igual a</MenuItem>
                                <MenuItem value="notEquals">é diferente de</MenuItem>
                                <MenuItem value="contains">contém</MenuItem>
                                <MenuItem value="isEmpty">está vazio</MenuItem>
                                <MenuItem value="isNotEmpty">está preenchido</MenuItem>
                                <MenuItem value="isTrue">é verdadeiro / está marcado</MenuItem>
                                <MenuItem value="isFalse">é falso / não está marcado</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          {needsValue && (
                            <Grid item xs={12} md={6}>
                              {hasOptions ? (
                                <FormControl fullWidth variant="outlined" size="small">
                                  <InputLabel>Valor</InputLabel>
                                  <Select
                                    value={rules.value ?? ""}
                                    onChange={(e) =>
                                      setFieldForm({
                                        ...fieldForm,
                                        conditionalRules: { ...rules, value: e.target.value },
                                      })
                                    }
                                    label="Valor"
                                  >
                                    {(sourceField.options || []).map((opt, i) => (
                                      <MenuItem key={i} value={opt}>{opt}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              ) : (
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Valor"
                                  variant="outlined"
                                  value={rules.value ?? ""}
                                  onChange={(e) =>
                                    setFieldForm({
                                      ...fieldForm,
                                      conditionalRules: { ...rules, value: e.target.value },
                                    })
                                  }
                                  placeholder='Ex: "Sim", "Não", texto específico'
                                />
                              )}
                            </Grid>
                          )}
                        </>
                      )}
                    </Grid>
                  </Box>
                );
              })()}
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
