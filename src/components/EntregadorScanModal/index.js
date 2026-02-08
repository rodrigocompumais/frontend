import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@material-ui/core";
import { Html5Qrcode } from "html5-qrcode";

const useStyles = makeStyles((theme) => ({
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(2),
    minHeight: 280,
  },
  readerWrap: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    "& video": { width: "100%" },
  },
  hint: {
    marginTop: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const READER_ID = "entregador-scan-qr-reader";

const EntregadorScanModal = ({ open, onClose, onScan }) => {
  const classes = useStyles();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    let html5QrCode = null;
    let cancelled = false;

    const startScanner = async () => {
      setStarting(true);
      setError(null);
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      try {
        if (!document.getElementById(READER_ID)) {
          setError("Elemento do scanner não encontrado.");
          return;
        }
        html5QrCode = new Html5Qrcode(READER_ID);
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (onScan && typeof onScan === "function") {
              onScan((decodedText || "").trim());
            }
          },
          () => {}
        );
        scannerRef.current = html5QrCode;
      } catch (err) {
        console.error("EntregadorScanModal error:", err);
        setError(err?.message || "Não foi possível acessar a câmera.");
      } finally {
        setStarting(false);
      }
    };

    startScanner();
    return () => {
      cancelled = true;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, [open, onScan]);

  const handleClose = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    scannerRef.current = null;
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Escanear QR do pedido</DialogTitle>
      <DialogContent>
        <Box className={classes.content}>
          <Box className={classes.readerWrap}>
            <div id={READER_ID} style={{ width: "100%", minHeight: 240 }} />
          </Box>
          {starting && (
            <Box position="absolute" display="flex" alignItems="center" justifyContent="center" style={{ minHeight: 240 }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Typography color="error" style={{ marginTop: 16 }}>
              {error}
            </Typography>
          )}
          <Typography className={classes.hint} variant="body2">
            Aponte para o QR Code impresso no pedido. Feche quando terminar de adicionar os pedidos.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Concluir coleta
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntregadorScanModal;
