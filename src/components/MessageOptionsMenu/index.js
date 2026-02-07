import React, { useState, useContext } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import { ExpandMore, ExpandLess } from "@material-ui/icons";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import EditMessageModal from "../EditMessageModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";

const REACTION_EMOJIS = [
	{ emoji: "👍", label: "messageOptionsMenu.reactions.like" },
	{ emoji: "❤️", label: "messageOptionsMenu.reactions.love" },
	{ emoji: "😂", label: "messageOptionsMenu.reactions.laugh" },
	{ emoji: "😮", label: "messageOptionsMenu.reactions.wow" },
	{ emoji: "🙏", label: "messageOptionsMenu.reactions.thanks" },
];

const isTextMessage = (msg) => {
	if (!msg || !msg.mediaType) return false;
	return msg.mediaType === "conversation" || msg.mediaType === "extendedTextMessage";
};

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorPosition, anchorOrigin }) => {
	const { setReplyingMessage } = useContext(ReplyMessageContext);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [reactionsOpen, setReactionsOpen] = useState(false);

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${message.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const hanldeReplyMessage = () => {
		setReplyingMessage(message);
		handleClose();
	};

	const handleOpenConfirmationModal = (e) => {
		setConfirmationOpen(true);
		handleClose();
	};

	const handleReaction = async (emoji) => {
		try {
			await api.post(`/messages/${message.id}/react`, { emoji });
			setReactionsOpen(false);
			handleClose();
		} catch (err) {
			toastError(err);
		}
	};

	const handleReactionsEnter = () => {
		setReactionsOpen(true);
	};

	const handleReactionsLeave = () => {
		setReactionsOpen(false);
	};

	const handleOpenEditModal = () => {
		setEditOpen(true);
		handleClose();
	};

	const handleEditMessage = async (newBody) => {
		try {
			await api.put(`/messages/${message.id}`, { body: newBody });
			setEditOpen(false);
		} catch (err) {
			toastError(err);
		}
	};

	const handleMenuClose = () => {
		setReactionsOpen(false);
		handleClose();
	};

	return (
		<>
			<ConfirmationModal
				title={i18n.t("messageOptionsMenu.confirmationModal.title")}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteMessage}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<EditMessageModal
				open={editOpen}
				onClose={() => setEditOpen(false)}
				message={message}
				onConfirm={handleEditMessage}
			/>
			<Menu
				anchorReference="anchorPosition"
				anchorPosition={anchorPosition || { top: 0, left: 0 }}
				anchorOrigin={anchorOrigin || { vertical: "top", horizontal: "left" }}
				transformOrigin={anchorOrigin || { vertical: "top", horizontal: "left" }}
				open={menuOpen}
				onClose={handleMenuClose}
			>
				{message.fromMe && (
					<MenuItem onClick={handleOpenConfirmationModal}>
						{i18n.t("messageOptionsMenu.delete")}
					</MenuItem>
				)}
				{message.fromMe && isTextMessage(message) && (
					<MenuItem onClick={handleOpenEditModal}>
						{i18n.t("messageOptionsMenu.edit")}
					</MenuItem>
				)}
				<div onMouseEnter={handleReactionsEnter} onMouseLeave={handleReactionsLeave}>
					<MenuItem style={{ justifyContent: "space-between" }}>
						{i18n.t("messageOptionsMenu.react")}
						{reactionsOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
					</MenuItem>
					<Collapse in={reactionsOpen} timeout="auto" unmountOnExit>
						<Box display="flex" flexDirection="row" flexWrap="nowrap" padding="8px 16px" gap={1}>
							{REACTION_EMOJIS.map(({ emoji }) => (
								<IconButton
									key={emoji}
									onClick={() => handleReaction(emoji)}
									size="small"
									title={emoji}
									style={{ padding: 4 }}
								>
									<span style={{ fontSize: 20 }}>{emoji}</span>
								</IconButton>
							))}
						</Box>
					</Collapse>
				</div>
				<MenuItem onClick={hanldeReplyMessage}>
					{i18n.t("messageOptionsMenu.reply")}
				</MenuItem>
			</Menu>
		</>
	);
};

export default MessageOptionsMenu;
