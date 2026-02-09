import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  makeStyles,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Divider,
  Fab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";

import InputMask from "react-input-mask";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { isFieldVisible } from "../../utils/formUtils";
import { getFormAppearanceStyles, FONT_IMPORTS } from "../../utils/formAppearanceStyles";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: theme.spacing(3),
    backgroundColor: theme.palette.type === "dark" ? "#121212" : "#f5f5f5",
  },
  container: {
    maxWidth: 900,
    width: "100%",
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  formPaper: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[3],
  },
  header: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
  },
  logo: {
    maxWidth: 150,
    maxHeight: 80,
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  description: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  tabsContainer: {
    marginBottom: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  productCard: {
    marginBottom: theme.spacing(2),
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  productImage: {
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  productCardContent: {
    display: "flex",
    alignItems: "flex-start",
  },
  productName: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  productDescription: {
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    marginBottom: theme.spacing(1),
  },
  productValue: {
    fontWeight: 600,
    color: theme.palette.primary.main,
    fontSize: "1.1rem",
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  quantityInput: {
    width: 80,
  },
  fieldContainer: {
    marginBottom: theme.spacing(3),
  },
  summaryCard: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.type === "dark" 
      ? "rgba(255, 255, 255, 0.05)" 
      : "rgba(0, 0, 0, 0.02)",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  submitButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5),
    fontSize: "1rem",
    fontWeight: 600,
  },
  successMessage: {
    padding: theme.spacing(3),
    textAlign: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 1300,
    [theme.breakpoints.up("sm")]: {
      bottom: theme.spacing(4),
      right: theme.spacing(4),
    },
  },
}));

