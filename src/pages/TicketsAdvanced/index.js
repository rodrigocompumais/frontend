import React, { useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Box from '@material-ui/core/Box';

import TicketsManagerTabs from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";
import TicketAdvancedLayout from "../../components/TicketAdvancedLayout";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    content: {
        overflow: "auto"
    },
    placeholderContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
		backgroundColor: theme.palette.boxticket, //DARK MODE PLW DESIGN//
    },
    placeholderItem: {
    }
}));

const TicketAdvanced = (props) => {
	const classes = useStyles();
	const { ticketId } = useParams();
    const { currentTicket, setCurrentTicket } = useContext(TicketsContext)

    useEffect(() => {
        if(currentTicket.id !== null) {
            setCurrentTicket({ id: currentTicket.id, code: '#open' })
        }
        return () => {
            setCurrentTicket({ id: null, code: null })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

	const renderPlaceholder = () => {
		return <Box className={classes.placeholderContainer}>
             {/*<div className={classes.placeholderItem}>{i18n.t("chat.noTicketMessage")}</div>*/}
			{/* Logo removido conforme solicitado */}
		</Box>
	}

	const renderContent = () => {
		if (ticketId) {
			return <Ticket />
		}
		return <TicketsManagerTabs />
	}

	return (
        <TicketAdvancedLayout>
            <Box className={classes.content}>
                {renderContent()}
            </Box>
        </TicketAdvancedLayout>
	);
};

export default TicketAdvanced;
