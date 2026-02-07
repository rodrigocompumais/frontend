import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@material-ui/core";
import QRCode from "qrcode.react";
import { toast } from "react-toastify";

const MesaQRModal = ({ open, onClose, mesa }) => {
  const qrRef = useRef(null);

  if (!mesa?.form?.slug) return null;

  const url = `${window.location.origin}/f/${mesa.form.slug}?mesa=${mesa.id}`;
  const mesaLabel = mesa.name || mesa.number || `Mesa ${mesa.id}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Link copiado!");
      });
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qr-mesa-${mesaLabel.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>QR Code - {mesaLabel}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box ref={qrRef}>
            <QRCode value={url} size={220} level="M" renderAs="canvas" />
          </Box>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 16, wordBreak: "break-all", textAlign: "center" }}>
            {url}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCopyLink} color="primary">
          Copiar link
        </Button>
        <Button onClick={handleDownloadQR} color="primary" variant="contained">
          Baixar QR
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MesaQRModal;
