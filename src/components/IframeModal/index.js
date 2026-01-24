import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    makeStyles
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
    dialog: {
        "& .MuiDialog-paper": {
            maxWidth: "95vw",
            maxHeight: "95vh",
            width: "95vw",
            height: "95vh",
        },
    },
    dialogTitle: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: theme.spacing(1, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    dialogContent: {
        padding: 0,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    },
    iframe: {
        width: "100%",
        height: "100%",
        border: "none",
        flex: 1,
    },
}));

const IframeModal = ({ open, onClose, url, title = "Visualização" }) => {
    const classes = useStyles();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            className={classes.dialog}
            maxWidth={false}
            fullWidth
        >
            <DialogTitle className={classes.dialogTitle}>
                <span>{title}</span>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                {url && (
                    <iframe
                        src={url}
                        title={title}
                        className={classes.iframe}
                        loading="lazy"
                        allowFullScreen
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IframeModal;
