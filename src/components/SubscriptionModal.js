import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import CheckoutPage from "./CheckoutPage/CheckoutPage";

/**
 * Modal de assinatura/pagamento usado no Financeiro.
 *
 * - Exibe o CheckoutPage com a fatura selecionada.
 * - Não usa mais o fluxo antigo /subscription (Gerencianet).
 */

const SubscriptionModal = ({ open, onClose, Invoice, mode = "invoice", onPaymentSuccess, onPaymentStart, onPaymentEnd }) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  const handlePaymentSuccess = (invoiceId) => {
    if (onPaymentSuccess) onPaymentSuccess(invoiceId);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="subscription-dialog-title"
    >
      <DialogTitle id="subscription-dialog-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {mode === "subscription"
              ? "Ativar assinatura recorrente"
              : Invoice
              ? `Pagamento da fatura #${Invoice.id}`
              : "Assinatura / Pagamento"}
          </Typography>
          <IconButton edge="end" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {Invoice ? (
          <CheckoutPage
            Invoice={Invoice}
            mode={mode}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentStart={onPaymentStart}
            onPaymentEnd={onPaymentEnd}
            isInsideModal
          />
        ) : (
          <Box p={2}>
            <Typography variant="body2" color="textSecondary">
              Para renovar sua assinatura, acesse o menu Financeiro, selecione
              uma fatura em aberto e clique em &quot;Pagar&quot; para gerar o
              pagamento via Asaas.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
