import React from "react";

// This component wraps the existing ScheduleModal
// It accepts props from the tab panel and passes them through
import ScheduleModalOriginal from "../ScheduleModal";

const ScheduleDispatchForm = ({
    scheduleId,
    contactId,
    cleanContact,
    onClose,
    reload,
}) => {
    // Simply render the original ScheduleModal
    // Note: ScheduleModal has its own Dialog wrapper, which will appear on top
    // This is fine for now - user can use tabs to switch between forms
    return (
        <ScheduleModalOriginal
            open={true}
            onClose={onClose}
            reload={reload}
            scheduleId={scheduleId}
            contactId={contactId}
            cleanContact={cleanContact}
        />
    );
};

export default ScheduleDispatchForm;
