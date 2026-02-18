import React from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
} from "@material-ui/core";
import {
  Visibility as VisibilityIcon,
  WhatsApp as WhatsAppIcon,
  AccessTime as TimeIcon,
  EventSeat as EventSeatIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@material-ui/icons";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(1.5),
    borderRadius: 12,
    cursor: "grab",
    transition: "all 0.2s ease",
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    touchAction: "manipulation",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
      borderColor: theme.palette.primary.main,
    },
    "&:active": {
      cursor: "grabbing",
    },
  },
  cardUpdating: {
    opacity: 0.75,
    cursor: "wait",
  },
  cardDragging: {
    boxShadow: theme.shadows[8],
    transform: "rotate(3deg) scale(1.02)",
    opacity: 0.9,
  },
  updatingIndicator: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing(1),
  },
  cardContent: {
    padding: theme.spacing(1.5),
    "&:last-child": {
      paddingBottom: theme.spacing(1.5),
    },
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(2),
      "&:last-child": {
        paddingBottom: theme.spacing(2),
      },
    },
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  contactName: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: theme.palette.text.primary,
    [theme.breakpoints.up("sm")]: {
      fontSize: "1.05rem",
    },
  },
  contactNumber: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: 4,
    [theme.breakpoints.up("sm")]: {
      fontSize: "0.85rem",
    },
  },
  itemsPreview: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.4,
    [theme.breakpoints.up("sm")]: {
      fontSize: "0.9rem",
      WebkitLineClamp: 3,
    },
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing(0.5),
  },
  totalValue: {
    fontWeight: 700,
    fontSize: "1rem",
    color: theme.palette.primary.main,
    [theme.breakpoints.up("sm")]: {
      fontSize: "1.15rem",
    },
  },
  timeInfo: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginTop: theme.spacing(1),
  },
  stageButtonsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.25),
    [theme.breakpoints.up("sm")]: {
      gap: theme.spacing(1.5),
      marginTop: theme.spacing(1.5),
    },
  },
  stageButton: {
    borderRadius: 12,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    fontWeight: 800,
    textTransform: "none",
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(1.25),
      paddingBottom: theme.spacing(1.25),
      fontSize: "0.95rem",
    },
  },
  actionButton: {
    padding: 6,
    "& svg": {
      fontSize: "1rem",
    },
    [theme.breakpoints.up("sm")]: {
      padding: 10,
      "& svg": {
        fontSize: "1.15rem",
      },
    },
  },
  whatsappIcon: {
    fontSize: "0.85rem",
    color: "#25D366",
  },
  mesaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    color: "#B45309",
    marginTop: 4,
    cursor: "pointer",
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 0.85,
    },
  },
}));

const PedidoKanbanCard = ({
  order,
  onCardClick,
  onViewDetails,
  onWhatsApp,
  showStageButtons = false,
  canBack = false,
  canAdvance = false,
  onBack,
  onAdvance,
  isDragging = false,
  isUpdating = false,
  provided,
}) => {
  const classes = useStyles();
  const history = useHistory();

  const getOrderTotal = () => {
    const metadata = order?.metadata || {};
    // Se já tem total salvo, usar ele (já inclui taxa de entrega)
    if (metadata.total != null) return Number(metadata.total);
    
    // Caso contrário, calcular: soma dos itens + taxa de entrega
    const items = metadata.menuItems || [];
    const itemsTotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const val = Number(item.productValue) || 0;
      return sum + qty * val;
    }, 0);
    
    // Adicionar taxa de entrega se existir
    const deliveryFee = Number(metadata.deliveryFee) || 0;
    return itemsTotal + deliveryFee;
  };

  const getItemsPreview = () => {
    const items = order?.metadata?.menuItems || [];
    return items
      .map((i) => `${i.quantity}x ${i.productName || `#${i.productId}`}`)
      .join(", ") || "Sem itens";
  };

  const formatTime = (date) => {
    if (!date) return "";
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "";
    }
  };

  const handleCardClick = (e) => {
    if (isDragging || isUpdating) return;
    if (onCardClick && !e.defaultPrevented) {
      onCardClick(order);
    }
  };

  return (
    <Card
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`${classes.card} ${isDragging ? classes.cardDragging : ""} ${isUpdating ? classes.cardUpdating : ""}`}
      onClick={handleCardClick}
      style={{
        ...(provided?.draggableProps?.style || {}),
        cursor: isUpdating ? "wait" : (onCardClick ? "pointer" : undefined),
      }}
    >
      <CardContent className={classes.cardContent}>
        <Box className={classes.header}>
          <Box>
            <Typography className={classes.contactName}>
              {order?.responderName || "Sem nome"}
            </Typography>
            {(order?.protocol || order?.id) && (
              <Typography variant="caption" color="textSecondary" style={{ fontFamily: "monospace", display: "block" }}>
                {order.protocol || `#${order.id}`}
                <span style={{ marginLeft: 8, fontFamily: "inherit" }}>
                  • {(order?.metadata?.orderType === "delivery" ? "Delivery" : "Mesa")}
                </span>
              </Typography>
            )}
          </Box>
          {isUpdating && (
            <Tooltip title="Atualizando status...">
              <span className={classes.updatingIndicator}>
                <CircularProgress size={16} />
              </span>
            </Tooltip>
          )}
        </Box>
        <Typography className={classes.contactNumber}>
          <WhatsAppIcon className={classes.whatsappIcon} fontSize="inherit" />
          {order?.responderPhone || "Sem número"}
        </Typography>
        {(order?.metadata?.tableNumber || order?.metadata?.tableId) && (
          <Tooltip title="Ir para Mesas">
            <Typography
              component="span"
              className={classes.mesaBadge}
              onClick={(e) => {
                e.stopPropagation();
                const mesaId = order?.metadata?.tableId;
                history.push(mesaId != null ? `/mesas?mesaId=${mesaId}` : "/mesas");
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  const mesaId = order?.metadata?.tableId;
                  history.push(mesaId != null ? `/mesas?mesaId=${mesaId}` : "/mesas");
                }
              }}
            >
              <EventSeatIcon style={{ fontSize: "0.75rem" }} />
              Mesa {order.metadata.tableNumber || order.metadata.tableId}
            </Typography>
          </Tooltip>
        )}
        <Typography className={classes.itemsPreview}>{getItemsPreview()}</Typography>
        <Box className={classes.totalRow}>
          <Box className={classes.timeInfo}>
            <TimeIcon style={{ fontSize: "0.85rem" }} />
            {formatTime(order?.submittedAt)}
          </Box>
          <Typography className={classes.totalValue}>
            R$ {getOrderTotal().toFixed(2).replace(".", ",")}
          </Typography>
        </Box>
        <Box className={classes.actions}>
          {onViewDetails && (
            <Tooltip title="Ver detalhes">
              <IconButton
                size="small"
                className={classes.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(order);
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          )}
          {onWhatsApp && order?.responderPhone && (
            <Tooltip title="WhatsApp">
              <IconButton
                size="small"
                className={classes.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onWhatsApp(order);
                }}
              >
                <WhatsAppIcon style={{ color: "#25D366" }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {showStageButtons && (
          <Box className={classes.stageButtonsRow}>
            <Button
              variant="outlined"
              color="default"
              startIcon={<ArrowBackIcon />}
              className={classes.stageButton}
              disabled={!canBack || isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                if (onBack) onBack(order);
              }}
              fullWidth
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              className={classes.stageButton}
              disabled={!canAdvance || isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                if (onAdvance) onAdvance(order);
              }}
              fullWidth
            >
              Avançar
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PedidoKanbanCard;
