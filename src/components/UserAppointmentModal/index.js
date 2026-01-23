import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";
import UserAppointmentForm from "./UserAppointmentForm";
import ScheduleDispatchForm from "./ScheduleDispatchForm";

const useStyles = makeStyles((theme) => ({
    dialog: {
        "& .MuiDialog-paper": {
            maxWidth: "900px",
            width: "100%",
        },
    },
    tabPanel: {
        padding: 0,
        width: "100%",
    },
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`schedule-tabpanel-${index}`}
            aria-labelledby={`schedule-tab-${index}`}
            style={{ width: "100%" }}
            {...other}
        >
            {value === index && <Box sx={{ width: "100%" }}>{children}</Box>}
        </div>
    );
}

const UserAppointmentModal = ({
    open,
    onClose,
    reload,
    initialTab = 0,
    appointmentId,
    scheduleId,
    contactId,
    cleanContact,
}) => {
    const classes = useStyles();
    const [tabValue, setTabValue] = useState(initialTab);

    useEffect(() => {
        setTabValue(initialTab);
    }, [initialTab, open]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleClose = () => {
        setTabValue(0);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            scroll="paper"
            className={classes.dialog}
        >
            <DialogTitle>
                {i18n.t("userAppointmentModal.title")}
            </DialogTitle>
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
            >
                <Tab label={i18n.t("userAppointmentModal.tabs.appointment")} />
                <Tab label={i18n.t("userAppointmentModal.tabs.dispatch")} />
            </Tabs>
            <TabPanel value={tabValue} index={0} className={classes.tabPanel}>
                <UserAppointmentForm
                    appointmentId={appointmentId}
                    onClose={handleClose}
                    reload={reload}
                />
            </TabPanel>
            <TabPanel value={tabValue} index={1} className={classes.tabPanel}>
                <ScheduleDispatchForm
                    scheduleId={scheduleId}
                    contactId={contactId}
                    cleanContact={cleanContact}
                    onClose={handleClose}
                    reload={reload}
                />
            </TabPanel>
        </Dialog>
    );
};

export default UserAppointmentModal;
