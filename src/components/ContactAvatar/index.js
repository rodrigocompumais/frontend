import React, { useState, useEffect, useContext, useCallback } from "react";
import { Avatar, CircularProgress, makeStyles } from "@material-ui/core";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import ContactAvatarModal from "../ContactAvatarModal";
import {
  withAvatarCacheBust,
  handleContactAvatarError,
  hasRealContactAvatar
} from "../../helpers/contactAvatar";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: "relative",
    display: "inline-flex",
    lineHeight: 0,
  },
  avatar: {
    transition: "opacity 0.25s ease, transform 0.25s ease",
  },
  avatarLoading: {
    opacity: 0.72,
    animation: "$avatarPulse 1.1s ease-in-out infinite",
  },
  "@keyframes avatarPulse": {
    "0%": { transform: "scale(1)", opacity: 0.72 },
    "50%": { transform: "scale(1.04)", opacity: 1 },
    "100%": { transform: "scale(1)", opacity: 0.72 },
  },
  ring: {
    position: "absolute",
    inset: -3,
    borderRadius: "50%",
    border: `2px solid ${theme.palette.primary.main}`,
    animation: "$ringPulse 1.1s ease-in-out infinite",
    pointerEvents: "none",
  },
  "@keyframes ringPulse": {
    "0%": { transform: "scale(0.96)", opacity: 0.35 },
    "50%": { transform: "scale(1.06)", opacity: 0.95 },
    "100%": { transform: "scale(0.96)", opacity: 0.35 },
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    pointerEvents: "none",
  },
}));

const ContactAvatar = ({
  contact,
  className,
  style,
  alt,
  onClick,
  disableModal = false,
}) => {
  const classes = useStyles();
  const socketManager = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [localContact, setLocalContact] = useState(contact || null);

  useEffect(() => {
    setLocalContact(contact || null);
    if (contact?.profilePicUrl) {
      setAvatarVersion(Date.now());
    }
  }, [contact]);

  useEffect(() => {
    if (!localContact?.id) return undefined;

    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleContactUpdate = (data) => {
      if (
        data?.action === "update" &&
        Number(data.contact?.id) === Number(localContact.id)
      ) {
        setLocalContact((prev) => ({ ...prev, ...data.contact }));
        setAvatarVersion(Date.now());
        setLoading(false);
      }
    };

    socket.on(`company-${companyId}-contact`, handleContactUpdate);
    return () => {
      socket.off(`company-${companyId}-contact`, handleContactUpdate);
    };
  }, [localContact?.id, socketManager]);

  const refreshProfilePic = useCallback(async () => {
    if (!localContact?.id || loading) {
      return null;
    }

    setLoading(true);
    try {
      const { data } = await api.post(
        `/contacts/${localContact.id}/refresh-profile-pic`
      );
      const updated = data.contact || {
        ...localContact,
        profilePicUrl: data.profilePicUrl,
      };
      setLocalContact((prev) => ({ ...prev, ...updated }));
      setAvatarVersion(Date.now());
      return updated;
    } catch (err) {
      console.error("Erro ao atualizar foto de perfil:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [localContact, loading]);

  const handleClick = async (event) => {
    if (onClick) {
      onClick(event);
    }

    if (event?.defaultPrevented) {
      return;
    }

    event?.stopPropagation?.();

    if (loading || !localContact) {
      return;
    }

    const hasPhoto = hasRealContactAvatar(localContact.profilePicUrl);

    if (!hasPhoto) {
      const updated = await refreshProfilePic();
      if (updated && hasRealContactAvatar(updated.profilePicUrl) && !disableModal) {
        setModalOpen(true);
      }
      return;
    }

    if (!disableModal) {
      setModalOpen(true);
    }
  };

  if (!localContact) {
    return null;
  }

  const avatarSrc = withAvatarCacheBust(
    localContact.profilePicUrl,
    avatarVersion
  );

  return (
    <>
      <span className={classes.wrapper} style={style}>
        {loading && <span className={classes.ring} aria-hidden />}
        <Avatar
          className={`${classes.avatar} ${loading ? classes.avatarLoading : ""} ${className || ""}`}
          src={avatarSrc}
          alt={alt || localContact.name || "contact_image"}
          onClick={handleClick}
          onError={handleContactAvatarError}
          style={{ cursor: loading ? "wait" : "pointer" }}
        />
        {loading && (
          <span className={classes.overlay}>
            <CircularProgress size={22} thickness={4} style={{ color: "#fff" }} />
          </span>
        )}
      </span>

      {!disableModal && (
        <ContactAvatarModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          contact={localContact}
          loading={loading}
          onRequestRefresh={refreshProfilePic}
        />
      )}
    </>
  );
};

export default ContactAvatar;
