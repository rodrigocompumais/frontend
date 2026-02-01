import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { IconButton, Button } from "@material-ui/core";
import { MoreVert, Replay } from "@material-ui/icons";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import UndoRoundedIcon from '@material-ui/icons/UndoRounded';
import Tooltip from '@material-ui/core/Tooltip';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CloseIcon from '@material-ui/icons/Close';
import PanToolIcon from '@material-ui/icons/PanTool';
import { TagsDropdown } from "../TagsDropdown";


const useStyles = makeStyles(theme => ({
	actionButtons: {
		marginRight: theme.spacing(2),
		flex: "none",
		alignSelf: "center",
		marginLeft: "auto",
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1),
	},
	acceptButton: {
		borderRadius: theme.spacing(2),
		padding: theme.spacing(1, 2.5),
		textTransform: "none",
		fontWeight: 600,
		background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
		color: "#FFFFFF",
		boxShadow: theme.shadows[2],
		transition: "all 0.3s ease",
		"&:hover": {
			boxShadow: theme.shadows[4],
			transform: "translateY(-2px)",
			background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
		},
		"&:disabled": {
			background: theme.palette.type === "dark" ? "#374151" : "#E5E7EB",
			color: theme.palette.text.secondary,
		},
	},
	rejectButton: {
		borderRadius: theme.spacing(2),
		padding: theme.spacing(1, 2.5),
		textTransform: "none",
		fontWeight: 600,
		borderColor: theme.palette.error.main,
		color: theme.palette.error.main,
		marginRight: theme.spacing(1),
		transition: "all 0.3s ease",
		"&:hover": {
			borderColor: theme.palette.error.dark,
			backgroundColor: theme.palette.error.main + "10",
		},
	},
	resolveButton: {
		borderRadius: theme.spacing(2),
		padding: theme.spacing(1, 2.5),
		textTransform: "none",
		fontWeight: 600,
		background: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
		color: "#FFFFFF",
		boxShadow: theme.shadows[2],
		transition: "all 0.3s ease",
		"&:hover": {
			boxShadow: theme.shadows[4],
			transform: "translateY(-2px)",
			background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
		},
	},
	reopenButton: {
		borderRadius: theme.spacing(2),
		padding: theme.spacing(1, 2.5),
		textTransform: "none",
		fontWeight: 500,
		border: `2px solid ${theme.palette.type === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}`,
		color: theme.palette.text.primary,
		transition: "all 0.3s ease",
		"&:hover": {
			borderColor: theme.palette.primary.main,
			backgroundColor: theme.palette.type === "dark"
				? "rgba(14, 165, 233, 0.1)"
				: "rgba(14, 165, 233, 0.05)",
			transform: "translateY(-1px)",
		},
	},
	iconButton: {
		borderRadius: theme.spacing(1.5),
		padding: theme.spacing(1),
		transition: "all 0.2s ease",
		"&:hover": {
			backgroundColor: theme.palette.type === "dark"
				? "rgba(255, 255, 255, 0.1)"
				: "rgba(0, 0, 0, 0.08)",
			transform: "scale(1.1)",
		},
	},
	returnIconButton: {
		borderRadius: theme.spacing(1.5),
		padding: theme.spacing(1),
		color: theme.palette.text.secondary,
		transition: "all 0.2s ease",
		"&:hover": {
			backgroundColor: theme.palette.type === "dark"
				? "rgba(255, 255, 255, 0.1)"
				: "rgba(0, 0, 0, 0.08)",
			color: theme.palette.text.primary,
			transform: "scale(1.1)",
		},
	},
	resolveIconButton: {
		borderRadius: theme.spacing(1.5),
		padding: theme.spacing(1),
		color: theme.palette.primary.main,
		transition: "all 0.2s ease",
		"&:hover": {
			backgroundColor: "rgba(14, 165, 233, 0.1)",
			transform: "scale(1.1)",
		},
	},
}));

