import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  makeStyles,
  Typography,
  Box,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      backgroundColor: "transparent",
      boxShadow: "none",
      maxWidth: "90vw",
      maxHeight: "90vh",
    },
  },
  dialogContent: {
    padding: 0,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
  },
  image: {
    maxWidth: "100%",
    maxHeight: "85vh",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[24],
  },
  contactInfo: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#FFFFFF",
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(1),
    textAlign: "center",
    minWidth: "200px",
  },
  contactName: {
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: "1rem",
  },
  contactNumber: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.875rem",
    marginTop: theme.spacing(0.5),
  },
  noImageContainer: {
    width: "300px",
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.spacing(2),
  },
  noImageText: {
    color: "#FFFFFF",
  },
}));

const ContactAvatarModal = ({ open, onClose, contact }) => {
  const classes = useStyles();

  if (!contact) return null;

  const imageUrl = contact.profilePicUrl || null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      maxWidth={false}
      fullWidth
    >
      <DialogContent className={classes.dialogContent}>
        <IconButton
          className={classes.closeButton}
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={contact.name || "Foto de perfil"}
              className={classes.image}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <Box className={classes.contactInfo}>
              <Typography className={classes.contactName}>
                {contact.name || "Sem nome"}
              </Typography>
              {contact.number && (
                <Typography className={classes.contactNumber}>
                  {contact.number}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Box
            className={classes.noImageContainer}
          >
            <Typography className={classes.noImageText}>
              Sem foto de perfil
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactAvatarModal;
