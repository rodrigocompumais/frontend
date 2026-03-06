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
// Tempo mínimo entre leituras do mesmo QR ou qualquer QR (ms)
const SCAN_LOCK_MS = 2500;

const EntregadorScanModal = ({ open, onClose, onScan }) => {
  const classes = useStyles();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const onScanRef = useRef(onScan);
  const scanLockRef = useRef(false);
  // Conjunto de tokens já lidos nesta sessão do modal, para não re-disparar API
  const seenTextsRef = useRef(new Set());
  // Flag para evitar chamadas concorrentes de startScanner
  const startingRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    // Null antes de await para que re-entrância não use o mesmo ref
    scannerRef.current = null;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch (_) {}
    try {
      await scanner.clear();
    } catch (_) {}
    // Limpa o DOM manualmente — html5-qrcode às vezes deixa resíduos de vídeo
    const el = document.getElementById(READER_ID);
    if (el) el.innerHTML = "";
  };

  useEffect(() => {
    if (!open) {
      stopScanner();
      seenTextsRef.current = new Set();
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      if (startingRef.current) return;
      startingRef.current = true;
      setStarting(true);
      setError(null);
      // Pequena pausa para o DOM renderizar o div antes de injetar o scanner
      await new Promise((r) => setTimeout(r, 150));
      if (cancelled) { startingRef.current = false; return; }

      try {
        // Garante limpeza de qualquer instância anterior
        await stopScanner();
        if (cancelled) { startingRef.current = false; return; }

        const el = document.getElementById(READER_ID);
        if (!el) {
          setError("Elemento do scanner não encontrado.");
          startingRef.current = false;
          return;
        }
        // Limpa resíduos de vídeo antes de criar nova instância
        el.innerHTML = "";

        const html5QrCode = new Html5Qrcode(READER_ID);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            const text = (decodedText || "").trim();

            // Ignora silenciosamente se já leu este texto nesta sessão
            if (seenTextsRef.current.has(text)) return;

            // Ignora se o lock global ainda está ativo
            if (scanLockRef.current) return;

            scanLockRef.current = true;
            seenTextsRef.current.add(text);

            try {
              const scanFn = onScanRef.current;
              if (scanFn && typeof scanFn === "function") {
                await Promise.resolve(scanFn(text));
              }
            } finally {
              // Lock mais longo para evitar re-leitura acidental
              setTimeout(() => {
                scanLockRef.current = false;
              }, SCAN_LOCK_MS);
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("EntregadorScanModal error:", err);
        setError(err?.message || "Não foi possível acessar a câmera.");
      } finally {
        setStarting(false);
        startingRef.current = false;
      }
    };

    startScanner();
    return () => {
      cancelled = true;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    stopScanner();
    setError(null);
    seenTextsRef.current = new Set();
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
            <Box
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
              style={{ minHeight: 240 }}
            >
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
