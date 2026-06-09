import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManagerTabs/";

const useStyles = makeStyles(() => ({
	chatContainer: {
		flex: 1,
		height: `calc(100vh - 56px)`,
		overflow: "hidden",
	},
}));

const TicketsCustom = () => {
	const classes = useStyles();

	return (
		<div className={`${classes.chatContainer} tour-tickets-page`}>
			<TicketsManager overviewInMainPanel />
		</div>
	);
};

export default TicketsCustom;
