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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import EventSeatIcon from "@material-ui/icons/EventSeat";
import PersonIcon from "@material-ui/icons/Person";
import { toast } from "react-toastify";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import useAuth from "../../hooks/useAuth.js";
import { useContext } from "react";
import { SocketContext } from "../../context/Socket/SocketContext";
import ContactModal from "../../components/ContactModal";

const filter = createFilterOptions({ trim: true });

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: 960,
    margin: "0 auto",
    paddingBottom: 24,
  },
  mesaGrid: {
    marginTop: theme.spacing(2),
  },
  mesaCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
    border: `2px solid ${theme.palette.divider}`,
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  mesaCardLivre: {
    borderLeftColor: "#22C55E",
    borderLeftWidth: 4,
  },
  mesaCardOcupada: {
    borderLeftColor: "#F59E0B",
    borderLeftWidth: 4,
  },
  mesaCardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
  mesaNumber: {
    fontWeight: 700,
    fontSize: "1.25rem",
    marginBottom: theme.spacing(0.5),
  },
  mesaStatus: {
    fontSize: "0.8rem",
    marginBottom: theme.spacing(1),
  },
  mesaCliente: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: theme.spacing(2),
  },
  productCard: {
    marginBottom: theme.spacing(1),
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  orderDialogContent: {
    maxHeight: "60vh",
    overflowY: "auto",
    paddingTop: 8,
  },
  orderTabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    minHeight: 40,
  },
  orderTabPanel: {
    paddingTop: theme.spacing(1),
  },
  summaryRow: {
    marginTop: 0,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));

