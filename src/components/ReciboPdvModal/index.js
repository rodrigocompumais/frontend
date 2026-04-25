import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import PrintIcon from "@material-ui/icons/Print";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import {
  aggregateReciboMenuItems,
  menuItemLineTotal,
  isPlaceholderMesaPhone,
} from "../../helpers/aggregateReciboMenuItems";

const THERMAL_WIDTH_MM = 80;

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      maxWidth: 420,
    },
  },
  actions: {
    padding: theme.spacing(2),
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  reciboWrap: {
    width: `${THERMAL_WIDTH_MM}mm`,
    maxWidth: "100%",
    margin: "0 auto",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 12,
    lineHeight: 1.4,
    padding: theme.spacing(2),
    backgroundColor: "#fff",
    color: "#000",
    border: "1px dashed #ccc",
    borderRadius: 4,
  },
  title: {
    textAlign: "center",
    fontWeight: 600,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 11,
    color: "#333",
    marginBottom: 4,
  },
  hr: {
    border: "none",
    borderTop: "1px dashed #999",
    margin: "8px 0",
  },
  metaLine: {
    textAlign: "left",
    marginBottom: 2,
    wordBreak: "break-word",
  },
  pedidoHeader: {
    fontWeight: 600,
    marginTop: 8,
    marginBottom: 4,
    fontSize: 11,
    color: "#444",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    width: "100%",
    marginBottom: 4,
  },
  itemLeft: {
    flex: 1,
    minWidth: 0,
    textAlign: "left",
    wordBreak: "break-word",
    paddingRight: theme.spacing(0.5),
  },
  itemRight: {
    flexShrink: 0,
    whiteSpace: "nowrap",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 700,
    marginTop: 10,
    paddingTop: 8,
    borderTop: "2px solid #000",
  },
  footer: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 11,
  },
  spacerSm: { height: 6 },
  "@media print": {
    reciboWrap: {
      width: `${THERMAL_WIDTH_MM}mm !important`,
      maxWidth: "none !important",
      border: "none !important",
      boxShadow: "none !important",
      padding: "4mm !important",
    },
  },
}));

function formatMoney(n) {
  return `R$ ${Number(n || 0).toFixed(2).replace(".", ",")}`;
}

/**
 * Linhas estruturadas: evita pad com espaços (quebra com pre-wrap / largura variável).
 * @returns {Array<{kind: string, ...}>}
 */
function buildReciboRows(data, modo) {
  if (!data) return [];

  const isVendaDireta = !data.mesa;
  const tipoConta = isVendaDireta ? "VENDA PDV" : data.mesa?.type === "comanda" ? "COMANDA" : "MESA";
  const numeroConta = isVendaDireta ? "" : data.mesa?.number || data.mesa?.name || "";
  const dataHora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const clienteNome = data.cliente?.name || data.cliente?.number || "";

  const rows = [];
  rows.push({ kind: "title", text: "RECIBO" });
  rows.push({ kind: "blank" });
  rows.push({ kind: "subtitle", text: "DOCUMENTO SEM VALOR FISCAL" });
  rows.push({ kind: "blank" });
  rows.push({ kind: "hr" });
  rows.push({
    kind: "left",
    text: numeroConta ? `${tipoConta}: ${numeroConta}` : tipoConta,
  });
  rows.push({ kind: "left", text: `Data/Hora: ${dataHora}` });
  if (!isVendaDireta && clienteNome) {
    rows.push({ kind: "left", text: `Cliente: ${clienteNome}` });
  }
  rows.push({ kind: "hr" });
  rows.push({ kind: "blank" });

  if (modo === "reduzido") {
    rows.push({ kind: "subtitle", text: "(Itens agrupados)" });
    rows.push({ kind: "blank" });
    aggregateReciboMenuItems(data.pedidos || []).forEach((row) => {
      rows.push({
        kind: "row",
        left: `${row.quantity}x ${row.productName || "Item"}`,
        right: formatMoney(row.lineTotal),
      });
    });
  } else {
    (data.pedidos || []).forEach((pedido) => {
      const protocol = pedido.protocol || `#${pedido.id}`;
      const dataPedido = pedido.submittedAt
        ? new Date(pedido.submittedAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      rows.push({ kind: "pedidoHeader", text: `${protocol} ${dataPedido}`.trim() });
      let pedidoSub = 0;
      (pedido.menuItems || []).forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const name = item.productName || "Item";
        const subtotal = menuItemLineTotal(item);
        pedidoSub += subtotal;
        rows.push({
          kind: "row",
          left: `${qty}x ${name}`,
          right: formatMoney(subtotal),
        });
      });
      rows.push({
        kind: "row",
        left: "Subtotal",
        right: formatMoney(pedidoSub),
        muted: true,
      });
      rows.push({ kind: "blank" });
    });
  }

  rows.push({ kind: "hr" });
  rows.push({
    kind: "total",
    left: "TOTAL:",
    right: formatMoney(Number(data.total || 0)),
  });

  if (Array.isArray(data.meiosPagamento) && data.meiosPagamento.length > 0) {
    rows.push({ kind: "blank" });
    rows.push({ kind: "left", text: "Pagamento:" });
    data.meiosPagamento.forEach((p) => {
      const metodo = String(p?.metodo || "").toUpperCase() || "OUTRO";
      const val = Number(p?.valor || 0);
      rows.push({ kind: "row", left: metodo, right: formatMoney(val) });
    });
  }

  rows.push({ kind: "hr" });
  rows.push({ kind: "blank" });
  rows.push({ kind: "footer", text: "Obrigado! Volte sempre." });
  return rows;
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function rowsToPrintHtml(rows) {
  const parts = rows.map((row) => {
    switch (row.kind) {
      case "title":
        return `<div class="t-center t-strong">${esc(row.text)}</div>`;
      case "subtitle":
        return `<div class="t-center t-small">${esc(row.text)}</div>`;
      case "blank":
        return '<div class="blank"></div>';
      case "hr":
        return '<div class="hr"></div>';
      case "left":
        return `<div class="t-left">${esc(row.text)}</div>`;
      case "pedidoHeader":
        return `<div class="t-pedido">${esc(row.text)}</div>`;
      case "row":
        return `<div class="row${row.muted ? " muted" : ""}"><span class="row-l">${esc(row.left)}</span><span class="row-r">${esc(row.right)}</span></div>`;
      case "total":
        return `<div class="row total"><span class="row-l">${esc(row.left)}</span><span class="row-r">${esc(row.right)}</span></div>`;
      case "footer":
        return `<div class="t-footer">${esc(row.text)}</div>`;
      default:
        return "";
    }
  });
  return parts.join("");
}

