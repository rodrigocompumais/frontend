import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import QRCode from "qrcode.react";
import { QrCodePix } from "qrcode-pix";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import useSettings from "../../hooks/useSettings";
import { i18n } from "../../translate/i18n";
import ReciboPdvModal from "../ReciboPdvModal";

export default function LiberarMesaModal({ open, mesa, onClose, onSuccess }) {
  const [resumoConta, setResumoConta] = useState(null);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [liberando, setLiberando] = useState(false);
  const [showRecibo, setShowRecibo] = useState(false);
  const [reciboData, setReciboData] = useState(null);
  const [numeroPessoas, setNumeroPessoas] = useState(1);
  const [meioPagamento, setMeioPagamento] = useState("pix");
  const [settingsPix, setSettingsPix] = useState({ pixKey: "", pixReceiverName: "", pixReceiverCity: "" });

  const { getAll: getAllSettings } = useSettings();

  useEffect(() => {
    if (!open || !mesa?.id) return;
    setResumoConta(null);
    setNumeroPessoas(1);
    setMeioPagamento("pix");
    setLoadingResumo(true);
    api
      .get(`/mesas/${mesa.id}/resumo-conta`)
      .then(({ data }) => setResumoConta(data))
      .catch((err) => {
        toastError(err);
        setResumoConta({ pedidos: [], total: 0, mesa, cliente: null });
      })
      .finally(() => setLoadingResumo(false));
  }, [open, mesa?.id]);

  useEffect(() => {
    if (!open) return;
    getAllSettings()
      .then((list) => {
        if (!Array.isArray(list)) return;
        const get = (key) => (list.find((s) => s.key === key)?.value || "").trim();
        setSettingsPix({ pixKey: get("pixKey"), pixReceiverName: get("pixReceiverName"), pixReceiverCity: get("pixReceiverCity") });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleConfirmarLiberar = async () => {
    if (!mesa?.id) return;
    setLiberando(true);
    try {
      await api.put(`/mesas/${mesa.id}/liberar`);
      toast.success(i18n.t("mesas.tableLiberated"));
      setReciboData(resumoConta ? { ...resumoConta, mesa: resumoConta.mesa || mesa } : { pedidos: [], total: 0, mesa, cliente: null });
      setShowRecibo(true);
      onClose && onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLiberando(false);
    }
  };

  const handleCloseRecibo = () => {
    setShowRecibo(false);
    setReciboData(null);
    onSuccess && onSuccess();
  };

  const handleClose = () => {
    if (!liberando) {
      onClose && onClose();
    }
  };

  if (!mesa) return null;

  return (
    <>
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {i18n.t("mesas.closeAccountTitle")} {mesa.number || mesa.name}
        {resumoConta?.cliente && (
          <Typography variant="body2" color="textSecondary" display="block">
            Cliente: {resumoConta.cliente.name || resumoConta.cliente.number}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {loadingResumo ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : resumoConta ? (
          <Box>
            {resumoConta.pedidos.length === 0 ? (
              <Typography color="textSecondary">{i18n.t("mesas.noOrders")}</Typography>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  {i18n.t("mesas.ordersTitle")}
                </Typography>
                {resumoConta.pedidos.map((p) => (
                  <Paper key={p.id} variant="outlined" style={{ padding: 12, marginBottom: 8 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        {p.protocol} - {new Date(p.submittedAt).toLocaleString("pt-BR")}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        R$ {Number(p.total).toFixed(2).replace(".", ",")}
                      </Typography>
                    </Box>
                    {p.menuItems?.length > 0 && (
                      <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 4 }}>
                        {p.menuItems.map((i) => `${i.quantity}x ${i.productName || ""}`).join(", ")}
                      </Typography>
                    )}
                  </Paper>
                ))}
                <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                  <Typography variant="h6" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{i18n.t("mesas.total")}</span>
                    <span>R$ {Number(resumoConta.total).toFixed(2).replace(".", ",")}</span>
                  </Typography>
                </Box>
                {resumoConta.pedidos.length > 0 && (
                  <>
                    <Box mt={2}>
                      <TextField
                        type="number"
                        label={i18n.t("mesas.numberOfPeople")}
                        value={numeroPessoas}
                        onChange={(e) => setNumeroPessoas(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        inputProps={{ min: 1 }}
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                      {numeroPessoas > 1 && (
                        <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                          {i18n.t("mesas.valuePerPerson")}: R$ {(Number(resumoConta.total) / numeroPessoas).toFixed(2).replace(".", ",")}
                        </Typography>
                      )}
                    </Box>
                    <Box mt={2}>
                      <FormControl variant="outlined" size="small" fullWidth>
                        <InputLabel>{i18n.t("mesas.paymentMethod")}</InputLabel>
                        <Select value={meioPagamento} onChange={(e) => setMeioPagamento(e.target.value)} label={i18n.t("mesas.paymentMethod")}>
                          <MenuItem value="pix">{i18n.t("mesas.paymentMethods.pix")}</MenuItem>
                          <MenuItem value="dinheiro">{i18n.t("mesas.paymentMethods.dinheiro")}</MenuItem>
                          <MenuItem value="cartao">{i18n.t("mesas.paymentMethods.cartao")}</MenuItem>
                          <MenuItem value="outro">{i18n.t("mesas.paymentMethods.outro")}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    {meioPagamento === "pix" && settingsPix.pixKey && (
                      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                        {(() => {
                          const valorPix = numeroPessoas > 1 ? Number(resumoConta.total) / numeroPessoas : Number(resumoConta.total);
                          const valorFormatado = Number(valorPix.toFixed(2));
                          const transactionId = `M${mesa.id || 0}${Date.now()}`.slice(0, 25);
                          try {
                            const qr = QrCodePix({
                              version: "01",
                              key: settingsPix.pixKey,
                              name: settingsPix.pixReceiverName || "Recebedor",
                              city: settingsPix.pixReceiverCity || "SAO PAULO",
                              transactionId,
                              value: valorFormatado,
                            });
                            const payload = qr.payload();
                            return (
                              <>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {i18n.t("mesas.paymentPixTitle")} — R$ {valorFormatado.toFixed(2).replace(".", ",")}
                                </Typography>
                                <Box mt={1}>
                                  <QRCode value={payload} size={200} level="M" renderAs="canvas" />
                                </Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  style={{ marginTop: 12 }}
                                  onClick={() => {
                                    if (navigator.clipboard) {
                                      navigator.clipboard.writeText(payload).then(() => toast.success(i18n.t("mesas.pixCodeCopied")));
                                    }
                                  }}
                                >
                                  {i18n.t("mesas.copyPixCode")}
                                </Button>
                              </>
                            );
                          } catch (err) {
                            return (
                              <Typography variant="body2" color="error">
                                {err?.message || "Erro ao gerar PIX"}
                              </Typography>
                            );
                          }
                        })()}
                      </Box>
                    )}
                    {meioPagamento === "pix" && !settingsPix.pixKey && (
                      <Typography variant="body2" color="textSecondary" style={{ marginTop: 12 }}>
                        {i18n.t("mesas.configurePixKey")}
                      </Typography>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={liberando}>
          {i18n.t("mesas.cancel")}
        </Button>
        <Button variant="contained" color="primary" onClick={handleConfirmarLiberar} disabled={liberando}>
          {liberando ? <CircularProgress size={24} /> : i18n.t("mesas.closeAndLiberate")}
        </Button>
      </DialogActions>
    </Dialog>

    <ReciboPdvModal
      open={showRecibo}
      onClose={handleCloseRecibo}
      data={reciboData}
      mesa={reciboData?.mesa || mesa}
    />
    </>
  );
}
