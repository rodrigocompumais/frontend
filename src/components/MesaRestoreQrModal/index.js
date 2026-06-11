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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import QrCodeScannerIcon from "@material-ui/icons/CropFree";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { parseMesaQrContent } from "../../helpers/parseMesaQr";

const READER_ID = "mesa-restore-qr-reader";
const SCAN_LOCK_MS = 2000;

const useStyles = makeStyles((theme) => ({
  readerWrap: {
    width: "100%",
    maxWidth: 320,
    margin: "0 auto",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    "& video": { width: "100%" },
  },
  hint: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
  },
  mesaIdBox: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: 8,
    backgroundColor: theme.palette.type === "dark" ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.08)",
    border: `1px solid ${theme.palette.success.main}55`,
  },
}));

const MesaRestoreQrModal = ({ open, onClose, onSuccess, initialType = "comanda" }) => {
  const classes = useStyles();
  const [step, setStep] = useState("scan");
  const [starting, setStarting] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrContent, setQrContent] = useState("");
  const [pasteLink, setPasteLink] = useState("");
  const [mesaId, setMesaId] = useState(null);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("comanda");
  const [formId, setFormId] = useState("");
  const [forms, setForms] = useState([]);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const scannerRef = useRef(null);
  const scanLockRef = useRef(false);
  const seenTextsRef = useRef(new Set());

  const resetState = () => {
    setStep("scan");
    setScanError(null);
    setQrContent("");
    setPasteLink("");
    setMesaId(null);
    setNumber("");
    setName("");
    setType(initialType === "mesa" ? "mesa" : "comanda");
    setFormId("");
    setAlreadyExists(false);
    seenTextsRef.current = new Set();
  };

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    setType(initialType === "mesa" ? "mesa" : "comanda");
    api.get("/forms?formType=cardapio").then(({ data }) => {
      setForms(data.forms || []);
    }).catch(() => setForms([]));
  }, [open, initialType]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    scannerRef.current = null;
    try {
      if (scanner.isScanning) await scanner.stop();
    } catch (_) {}
    try {
      await scanner.clear();
    } catch (_) {}
    const el = document.getElementById(READER_ID);
    if (el) el.innerHTML = "";
  };

  const processQrContent = async (content) => {
    const parsed = parseMesaQrContent(content);
    if (!parsed) {
      toast.error("QR Code inválido. Use o QR impresso na mesa ou comanda.");
      return;
    }
    setValidating(true);
    try {
      const { data } = await api.post("/mesas/validate-restore-qr", {
        qrContent: content.trim(),
      });
      setQrContent(content.trim());
      setMesaId(data.mesaId);
      setAlreadyExists(Boolean(data.alreadyExists));
      if (data.alreadyExists) {
        toast.warning("Esta mesa/comanda já está cadastrada no sistema.");
      } else {
        setStep("form");
        await stopScanner();
        toast.success("QR válido! Informe o número da comanda/mesa.");
      }
    } catch (err) {
      toastError(err);
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    if (!open || step !== "scan") {
      stopScanner();
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      setStarting(true);
      setScanError(null);
      await new Promise((r) => setTimeout(r, 150));
      if (cancelled) return;

      try {
        await stopScanner();
        const el = document.getElementById(READER_ID);
        if (!el) {
          setScanError("Elemento do scanner não encontrado.");
          return;
        }
        el.innerHTML = "";

        const html5QrCode = new Html5Qrcode(READER_ID);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            const text = (decodedText || "").trim();
            if (!text || seenTextsRef.current.has(text) || scanLockRef.current) return;
            scanLockRef.current = true;
            seenTextsRef.current.add(text);
            try {
              await processQrContent(text);
            } finally {
              setTimeout(() => {
                scanLockRef.current = false;
              }, SCAN_LOCK_MS);
            }
          },
          () => {}
        );
      } catch (err) {
        setScanError(err?.message || "Não foi possível acessar a câmera.");
      } finally {
        setStarting(false);
      }
    };

    startScanner();
    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open, step]);

  const handlePasteValidate = async () => {
    if (!pasteLink.trim()) return;
    await processQrContent(pasteLink.trim());
  };

  const handleRestore = async () => {
    if (!number.trim()) {
      toast.error("Informe o número da mesa ou comanda");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/mesas/restore-from-qr", {
        qrContent,
        number: number.trim(),
        name: name.trim() || null,
        type: type === "comanda" ? "comanda" : "mesa",
        formId: formId ? parseInt(formId, 10) : null,
      });
      toast.success(
        type === "comanda"
          ? "Comanda restaurada! O QR físico volta a funcionar."
          : "Mesa restaurada! O QR físico volta a funcionar."
      );
      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <QrCodeScannerIcon style={{ marginRight: 8 }} />
          Restaurar mesa/comanda pelo QR
        </Box>
      </DialogTitle>
      <DialogContent>
        {step === "scan" && (
          <>
            <Typography variant="body2" color="textSecondary" paragraph>
              Escaneie o QR Code impresso na comanda ou mesa excluída. O sistema recria o cadastro com o
              mesmo identificador para o QR voltar a funcionar.
            </Typography>
            <Box className={classes.readerWrap}>
              <div id={READER_ID} />
            </Box>
            {(starting || validating) && (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={28} />
              </Box>
            )}
            {scanError && (
              <Typography color="error" className={classes.hint}>
                {scanError}
              </Typography>
            )}
            <Typography className={classes.hint}>
              Ou cole o link do QR abaixo:
            </Typography>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              label="Link do QR"
              value={pasteLink}
              onChange={(e) => setPasteLink(e.target.value)}
              placeholder="https://.../mesa/123?t=..."
              margin="dense"
            />
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              style={{ marginTop: 8 }}
              onClick={handlePasteValidate}
              disabled={validating || !pasteLink.trim()}
            >
              Validar link
            </Button>
          </>
        )}

        {step === "form" && mesaId && (
          <>
            <Box className={classes.mesaIdBox}>
              <Typography variant="caption" color="textSecondary">
                Identificador do QR (será restaurado)
              </Typography>
              <Typography variant="h6" style={{ fontWeight: 800 }}>
                #{mesaId}
              </Typography>
            </Box>
            {alreadyExists && (
              <Alert severity="warning" style={{ marginBottom: 16 }}>
                Já existe um cadastro com este QR. Edite a mesa/comanda existente em vez de restaurar.
              </Alert>
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>Tipo</InputLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)} label="Tipo">
                <MenuItem value="mesa">Mesa</MenuItem>
                <MenuItem value="comanda">Comanda</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={type === "comanda" ? "Código da comanda" : "Número da mesa"}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Nome (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="dense"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Formulário cardápio (opcional)</InputLabel>
              <Select value={formId} onChange={(e) => setFormId(e.target.value)} label="Formulário cardápio (opcional)">
                <MenuItem value="">Padrão da empresa</MenuItem>
                {forms.map((f) => (
                  <MenuItem key={f.id} value={String(f.id)}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {step === "form" && !alreadyExists && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleRestore}
            disabled={submitting || !number.trim()}
          >
            {submitting ? <CircularProgress size={24} /> : "Restaurar"}
          </Button>
        )}
        {step === "form" && (
          <Button onClick={() => { setStep("scan"); setMesaId(null); }}>
            Ler outro QR
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MesaRestoreQrModal;