function ReciboBody({ rows, classes }) {
  return (
    <>
      {rows.map((row, i) => {
        switch (row.kind) {
          case "title":
            return (
              <Typography key={i} component="div" className={classes.title}>
                {row.text}
              </Typography>
            );
          case "subtitle":
            return (
              <Typography key={i} component="div" className={classes.subtitle}>
                {row.text}
              </Typography>
            );
          case "blank":
            return <Box key={i} className={classes.spacerSm} />;
          case "hr":
            return <Box key={i} component="hr" className={classes.hr} />;
          case "left":
            return (
              <Typography key={i} component="div" className={classes.metaLine}>
                {row.text}
              </Typography>
            );
          case "pedidoHeader":
            return (
              <Typography key={i} component="div" className={classes.pedidoHeader}>
                {row.text}
              </Typography>
            );
          case "row":
            return (
              <Box
                key={i}
                className={classes.itemRow}
                style={row.muted ? { opacity: 0.85, fontSize: 11 } : undefined}
              >
                <Typography component="span" variant="body2" className={classes.itemLeft}>
                  {row.left}
                </Typography>
                <Typography component="span" variant="body2" className={classes.itemRight}>
                  {row.right}
                </Typography>
              </Box>
            );
          case "total":
            return (
              <Box key={i} className={classes.totalRow}>
                <Typography component="span">{row.left}</Typography>
                <Typography component="span">{row.right}</Typography>
              </Box>
            );
          case "footer":
            return (
              <Typography key={i} component="div" className={classes.footer}>
                {row.text}
              </Typography>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export default function ReciboPdvModal({ open, onClose, data, mesa }) {
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [sendingWa, setSendingWa] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(0);
      setPhoneInput("");
    }
  }, [open, data]);

  const effectiveModo = tab === 1 ? "reduzido" : "detalhado";

  const rows = useMemo(() => (data ? buildReciboRows(data, effectiveModo) : []), [data, effectiveModo]);

  const dataForApi = useMemo(() => {
    if (!data) return null;
    return { ...data, mesa: data.mesa || mesa || null };
  }, [data, mesa]);

  const sendPdfToNumber = useCallback(
    async (digits) => {
      if (!dataForApi) return;
      const clean = String(digits || "").replace(/\D/g, "");
      if (clean.length < 10) {
        toast.error("Informe um número válido (DDD + número).");
        return;
      }
      const variant = effectiveModo === "reduzido" ? "reduced" : "full";
      setSendingWa(true);
      try {
        const pdfRes = await api.post(
          "/recibos/pdf",
          { variant, data: dataForApi },
          { responseType: "blob" }
        );
        const blob = pdfRes.data;
        const fd = new FormData();
        fd.append("file", blob, "recibo.pdf");
        fd.append("number", clean);
        fd.append("body", "Segue o recibo da sua conta.");
        await api.post("/messages/send-media-by-phone", fd);
        toast.success("PDF enviado para o WhatsApp.");
        setPhoneDialogOpen(false);
        setPhoneInput("");
      } catch (e) {
        toastError(e);
      } finally {
        setSendingWa(false);
      }
    },
    [dataForApi, effectiveModo]
  );

  const handleWhatsAppClick = () => {
    const num = data?.cliente?.number;
    if (num && !isPlaceholderMesaPhone(num)) {
      sendPdfToNumber(num);
      return;
    }
    setPhoneInput("");
    setPhoneDialogOpen(true);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    const printContent = rowsToPrintHtml(rows);
    const titleMesa = (mesa?.number ?? mesa?.name ?? data?.mesa?.number ?? data?.mesa?.name ?? "Conta")
      .toString()
      .replace(/</g, "");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recibo - ${titleMesa}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.4;
              width: ${THERMAL_WIDTH_MM}mm;
              max-width: ${THERMAL_WIDTH_MM}mm;
              padding: 4mm;
              margin: 0 auto;
              background: #fff;
              color: #000;
            }
            .t-center { text-align: center; }
            .t-strong { font-weight: 600; }
            .t-small { font-size: 11px; color: #333; }
            .t-left { text-align: left; margin-bottom: 2px; word-break: break-word; }
            .t-pedido { font-weight: 600; margin-top: 8px; margin-bottom: 4px; font-size: 11px; color: #444; }
            .blank { height: 6px; }
            .hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 12px;
              width: 100%;
              margin-bottom: 4px;
            }
            .row.muted { opacity: 0.85; font-size: 11px; }
            .row-l { flex: 1; min-width: 0; text-align: left; word-break: break-word; }
            .row-r { flex-shrink: 0; white-space: nowrap; text-align: right; font-variant-numeric: tabular-nums; }
            .row.total { font-weight: 700; margin-top: 10px; padding-top: 8px; border-top: 2px solid #000; }
            .t-footer { text-align: center; margin-top: 12px; font-size: 11px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!data) return null;

  const isVendaDireta = !data.mesa;
  const tipoConta = isVendaDireta ? "VENDA PDV" : data.mesa?.type === "comanda" ? "COMANDA" : "MESA";
  const numeroConta = isVendaDireta ? "" : data.mesa?.number || data.mesa?.name || "";

  return (
    <>
      <Dialog open={open} onClose={onClose} className={classes.dialogPaper} maxWidth="sm" fullWidth>
        <DialogTitle>Recibo — {numeroConta ? `${tipoConta} ${numeroConta}` : tipoConta}</DialogTitle>
        <DialogContent>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} indicatorColor="primary" textColor="primary">
            <Tab label="Detalhado (por pedido)" />
            <Tab label="Impressão reduzida" />
          </Tabs>
          <Box mt={1}>
            <Box className={classes.reciboWrap} id="recibo-termico-pdv">
              <ReciboBody rows={rows} classes={classes} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={onClose} color="primary" variant="outlined">
            Fechar
          </Button>
          <Button onClick={handlePrint} color="primary" variant="contained" startIcon={<PrintIcon />}>
            Imprimir
          </Button>
          <Button
            onClick={handleWhatsAppClick}
            color="primary"
            variant="contained"
            style={{ backgroundColor: "#25D366", color: "#fff" }}
            startIcon={sendingWa ? <CircularProgress size={18} color="inherit" /> : <WhatsAppIcon />}
            disabled={sendingWa}
          >
            PDF no WhatsApp
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={phoneDialogOpen} onClose={() => !sendingWa && setPhoneDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Telefone para envio</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Não há telefone válido no cadastro da mesa. Informe o número com DDD (apenas números).
          </Typography>
          <TextField
            fullWidth
            label="WhatsApp"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="5511999998888"
            variant="outlined"
            margin="dense"
            disabled={sendingWa}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhoneDialogOpen(false)} disabled={sendingWa}>
            Cancelar
          </Button>
          <Button color="primary" variant="contained" disabled={sendingWa} onClick={() => sendPdfToNumber(phoneInput)}>
            {sendingWa ? <CircularProgress size={22} /> : "Enviar PDF"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
