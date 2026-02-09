import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  TextField,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import TableChartIcon from "@material-ui/icons/TableChart";
import { QrCode2 as QrCodeIcon } from "@mui/icons-material";
import QRCode from "qrcode.react";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import MesaCard from "../../components/MesaCard";
import MesaModal from "../../components/MesaModal";
import MesaOcuparModal from "../../components/MesaOcuparModal";
import MesaBulkCreateModal from "../../components/MesaBulkCreateModal";
import MesaPrintQRModal from "../../components/MesaPrintQRModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import LiberarMesaModal from "../../components/LiberarMesaModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useCompanyModules from "../../hooks/useCompanyModules";
import { i18n } from "../../translate/i18n";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.fancyBackground || theme.palette.background.default,
    overflow: "auto",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  filterControl: {
    minWidth: 160,
  },
  grid: {
    marginTop: theme.spacing(2),
    flex: 1,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
  cardapioBanner: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    background: theme.palette.type === "dark" ? "rgba(34, 197, 94, 0.12)" : "rgba(34, 197, 94, 0.08)",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
  },
  mesaCardHighlight: {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
    borderRadius: 14,
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
  orderTabPanel: { paddingTop: theme.spacing(1) },
  orderProductCard: { marginBottom: theme.spacing(1) },
  orderQuantityControl: { display: "flex", alignItems: "center", gap: theme.spacing(0.5) },
  orderSummaryRow: {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  orderLineRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const Mesas = ({ cardapioSlugFromHub }) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { hasLanchonetes, loading: modulesLoading } = useCompanyModules();
  const socketManager = useContext(SocketContext);
  const mesaIdFromUrl = new URLSearchParams(location.search).get("mesaId");
  const highlightedMesaRef = useRef(null);

  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [mesaModalOpen, setMesaModalOpen] = useState(false);
  const [mesaBulkModalOpen, setMesaBulkModalOpen] = useState(false);
  const [ocuparModalOpen, setOcuparModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [mesaToDelete, setMesaToDelete] = useState(null);
  const [cardapioQRModalOpen, setCardapioQRModalOpen] = useState(false);
  const [printAllQRModalOpen, setPrintAllQRModalOpen] = useState(false);
  const cardapioQRRef = useRef(null);
  const [liberarModalOpen, setLiberarModalOpen] = useState(false);
  const [mesaParaLiberar, setMesaParaLiberar] = useState(null);
  const [cardapioSlugFetched, setCardapioSlugFetched] = useState(null);

  const [mesaParaPedido, setMesaParaPedido] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderLines, setOrderLines] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);
  const [orderForm, setOrderForm] = useState(null);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderDialogTab, setOrderDialogTab] = useState(0);
  const [variablePriceDialogOpen, setVariablePriceDialogOpen] = useState(false);
  const [variablePriceProduct, setVariablePriceProduct] = useState(null);
  const [variablePriceQty, setVariablePriceQty] = useState(1);
  const [variablePriceUnit, setVariablePriceUnit] = useState("");

  const cardapioSlug = cardapioSlugFromHub ?? cardapioSlugFetched;

  useEffect(() => {
    if (cardapioSlugFromHub) return;
    api.get("/forms?formType=cardapio").then(({ data }) => {
      const forms = data.forms || [];
      const slug = forms.length ? (forms.sort((a, b) => (a.id || 0) - (b.id || 0))[0]?.slug) : null;
      if (slug) setCardapioSlugFetched(slug);
    }).catch(() => {});
  }, [cardapioSlugFromHub]);

  const fetchMesas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (sectionFilter) params.section = sectionFilter;
      const { data } = await api.get("/mesas", { params });
      setMesas(Array.isArray(data) ? data : []);
    } catch (err) {
      toastError(err);
      setMesas([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sectionFilter]);

  useEffect(() => {
    if (!hasLanchonetes && !modulesLoading) {
      history.push("/dashboard");
    }
  }, [hasLanchonetes, modulesLoading, history]);

  useEffect(() => {
    if (hasLanchonetes) {
      fetchMesas();
    }
  }, [hasLanchonetes, fetchMesas]);

  useEffect(() => {
    const socket = user?.companyId ? socketManager?.getSocket?.(user.companyId) : null;
    if (!socket) return;
    socket.on(`company-${user.companyId}-mesa`, (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "ocupar" || data.action === "liberar") {
        const mesa = data.mesa;
        setMesas((prev) => {
          const idx = prev.findIndex((m) => m.id === mesa.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = mesa;
            return updated;
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
    });
    return () => {
      socket.off(`company-${user.companyId}-mesa`);
    };
  }, [socketManager, user?.companyId]);

  useEffect(() => {
    if (!orderDialogOpen || !mesaParaPedido || !cardapioSlug) {
      if (!orderDialogOpen) {
        setOrderForm(null);
        setOrderProducts([]);
        setOrderLines([]);
        setOrderDialogTab(0);
      }
      return;
    }
    setOrderLoading(true);
    (async () => {
      try {
        const [{ data: formsData }, { data: productsData }] = await Promise.all([
          api.get("/forms?formType=cardapio"),
          api.get(`/public/forms/${cardapioSlug}/products`).catch(() => ({ data: { products: [] } })),
        ]);
        const forms = formsData?.forms || [];
        const form = forms.find((f) => f.slug === cardapioSlug) || forms[0] || null;
        setOrderForm(form);
        setOrderProducts(productsData?.products || []);
      } catch (err) {
        toastError(err);
      } finally {
        setOrderLoading(false);
      }
    })();
  }, [orderDialogOpen, mesaParaPedido?.id, cardapioSlug]);

  const handleOpenOrderDialog = (mesa) => {
    if (mesa.status !== "ocupada" || !mesa.contact) {
      toast.error("Mesa ocupada sem cliente vinculado.");
      return;
    }
    setMesaParaPedido(mesa);
    setOrderLines([]);
    setOrderDialogTab(0);
    setOrderDialogOpen(true);
  };

  const handleCloseOrderDialog = () => {
    if (!orderSubmitting) {
      setOrderDialogOpen(false);
      setMesaParaPedido(null);
      setOrderLines([]);
    }
  };

  const getOrderLineCount = (productId) =>
    orderLines
      .filter((l) => l.productId === productId)
      .reduce((a, l) => a + l.quantity, 0);

  const handleOrderQuantityChange = (productId, delta, product) => {
    const p = product || orderProducts.find((x) => x.id === productId);
    if (delta === 1 && p?.variablePrice) {
      setVariablePriceProduct(p);
      setVariablePriceQty(1);
      setVariablePriceUnit(Number(p?.value) ?? 0);
      setVariablePriceDialogOpen(true);
      return;
    }
    setOrderLines((prev) => {
      if (delta === 1) {
        const idx = prev.findIndex((l) => l.productId === productId && l.productValue == null);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
          return next;
        }
        return [...prev, { productId, quantity: 1 }];
      }
      const rev = prev.map((l, i) => ({ l, i })).filter((x) => x.l.productId === productId);
      const last = rev[rev.length - 1];
      if (!last) return prev;
      const idx = last.i;
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
      if (next[idx].quantity <= 0) next.splice(idx, 1);
      return next;
    });
  };

  const handleAddVariablePriceLine = () => {
    const qty = Math.max(1, parseInt(variablePriceQty, 10) || 1);
    const unit = parseFloat(String(variablePriceUnit).replace(",", "."));
    if (isNaN(unit) || unit < 0) {
      toast.error("Informe um valor unitário válido (maior ou igual a zero).");
      return;
    }
    setOrderLines((prev) => [
      ...prev,
      {
        productId: variablePriceProduct.id,
        quantity: qty,
        productValue: unit,
      },
    ]);
    setVariablePriceDialogOpen(false);
    setVariablePriceProduct(null);
  };

  const handleRemoveOrderLine = (lineIndex) => {
    setOrderLines((prev) => prev.filter((_, i) => i !== lineIndex));
  };

  const getOrderTotalItems = () =>
    orderLines.reduce((a, l) => a + l.quantity, 0);

  const calculateOrderTotal = () =>
    orderLines.reduce((acc, line) => {
      const p = orderProducts.find((x) => x.id === line.productId);
      const unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
      return acc + line.quantity * unit;
    }, 0);

  const submitOrder = async () => {
    if (!orderForm?.slug || !mesaParaPedido) return;
    if (getOrderTotalItems() === 0) {
      toast.error("Adicione itens ao pedido");
      return;
    }
    const contact = mesaParaPedido.contact || {};
    for (const line of orderLines) {
      const p = orderProducts.find((x) => x.id === line.productId);
      if (p?.variablePrice && (line.productValue == null || line.productValue < 0)) {
        toast.error(`Informe o valor para "${p.name}".`);
        return;
      }
    }
    setOrderSubmitting(true);
    try {
      const menuItems = orderLines.map((line) => {
        const p = orderProducts.find((x) => x.id === line.productId);
        const unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
        return {
          productId: line.productId,
          quantity: line.quantity,
          productName: p?.name,
          productValue: unit,
          grupo: p?.grupo || "Outros",
        };
      });
      const labelLower = (l) => (l || "").trim().toLowerCase();
      const fields = orderForm.fields || [];
      const autoFields = fields.filter(
        (f) => f.metadata?.autoFieldType === "name" || f.metadata?.autoFieldType === "phone"
      );
      let answers = autoFields.map((f) => ({
        fieldId: f.id,
        answer: f.metadata?.autoFieldType === "name" ? (contact?.name || "Cliente") : (contact?.number || ""),
      }));
      const nomeField = fields.find(
        (f) => f.isRequired && (f.metadata?.autoFieldType === "name" || (labelLower(f.label).includes("nome") && !labelLower(f.label).includes("sobrenome")))
      );
      if (nomeField && !answers.some((a) => a.fieldId === nomeField.id)) {
        answers = [...answers, { fieldId: nomeField.id, answer: contact?.name || "Cliente" }];
      }
      const tipoPedidoField = (orderForm.fields || []).find(
        (f) => f.isRequired && labelLower(f.label).includes("tipo") && labelLower(f.label).includes("pedido")
      );
      if (tipoPedidoField && !answers.some((a) => a.fieldId === tipoPedidoField.id)) {
        answers = [...answers, { fieldId: tipoPedidoField.id, answer: "Mesa" }];
      }
      const metadata = {
        tableId: mesaParaPedido.id,
        tableNumber: mesaParaPedido.number || mesaParaPedido.name,
        orderType: "mesa",
        garcomName: user?.name || "",
      };
      await api.post(`/public/forms/${orderForm.slug}/submit`, {
        answers,
        menuItems,
        metadata,
        responderName: contact?.name || "Cliente",
        responderPhone: contact?.number || "",
      });
      toast.success("Pedido enviado!");
      setOrderDialogOpen(false);
      setMesaParaPedido(null);
      setOrderLines([]);
      fetchMesas();
    } catch (err) {
      toastError(err);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const orderGroups = [...new Set(orderProducts.map((p) => p.grupo || "Outros"))].sort();

  useEffect(() => {
    if (!mesaIdFromUrl || mesas.length === 0 || !highlightedMesaRef.current) return;
    highlightedMesaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mesaIdFromUrl, mesas]);

  const handleOpenMesaModal = (mesa = null) => {
    setSelectedMesa(mesa);
    setMesaModalOpen(true);
  };

  const handleCloseMesaModal = () => {
    setMesaModalOpen(false);
    setSelectedMesa(null);
    fetchMesas();
  };

  const handleOpenBulkModal = () => setMesaBulkModalOpen(true);
  const handleCloseBulkModal = () => {
    setMesaBulkModalOpen(false);
    fetchMesas();
  };

  const handleOcupar = (mesa) => {
    setSelectedMesa(mesa);
    setOcuparModalOpen(true);
  };

  const handleLiberar = (mesa) => {
    setMesaParaLiberar(mesa);
    setLiberarModalOpen(true);
  };

  const handleVerTicket = (mesa) => {
    if (mesa?.ticketId) {
      history.push(`/tickets/${mesa.ticketId}`);
    }
  };

  const handleEdit = (mesa) => handleOpenMesaModal(mesa);

  const handleDeleteClick = (mesa) => {
    setMesaToDelete(mesa);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mesaToDelete) return;
    try {
      await api.delete(`/mesas/${mesaToDelete.id}`);
      toast.success("Mesa removida");
      setConfirmModalOpen(false);
      setMesaToDelete(null);
      fetchMesas();
    } catch (err) {
      toastError(err);
    }
  };

  if (!hasLanchonetes && !modulesLoading) return null;

  return (
    <MainContainer>
      <MainHeader>
        <Title>Mesas</Title>
        <MainHeaderButtonsWrapper>
          <div className={classes.headerActions}>
            <FormControl size="small" className={classes.filterControl}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="livre">Livre</MenuItem>
                <MenuItem value="ocupada">Ocupada</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" className={classes.filterControl}>
              <InputLabel>Seção</InputLabel>
              <Select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                label="Seção"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="salao">Salão</MenuItem>
                <MenuItem value="varanda">Varanda</MenuItem>
                <MenuItem value="area_externa">Área externa</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenMesaModal()}
            >
              Nova mesa
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenBulkModal}
            >
              Criar várias
            </Button>
          </div>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Box className={classes.root}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : mesas.length === 0 ? (
          <Paper className={classes.emptyState}>
            <TableChartIcon style={{ fontSize: 64, marginBottom: 16 }} />
            <Typography variant="h6">Nenhuma mesa cadastrada</Typography>
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Crie mesas individuais ou em massa para começar.
            </Typography>
            <Box mt={2} display="flex" gap={1}>
              <Button variant="contained" color="primary" onClick={() => handleOpenMesaModal()}>
                Nova mesa
              </Button>
              <Button variant="outlined" onClick={handleOpenBulkModal}>
                Criar várias
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            {(() => {
              const formSlug = mesas.find((m) => m.form?.slug)?.form?.slug || cardapioSlug;
              if (!formSlug) return null;
              const cardapioUrl = `${window.location.origin}/f/${formSlug}`;
              return (
                <Paper className={classes.cardapioBanner}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    Cardápio para mesas
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(cardapioUrl).then(() => toast.success("Link copiado!"));
                        }
                      }}
                    >
                      Copiar link
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<QrCodeIcon fontSize="small" />}
                      onClick={() => setCardapioQRModalOpen(true)}
                    >
                      Ver QR geral
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<QrCodeIcon fontSize="small" />}
                      onClick={() => setPrintAllQRModalOpen(true)}
                    >
                      Imprimir todos os QR Codes
                    </Button>
                  </Box>
                </Paper>
              );
            })()}
          <Grid container spacing={2} className={classes.grid}>
            {mesas.map((mesa) => {
              const isHighlighted = mesaIdFromUrl && Number(mesaIdFromUrl) === mesa.id;
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={mesa.id}
                  ref={isHighlighted ? highlightedMesaRef : undefined}
                  className={isHighlighted ? classes.mesaCardHighlight : undefined}
                >
                  <MesaCard
                    mesa={mesa}
                    onOcupar={handleOcupar}
                    onLiberar={handleLiberar}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onVerTicket={handleVerTicket}
                    onAdicionarPedido={handleOpenOrderDialog}
                    onCopyLink={(url) => toast.success("Link copiado!")}
                    cardapioSlug={cardapioSlug}
                  />
                </Grid>
              );
            })}
          </Grid>
          </>
        )}
      </Box>

      <Dialog
        open={orderDialogOpen}
        onClose={handleCloseOrderDialog}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Adicionar pedido - Mesa {mesaParaPedido?.number || mesaParaPedido?.name}
          {mesaParaPedido?.contact && (
            <Typography variant="body2" color="textSecondary" display="block">
              Cliente: {mesaParaPedido.contact.name || mesaParaPedido.contact.number || "—"}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent className={classes.orderDialogContent}>
          {orderLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Tabs
                value={orderDialogTab}
                onChange={(_, v) => setOrderDialogTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                className={classes.orderTabs}
              >
                {orderGroups.map((grupo, idx) => (
                  <Tab key={grupo} label={grupo} id={`order-tab-${idx}`} aria-controls={`order-tabpanel-${idx}`} />
                ))}
              </Tabs>
              {orderGroups.map((grupo, idx) => (
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
                      {orderProducts
                        .filter((p) => (p.grupo || "Outros") === grupo)
                        .map((product) => (
                          <Card key={product.id} className={classes.orderProductCard} variant="outlined">
                            <CardContent style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                              <Box>
                                <Typography variant="body1">{product.name}</Typography>
                                <Typography variant="body2" color="primary">
                                  {product.variablePrice
                                    ? "Preço variável"
                                    : `R$ ${(Number(product.value) || 0).toFixed(2)}`}
                                </Typography>
                              </Box>
                              <Box className={classes.orderQuantityControl}>
                                <IconButton size="small" onClick={() => handleOrderQuantityChange(product.id, -1, product)}>
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography style={{ minWidth: 28, textAlign: "center", fontWeight: 600 }}>
                                  {getOrderLineCount(product.id)}
                                </Typography>
                                <IconButton size="small" onClick={() => handleOrderQuantityChange(product.id, 1, product)}>
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
              {orderLines.length > 0 && (
                <Box mt={2} mb={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Itens do pedido
                  </Typography>
                  {orderLines.map((line, idx) => {
                    const p = orderProducts.find((x) => x.id === line.productId);
                    const unit = line.productValue != null ? line.productValue : (Number(p?.value) || 0);
                    const subtotal = line.quantity * unit;
                    return (
                      <Box key={idx} className={classes.orderLineRow}>
                        <Box>
                          <Typography variant="body2">
                            {p?.name || "Produto"} • {line.quantity}x R$ {unit.toFixed(2).replace(".", ",")} = R$ {subtotal.toFixed(2).replace(".", ",")}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleRemoveOrderLine(idx)} aria-label="Remover item">
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              )}
              <Box className={classes.orderSummaryRow}>
                <Typography variant="h6">
                  Total: R$ {(Number(calculateOrderTotal()) || 0).toFixed(2).replace(".", ",")} • {getOrderTotalItems()} itens
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitOrder}
                  disabled={getOrderTotalItems() === 0 || orderSubmitting}
                >
                  {orderSubmitting ? <CircularProgress size={24} color="inherit" /> : "Enviar pedido"}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={variablePriceDialogOpen} onClose={() => setVariablePriceDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Valor unitário</DialogTitle>
        <DialogContent>
          {variablePriceProduct && (
            <>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                {variablePriceProduct.name} — informe a quantidade e o valor unitário (ex.: refeição por kg).
              </Typography>
              <TextField
                label="Quantidade"
                type="number"
                inputProps={{ min: 1 }}
                value={variablePriceQty}
                onChange={(e) => setVariablePriceQty(e.target.value)}
                variant="outlined"
                margin="dense"
                fullWidth
                style={{ marginBottom: 12 }}
              />
              <TextField
                label="Valor unitário (R$)"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={variablePriceUnit}
                onChange={(e) => setVariablePriceUnit(e.target.value)}
                variant="outlined"
                margin="dense"
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariablePriceDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleAddVariablePriceLine} color="primary" variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <MesaModal
        open={mesaModalOpen}
        onClose={handleCloseMesaModal}
        mesa={selectedMesa}
        onSuccess={fetchMesas}
      />
      <MesaOcuparModal
        open={ocuparModalOpen}
        onClose={() => {
          setOcuparModalOpen(false);
          setSelectedMesa(null);
        }}
        mesa={selectedMesa}
        onSuccess={fetchMesas}
      />
      <MesaBulkCreateModal
        open={mesaBulkModalOpen}
        onClose={handleCloseBulkModal}
        onSuccess={fetchMesas}
      />
      <MesaPrintQRModal
        open={printAllQRModalOpen}
        onClose={() => setPrintAllQRModalOpen(false)}
      />
      <ConfirmationModal
        title="Excluir mesa"
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setMesaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      >
        Tem certeza que deseja excluir a mesa {mesaToDelete?.number || mesaToDelete?.name}?
      </ConfirmationModal>

      <LiberarMesaModal
        open={liberarModalOpen}
        mesa={mesaParaLiberar}
        onClose={() => {
          setLiberarModalOpen(false);
          setMesaParaLiberar(null);
        }}
        onSuccess={fetchMesas}
      />

      {(() => {
        const formSlug = mesas.find((m) => m.form?.slug)?.form?.slug || cardapioSlug;
        if (!formSlug) return null;
        const cardapioUrl = `${window.location.origin}/f/${formSlug}`;
        return (
          <Dialog open={cardapioQRModalOpen} onClose={() => setCardapioQRModalOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle>QR Code - Cardápio</DialogTitle>
            <DialogContent>
              <Box ref={cardapioQRRef} display="flex" flexDirection="column" alignItems="center">
                <QRCode value={cardapioUrl} size={220} level="M" renderAs="canvas" />
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 16, wordBreak: "break-all", textAlign: "center" }}>
                  {cardapioUrl}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(cardapioUrl).then(() => toast.success("Link copiado!"));
                  }
                }}
                color="primary"
              >
                Copiar link
              </Button>
              <Button
                onClick={() => {
                  const canvas = cardapioQRRef.current?.querySelector("canvas");
                  if (canvas) {
                    const link = document.createElement("a");
                    link.download = "qr-cardapio.png";
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  }
                }}
                color="primary"
                variant="contained"
              >
                Baixar QR
              </Button>
              <Button onClick={() => setCardapioQRModalOpen(false)}>Fechar</Button>
            </DialogActions>
          </Dialog>
        );
      })()}
    </MainContainer>
  );
};

export default Mesas;
