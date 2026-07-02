import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  makeStyles,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import RefreshIcon from "@material-ui/icons/Refresh";
import {
  withAvatarCacheBust,
  hasRealContactAvatar,
  handleContactAvatarError,
} from "../../helpers/contactAvatar";

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
    padding: theme.spacing(4, 2, 2, 2),
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
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
  imageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: theme.spacing(3),
  },
  image: {
    maxWidth: "500px",
    maxHeight: "500px",
    minWidth: "300px",
    minHeight: "300px",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[24],
    [theme.breakpoints.down("sm")]: {
      maxWidth: "90vw",
      maxHeight: "60vh",
      minWidth: "250px",
      minHeight: "250px",
    },
  },
  contactInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#FFFFFF",
    padding: theme.spacing(2, 3),
    borderRadius: theme.spacing(1),
    textAlign: "center",
    minWidth: "200px",
    marginTop: theme.spacing(2),
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
    flexDirection: "column",
    gap: theme.spacing(2),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.spacing(2),
  },
  noImageText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  loadingBox: {
    width: "300px",
    height: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: theme.spacing(2),
  },
}));

const ContactAvatarModal = ({
  open,
  onClose,
  contact,
  imageBroken = false,
  loading = false,
  onRequestRefresh,
}) => {
  const classes = useStyles();
  const [avatarVersion, setAvatarVersion] = useState(0);

  useEffect(() => {
    if (contact?.profilePicUrl) {
      setAvatarVersion(Date.now());
    }
  }, [contact?.profilePicUrl]);

  if (!contact) return null;

  const imageUrl =
    !imageBroken && hasRealContactAvatar(contact.profilePicUrl)
      ? withAvatarCacheBust(contact.profilePicUrl, avatarVersion)
      : null;

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
        {loading ? (
          <Box className={classes.loadingBox}>
            <CircularProgress style={{ color: "#fff" }} />
          </Box>
        ) : imageUrl ? (
          <Box className={classes.imageContainer}>
            <img
              src={imageUrl}
              alt={contact.name || "Foto de perfil"}
              className={classes.image}
              onError={handleContactAvatarError}
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
            {onRequestRefresh && (
              <Button
                color="primary"
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={async () => {
                  await onRequestRefresh();
                  setAvatarVersion(Date.now());
                }}
              >
                Atualizar foto
              </Button>
            )}
          </Box>
        ) : (
          <Box className={classes.noImageContainer}>
            <Typography className={classes.noImageText}>
              Sem foto de perfil
            </Typography>
            {onRequestRefresh && (
              <Button
                color="primary"
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={onRequestRefresh}
              >
                Buscar foto no WhatsApp
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactAvatarModal;
