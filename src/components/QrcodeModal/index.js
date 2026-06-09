import React, { useEffect, useState, useContext, useCallback } from "react";
import QRCode from "qrcode.react";
import toastError from "../../errors/toastError";

import {
  Dialog,
  DialogContent,
  Paper,
  Typography,
  CircularProgress,
  Box,
  makeStyles,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { sanitizeWhatsAppQrCode } from "../../utils/whatsappQrCode";

const useStyles = makeStyles((theme) => ({
  qrContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 256,
    height: 256,
  },
  loadingText: {
    marginTop: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const [qrCode, setQrCode] = useState("");
  const classes = useStyles();
  const socketManager = useContext(SocketContext);
  const { whatsApps } = useContext(WhatsAppsContext);

  const applyQrFromSession = useCallback((session) => {
    if (!session || Number(session.id) !== Number(whatsAppId)) return;

    if (session.status === "CONNECTED") {
      onClose();
      return;
    }

    const qrValue = sanitizeWhatsAppQrCode(session.qrcode);
    if (qrValue) {
      setQrCode(qrValue);
    }
  }, [whatsAppId, onClose]);

  const fetchQrFromApi = useCallback(async () => {
    if (!whatsAppId) return;
    try {
      const { data } = await api.get(`/whatsapp/${whatsAppId}`);
      applyQrFromSession(data);
    } catch (err) {
      toastError(err);
    }
  }, [whatsAppId, applyQrFromSession]);

  useEffect(() => {
    if (!open) {
      setQrCode("");
      return undefined;
    }

    if (!whatsAppId) return undefined;

    setQrCode("");
    fetchQrFromApi();
    return undefined;
  }, [open, whatsAppId, fetchQrFromApi]);

  useEffect(() => {
    if (!open || !whatsAppId) return undefined;

    const whatsApp = whatsApps.find((w) => Number(w.id) === Number(whatsAppId));
    if (whatsApp) {
      applyQrFromSession(whatsApp);
    }
  }, [open, whatsAppId, whatsApps, applyQrFromSession]);

  useEffect(() => {
    if (!open || !whatsAppId) return undefined;

    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleSessionUpdate = (data) => {
      if (data.action !== "update") return;
      applyQrFromSession(data.session);
    };

    const legacyEvent = "whatsappSession";

    socket.on(`company-${companyId}-whatsappSession`, handleSessionUpdate);
    socket.on(legacyEvent, handleSessionUpdate);

    return () => {
      socket.off(`company-${companyId}-whatsappSession`, handleSessionUpdate);
      socket.off(legacyEvent, handleSessionUpdate);
    };
  }, [open, whatsAppId, socketManager, applyQrFromSession]);

  useEffect(() => {
    if (!open || !whatsAppId || qrCode) return undefined;

    const interval = setInterval(() => {
      fetchQrFromApi();
    }, 2500);

    return () => clearInterval(interval);
  }, [open, whatsAppId, qrCode, fetchQrFromApi]);

  const isLoadingQr = open && (!qrCode || qrCode.trim() === "");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
      <DialogContent>
        <Paper elevation={0} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: "20px" }}>
            <Typography
              variant="h2"
              component="h2"
              color="textPrimary"
              gutterBottom
              style={{
                fontFamily: "Montserrat",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              {i18n.t("qrCodeModal.title")}
            </Typography>
            <Typography variant="body1" color="textPrimary" gutterBottom>
              {i18n.t("qrCodeModal.steps.one")}
            </Typography>
            <Typography variant="body1" color="textPrimary" gutterBottom>
              {i18n.t("qrCodeModal.steps.two.partOne")}{" "}
              <svg
                className="MuiSvgIcon-root"
                focusable="false"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>{" "}
              {i18n.t("qrCodeModal.steps.two.partTwo")}{" "}
              <svg
                className="MuiSvgIcon-root"
                focusable="false"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>{" "}
              {i18n.t("qrCodeModal.steps.two.partThree")}
            </Typography>
            <Typography variant="body1" color="textPrimary" gutterBottom>
              {i18n.t("qrCodeModal.steps.three")}
            </Typography>
            <Typography variant="body1" color="textPrimary" gutterBottom>
              {i18n.t("qrCodeModal.steps.four")}
            </Typography>
          </div>
          <div>
            {isLoadingQr ? (
              <Box className={classes.qrContainer}>
                <CircularProgress size={56} />
                <Typography variant="body2" className={classes.loadingText}>
                  {i18n.t("qrCodeModal.generating")}
                </Typography>
              </Box>
            ) : (
              <QRCode value={qrCode} size={256} />
            )}
          </div>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