const Garcom = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useAuth();
  const socketManager = useContext(SocketContext);
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();
  const [mesas, setMesas] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [mesaParaPedido, setMesaParaPedido] = useState(null);
  const [contactParaPedido, setContactParaPedido] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [orderDialogTab, setOrderDialogTab] = useState(0);

  const [clienteDialogOpen, setClienteDialogOpen] = useState(false);
  const [mesaParaOcupar, setMesaParaOcupar] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchContact, setSearchContact] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newContactInitial, setNewContactInitial] = useState({});

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
    const companyId = user?.companyId;
    const socket = companyId ? socketManager?.getSocket?.(companyId) : null;
    if (!socket) return;
    const handler = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "ocupar" || data.action === "liberar") {
        const mesa = data.mesa;
        setMesas((prev) => {
          const idx = prev.findIndex((m) => m.id === mesa.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = mesa;
            return next;
          }
          return [mesa, ...prev];
        });
      }
      if (data.action === "delete") {
        setMesas((prev) => prev.filter((m) => m.id !== data.mesaId));
      }
      if (data.action === "bulkCreate") {
        setMesas((prev) => [...(data.mesas || []), ...prev]);
      }
    };
    socket.on(`company-${companyId}-mesa`, handler);
    return () => socket.off(`company-${companyId}-mesa`, handler);
  }, [socketManager, user?.companyId]);

  useEffect(() => {
    if (!clienteDialogOpen || searchContact.length < 2) {
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
  }, [clienteDialogOpen, searchContact]);

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
      return acc + (Number(p?.value) || 0) * qty;
    }, 0);

  const handleContactCreated = (contact) => {
    setSelectedContact(contact);
    setContactModalOpen(false);
    setNewContactInitial({});
  };

  const abrirPedido = (mesa) => {
    if (mesa.status === "ocupada") {
      const contact = mesa.contact || (mesa.contactId ? { id: mesa.contactId, name: "Cliente", number: "" } : null);
      if (!contact) {
        toast.error("Mesa ocupada sem contato vinculado. Libere e ocupe novamente.");
        return;
      }
      setMesaParaPedido(mesa);
      setContactParaPedido(contact);
      setSelectedItems({});
      setOrderDialogTab(0);
      setOrderDialogOpen(true);
    } else {
      setMesaParaOcupar(mesa);
      setSelectedContact(null);
      setSearchContact("");
      setClienteDialogOpen(true);
    }
  };

  const handleConfirmarCliente = async () => {
    if (!selectedContact) {
      toast.error("Selecione ou crie o cliente");
      return;
    }
    if (!mesaParaOcupar) return;
    setSubmitting(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: selectedContact.id,
        status: "open",
        reuseOpenTicket: true,
      });
      await api.put(`/mesas/${mesaParaOcupar.id}/ocupar`, {
        contactId: selectedContact.id,
        ticketId: ticket?.id,
        transferir: true,
      });
      toast.success("Mesa ocupada");
      setClienteDialogOpen(false);
      const mesasRes = await api.get("/mesas");
      setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
      const mesaAtualizada = (mesasRes.data || []).find((m) => m.id === mesaParaOcupar.id) || {
        ...mesaParaOcupar,
        status: "ocupada",
        contactId: selectedContact.id,
        contact: selectedContact,
        ticketId: ticket?.id,
      };
      setMesaParaPedido(mesaAtualizada);
      setContactParaPedido(selectedContact);
      setSelectedItems({});
      setOrderDialogTab(0);
      setOrderDialogOpen(true);
      setMesaParaOcupar(null);
      setSelectedContact(null);
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitOrder = async () => {
    if (!form?.slug || !mesaParaPedido || !contactParaPedido) return;
    if (getTotalItems() === 0) {
      toast.error("Adicione itens ao pedido");
      return;
    }
    setSubmitting(true);
    try {
      const menuItems = Object.entries(selectedItems).map(([productId, qty]) => {
        const p = products.find((x) => x.id === parseInt(productId));
        return {
          productId: parseInt(productId),
          quantity: qty,
          productName: p?.name,
          productValue: Number(p?.value) || 0,
          grupo: p?.grupo || "Outros",
        };
      });
      const autoFields = form.fields?.filter(
        (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
      ) || [];
      const answers = [];
      autoFields.forEach((f) => {
        const val = f.metadata?.autoFieldType === "name"
          ? (contactParaPedido?.name || "")
          : f.metadata?.autoFieldType === "phone"
          ? (contactParaPedido?.number || "")
          : "";
        if (val) answers.push({ fieldId: f.id, answer: val });
      });
      const tipoPedidoField = (form.fields || []).find(
        (f) => f.isRequired && /tipo\s*(de\s*)?pedido/i.test((f.label || "").trim())
      );
      if (tipoPedidoField && !answers.some((a) => a.fieldId === tipoPedidoField.id)) {
        answers.push({ fieldId: tipoPedidoField.id, answer: "Mesa" });
      }
      const metadata = {
        tableId: mesaParaPedido.id,
        tableNumber: mesaParaPedido.number || mesaParaPedido.name,
        orderType: "mesa",
        garcomName: user?.name || "",
      };
      await api.post(`/public/forms/${form.slug}/submit`, {
        answers,
        menuItems,
        metadata,
        responderName: contactParaPedido?.name || "Cliente",
        responderPhone: contactParaPedido?.number || "",
      });
      toast.success("Pedido enviado!");
      setSelectedItems({});
      setOrderDialogOpen(false);
      setMesaParaPedido(null);
      setContactParaPedido(null);
      const mesasRes = await api.get("/mesas");
      setMesas(Array.isArray(mesasRes.data) ? mesasRes.data : []);
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
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : mesas.length === 0 ? (
          <Paper style={{ padding: 24, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Nenhuma mesa cadastrada.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/lanchonetes?tab=3")}
            >
              Ir para Mesas
            </Button>
          </Paper>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Clique em &quot;Fazer pedido&quot; na mesa. Se estiver livre, informe o cliente primeiro.
            </Typography>
            <Grid container spacing={2} className={classes.mesaGrid}>
            {mesas.map((mesa) => (
              <Grid item xs={12} sm={6} md={4} key={mesa.id}>
                <Card
                  className={`${classes.mesaCard} ${
                    mesa.status === "ocupada" ? classes.mesaCardOcupada : classes.mesaCardLivre
                  }`}
                  variant="outlined"
                >
                  <CardContent className={classes.mesaCardContent}>
                    <Typography className={classes.mesaNumber}>
                      <EventSeatIcon style={{ fontSize: "1.2rem", verticalAlign: "middle", marginRight: 4 }} />
                      Mesa {mesa.number || mesa.name || mesa.id}
                    </Typography>
                    <Typography
                      className={classes.mesaStatus}
                      color={mesa.status === "ocupada" ? "secondary" : "primary"}
                    >
                      {mesa.status === "ocupada" ? "Ocupada" : "Livre"}
                    </Typography>
                    {mesa.status === "ocupada" && (mesa.contact?.name || mesa.contact?.number) && (
                      <Typography className={classes.mesaCliente}>
                        <PersonIcon style={{ fontSize: "1rem" }} />
                        {mesa.contact?.name || mesa.contact?.number || "Cliente"}
                      </Typography>
                    )}
                    <Box flex={1} />
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => abrirPedido(mesa)}
                      style={{ marginTop: 8 }}
                    >
                      Fazer pedido
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            </Grid>
          </>
        )}
      </Box>

      <Dialog
        open={orderDialogOpen}
        onClose={() => {
          if (!submitting) {
            setOrderDialogOpen(false);
            setMesaParaPedido(null);
            setContactParaPedido(null);
            setSelectedItems({});
          }
        }}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Pedido - Mesa {mesaParaPedido?.number || mesaParaPedido?.name}
          {contactParaPedido?.name && (
            <Typography variant="body2" color="textSecondary">
              Cliente: {contactParaPedido.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent className={classes.orderDialogContent}>
          <Tabs
            value={orderDialogTab}
            onChange={(_, v) => setOrderDialogTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.orderTabs}
          >
            {groups.map((grupo, idx) => (
              <Tab key={grupo} label={grupo} id={`order-tab-${idx}`} aria-controls={`order-tabpanel-${idx}`} />
            ))}
          </Tabs>
          {groups.map((grupo, idx) => (
            <div
              key={grupo}
              role="tabpanel"
              hidden={orderDialogTab !== idx}
              id={`order-tabpanel-${idx}`}
              aria-labelledby={`order-tab-${idx}`}
              className={classes.orderTabPanel}
            >
              {orderDialogTab === idx && (
                <Box>
                  {products
                    .filter((p) => (p.grupo || "Outros") === grupo)
                    .map((product) => (
                      <Card key={product.id} className={classes.productCard} variant="outlined">
                        <CardContent style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                          <Box>
                            <Typography variant="body1">{product.name}</Typography>
                            <Typography variant="body2" color="primary">
                              R$ {(Number(product.value) || 0).toFixed(2)}
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
              )}
            </div>
          ))}
        </DialogContent>
        <DialogActions className={classes.summaryRow}>
          <Typography variant="h6">
            Total: R$ {(Number(calculateTotal()) || 0).toFixed(2).replace(".", ",")} • {getTotalItems()} itens
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={submitOrder}
            disabled={getTotalItems() === 0 || submitting}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : "Enviar pedido"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={clienteDialogOpen}
        onClose={() => {
          if (!submitting) {
            setClienteDialogOpen(false);
            setMesaParaOcupar(null);
            setSelectedContact(null);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ocupar mesa {mesaParaOcupar?.number || mesaParaOcupar?.name} - Informe o cliente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Selecione ou crie o cliente para ocupar a mesa e em seguida fazer o pedido.
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
            onClick={() => {
              setNewContactInitial({});
              setContactModalOpen(true);
            }}
            style={{ marginTop: 8 }}
          >
            Novo contato
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setClienteDialogOpen(false); setMesaParaOcupar(null); setSelectedContact(null); }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmarCliente}
            disabled={!selectedContact || submitting}
          >
            {submitting ? <CircularProgress size={24} /> : "Ocupar mesa e fazer pedido"}
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
