import React, { useState, useRef, useEffect, useContext } from "react";

import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import { SocketContext } from "../../context/Socket/SocketContext";

import useSound from "use-sound";

import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";
import ChatIcon from "@material-ui/icons/Chat";

import TicketListItem from "../TicketListItemCustom";
import useTickets from "../../hooks/useTickets";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { canNotifyBrowserForTicket, canUserAccessTicket } from "../../utils/ticketEligibility";

const useStyles = makeStyles(theme => ({
	tabContainer: {
		overflowY: "auto",
		maxHeight: 350,
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.text.primary,
		...theme.scrollbarStyles,
	},
	popoverPaper: {
		width: "100%",
		maxWidth: 350,
		marginLeft: theme.spacing(2),
		marginRight: theme.spacing(1),
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.text.primary,
		border: `1px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
		boxShadow: theme.shadows[8],
		[theme.breakpoints.down("sm")]: {
			maxWidth: 270,
		},
	},
	noShadow: {
		boxShadow: "none !important",
	},
	listItem: {
		color: theme.palette.text.primary,
		"&:hover": {
			backgroundColor: theme.palette.type === "dark" 
				? "rgba(255, 255, 255, 0.08)" 
				: "rgba(0, 0, 0, 0.04)",
		},
	},
	listItemText: {
		color: theme.palette.text.primary,
	},
}));

const NotificationsPopOver = (volume) => {
	const classes = useStyles();

	const history = useHistory();
	const { user } = useContext(AuthContext);
	const ticketIdUrl = +history.location.pathname.split("/")[2];
	const ticketIdRef = useRef(ticketIdUrl);
	const anchorEl = useRef();
	const [isOpen, setIsOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);

	const [showPendingTickets, setShowPendingTickets] = useState(false);

	const [, setDesktopNotifications] = useState([]);

	const { tickets } = useTickets({ withUnreadMessages: "true" });

	const [play] = useSound(alertSound, volume);
	const soundAlertRef = useRef();

	const historyRef = useRef(history);

  const socketManager = useContext(SocketContext);

	useEffect(() => {
		const fetchSettings = async () => {
			try {

				if (user.allTicket === "enable") {
					setShowPendingTickets(true);
				}
			} catch (err) {
			  	toastError(err);
			}
		}
	  
		fetchSettings();
	}, []);

	useEffect(() => {
		soundAlertRef.current = play;

		if (!("Notification" in window)) {
			if (process.env.NODE_ENV !== 'production') {
				console.log("This browser doesn't support notifications");
			}
		} else {
			// Solicitar permissão se ainda não foi concedida
			if (Notification.permission === "default") {
				Notification.requestPermission().then(permission => {
					if (process.env.NODE_ENV !== 'production') {
						if (permission === "granted") {
							console.log("Permissão de notificação concedida");
						} else {
							console.warn("Permissão de notificação negada");
						}
					}
				});
			}
		}
	}, [play]);

	useEffect(() => {
		const processNotifications = () => {
			if (showPendingTickets) {
				setNotifications(tickets);
			} else {
				const newNotifications = tickets.filter(ticket => ticket.status !== "pending");

				setNotifications(newNotifications);
			}
		}

		processNotifications();
	}, [tickets]);

	useEffect(() => {
		ticketIdRef.current = ticketIdUrl;
	}, [ticketIdUrl]);

	useEffect(() => {
    const socket = socketManager.getSocket(user.companyId);

		socket.on("ready", () => socket.emit("joinNotification"));

		socket.on(`company-${user.companyId}-ticket`, data => {
			if (data.action === "updateUnread" || data.action === "delete") {
				setNotifications(prevState => {
					const ticketIndex = prevState.findIndex(t => t.id === data.ticketId);
					if (ticketIndex !== -1) {
						prevState.splice(ticketIndex, 1);
						return [...prevState];
					}
					return prevState;
				});

				setDesktopNotifications(prevState => {
					const notfiticationIndex = prevState.findIndex(
						n => n.tag === String(data.ticketId)
					);
					if (notfiticationIndex !== -1) {
						prevState[notfiticationIndex].close();
						prevState.splice(notfiticationIndex, 1);
						return [...prevState];
					}
					return prevState;
				});
			}
		});

		socket.on(`company-${user.companyId}-appMessage`, data => {
			const ticket = data.ticket || {};
			const canAccessTicket = canUserAccessTicket(ticket, user, {
				allowUnassignedPending: true,
				allowUnassignedWithoutQueue: true
			});

			if (
				data.action === "create" && !data.message.fromMe && 
				(!data.message.read || ticket.status === "pending") &&
				canAccessTicket
			) {
				setNotifications(prevState => {
					const ticketIndex = prevState.findIndex(t => t.id === ticket.id);
					if (ticketIndex !== -1) {
						prevState[ticketIndex] = ticket;
						return [...prevState];
					}
					return [ticket, ...prevState];
				});

				const shouldNotNotificate =
					(data.message.ticketId === ticketIdRef.current &&
						document.visibilityState === "visible") ||
					!canNotifyBrowserForTicket(ticket, user) ||
					ticket.isGroup;

				if (shouldNotNotificate) return;

				handleNotifications(data);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [user, showPendingTickets, socketManager]);

	const getNotificationTitle = (contact) => {
		const name = contact?.name?.trim?.() || "";
		const number = contact?.number || "";
		const onlyDigits = /^\d+$/.test(name);
		const displayName = name && !onlyDigits && name !== number
			? name
			: (number ? number : i18n.t("tickets.notification.contact"));
		return `${i18n.t("tickets.notification.message")} ${displayName}`;
	};

	const getNotificationBody = (message) => {
		const body = message?.body?.trim?.() || "";
		const mediaTypeLabels = {
			extendedTextMessage: i18n.t("tickets.notification.newMessage"),
			conversation: i18n.t("tickets.notification.newMessage"),
			imageMessage: "🖼 " + (i18n.t("tickets.notification.image") || "Imagem"),
			videoMessage: "🎬 " + (i18n.t("tickets.notification.video") || "Vídeo"),
			audioMessage: "🎵 " + (i18n.t("tickets.notification.audio") || "Áudio"),
			documentMessage: "📎 " + (i18n.t("tickets.notification.document") || "Documento"),
			stickerMessage: "🖼 " + (i18n.t("tickets.notification.sticker") || "Figurinha"),
		};
		if (body && !mediaTypeLabels[body]) {
			return body.length > 100 ? body.substring(0, 97) + "..." : body;
		}
		return mediaTypeLabels[body] || i18n.t("tickets.notification.newMessage");
	};

	const handleNotifications = data => {
		const { message, contact, ticket } = data;
		const safeContact = contact || {};
		const bodyText = getNotificationBody(message);

		// Usar tag única combinando ticket.id e message.id para permitir múltiplas notificações
		const uniqueTag = `ticket-${ticket.id}-msg-${message.id || Date.now()}`;

		const options = {
			body: `${bodyText} - ${format(new Date(), "HH:mm")}`,
			icon: safeContact.urlPicture,
			tag: uniqueTag,
			renotify: true,
			requireInteraction: false, // Permite que a notificação desapareça automaticamente
		};

		// Verificar permissão antes de criar notificação
		if (Notification.permission !== "granted") {
			if (process.env.NODE_ENV !== 'production') {
				console.warn("Permissão de notificação não concedida");
			}
			return;
		}

		try {
			const notification = new Notification(
				getNotificationTitle(safeContact),
				options
			);

			notification.onclick = e => {
				e.preventDefault();
				window.focus();
				notification.close();
				historyRef.current.push(`/tickets/${ticket.uuid}`);
				// handleChangeTab(null, ticket.isGroup? "group" : "open");
			};

			// Fechar notificação automaticamente após 10 segundos
			setTimeout(() => {
				notification.close();
			}, 10000);

			setDesktopNotifications(prevState => {
				// Remover notificações antigas do mesmo ticket (manter apenas as últimas 3)
				const ticketNotifications = prevState.filter(
					n => n.tag && n.tag.startsWith(`ticket-${ticket.id}-`)
				);
				
				if (ticketNotifications.length >= 3) {
					// Fechar a mais antiga
					const oldest = ticketNotifications[ticketNotifications.length - 1];
					if (oldest) {
						oldest.close();
					}
					// Remover do estado
					prevState = prevState.filter(n => n !== oldest);
				}

				// Adicionar nova notificação
				return [notification, ...prevState];
			});

			soundAlertRef.current();
		} catch (error) {
			console.error("Erro ao criar notificação:", error);
		}
	};

	const handleClick = () => {
		setIsOpen(prevState => !prevState);
	};

	const handleClickAway = () => {
		setIsOpen(false);
	};

	const NotificationTicket = ({ children }) => {
		return <div onClick={handleClickAway}>{children}</div>;
	};

	return (
		<>
			<IconButton
				onClick={handleClick}
				ref={anchorEl}
				aria-label="Open Notifications"
				color="inherit"
				style={{color:"white"}}
			>
				<Badge overlap="rectangular" badgeContent={notifications.length} color="secondary">
					<ChatIcon />
				</Badge>
			</IconButton>
			<Popover
				disableScrollLock
				open={isOpen}
				anchorEl={anchorEl.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				classes={{ paper: classes.popoverPaper }}
				onClose={handleClickAway}
			>
				<List dense className={classes.tabContainer}>
					{notifications.length === 0 ? (
						<ListItem className={classes.listItem}>
							<ListItemText 
								className={classes.listItemText}
								primary={i18n.t("notifications.noTickets")}
							/>
						</ListItem>
					) : (
						notifications.map(ticket => (
							<NotificationTicket key={ticket.id}>
								<TicketListItem ticket={ticket} />
							</NotificationTicket>
						))
					)}
				</List>
			</Popover>
		</>
	);
};

export default NotificationsPopOver;