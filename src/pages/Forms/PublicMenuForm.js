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
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

import api from "../../services/api";
import toastError from "../../errors/toastError";

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
}));

const PublicMenuForm = ({ form, slug: formSlug }) => {
  const classes = useStyles();
  const location = useLocation();
  const { slug: urlSlug } = useParams();
  // Usar slug do formulário, da prop ou da URL
  const slug = form?.slug || formSlug || urlSlug;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const [activeTab, setActiveTab] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [groups, setGroups] = useState([]);
  const [orderData, setOrderData] = useState(null); // Dados do pedido para exibir na confirmação

  useEffect(() => {
    if (form && slug) {
      loadProducts();
    }
  }, [form, slug]);

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
      setProducts(allProducts);

      // Agrupar produtos por grupo
      const groupsMap = {};
      allProducts.forEach((product) => {
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

    // Validar campos obrigatórios
    const finalizeFields = form.settings?.finalizeFields || [];
    finalizeFields.forEach((field) => {
      if (field.isRequired) {
        const answer = answers[field.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[field.id] = `${field.label} é obrigatório`;
          isValid = false;
        }
      }
    });

    // Validar que pelo menos um produto foi selecionado
    if (Object.keys(selectedItems).length === 0) {
      toast.error("Selecione pelo menos um produto");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Preparar menuItems
      const menuItems = Object.keys(selectedItems).map((productId) => {
        const product = products.find((p) => p.id === parseInt(productId));
        return {
          productId: parseInt(productId),
          quantity: selectedItems[productId],
          productName: product?.name,
          productValue: product?.value,
          grupo: product?.grupo || "Outros",
        };
      });

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

      // Enviar formulário
      const response = await api.post(`/public/forms/${form.slug}/submit`, {
        answers: answersArray,
        menuItems,
      });

      // Preparar dados do pedido para exibição
      const orderInfo = {
        menuItems: menuItems.map((item) => ({
          ...item,
          total: (item.productValue || 0) * item.quantity,
        })),
        total: calculateTotal(),
        totalItems: getTotalItems(),
        customerName: answers[autoFields.find((f) => f.metadata?.autoFieldType === "name")?.id] || "",
        customerPhone: answers[autoFields.find((f) => f.metadata?.autoFieldType === "phone")?.id] || "",
        customFields: finalizeFields.map((field) => ({
          label: field.label,
          value: answers[field.id] || "",
        })),
        averageDeliveryTime: form.settings?.averageDeliveryTime || "",
      };
      setOrderData(orderInfo);

      // Verificar se precisa enviar WhatsApp e aguardar confirmação
      if (response.data?.whatsappSent !== undefined) {
        setSendingWhatsApp(true);
        
        // Aguardar confirmação do envio (já foi enviado no backend, mas aguardamos a resposta)
        if (response.data.whatsappSent) {
          // Mensagem enviada com sucesso
          setTimeout(() => {
            setSendingWhatsApp(false);
            setSubmitted(true);
          }, 1000); // Pequeno delay para mostrar a confirmação
        } else {
          // Erro ao enviar mensagem
          setSendingWhatsApp(false);
          toast.error(response.data.whatsappError || "Pedido salvo, mas houve erro ao enviar mensagem WhatsApp");
          setSubmitted(true);
        }
      } else {
        // Se não for cardápio ou não tiver WhatsApp configurado, apenas mostrar sucesso
        setSubmitted(true);
      }
    } catch (err) {
      toastError(err);
      setSendingWhatsApp(false);
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
      case "phone":
        // Garantir que campo telefone sempre tenha "55" como valor padrão se for campo automático
        const phoneValue = field.metadata?.autoFieldType === "phone" 
          ? (value || "55") 
          : value;
        return (
          <TextField
            fullWidth
            variant="outlined"
            type="text"
            value={phoneValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || "55"}
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
        );
      case "number":
        return (
          <TextField
            fullWidth
            variant="outlined"
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
            variant="outlined"
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
          <FormControl fullWidth variant="outlined" error={hasError} required={field.isRequired}>
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

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selectedItems).forEach((productId) => {
      const product = products.find((p) => p.id === parseInt(productId));
      if (product) {
        total += (product.value || 0) * selectedItems[productId];
      }
    });
    return total;
  };

  const getTotalItems = () => {
    return Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
  };

  if (loading) {
    return (
      <Box className={classes.root}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (sendingWhatsApp) {
    return (
      <Box className={classes.root}>
        <Paper className={classes.formPaper}>
          <Box className={classes.loadingContainer} style={{ flexDirection: "column", gap: 16, padding: 40 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" style={{ marginTop: 16 }}>
              Enviando mensagem WhatsApp...
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Aguarde enquanto confirmamos o envio da mensagem
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (submitted && orderData) {
    return (
      <Box className={classes.root}>
        <Paper className={classes.formPaper}>
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
      <Box className={classes.root}>
        <Paper className={classes.formPaper}>
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
    <Box className={classes.root}>
      <Box className={classes.container}>
        <Paper className={classes.formPaper}>
          {form.logoUrl && form.logoPosition !== "none" && (
            <Box className={classes.header}>
              <img src={form.logoUrl} alt="Logo" className={classes.logo} />
            </Box>
          )}

          <Box className={classes.header}>
            <Typography className={classes.title} style={{ color: form.primaryColor }}>
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
                return (
                  <Card key={product.id} className={classes.productCard}>
                    <CardContent>
                      <Typography className={classes.productName}>
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography className={classes.productDescription}>
                          {product.description}
                        </Typography>
                      )}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography className={classes.productValue}>
                          R$ {parseFloat(product.value || 0).toFixed(2).replace(".", ",")}
                        </Typography>
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
                            variant="outlined"
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
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          {activeTab === groups.length && (
            <form onSubmit={handleSubmit}>
              <Box style={{ marginTop: 24 }}>
                {/* Campos automáticos (nome e telefone) */}
                {autoFields.map((field) => (
                  <Box key={field.id} className={classes.fieldContainer}>
                    {renderField(field)}
                  </Box>
                ))}

                {/* Campos customizados da aba finalizar */}
                {finalizeFields.map((field) => (
                  <Box key={field.id} className={classes.fieldContainer}>
                    {renderField(field)}
                  </Box>
                ))}

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
                  style={{ backgroundColor: form.primaryColor }}
                >
                  {submitting ? "Enviando..." : "Finalizar Pedido"}
                </Button>
              </Box>
            </form>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default PublicMenuForm;
