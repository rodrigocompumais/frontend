import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Badge,
} from "@material-ui/core";
import {
  Visibility as VisibilityIcon,
  SwapHoriz as TransferIcon,
  MoreVert as MoreIcon,
  AccessTime as TimeIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
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
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
      borderColor: theme.palette.primary.main,
    },
    "&:active": {
      cursor: "grabbing",
    },
  },
  cardDragging: {
    boxShadow: theme.shadows[8],
    transform: "rotate(3deg)",
    opacity: 0.9,
  },
  cardContent: {
    padding: theme.spacing(1.5),
    "&:last-child": {
      paddingBottom: theme.spacing(1.5),
    },
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  contactInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: theme.palette.primary.main,
    fontSize: "1rem",
  },
  contactDetails: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: theme.palette.text.primary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  contactNumber: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  unreadBadge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#22C55E",
      color: "#fff",
      fontWeight: 600,
      fontSize: "0.7rem",
    },
  },
  lastMessage: {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.4,
    minHeight: 36,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
  },
  metaInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    flexWrap: "wrap",
  },
  chip: {
    height: 22,
    fontSize: "0.7rem",
    fontWeight: 500,
  },
  queueChip: {
    backgroundColor: (props) => props.queueColor || theme.palette.grey[500],
    color: "#fff",
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
    opacity: 0,
    transition: "opacity 0.2s ease",
    "$card:hover &": {
      opacity: 1,
    },
  },
  actionButton: {
    padding: 4,
    "& svg": {
      fontSize: "1rem",
    },
  },
  userAvatar: {
    width: 20,
    height: 20,
    fontSize: "0.65rem",
    marginRight: 4,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
  },
  ticketId: {
    fontSize: "0.65rem",
    color: theme.palette.text.disabled,
    marginBottom: 2,
  },
  priorityHigh: {
    color: "#EF4444",
  },
  priorityMedium: {
    color: "#F59E0B",
  },
  priorityLow: {
    color: "#22C55E",
  },
  whatsappIcon: {
    fontSize: "0.85rem",
    color: "#25D366",
  },
}));

const KanbanCard = ({ 
  ticket, 
  onViewTicket, 
  onTransfer,
  isDragging = false,
  provided,
}) => {
  const queueColor = ticket.queue?.color || "#6B7280";
  const classes = useStyles({ queueColor });

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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

  const truncateMessage = (message, maxLength = 60) => {
    if (!message) return "Sem mensagens";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <Card
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`${classes.card} ${isDragging ? classes.cardDragging : ""}`}
    >
      <CardContent className={classes.cardContent}>
        {/* Ticket ID */}
        <Typography className={classes.ticketId}>
          #{ticket.id}
        </Typography>

        {/* Header: Avatar + Nome + Badge */}
        <Box className={classes.header}>
          <Box className={classes.contactInfo}>
            <Badge
              badgeContent={ticket.unreadMessages || 0}
              className={classes.unreadBadge}
              invisible={!ticket.unreadMessages}
            >
              <Avatar
                src={ticket.contact?.profilePicUrl}
                className={classes.avatar}
              >
                {getInitials(ticket.contact?.name)}
              </Avatar>
            </Badge>
            <Box className={classes.contactDetails}>
              <Typography className={classes.contactName}>
                {ticket.contact?.name || "Sem nome"}
              </Typography>
              <Typography className={classes.contactNumber}>
                <WhatsAppIcon className={classes.whatsappIcon} />
                {ticket.contact?.number || "Sem número"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Última mensagem */}
        <Typography className={classes.lastMessage}>
          {truncateMessage(ticket.lastMessage)}
        </Typography>

        {/* Footer: Meta info + Actions */}
        <Box className={classes.footer}>
          <Box className={classes.metaInfo}>
            {ticket.queue && (
              <Chip
                label={ticket.queue.name}
                size="small"
                className={`${classes.chip} ${classes.queueChip}`}
              />
            )}
            {ticket.user && (
              <Tooltip title={`Atendente: ${ticket.user.name}`}>
                <Box className={classes.userInfo}>
                  <Avatar className={classes.userAvatar}>
                    {getInitials(ticket.user.name)}
                  </Avatar>
                  {ticket.user.name?.split(" ")[0]}
                </Box>
              </Tooltip>
            )}
          </Box>

          <Box className={classes.timeInfo}>
            <TimeIcon style={{ fontSize: "0.85rem" }} />
            {formatTime(ticket.updatedAt)}
          </Box>
        </Box>

        {/* Action buttons (aparecem no hover) */}
        <Box className={classes.actions} style={{ marginTop: 8 }}>
          <Tooltip title="Ver conversa">
            <IconButton
              size="small"
              className={classes.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                onViewTicket && onViewTicket(ticket.uuid);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Transferir">
            <IconButton
              size="small"
              className={classes.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                onTransfer && onTransfer(ticket);
              }}
            >
              <TransferIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KanbanCard;

