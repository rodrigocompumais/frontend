import React, { useState, useEffect } from "react";

import { Avatar, CardHeader } from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import ContactAvatarModal from "../ContactAvatarModal";

const TicketInfo = ({ contact, ticket, onClick }) => {
	const { user } = ticket
	const [userName, setUserName] = useState('')
	const [contactName, setContactName] = useState('')
	const [avatarModalOpen, setAvatarModalOpen] = useState(false)

	useEffect(() => {
		if (contact) {
			setContactName(contact.name);
			if(document.body.offsetWidth < 600) {
				if (contact.name.length > 10) {
					const truncadName = contact.name.substring(0, 10) + '...';
					setContactName(truncadName);
				}
			}
		}

		if (user && contact) {
			setUserName(`${i18n.t("messagesList.header.assignedTo")} ${user.name}`);

			if(document.body.offsetWidth < 600) {
				setUserName(`${user.name}`);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<>
			<CardHeader
				onClick={onClick}
				style={{ cursor: "pointer" }}
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={
					<Avatar 
						src={contact.profilePicUrl} 
						alt="contact_image"
						onClick={(e) => {
							e.stopPropagation();
							setAvatarModalOpen(true);
						}}
						style={{ cursor: "pointer" }}
					/>
				}
				title={`${contactName} #${ticket.id}`}
				subheader={ticket.user && `${userName}`}
			/>
			<ContactAvatarModal
				open={avatarModalOpen}
				onClose={() => setAvatarModalOpen(false)}
				contact={contact}
			/>
		</>
	);
};

export default TicketInfo;
