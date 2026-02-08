import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
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
import { toast } from "react-toastify";

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
    "& video": {
      width: "100%",
    },
  },
  hint: {
    marginTop: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const READER_ID = "quick-scan-qr-reader";

/**
 * Extrai path do app a partir do conteúdo escaneado (URL ou path).
 * Aceita: /garcom, /cozinha, https://origin/garcom, etc.
 */
function getAppPathFromScan(decodedText, origin = window.location.origin) {
  const raw = (decodedText || "").trim();
  if (!raw) return null;
  // Já é um path (começa com /)
  if (raw.startsWith("/")) {
    return raw.split("?")[0];
  }
  try {
    const url = new URL(raw);
    if (url.origin !== origin) return null;
    return url.pathname || "/";
  } catch {
    return null;
  }
}

const QuickScanModal = ({ open, onClose }) => {
  const classes = useStyles();
  const history = useHistory();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    let html5QrCode = null;
    const elementId = READER_ID;
    let cancelled = false;

    const startScanner = async () => {
      setStarting(true);
      setError(null);
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      try {
        if (!document.getElementById(elementId)) {
          setError("Elemento do scanner não encontrado.");
          return;
        }
        html5QrCode = new Html5Qrcode(elementId);
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            const path = getAppPathFromScan(decodedText);
            if (path) {
              html5QrCode.stop().catch(() => {});
              onClose();
              history.push(path);
              toast.success(`Abrindo: ${path}`);
            } else {
              toast.info("QR Code não é um link desta aplicação.");
            }
          },
          () => {}
        );
        scannerRef.current = html5QrCode;
      } catch (err) {
        console.error("QuickScan start error:", err);
        setError(err?.message || "Não foi possível acessar a câmera.");
        toast.error("Erro ao acessar a câmera. Verifique as permissões.");
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
  }, [open, onClose, history]);

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
      <DialogTitle>Escanear QR Code</DialogTitle>
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
            Aponte a câmera para o QR Code do garçom, cozinha ou outro link da aplicação.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickScanModal;
