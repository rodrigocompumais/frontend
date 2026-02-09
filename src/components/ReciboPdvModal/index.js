import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@material-ui/core";
import PrintIcon from "@material-ui/icons/Print";
import { makeStyles } from "@material-ui/core/styles";

/**
 * Recibo em formato térmico (80mm) para PDV.
 * Exibe "Documento sem valor fiscal" e permite imprimir.
 */
const THERMAL_WIDTH_MM = 80;
const CHARS_PER_LINE = 48;

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      maxWidth: 360,
    },
  },
  actions: {
    padding: theme.spacing(2),
    flexWrap: "wrap",
  },
  /** Área do recibo: largura de impressora térmica 80mm (≈302px @96dpi) */
  reciboWrap: {
    width: `${THERMAL_WIDTH_MM}mm`,
    maxWidth: "100%",
    margin: "0 auto",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 12,
    lineHeight: 1.35,
    padding: theme.spacing(2),
    backgroundColor: "#fff",
    color: "#000",
    border: "1px dashed #ccc",
    borderRadius: 4,
  },
  reciboLine: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    marginBottom: 2,
  },
  reciboCenter: {
    textAlign: "center",
  },
  reciboTotal: {
    fontWeight: 700,
    marginTop: 8,
    borderTop: "2px solid #000",
    paddingTop: 8,
  },
  /** Usado na impressão: esconder resto da página e mostrar só o recibo em 80mm */
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

function centerText(text, width = CHARS_PER_LINE) {
  if (!text || text.length >= width) return text;
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(pad) + text;
}

function padRight(text, width) {
  const t = String(text || "").slice(0, width);
  return t + " ".repeat(Math.max(0, width - t.length));
}

function padLeft(text, width) {
  const t = String(text || "").slice(0, width);
  return " ".repeat(Math.max(0, width - t.length)) + t;
}

export default function ReciboPdvModal({ open, onClose, data, mesa }) {
  const classes = useStyles();

  const buildPrintHtml = (linesArray) => {
    const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return linesArray
      .map((line, i) => {
        const isCenter = i <= 3 || line === "Obrigado! Volte sempre.";
        const isTotal = line.startsWith("TOTAL:");
        const cls = ["line", isCenter ? "center" : "", isTotal ? "total" : ""].filter(Boolean).join(" ");
        return `<div class="${cls}">${esc(line || " ")}</div>`;
      })
      .join("");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    const printContent = buildPrintHtml(lines);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recibo - ${(mesa?.number || mesa?.name || "Conta").toString().replace(/</g, "")}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.35;
              width: ${THERMAL_WIDTH_MM}mm;
              max-width: ${THERMAL_WIDTH_MM}mm;
              padding: 4mm;
              margin: 0 auto;
              background: #fff;
              color: #000;
            }
            .line { white-space: pre-wrap; word-break: break-word; margin-bottom: 2px; }
            .center { text-align: center; }
            .total { font-weight: 700; margin-top: 8px; border-top: 2px solid #000; padding-top: 8px; }
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

  const tipoConta = data.mesa?.type === "comanda" ? "COMANDA" : "MESA";
  const numeroConta = data.mesa?.number || data.mesa?.name || "";
  const dataHora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const clienteNome = data.cliente?.name || data.cliente?.number || "";

  const lines = [];
  lines.push(centerText("RECIBO"));
  lines.push("");
  lines.push(centerText("DOCUMENTO SEM VALOR FISCAL"));
  lines.push("");
  lines.push(centerText("--------------------------------"));
  lines.push(`${tipoConta}: ${numeroConta}`);
  lines.push(`Data/Hora: ${dataHora}`);
  if (clienteNome) lines.push(`Cliente: ${clienteNome.slice(0, CHARS_PER_LINE - 10)}`);
  lines.push("--------------------------------");
  lines.push("");

  (data.pedidos || []).forEach((pedido) => {
    const protocol = pedido.protocol || `#${pedido.id}`;
    const dataPedido = pedido.submittedAt
      ? new Date(pedido.submittedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
      : "";
    lines.push(`${protocol} ${dataPedido}`);
    (pedido.menuItems || []).forEach((item) => {
      const qty = item.quantity || 0;
      const name = (item.productName || "").slice(0, 28);
      const unitVal = Number(item.productValue) || 0;
      const subtotal = qty * unitVal;
      const line = `  ${qty}x ${name}`.slice(0, 32);
      const valStr = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
      lines.push(padRight(line, CHARS_PER_LINE - valStr.length) + valStr);
    });
    lines.push(padLeft(`Subtotal: R$ ${Number(pedido.total || 0).toFixed(2).replace(".", ",")}`, CHARS_PER_LINE));
    lines.push("");
  });

  lines.push("--------------------------------");
  const totalStr = `R$ ${Number(data.total || 0).toFixed(2).replace(".", ",")}`;
  lines.push(padLeft(`TOTAL: ${totalStr}`, CHARS_PER_LINE));
  lines.push("--------------------------------");
  lines.push("");
  lines.push(centerText("Obrigado! Volte sempre."));

  return (
    <Dialog open={open} onClose={onClose} className={classes.dialogPaper}>
      <DialogTitle>Recibo — {tipoConta} {numeroConta}</DialogTitle>
      <DialogContent>
        <Box className={classes.reciboWrap} id="recibo-termico-pdv">
          {lines.map((line, i) => {
            const isCenter = i <= 3 || line === "Obrigado! Volte sempre.";
            const isTotal = line.startsWith("TOTAL:");
            return (
              <div
                key={i}
                className={`${classes.reciboLine} ${isCenter ? classes.reciboCenter : ""} ${isTotal ? classes.reciboTotal : ""}`}
              >
                {line || " "}
              </div>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onClose} color="primary" variant="outlined">
          Fechar
        </Button>
        <Button onClick={handlePrint} color="primary" variant="contained" startIcon={<PrintIcon />}>
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
