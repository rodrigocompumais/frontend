import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  makeStyles,
  Typography,
  Box,
  Button,
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
  loadingImageWrapper: {
    position: "relative",
    display: "inline-flex",
    borderRadius: theme.spacing(2),
    overflow: "hidden",
  },
  loadingImage: {
    opacity: 0.55,
  },
  modalLoadingBackdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    pointerEvents: "none",
    zIndex: 1,
  },
  modalLoadingRing: {
    position: "absolute",
    inset: 6,
    borderRadius: theme.spacing(2),
    pointerEvents: "none",
    zIndex: 2,
    animation: "$modalRingSpin 0.9s linear infinite",
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: theme.spacing(2),
      border: "2px solid #FFFFFF",
      borderBottomColor: "transparent",
      borderLeftColor: "transparent",
    },
  },
  loadingSkeleton: {
    position: "relative",
    width: "300px",
    height: "300px",
    borderRadius: theme.spacing(2),
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      width: "250px",
      height: "250px",
    },
  },
  shimmer: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
    backgroundSize: "200% 100%",
    animation: "$shimmer 1.5s ease-in-out infinite",
    pointerEvents: "none",
  },
  "@keyframes modalRingSpin": {
    to: { transform: "rotate(360deg)" },
  },
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "200% 0" },
    "100%": { backgroundPosition: "-200% 0" },
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
          imageUrl ? (
            <Box className={classes.imageContainer}>
              <Box className={classes.loadingImageWrapper}>
                <img
                  src={imageUrl}
                  alt={contact.name || "Foto de perfil"}
                  className={`${classes.image} ${classes.loadingImage}`}
                  onError={handleContactAvatarError}
                />
                <span className={classes.modalLoadingBackdrop} aria-hidden="true" />
                <span className={classes.modalLoadingRing} aria-hidden="true" />
              </Box>
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
            </Box>
          ) : (
            <Box className={classes.loadingSkeleton} aria-busy="true">
              <span className={classes.shimmer} aria-hidden="true" />
            </Box>
          )
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
