import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Button,
} from "@material-ui/core";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  EventSeat as EventSeatIcon,
  Chat as ChatIcon,
  AccessTime as TimeIcon,
  Link as LinkIcon,
  AddCircle as AddCircleIcon,
} from "@material-ui/icons";
import { QrCode2 as QrCodeIcon } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import MesaQRModal from "../MesaQRModal";
import { ptBR } from "date-fns/locale";

const useStyles = makeStyles((theme) => ({
  card: {
    borderRadius: 12,
    transition: "all 0.2s ease",
    background: theme.palette.background.paper,
    border: `2px solid ${theme.palette.divider}`,
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardLivree: {
    borderColor: "#22C55E",
    borderLeftWidth: 4,
  },
  cardOcupada: {
    borderColor: "#F59E0B",
    borderLeftWidth: 4,
  },
  sectionSalao: { borderLeftColor: "#3B82F6" },
  sectionVaranda: { borderLeftColor: "#10B981" },
  sectionAreaExterna: { borderLeftColor: "#F59E0B" },
  cardContent: {
    flex: 1,
    padding: theme.spacing(1.5),
    display: "flex",
    flexDirection: "column",
    "&:last-child": {
      paddingBottom: theme.spacing(1.5),
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  mesaNumber: {
    fontWeight: 700,
    fontSize: "1.25rem",
    color: theme.palette.text.primary,
  },
  statusChip: {
    fontWeight: 600,
  },
  contactInfo: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    borderRadius: 8,
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
  },
  contactName: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  occupiedTime: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  sectionLabel: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    marginTop: 4,
  },
  actions: {
    marginTop: "auto",
    paddingTop: theme.spacing(1),
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
    justifyContent: "flex-end",
  },
  actionBtn: {
    padding: 4,
  },
}));

const MesaCard = ({
  mesa,
  onOcupar,
  onLiberar,
  onEdit,
  onDelete,
  onVerTicket,
  onCopyLink,
  onAdicionarPedido,
  cardapioSlug,
}) => {
  const classes = useStyles();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const isOcupada = mesa.status === "ocupada";
  const slug = mesa.form?.slug || cardapioSlug;
  const sectionClass = mesa.section === "varanda" ? classes.sectionVaranda
    : mesa.section === "area_externa" ? classes.sectionAreaExterna
    : mesa.section === "salao" ? classes.sectionSalao : "";

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const url = mesa.linkUrl || (slug ? `${window.location.origin}/f/${slug}?mesa=${mesa.id}` : null);
    if (!url) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        if (onCopyLink) onCopyLink(url);
      });
    }
  };

  return (
    <Card className={`${classes.card} ${isOcupada ? classes.cardOcupada : classes.cardLivree} ${sectionClass}`}>
      <CardContent className={classes.cardContent}>
        <Box className={classes.header}>
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography className={classes.mesaNumber}>
              {(mesa.type === "comanda" ? "Comanda " : "Mesa ") + (mesa.name || mesa.number)}
            </Typography>
            <Chip size="small" label={mesa.type === "comanda" ? "Comanda" : "Mesa"} variant="outlined" style={{ fontSize: "0.7rem" }} />
          </Box>
          <Chip
            size="small"
            label={isOcupada ? "Ocupada" : "Livre"}
            color={isOcupada ? "secondary" : "primary"}
            className={classes.statusChip}
            style={{
              backgroundColor: isOcupada ? "#F59E0B" : "#22C55E",
              color: "#fff",
            }}
          />
        </Box>

        {mesa.section && (
          <Typography className={classes.sectionLabel}>
            {mesa.section}
          </Typography>
        )}

        {isOcupada && mesa.contact && (
          <Box className={classes.contactInfo}>
            <Typography className={classes.contactName}>
              <PersonIcon fontSize="small" />
              {mesa.contact.name || mesa.contact.number || "Sem nome"}
            </Typography>
            {mesa.occupiedAt && (
              <Typography className={classes.occupiedTime}>
                <TimeIcon fontSize="small" />
                Ocupada há {formatDistanceToNow(new Date(mesa.occupiedAt), { addSuffix: false, locale: ptBR })}
              </Typography>
            )}
          </Box>
        )}

        <Box className={classes.actions}>
          {isOcupada ? (
            <>
              {onAdicionarPedido && (
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  onClick={() => onAdicionarPedido(mesa)}
                >
                  Adicionar pedido
                </Button>
              )}
              {mesa.ticketId && (
                <Tooltip title="Ver ticket">
                  <IconButton
                    size="small"
                    className={classes.actionBtn}
                    onClick={() => { if (onVerTicket) onVerTicket(mesa); }}
                  >
                    <ChatIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => { if (onLiberar) onLiberar(mesa); }}
              >
                Liberar
              </Button>
            </>
          ) : (
            <Button
              size="small"
              color="primary"
              variant="contained"
              startIcon={<EventSeatIcon />}
              onClick={() => { if (onOcupar) onOcupar(mesa); }}
            >
              Ocupar
            </Button>
          )}
          {(slug || mesa.linkUrl) && (
            <>
              <Tooltip title="Ver QR Code do cardápio para esta mesa">
                <IconButton
                  size="small"
                  className={classes.actionBtn}
                  onClick={() => setQrModalOpen(true)}
                >
                  <QrCodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copiar link do cardápio para esta mesa">
                <IconButton
                  size="small"
                  className={classes.actionBtn}
                  onClick={handleCopyLink}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Editar">
            <IconButton
              size="small"
              className={classes.actionBtn}
              onClick={() => { if (onEdit) onEdit(mesa); }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              className={classes.actionBtn}
              color="secondary"
              onClick={() => { if (onDelete) onDelete(mesa); }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
      <MesaQRModal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        mesa={mesa}
        cardapioSlug={cardapioSlug}
      />
    </Card>
  );
};

export default MesaCard;