const PublicMenuForm = ({
  form,
  slug: formSlug,
  initialProducts,
  initialMesaFromQR,
  initialOrderToken,
  initialMesaValue,
}) => {
  const classes = useStyles();
  const location = useLocation();
  const { slug: urlSlug } = useParams();
  const slug = form?.slug || formSlug || urlSlug;

  const [loading, setLoading] = useState(!initialProducts);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState(initialProducts || []);
  const [selectedItems, setSelectedItems] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [groups, setGroups] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [mesaValue, setMesaValue] = useState(initialMesaValue ?? "");
  const [mesaFromQR, setMesaFromQR] = useState(initialMesaFromQR ?? null);
  const [loadingMesa, setLoadingMesa] = useState(false);
  const [orderToken, setOrderToken] = useState(initialOrderToken ?? null);
  const [halfAndHalfItems, setHalfAndHalfItems] = useState([]);
  const [halfAndHalfModalOpen, setHalfAndHalfModalOpen] = useState(false);
  const [halfAndHalfModalProduct, setHalfAndHalfModalProduct] = useState(null);
  const [halfAndHalfModalHalf1, setHalfAndHalfModalHalf1] = useState("");
  const [halfAndHalfModalHalf2, setHalfAndHalfModalHalf2] = useState("");
  const [halfAndHalfModalQty, setHalfAndHalfModalQty] = useState(1);

  const appStyles = form ? getFormAppearanceStyles(form) : null;
  const fieldVariant = appStyles?.fieldVariant || "outlined";

  useEffect(() => {
    const app = form?.settings?.appearance || {};
    const fontFamily = app.fontFamily;
    if (!fontFamily || fontFamily === "inherit") return;
    const fontImport = FONT_IMPORTS[fontFamily];
    if (!fontImport) return;
    const link = document.createElement("link");
    link.href = fontImport;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, [form?.settings?.appearance?.fontFamily]);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      const filtered = initialProducts.filter((p) => !p.variablePrice);
      setProducts(filtered);
      const groupsMap = {};
      filtered.forEach((p) => {
        const g = p.grupo || "Outros";
        if (!groupsMap[g]) groupsMap[g] = [];
        groupsMap[g].push(p);
      });
      setGroups(Object.keys(groupsMap).sort());
      setLoading(false);
      return;
    }
    if (form && slug) {
      loadProducts();
    }
  }, [form, slug, initialProducts]);

  useEffect(() => {
    if (form?.settings?.showMesaField && (form.settings?.mesaFieldMode || "select") === "select" && slug) {
      api.get(`/public/forms/${slug}/mesas`).then(({ data }) => {
        setMesas(data.mesas || []);
      }).catch(() => setMesas([]));
    }
  }, [form?.settings?.showMesaField, form?.settings?.mesaFieldMode, slug]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlMesa = searchParams.get("mesa");
    if (urlMesa) setMesaValue(urlMesa);
  }, [location.search]);

  // QR da mesa: buscar status da mesa (ocupada = não pedir nome/telefone). Passar t= para link assinado.
  // Quando initialOrderToken/initialMesaFromQR vêm do link da mesa (/mesa/:id/cardapio), não refetch.
  useEffect(() => {
    if (initialOrderToken != null && initialMesaFromQR != null) {
      if (initialMesaFromQR.status === "ocupada" && initialMesaFromQR.contact && form?.fields) {
        setAnswers((prev) => {
          const next = { ...prev };
          form.fields.forEach((field) => {
            if (field.metadata?.autoFieldType === "name" && initialMesaFromQR.contact?.name) {
              next[field.id] = initialMesaFromQR.contact.name;
            } else if (field.metadata?.autoFieldType === "phone" && initialMesaFromQR.contact?.number) {
              next[field.id] = initialMesaFromQR.contact.number;
            }
          });
          return next;
        });
      }
      return;
    }
    const searchParams = new URLSearchParams(location.search);
    const mesaId = searchParams.get("mesa");
    const t = searchParams.get("t");
    if (!form || !slug || !mesaId) {
      setMesaFromQR(null);
      setOrderToken(null);
      return;
    }
    setLoadingMesa(true);
    const params = t ? { t } : {};
    api.get(`/public/forms/${slug}/mesas/${mesaId}`, { params })
      .then(({ data }) => {
        setMesaFromQR(data);
        setMesaValue(String(data.id));
        if (data.orderToken) setOrderToken(data.orderToken);
        else setOrderToken(null);
        if (data.status === "ocupada" && data.contact && form?.fields) {
          setAnswers((prev) => {
            const next = { ...prev };
            form.fields.forEach((field) => {
              if (field.metadata?.autoFieldType === "name" && data.contact?.name) {
                next[field.id] = data.contact.name;
              } else if (field.metadata?.autoFieldType === "phone" && data.contact?.number) {
                next[field.id] = data.contact.number;
              }
            });
            return next;
          });
        }
      })
      .catch(() => {
        setMesaFromQR(null);
        setOrderToken(null);
      })
      .finally(() => setLoadingMesa(false));
  }, [form?.id, slug, location.search, initialOrderToken, initialMesaFromQR]);

  useEffect(() => {
    // Ler parâmetros da URL
    const searchParams = new URLSearchParams(location.search);
    const urlName = searchParams.get("name") || searchParams.get("nome");
    const urlPhone = searchParams.get("phone") || searchParams.get("telefone");
    
    // Preencher campos automáticos se vierem na URL
    if (form?.fields) {
      const initialAnswers = {};
      form.fields.forEach((field) => {
        if (field.metadata?.autoFieldType === "name") {
          initialAnswers[field.id] = urlName || "";
        } else if (field.metadata?.autoFieldType === "phone") {
          // Pré-preencher com "55" se não vier da URL
          initialAnswers[field.id] = urlPhone || "55";
        } else {
          // Inicializar outros campos vazios
          initialAnswers[field.id] = "";
        }
      });
      setAnswers(initialAnswers);
    }
  }, [form, location.search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Buscar produtos de cardápio via rota pública usando o slug do formulário
      const { data } = await api.get(`/public/forms/${slug}/products`);

      const allProducts = data.products || [];
      const filtered = allProducts.filter((p) => !p.variablePrice);
      setProducts(filtered);

      // Agrupar produtos por grupo (apenas os exibidos, sem preço variável)
      const groupsMap = {};
      filtered.forEach((product) => {
        const grupo = product.grupo || "Outros";
        if (!groupsMap[grupo]) {
          groupsMap[grupo] = [];
        }
        groupsMap[grupo].push(product);
      });

      const groupsList = Object.keys(groupsMap).sort();
      setGroups(groupsList);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, delta) => {
    setSelectedItems((prev) => {
      const current = prev[productId] || 0;
      const newQuantity = Math.max(0, current + delta);
      if (newQuantity === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleQuantityInput = (productId, value) => {
    const quantity = parseInt(value) || 0;
    if (quantity <= 0) {
      setSelectedItems((prev) => {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setSelectedItems((prev) => ({ ...prev, [productId]: quantity }));
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Limpar erro do campo
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validar que pelo menos um produto foi selecionado (normal ou meio a meio)
    if (Object.keys(selectedItems).length === 0 && halfAndHalfItems.length === 0) {
      toast.error("Selecione pelo menos um produto");
      isValid = false;
    }

    // Obter campos de finalizar da mesma forma que são renderizados
    const allFormFields = form.fields || [];
    const finalizeFields = allFormFields.filter(
      (f) => !f.metadata?.isAutoField && f.order >= 2
    );

    // Validar campos obrigatórios de finalizar (apenas os visíveis)
    const allFormFieldsSorted = [...allFormFields].sort((a, b) => a.order - b.order);
    finalizeFields.forEach((field) => {
      if (!isFieldVisible(field, answers, allFormFieldsSorted)) return;
      if (field.isRequired) {
        const answer = answers[field.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === "string" && answer.trim() === "")) {
          newErrors[field.id] = `${field.label} é obrigatório`;
          isValid = false;
        }
      }
    });

    // Validar campos automáticos obrigatórios (nome e telefone) — dispensar se mesa ocupada (QR)
    const mesaOcupadaFromQR = mesaFromQR?.status === "ocupada";
    const autoFields = form.fields?.filter(
      (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
    ) || [];
    if (!mesaOcupadaFromQR) {
      autoFields.forEach((field) => {
        if (field.isRequired) {
          const answer = answers[field.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === "string" && answer.trim() === "")) {
            newErrors[field.id] = `${field.label} é obrigatório`;
            isValid = false;
          }
        }
      });
    }

    // Se houver erros, mostrar toast
    if (!isValid && Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("[PublicMenuForm] handleSubmit chamado", { 
      selectedItems: Object.keys(selectedItems).length, 
      totalItems: getTotalItems(),
      formId: form?.id 
    });

    const isValid = validateForm();
    if (!isValid) {
      console.log("[PublicMenuForm] Validação falhou");
      return;
    }

    console.log("[PublicMenuForm] Validação passou, iniciando envio");

    setSubmitting(true);

    try {
      // Preparar menuItems (normais + meio a meio)
      const normalMenuItems = Object.keys(selectedItems).map((productId) => {
        const product = products.find((p) => p.id === parseInt(productId));
        return {
          productId: parseInt(productId),
          quantity: selectedItems[productId],
          productName: product?.name,
          productValue: product?.value,
          grupo: product?.grupo || "Outros",
        };
      });
      const halfMenuItems = halfAndHalfItems.map((item) => ({
        type: "halfAndHalf",
        productId: item.baseProductId,
        quantity: item.quantity,
        half1ProductId: item.half1ProductId,
        half2ProductId: item.half2ProductId,
        grupo: products.find((p) => p.id === item.baseProductId)?.grupo || "Outros",
      }));
      const menuItems = [...normalMenuItems, ...halfMenuItems];

      // Preparar answers - incluir TODOS os campos do formulário (automáticos + customizados)
      const allFormFields = form.fields || [];
      const answersArray = [];
      
      // Adicionar TODAS as respostas (automáticas e customizadas)
      allFormFields.forEach((field) => {
        const answer = answers[field.id];
        if (answer !== undefined && answer !== null && answer !== "") {
          answersArray.push({
            fieldId: field.id,
            answer: answer,
          });
        }
      });

      // Mesa ocupada (QR): preencher Nome/Telefone/Tipo de pedido obrigatórios com dados do contato da mesa
      const mesaOcupadaFromQR = mesaFromQR?.status === "ocupada" && mesaFromQR?.contact;
      if (mesaOcupadaFromQR) {
        const contact = mesaFromQR.contact;
        const labelLower = (l) => (l || "").trim().toLowerCase();
        const hasAnswer = (fieldId) => answersArray.some((a) => a.fieldId === fieldId);
        allFormFields.forEach((field) => {
          if (hasAnswer(field.id)) return;
          if (field.metadata?.autoFieldType === "name" || (field.isRequired && labelLower(field.label).includes("nome") && !labelLower(field.label).includes("sobrenome"))) {
            answersArray.push({ fieldId: field.id, answer: contact.name || "Cliente" });
          } else if (field.metadata?.autoFieldType === "phone" || (field.isRequired && (field.fieldType === "phone" || labelLower(field.label).includes("telefone")))) {
            answersArray.push({ fieldId: field.id, answer: contact.number || "Não informado" });
          }
        });
        const tipoPedidoField = allFormFields.find(
          (f) => f.isRequired && labelLower(f.label).includes("tipo") && labelLower(f.label).includes("pedido")
        );
        if (tipoPedidoField && !hasAnswer(tipoPedidoField.id)) {
          answersArray.push({ fieldId: tipoPedidoField.id, answer: "Mesa" });
        }
      }

      // Metadata com mesa e orderType (QR da mesa ou campo mesa configurado)
      let orderMetadata = {};
      const mesasEnabled = form.settings?.mesas !== false;
      const deliveryEnabled = form.settings?.delivery !== false;
      if (mesaFromQR && mesaValue) {
        orderMetadata.tableId = mesaFromQR.id;
        orderMetadata.tableNumber = mesaFromQR.number || mesaFromQR.name || String(mesaFromQR.id);
        orderMetadata.orderType = "mesa";
      } else if (form.settings?.showMesaField && mesaValue && mesasEnabled) {
        const isSelect = (form.settings?.mesaFieldMode || "select") === "select";
        const mesaId = isSelect ? parseInt(mesaValue, 10) : null;
        const mesa = mesas.find((m) => m.id === parseInt(mesaValue, 10));
        const mesaNumber = isSelect ? (mesa?.number || mesa?.name || mesaValue) : mesaValue;
        if (mesaId) orderMetadata.tableId = mesaId;
        orderMetadata.tableNumber = mesaNumber;
        orderMetadata.orderType = "mesa";
      } else if (mesaValue && mesasEnabled) {
        const mesaIdNum = parseInt(mesaValue, 10);
        if (!Number.isNaN(mesaIdNum)) {
          orderMetadata.tableId = mesaIdNum;
          orderMetadata.tableNumber = mesas.find((m) => m.id === mesaIdNum)?.number || mesas.find((m) => m.id === mesaIdNum)?.name || mesaValue;
          orderMetadata.orderType = "mesa";
        }
      }
      if (!orderMetadata.tableId && deliveryEnabled) {
        orderMetadata.orderType = "delivery";
      } else if (!orderMetadata.tableId) {
        orderMetadata.orderType = mesasEnabled ? "mesa" : "delivery";
      }

      // Enviar formulário (orderToken garante que o pedido vá para a mesa do link assinado)
      const response = await api.post(`/public/forms/${form.slug}/submit`, {
        answers: answersArray,
        menuItems,
        ...(Object.keys(orderMetadata).length > 0 && { metadata: orderMetadata }),
        ...(orderToken && { orderToken }),
      });

      const customerName = answers[autoFields.find((f) => f.metadata?.autoFieldType === "name")?.id] || "";
      const mesaNumberDisplay = mesaFromQR
        ? (mesaFromQR.number || mesaFromQR.name || String(mesaFromQR.id))
        : (form.settings?.showMesaField && mesaValue
          ? ((form.settings?.mesaFieldMode || "select") === "select" ? (mesas.find((m) => m.id === parseInt(mesaValue, 10))?.number || mesaValue) : mesaValue)
          : "");
      // Preparar dados do pedido para exibição (com responsável da mesa para confirmação)
      const displayMenuItems = menuItems.map((item) => {
        if (item.type === "halfAndHalf") {
          const base = products.find((p) => p.id === item.productId);
          const half1 = products.find((p) => p.id === item.half1ProductId);
          const half2 = products.find((p) => p.id === item.half2ProductId);
          const unitVal = computeHalfAndHalfUnitValue(base, half1, half2);
          const productName = base && half1 && half2
            ? `${base.name} - Metade ${half1.name} / Metade ${half2.name}`
            : "Meio a meio";
          return {
            ...item,
            productName,
            productValue: unitVal,
            total: unitVal * item.quantity,
          };
        }
        return {
          ...item,
          total: (item.productValue || 0) * item.quantity,
        };
      });
      const orderInfo = {
        menuItems: displayMenuItems,
        total: calculateTotal(),
        totalItems: getTotalItems(),
        customerName,
        customerPhone: answers[autoFields.find((f) => f.metadata?.autoFieldType === "phone")?.id] || "",
        responsavelMesa: customerName,
        mesaNumber: mesaNumberDisplay,
        customFields: [
          ...(mesaNumberDisplay ? [{ label: "Mesa", value: mesaNumberDisplay }] : []),
          ...finalizeFields.map((field) => ({
            label: field.label,
            value: answers[field.id] || "",
          })),
        ],
        averageDeliveryTime: form.settings?.averageDeliveryTime || "",
      };
      setOrderData(orderInfo);

      // Pedido salvo; envio WhatsApp é em segundo plano — não bloqueia a tela
      setSubmitted(true);
      if (response.data?.whatsappSent === "pending") {
        toast.info("Pedido enviado! A confirmação por WhatsApp será enviada em instantes.");
      } else if (response.data?.whatsappSent === false && response.data?.whatsappError) {
        toast.warn("Pedido salvo. " + (response.data.whatsappError || ""));
      }
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = answers[field.id] || "";
    const error = errors[field.id];
    const hasError = !!error;

    switch (field.fieldType) {
      case "text":
      case "email":
        return (
          <TextField
            fullWidth
            variant={fieldVariant}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
            required={field.isRequired}
            label={field.label}
          />
        );
      case "phone": {
        const phoneValue = field.metadata?.autoFieldType === "phone"
          ? (value || "55")
          : value;
        return (
          <InputMask
            mask="55(99)9999-9999"
            maskChar={null}
            value={phoneValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          >
            {(inputProps) => (
              <TextField
                {...inputProps}
                fullWidth
                variant={fieldVariant}
                type="text"
                placeholder="55(99)9999-9999"
                error={hasError}
                helperText={error || field.helpText}
                required={field.isRequired}
                label={field.label}
                InputProps={{
                  startAdornment: field.metadata?.autoFieldType === "phone" ? (
                    <InputAdornment position="start">+</InputAdornment>
                  ) : null,
                }}
              />
            )}
          </InputMask>
        );
      }
      case "number":
        return (
          <TextField
            fullWidth
            variant={fieldVariant}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
            required={field.isRequired}
            label={field.label}
          />
        );

      case "textarea":
        return (
          <TextField
            fullWidth
            variant={fieldVariant}
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={hasError}
            helperText={error || field.helpText}
            required={field.isRequired}
            label={field.label}
          />
        );

      case "select":
        return (
          <FormControl fullWidth variant={fieldVariant} error={hasError} required={field.isRequired}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              label={field.label}
            >
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {(error || field.helpText) && (
              <FormHelperText>{error || field.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  const getProductsByGroup = (grupo) => {
    return products.filter((p) => (p.grupo || "Outros") === grupo);
  };

  const getFlavorProductsForHalfAndHalf = (baseProduct) => {
    if (!baseProduct) return [];
    const grupoFilter = baseProduct.halfAndHalfGrupo || baseProduct.grupo || null;
    return products.filter((p) => {
      if (grupoFilter) return (p.grupo || "") === grupoFilter;
      return true;
    });
  };

  const computeHalfAndHalfUnitValue = (base, half1, half2) => {
    if (!base || !half1 || !half2) return 0;
    const rule = base.halfAndHalfPriceRule || "max";
    const v1 = parseFloat(half1.value) || 0;
    const v2 = parseFloat(half2.value) || 0;
    if (rule === "max") return Math.max(v1, v2);
    if (rule === "fixed") return parseFloat(base.value) || 0;
    if (rule === "average") return (v1 + v2) / 2;
    return Math.max(v1, v2);
  };

  const openHalfAndHalfModal = (product) => {
    setHalfAndHalfModalProduct(product);
    setHalfAndHalfModalHalf1(String(product.id));
    setHalfAndHalfModalHalf2("");
    setHalfAndHalfModalQty(1);
    setHalfAndHalfModalOpen(true);
  };

  const addHalfAndHalfToCart = () => {
    if (!halfAndHalfModalProduct || !halfAndHalfModalHalf1 || !halfAndHalfModalHalf2 || halfAndHalfModalHalf1 === halfAndHalfModalHalf2) {
      toast.error("Selecione dois sabores diferentes");
      return;
    }
    const qty = Math.max(1, parseInt(halfAndHalfModalQty, 10) || 1);
    setHalfAndHalfItems((prev) => [
      ...prev,
      {
        baseProductId: halfAndHalfModalProduct.id,
        half1ProductId: parseInt(halfAndHalfModalHalf1, 10),
        half2ProductId: parseInt(halfAndHalfModalHalf2, 10),
        quantity: qty,
      },
    ]);
    setHalfAndHalfModalOpen(false);
    setHalfAndHalfModalProduct(null);
  };

  const removeHalfAndHalfItem = (index) => {
    setHalfAndHalfItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selectedItems).forEach((productId) => {
      const product = products.find((p) => p.id === parseInt(productId));
      if (product) {
        total += (product.value || 0) * selectedItems[productId];
      }
    });
    halfAndHalfItems.forEach((item) => {
      const base = products.find((p) => p.id === item.baseProductId);
      const half1 = products.find((p) => p.id === item.half1ProductId);
      const half2 = products.find((p) => p.id === item.half2ProductId);
      total += computeHalfAndHalfUnitValue(base, half1, half2) * item.quantity;
    });
    return total;
  };

  const getTotalItems = () => {
    const normal = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
    const half = halfAndHalfItems.reduce((sum, i) => sum + i.quantity, 0);
    return normal + half;
  };

  if (loading) {
    return (
      <Box className={classes.root} style={appStyles?.rootStyle}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (submitted && orderData) {
    return (
      <Box className={classes.root} style={appStyles?.rootStyle}>
        <Paper className={classes.formPaper} style={appStyles?.formPaperStyle}>
          <Box className={classes.successMessage}>
            {/* Título de Confirmação */}
            <Box style={{ textAlign: "center", marginBottom: 32 }}>
              <Typography variant="h4" gutterBottom style={{ color: form.primaryColor, fontWeight: 600 }}>
                ✅ Pedido Confirmado!
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {form.successMessage || "Seu pedido foi recebido e está sendo processado."}
              </Typography>
            </Box>

            {/* Tempo Médio de Entrega - Destaque */}
            {orderData.averageDeliveryTime && (
              <Box 
                style={{ 
                  backgroundColor: form.primaryColor + "20", 
                  padding: 24, 
                  borderRadius: 12,
                  textAlign: "center",
                  marginBottom: 32,
                  border: `2px solid ${form.primaryColor}40`
                }}
              >
                <Typography variant="h6" style={{ color: form.primaryColor, marginBottom: 8, fontWeight: 600 }}>
                  ⏱️ Tempo Médio de Entrega
                </Typography>
                <Typography variant="h4" style={{ color: form.primaryColor, fontWeight: 700 }}>
                  {orderData.averageDeliveryTime}
                </Typography>
              </Box>
            )}

            {/* Informações do Cliente */}
            <Box style={{ marginBottom: 24, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 16 }}>
                Dados do Cliente
              </Typography>
              
              {orderData.customerName && (
                <Typography variant="body1" style={{ marginBottom: 8 }}>
                  <strong>Nome:</strong> {orderData.customerName}
                </Typography>
              )}
              
              {orderData.customerPhone && (
                <Typography variant="body1">
                  <strong>Telefone:</strong> {orderData.customerPhone}
                </Typography>
              )}
            </Box>

            {/* Itens do Pedido */}
            <Box style={{ marginBottom: 24 }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 16 }}>
                Itens do Pedido
              </Typography>
              
              <Paper style={{ padding: 16, backgroundColor: "#fafafa" }}>
                {orderData.menuItems.map((item, index) => (
                  <Box 
                    key={index} 
                    style={{ 
                      marginBottom: index < orderData.menuItems.length - 1 ? 16 : 0,
                      paddingBottom: index < orderData.menuItems.length - 1 ? 16 : 0,
                      borderBottom: index < orderData.menuItems.length - 1 ? "1px solid #e0e0e0" : "none"
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="body1" style={{ fontWeight: 600, marginBottom: 4 }}>
                          {item.productName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Quantidade: {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
                        </Typography>
                      </Box>
                      <Typography variant="body1" style={{ fontWeight: 600, color: form.primaryColor, marginLeft: 16 }}>
                        R$ {item.total.toFixed(2).replace(".", ",")}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* Resumo Financeiro */}
            <Box style={{ marginBottom: 24, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
                <Typography variant="body1">
                  <strong>Total de itens:</strong>
                </Typography>
                <Typography variant="body1" style={{ fontWeight: 600 }}>
                  {orderData.totalItems} {orderData.totalItems === 1 ? "item" : "itens"}
                </Typography>
              </Box>
              
              <Divider style={{ marginBottom: 12 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" style={{ fontWeight: 600 }}>
                  Total do Pedido:
                </Typography>
                <Typography variant="h5" style={{ color: form.primaryColor, fontWeight: 700 }}>
                  R$ {orderData.total.toFixed(2).replace(".", ",")}
                </Typography>
              </Box>
            </Box>

            {/* Confirmação: responsável pela mesa */}
            {(orderData.mesaNumber || orderData.responsavelMesa) && (
              <Box style={{ marginBottom: 24, padding: 16, backgroundColor: "#e8f5e9", borderRadius: 8 }}>
                <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 12 }}>
                  Confirmação
                </Typography>
                {orderData.mesaNumber && (
                  <Typography variant="body1" style={{ marginBottom: 4 }}>
                    <strong>Mesa:</strong> {orderData.mesaNumber}
                  </Typography>
                )}
                {orderData.responsavelMesa && (
                  <Typography variant="body1">
                    <strong>Responsável pela mesa:</strong> {orderData.responsavelMesa}
                  </Typography>
                )}
              </Box>
            )}

            {/* Informações Adicionais */}
            {orderData.customFields && orderData.customFields.length > 0 && orderData.customFields.some(f => f.value) && (
              <Box style={{ marginBottom: 24, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
                <Typography variant="h6" gutterBottom style={{ fontWeight: 600, marginBottom: 16 }}>
                  Informações Adicionais
                </Typography>
                {orderData.customFields.map((field, index) => (
                  field.value && (
                    <Box key={index} style={{ marginBottom: index < orderData.customFields.length - 1 ? 12 : 0 }}>
                      <Typography variant="body2" style={{ marginBottom: 4, fontWeight: 600 }}>
                        {field.label}:
                      </Typography>
                      <Typography variant="body1" style={{ paddingLeft: 8 }}>
                        {field.value}
                      </Typography>
                    </Box>
                  )
                ))}
              </Box>
            )}

            {form.successRedirectUrl && (
              <Box style={{ textAlign: "center", marginTop: 24 }}>
                <Typography variant="body2" color="textSecondary">
                  Você será redirecionado em instantes...
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box className={classes.root} style={appStyles?.rootStyle}>
        <Paper className={classes.formPaper} style={appStyles?.formPaperStyle}>
          <Box className={classes.successMessage}>
            <Typography variant="h5" gutterBottom>
              {form.successMessage || "Obrigado! Seu pedido foi enviado com sucesso."}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Campos automáticos (nome e telefone)
  const autoFields = form.fields?.filter(
    (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
  ) || [];
  
  // Campos da aba finalizar (campos customizados que não são automáticos, order >= 2)
  const allFormFields = form.fields || [];
  const finalizeFields = allFormFields.filter(
    (f) => !f.metadata?.isAutoField && f.order >= 2
  );

  return (
    <Box className={classes.root} style={appStyles?.rootStyle}>
      <Box className={classes.container} style={appStyles?.containerStyle}>
        <Paper className={classes.formPaper} style={appStyles?.formPaperStyle}>
          {form.logoUrl && form.logoPosition !== "none" && (
            <Box className={classes.header}>
              <img src={form.logoUrl} alt="Logo" className={classes.logo} />
            </Box>
          )}

          <Box className={classes.header}>
            <Typography className={classes.title} style={appStyles?.titleStyle}>
              {form.name}
            </Typography>
            {form.description && (
              <Typography className={classes.description}>{form.description}</Typography>
            )}
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.tabsContainer}
            indicatorColor="primary"
            textColor="primary"
          >
            {groups.map((grupo) => (
              <Tab key={grupo} label={grupo} />
            ))}
            <Tab label="Finalizar" />
          </Tabs>

          {activeTab < groups.length && (
            <Box style={{ marginTop: 24 }}>
              {getProductsByGroup(groups[activeTab]).map((product) => {
                const quantity = selectedItems[product.id] || 0;
                const isHalfAndHalf = product.allowsHalfAndHalf === true;
                return (
                  <Card key={product.id} className={classes.productCard}>
                    <CardContent>
                      <Box className={classes.productCardContent}>
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={classes.productImage}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        )}
                        <Box flex={1}>
                      <Typography className={classes.productName}>
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography className={classes.productDescription}>
                          {product.description}
                        </Typography>
                      )}
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <Typography className={classes.productValue}>
                          R$ {parseFloat(product.value || 0).toFixed(2).replace(".", ",")}
                        </Typography>
                        <Box display="flex" alignItems="center" flexWrap="wrap">
                          {isHalfAndHalf && (
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => openHalfAndHalfModal(product)}
                              style={{ marginRight: 8 }}
                            >
                              Meio a meio
                            </Button>
                          )}
                          <Box className={classes.quantityControl}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(product.id, -1)}
                              disabled={quantity === 0}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <TextField
                              className={classes.quantityInput}
                              type="number"
                              value={quantity}
                              onChange={(e) => handleQuantityInput(product.id, e.target.value)}
                              inputProps={{ min: 0 }}
                              variant={fieldVariant}
                              size="small"
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(product.id, 1)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          <Dialog open={halfAndHalfModalOpen} onClose={() => setHalfAndHalfModalOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Meio a meio - {halfAndHalfModalProduct?.name}</DialogTitle>
            <DialogContent>
              <FormControl fullWidth variant={fieldVariant} size="small" style={{ marginTop: 8 }}>
                <InputLabel>Metade 1</InputLabel>
                <Select
                  value={halfAndHalfModalHalf1}
                  onChange={(e) => setHalfAndHalfModalHalf1(e.target.value)}
                  label="Metade 1"
                >
                  <MenuItem value=""><em>Selecione</em></MenuItem>
                  {halfAndHalfModalProduct && getFlavorProductsForHalfAndHalf(halfAndHalfModalProduct).map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>{p.name} - R$ {parseFloat(p.value || 0).toFixed(2)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth variant={fieldVariant} size="small" style={{ marginTop: 16 }}>
                <InputLabel>Metade 2</InputLabel>
                <Select
                  value={halfAndHalfModalHalf2}
                  onChange={(e) => setHalfAndHalfModalHalf2(e.target.value)}
                  label="Metade 2"
                >
                  <MenuItem value=""><em>Selecione</em></MenuItem>
                  {halfAndHalfModalProduct && getFlavorProductsForHalfAndHalf(halfAndHalfModalProduct).map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>{p.name} - R$ {parseFloat(p.value || 0).toFixed(2)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Quantidade"
                type="number"
                value={halfAndHalfModalQty}
                onChange={(e) => setHalfAndHalfModalQty(e.target.value)}
                inputProps={{ min: 1 }}
                variant={fieldVariant}
                size="small"
                fullWidth
                style={{ marginTop: 16 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setHalfAndHalfModalOpen(false)} color="secondary">Cancelar</Button>
              <Button onClick={addHalfAndHalfToCart} color="primary" variant="contained">Adicionar</Button>
            </DialogActions>
          </Dialog>

          {activeTab === groups.length && (
            <form onSubmit={handleSubmit}>
              <Box style={{ marginTop: 24 }}>
                {halfAndHalfItems.length > 0 && (
                  <Box marginBottom={2} padding={2} bgcolor="action.hover" borderRadius={8}>
                    <Typography variant="subtitle2" gutterBottom>Itens meio a meio</Typography>
                    {halfAndHalfItems.map((item, idx) => {
                      const base = products.find((p) => p.id === item.baseProductId);
                      const h1 = products.find((p) => p.id === item.half1ProductId);
                      const h2 = products.find((p) => p.id === item.half2ProductId);
                      const unitVal = computeHalfAndHalfUnitValue(base, h1, h2);
                      const label = base && h1 && h2
                        ? `${base.name}: ${h1.name} / ${h2.name}`
                        : "Meio a meio";
                      return (
                        <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" style={{ marginTop: 4 }}>
                          <Typography variant="body2">
                            {item.quantity}x {label} — R$ {(unitVal * item.quantity).toFixed(2).replace(".", ",")}
                          </Typography>
                          <IconButton size="small" onClick={() => removeHalfAndHalfItem(idx)} aria-label="Remover">
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                )}
                {/* Mesa fixa por QR: se ocupada, só mostrar "Mesa X - Cliente"; se livre, pedir nome/telefone */}
                {loadingMesa && (
                  <Box className={classes.fieldContainer} style={{ marginBottom: 16 }}>
                    <Typography variant="body2" color="textSecondary">Carregando informações da mesa...</Typography>
                  </Box>
                )}
                {mesaFromQR && !loadingMesa && (
                  <Box className={classes.fieldContainer} style={{ marginBottom: 24 * (appStyles?.spacingMultiplier || 1) }}>
                    <Typography variant="body1" style={{ fontWeight: 600 }}>
                      Mesa {mesaFromQR.number || mesaFromQR.name || mesaFromQR.id}
                    </Typography>
                    {mesaFromQR.status === "ocupada" && mesaFromQR.contact && (
                      <Typography variant="body2" color="textSecondary">
                        Cliente: {mesaFromQR.contact.name || mesaFromQR.contact.number || "—"}
                      </Typography>
                    )}
                  </Box>
                )}
                {/* Campos automáticos (nome e telefone) — ocultar se mesa ocupada (QR) */}
                {!(mesaFromQR?.status === "ocupada") && autoFields.map((field) => (
                  <Box key={field.id} className={classes.fieldContainer} style={{ marginBottom: 24 * (appStyles?.spacingMultiplier || 1) }}>
                    {renderField(field)}
                  </Box>
                ))}

                {/* Campo Mesa (se configurado e form aceita mesas; não mostrar quando mesa veio do QR) */}
                {form.settings?.showMesaField && form.settings?.mesas !== false && !mesaFromQR && (
                  <Box key="mesa-field" className={classes.fieldContainer} style={{ marginBottom: 24 * (appStyles?.spacingMultiplier || 1) }}>
                    {(form.settings?.mesaFieldMode || "select") === "select" ? (
                      <FormControl fullWidth variant={fieldVariant}>
                        <InputLabel>Número da mesa</InputLabel>
                        <Select
                          value={mesaValue}
                          onChange={(e) => setMesaValue(e.target.value)}
                          label="Número da mesa"
                        >
                          <MenuItem value="">
                            <em>Selecione</em>
                          </MenuItem>
                          {mesas.map((m) => (
                            <MenuItem key={m.id} value={String(m.id)}>
                              {m.name || m.number} {m.status === "ocupada" ? "(ocupada)" : ""}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        variant={fieldVariant}
                        label="Número da mesa"
                        value={mesaValue}
                        onChange={(e) => setMesaValue(e.target.value)}
                        placeholder="Ex: Mesa 5"
                      />
                    )}
                  </Box>
                )}

                {/* Campos customizados da aba finalizar */}
                {finalizeFields.map((field) => {
                  const allFormFieldsSorted = [...(form.fields || [])].sort((a, b) => a.order - b.order);
                  if (!isFieldVisible(field, answers, allFormFieldsSorted)) return null;
                  return (
                    <Box key={field.id} className={classes.fieldContainer} style={{ marginBottom: 24 * (appStyles?.spacingMultiplier || 1) }}>
                      {renderField(field)}
                    </Box>
                  );
                })}

                {/* Resumo do pedido */}
                {getTotalItems() > 0 && (
                  <Paper className={classes.summaryCard}>
                    <Typography variant="h6" gutterBottom>
                      Resumo do Pedido
                    </Typography>
                    <Box className={classes.summaryRow}>
                      <Typography>Total de itens:</Typography>
                      <Typography fontWeight={600}>{getTotalItems()}</Typography>
                    </Box>
                    <Box className={classes.summaryRow}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" style={{ color: form.primaryColor }}>
                        R$ {calculateTotal().toFixed(2).replace(".", ",")}
                      </Typography>
                    </Box>
                  </Paper>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className={classes.submitButton}
                  disabled={submitting || getTotalItems() === 0}
                  style={appStyles?.submitButtonStyle}
                  onClick={(e) => {
                    // Fallback: garantir que handleSubmit seja chamado
                    if (!e.defaultPrevented) {
                      handleSubmit(e);
                    }
                  }}
                >
                  {submitting ? "Enviando..." : "Finalizar Pedido"}
                </Button>
              </Box>
            </form>
          )}
        </Paper>
      </Box>

      {/* Botão flutuante: ir para Finalizar */}
      {!submitted && form && groups.length > 0 && (
        <Fab
          color="primary"
          aria-label="Finalizar pedido"
          className={classes.fab}
          onClick={() => setActiveTab(groups.length)}
          style={appStyles?.primaryColor ? { backgroundColor: appStyles.primaryColor } : {}}
        >
          <Badge badgeContent={getTotalItems()} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </Fab>
      )}
    </Box>
  );
};

export default PublicMenuForm;
