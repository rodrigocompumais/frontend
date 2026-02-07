import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";

import { i18n } from "../../translate/i18n";

const EditMessageModal = ({ open, onClose, message, onConfirm }) => {
	const [body, setBody] = useState("");

	useEffect(() => {
		if (message) {
			setBody(message.body || "");
		}
	}, [message, open]);

	const handleConfirm = () => {
		const trimmed = body?.trim() || "";
		if (trimmed) {
			onConfirm(trimmed);
			onClose();
		}
	};

	return (
		<Dialog open={open} onClose={onClose} aria-labelledby="edit-message-dialog" maxWidth="sm" fullWidth>
			<DialogTitle id="edit-message-dialog">
				{i18n.t("messageOptionsMenu.editModal.title")}
			</DialogTitle>
			<DialogContent dividers>
				<TextField
					autoFocus
					fullWidth
					multiline
					rows={4}
					value={body}
					onChange={(e) => setBody(e.target.value)}
					placeholder={i18n.t("messageOptionsMenu.editModal.placeholder")}
					variant="outlined"
					margin="dense"
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="default">
					{i18n.t("messageOptionsMenu.editModal.cancel")}
				</Button>
				<Button onClick={handleConfirm} color="primary" variant="contained" disabled={!body?.trim()}>
					{i18n.t("messageOptionsMenu.editModal.confirm")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditMessageModal;
