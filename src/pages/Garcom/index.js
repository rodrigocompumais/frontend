import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { toast } from "react-toastify";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import ContactModal from "../../components/ContactModal";

const filter = createFilterOptions({ trim: true });

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: 600,
    margin: "0 auto",
    paddingBottom: 120,
  },
  mesaBar: {
    display: "flex",
    gap: theme.spacing(1),
    overflowX: "auto",
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(2),
    "&::-webkit-scrollbar": { height: 4 },
  },
  mesaChip: {
    flexShrink: 0,
    cursor: "pointer",
  },
  productCard: {
    marginBottom: theme.spacing(1),
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  summaryBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[4],
  },
}));

const Garcom = () => {
  const classes = useStyles();
  const history = useHistory();
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();
  const [mesas, setMesas] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newContactInitial, setNewContactInitial] = useState({});
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [searchContact, setSearchContact] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
    }
  }, [hasLanchonetes, modulesLoading, history]);

  useEffect(() => {
    if (!hasLanchonetes) return;
    const load = async () => {
      setLoading(true);
      try {
        const [mesasRes, formsRes] = await Promise.all([
          api.get("/mesas"),
          api.get("/forms?formType=cardapio"),
        ]);
        setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
        const forms = formsRes.data?.forms || [];
        const firstForm = forms[0];
        setForm(firstForm || null);
        if (firstForm?.slug) {
          const { data } = await api.get(`/public/forms/${firstForm.slug}/products`);
          setProducts(data.products || []);
        }
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hasLanchonetes]);

  useEffect(() => {
    if (!clienteModalOpen || searchContact.length < 2) {
      setContacts([]);
      return;
    }
    setLoadingContacts(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/contacts", { params: { searchParam: searchContact } });
        setContacts(data.contacts || []);
      } catch (err) {
        toastError(err);
      } finally {
        setLoadingContacts(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [clienteModalOpen, searchContact]);

  const handleQuantityChange = (productId, delta) => {
    setSelectedItems((prev) => {
      const current = prev[productId] || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const getTotalItems = () =>
    Object.values(selectedItems).reduce((a, b) => a + b, 0);

  const calculateTotal = () =>
    Object.entries(selectedItems).reduce((acc, [productId, qty]) => {
      const p = products.find((x) => x.id === parseInt(productId));
      return acc + (p?.value || 0) * qty;
    }, 0);

  const handleContactCreated = (contact) => {
    setSelectedContact(contact);
    setContactModalOpen(false);
    setNewContactInitial({});
  };

  const handleEnviarPedido = () => {
    if (getTotalItems() === 0) {
      toast.error("Adicione itens ao pedido");
      return;
    }
    if (!selectedMesa) {
      toast.error("Selecione a mesa");
      return;
    }
    if (!form?.slug) {
      toast.error("Nenhum cardápio configurado");
      return;
    }
    if (selectedMesa.status === "livre") {
      setClienteModalOpen(true);
    } else {
      submitOrder(selectedMesa.contact || { id: selectedMesa.contactId, name: "Cliente", number: "" });
    }
  };

  const handleConfirmarCliente = async () => {
    if (!selectedContact) {
      toast.error("Selecione ou crie o cliente");
      return;
    }
    setClienteModalOpen(false);
    await occupyAndSubmit(selectedContact);
  };

  const occupyAndSubmit = async (contact) => {
    setSubmitting(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contact.id,
        status: "open",
      });
      await api.put(`/mesas/${selectedMesa.id}/ocupar`, {
        contactId: contact.id,
        ticketId: ticket?.id,
      });
      toast.success("Mesa ocupada");
      await submitOrder(contact);
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitOrder = async (contact) => {
    if (!form?.slug || !selectedMesa) return;
    setSubmitting(true);
    try {
      const menuItems = Object.entries(selectedItems).map(([productId, qty]) => {
        const p = products.find((x) => x.id === parseInt(productId));
        return {
          productId: parseInt(productId),
          quantity: qty,
          productName: p?.name,
          productValue: p?.value,
          grupo: p?.grupo || "Outros",
        };
      });
      const autoFields = form.fields?.filter(
        (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
      ) || [];
      const answers = [];
      autoFields.forEach((f) => {
        const val = f.metadata?.autoFieldType === "name"
          ? (contact?.name || "")
          : f.metadata?.autoFieldType === "phone"
          ? (contact?.number || "")
          : "";
        if (val) answers.push({ fieldId: f.id, answer: val });
      });
      const metadata = {
        tableId: selectedMesa?.id,
        tableNumber: selectedMesa?.number || selectedMesa?.name,
        orderType: "mesa",
      };
      await api.post(`/public/forms/${form.slug}/submit`, {
        answers,
        menuItems,
        metadata,
        responderName: contact?.name || "Cliente",
        responderPhone: contact?.number || "",
      });
      toast.success(selectedMesa.status === "livre" ? "Mesa ocupada e pedido enviado!" : "Pedido adicionado à conta!");
      setSelectedItems({});
      setSelectedContact(null);
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const groups = [...new Set(products.map((p) => p.grupo || "Outros"))].sort();

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <MainContainer>
      <Box className={classes.root}>
        <Box display="flex" alignItems="center" marginBottom={2}>
          <IconButton onClick={() => history.push("/lanchonetes")} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" style={{ marginLeft: 8 }}>
            Pedido rápido
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Mesa
            </Typography>
            {mesas.length === 0 ? (
              <Paper style={{ padding: 16, marginBottom: 16 }}>
                <Typography variant="body2" color="textSecondary">
                  Nenhuma mesa cadastrada.
                </Typography>
                <Button size="small" onClick={() => history.push("/lanchonetes?tab=3")} style={{ marginTop: 8 }}>
                  Ir para Mesas
                </Button>
              </Paper>
            ) : (
              <Box className={classes.mesaBar}>
                {mesas.map((mesa) => (
                  <Chip
                    key={mesa.id}
                    label={`${mesa.number || mesa.name} ${mesa.status === "ocupada" ? "●" : ""}`}
                    onClick={() => setSelectedMesa(mesa)}
                    color={selectedMesa?.id === mesa.id ? "primary" : "default"}
                    variant={selectedMesa?.id === mesa.id ? "default" : "outlined"}
                    className={classes.mesaChip}
                    size="medium"
                  />
                ))}
              </Box>
            )}

            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Itens do pedido
            </Typography>
            {groups.map((grupo) => (
              <Box key={grupo} mb={2}>
                <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 4 }}>
                  {grupo}
                </Typography>
                {products
                  .filter((p) => (p.grupo || "Outros") === grupo)
                  .map((product) => (
                    <Card key={product.id} className={classes.productCard} variant="outlined">
                      <CardContent style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                        <Box>
                          <Typography variant="body1">{product.name}</Typography>
                          <Typography variant="body2" color="primary">
                            R$ {(product.value || 0).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box className={classes.quantityControl}>
                          <IconButton size="small" onClick={() => handleQuantityChange(product.id, -1)}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography style={{ minWidth: 28, textAlign: "center", fontWeight: 600 }}>
                            {selectedItems[product.id] || 0}
                          </Typography>
                          <IconButton size="small" onClick={() => handleQuantityChange(product.id, 1)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            ))}
          </>
        )}
      </Box>

      {getTotalItems() > 0 && (
        <Box className={classes.summaryBar}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                {selectedMesa ? `Mesa ${selectedMesa.number || selectedMesa.name}` : "Selecione a mesa"}
              </Typography>
              <Typography variant="h6">
                R$ {calculateTotal().toFixed(2)} • {getTotalItems()} itens
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!selectedMesa || submitting}
              onClick={handleEnviarPedido}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : selectedMesa?.status === "livre" ? "Ocupar e enviar" : "Adicionar à conta"}
            </Button>
          </Box>
        </Box>
      )}

      <Dialog open={clienteModalOpen} onClose={() => setClienteModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ocupar mesa {selectedMesa?.number} - Cliente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Selecione ou crie o cliente para ocupar a mesa e enviar o pedido.
          </Typography>
          <Autocomplete
            options={contacts}
            getOptionLabel={(opt) =>
              opt.isNew ? `Criar: ${opt.name}` : (opt.name ? `${opt.name} (${opt.number})` : opt.number || "")
            }
            value={selectedContact}
            onChange={(_, val) => {
              if (val?.isNew) {
                setNewContactInitial({ name: val.name });
                setContactModalOpen(true);
              } else setSelectedContact(val);
            }}
            onInputChange={(_, v) => setSearchContact(v)}
            loading={loadingContacts}
            filterOptions={(opts, params) => {
              const f = filter(opts, params);
              if (params.inputValue?.trim() && searchContact.length >= 2) {
                f.push({ name: params.inputValue.trim(), number: "", isNew: true });
              }
              return f;
            }}
            renderInput={(params) => (
              <TextField {...params} label="Buscar ou criar contato" variant="outlined" fullWidth />
            )}
          />
          <Button
            size="small"
            startIcon={<AddCircleIcon />}
            onClick={() => { setNewContactInitial({}); setContactModalOpen(true); }}
            style={{ marginTop: 8 }}
          >
            Novo contato
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClienteModalOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmarCliente} disabled={!selectedContact || submitting}>
            {submitting ? <CircularProgress size={24} /> : "Ocupar mesa e enviar pedido"}
          </Button>
        </DialogActions>
      </Dialog>

      <ContactModal
        open={contactModalOpen}
        onClose={() => { setContactModalOpen(false); setNewContactInitial({}); }}
        onSave={handleContactCreated}
        initialValues={newContactInitial}
      />
    </MainContainer>
  );
};

export default Garcom;
