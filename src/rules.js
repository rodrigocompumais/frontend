const rules = {
	user: {
		static: [
			"forms:create",
			"forms:edit",
			"forms:delete"
		],
	},

	admin: {
		static: [
			"dashboard:view",
			"drawer-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
			"ticket-options:deleteTicket",
			"contacts-page:deleteContact",
			"connections-page:actionButtons",
			"connections-page:addConnection",
			"connections-page:editOrDeleteConnection",
			"forms:create",
			"forms:edit",
			"forms:delete"
		],
	},
};

export default rules;