const TicketActionButtonsCustom = ({ ticket }) => {
	const classes = useStyles();
	const history = useHistory();
	const [anchorEl, setAnchorEl] = useState(null);
	const [loading, setLoading] = useState(false);
	const ticketOptionsMenuOpen = Boolean(anchorEl);
	const { user } = useContext(AuthContext);
	const { setCurrentTicket } = useContext(TicketsContext);

	const handleOpenTicketOptionsMenu = e => {
		setAnchorEl(e.currentTarget);
	};

	const handleCloseTicketOptionsMenu = e => {
		setAnchorEl(null);
	};

	const handleUpdateTicketStatus = async (e, status, userId) => {
		setLoading(true);
		try {
			await api.put(`/tickets/${ticket.id}`, {
				status: status,
				userId: userId || null,
				useIntegration: status === "closed" ? false : ticket.useIntegration,
				promptId: status === "closed" ? false : ticket.promptId,
				integrationId: status === "closed" ? false : ticket.integrationId
			});

			setLoading(false);
			if (status === "open") {
				setCurrentTicket({ ...ticket, code: "#open" });
			} else {
				setCurrentTicket({ id: null, code: null })
				history.push("/tickets");
			}
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	return (
		<div className={classes.actionButtons}>
			{/* Não exibir botões de ação em grupos */}
			{ticket.isGroup ? (
				<>
					{/* Apenas menu de opções para grupos */}
					<IconButton
						onClick={handleOpenTicketOptionsMenu}
						className={classes.iconButton}
					>
						<MoreVert />
					</IconButton>
					<TicketOptionsMenu
						ticket={ticket}
						anchorEl={anchorEl}
						menuOpen={ticketOptionsMenuOpen}
						handleClose={handleCloseTicketOptionsMenu}
					/>
				</>
			) : (
				<>
					{ticket.status === "closed" && (
						<>
							<TagsDropdown ticket={ticket} />
							<ButtonWithSpinner
								loading={loading}
								startIcon={<Replay />}
								onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
								className={classes.reopenButton}
								variant="outlined"
							>
								{i18n.t("messagesList.header.buttons.reopen")}
							</ButtonWithSpinner>
						</>
					)}
					{ticket.status === "open" && (
						<>
							<TagsDropdown ticket={ticket} />
							{ticket.userId !== user?.id && (
								<Tooltip title="Assumir Atendimento">
									<ButtonWithSpinner
										loading={loading}
										startIcon={<PanToolIcon />}
										size="small"
										onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
										variant="contained"
										className={classes.acceptButton}
									>
										Assumir
									</ButtonWithSpinner>
								</Tooltip>
							)}
							<Tooltip title={i18n.t("messagesList.header.buttons.return")}>
								<IconButton
									onClick={e => handleUpdateTicketStatus(e, "pending", null)}
									className={classes.returnIconButton}
								>
									<UndoRoundedIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title={i18n.t("messagesList.header.buttons.resolve")}>
								<Button
									onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)}
									className={classes.resolveButton}
									startIcon={<CheckCircleIcon />}
									disabled={loading}
								>
									{i18n.t("messagesList.header.buttons.resolve")}
								</Button>
							</Tooltip>
							<IconButton
								onClick={handleOpenTicketOptionsMenu}
								className={classes.iconButton}
							>
								<MoreVert />
							</IconButton>
							<TicketOptionsMenu
								ticket={ticket}
								anchorEl={anchorEl}
								menuOpen={ticketOptionsMenuOpen}
								handleClose={handleCloseTicketOptionsMenu}
							/>
						</>
					)}
					{ticket.status === "pending" && (
						<>
							<TagsDropdown ticket={ticket} />
							<ButtonWithSpinner
								loading={loading}
								startIcon={<CloseIcon />}
								onClick={e => handleUpdateTicketStatus(e, "closed", user?.id)}
								className={classes.rejectButton}
								variant="outlined"
							>
								Rejeitar
							</ButtonWithSpinner>
							<ButtonWithSpinner
								loading={loading}
								startIcon={<PlayArrowIcon />}
								onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
								className={classes.acceptButton}
								variant="contained"
							>
								{i18n.t("messagesList.header.buttons.accept")}
							</ButtonWithSpinner>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default TicketActionButtonsCustom;
