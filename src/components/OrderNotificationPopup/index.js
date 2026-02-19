import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  makeStyles,
} from "@material-ui/core";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import EventSeatIcon from "@material-ui/icons/EventSeat";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(2),
    minWidth: 320,
    maxWidth: 400,
  },
  orderInfo: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  itemsList: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    maxHeight: 200,
    overflowY: "auto",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(0.5, 0),
    fontSize: "0.875rem",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
    fontWeight: 600,
  },
}));

const OrderNotificationPopup = ({ open, order, onView, onClose }) => {
  const classes = useStyles();

  if (!order) return null;

  const metadata = order.metadata || {};
  const menuItems = metadata.menuItems || [];
  const tableNumber = metadata.tableNumber || "N/A";
  const total = metadata.total != null 
    ? Number(metadata.total) 
    : menuItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.productValue) || 0), 0);

  const getOrderTotal = () => {
    return total.toFixed(2).replace(".", ",");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ShoppingCartIcon color="primary" />
          <Typography variant="h6">Novo Pedido Pendente</Typography>
        </Box>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box className={classes.orderInfo}>
          <Box className={classes.infoRow}>
            <EventSeatIcon fontSize="small" color="action" />
            <Typography variant="body2">
              <strong>Mesa:</strong> {tableNumber}
            </Typography>
          </Box>
          {order.protocol && (
            <Box className={classes.infoRow}>
              <Typography variant="body2" color="textSecondary">
                <strong>Protocolo:</strong> {order.protocol}
              </Typography>
            </Box>
          )}
          {order.responderName && (
            <Box className={classes.infoRow}>
              <Typography variant="body2" color="textSecondary">
                <strong>Cliente:</strong> {order.responderName}
              </Typography>
            </Box>
          )}
        </Box>

        {menuItems.length > 0 && (
          <>
            <Divider style={{ margin: "16px 0" }} />
            <Typography variant="subtitle2" gutterBottom>
              Itens do Pedido:
            </Typography>
            <Box className={classes.itemsList}>
              {menuItems.map((item, index) => (
                <Box key={index} className={classes.itemRow}>
                  <Typography variant="body2">
                    {item.quantity}x {item.productName || "Produto"}
                  </Typography>
                  <Typography variant="body2">
                    R$ {((Number(item.quantity) || 0) * (Number(item.productValue) || 0))
                      .toFixed(2)
                      .replace(".", ",")}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box className={classes.totalRow}>
              <Typography variant="subtitle1">
                <strong>Total:</strong>
              </Typography>
              <Typography variant="subtitle1" color="primary">
                <strong>R$ {getOrderTotal()}</strong>
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          Fechar
        </Button>
        {onView && (
          <Button onClick={onView} color="primary" variant="contained">
            Ver Pedido
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrderNotificationPopup;
