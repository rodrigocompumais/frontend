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
  const onScanRef = useRef(onScan);
  const scanLockRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (_) {}

    try {
      await scanner.clear();
    } catch (_) {}
  };

  useEffect(() => {
    if (!open) {
      stopScanner();
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      setStarting(true);
      setError(null);
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      try {
        await stopScanner();
        if (!document.getElementById(READER_ID)) {
          setError("Elemento do scanner não encontrado.");
          return;
        }
        const html5QrCode = new Html5Qrcode(READER_ID);
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (scanLockRef.current) return;
            scanLockRef.current = true;
            try {
              const scanFn = onScanRef.current;
              if (scanFn && typeof scanFn === "function") {
                await Promise.resolve(scanFn((decodedText || "").trim()));
              }
            } finally {
              setTimeout(() => {
                scanLockRef.current = false;
              }, 450);
            }
          },
          () => {}
        );
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
      stopScanner();
    };
  }, [open]);

  const handleClose = () => {
    stopScanner();
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
