import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";
import PrintIcon from "@material-ui/icons/Print";
import QRCode from "qrcode.react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  noPrint: {},
  printRoot: {
    "@media print": {
      "& $noPrint": {
        display: "none !important",
      },
    },
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  card: {
    border: "1px solid",
    borderColor: theme.palette.divider,
    borderRadius: 8,
    padding: theme.spacing(1.5),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },
  qrWrap: {
    "& canvas": {
      width: "100% !important",
      height: "auto !important",
      maxWidth: 120,
    },
  },
  label: {
    marginTop: theme.spacing(1),
    fontWeight: 600,
    fontSize: "0.95rem",
    textAlign: "center",
  },
  empty: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const MesaPrintQRModal = ({ open, onClose }) => {
  const classes = useStyles();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setItems([]);
      return;
    }
    setLoading(true);
    api
      .get("/mesas/links-qr")
      .then(({ data }) => {
        setItems(data.items || []);
      })
      .catch((err) => {
        toastError(err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    el.classList.add("mesa-print-qr-print-zone");
    const style = document.createElement("style");
    style.id = "mesa-print-qr-style";
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .mesa-print-qr-print-zone,
        .mesa-print-qr-print-zone * { visibility: visible; }
        .mesa-print-qr-print-zone { position: absolute !important; left: 0; top: 0; width: 100%; padding: 16px; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    el.classList.remove("mesa-print-qr-print-zone");
    const s = document.getElementById("mesa-print-qr-style");
    if (s) s.remove();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className={classes.printRoot}
    >
      <DialogTitle className={classes.noPrint}>Imprimir QR Codes - Todas as mesas</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Typography className={classes.empty}>
            Nenhuma mesa cadastrada.
          </Typography>
        ) : (
          <Box ref={printRef}>
            <Typography variant="h6" align="center" gutterBottom className={classes.noPrint}>
              {items.length} mesa(s) — use o botão Imprimir abaixo
            </Typography>
            <div className={classes.grid}>
              {items.map((item) => (
                <div key={item.mesaId} className={classes.card}>
                  <div className={classes.qrWrap}>
                    <QRCode value={item.url} size={120} level="M" renderAs="canvas" />
                  </div>
                  <Typography className={classes.label}>Mesa {item.label}</Typography>
                </div>
              ))}
            </div>
          </Box>
        )}
      </DialogContent>
      <DialogActions className={classes.noPrint}>
        <Button onClick={onClose}>Fechar</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || items.length === 0}
        >
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MesaPrintQRModal;
