import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Avatar, CircularProgress, makeStyles } from "@material-ui/core";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import ContactAvatarModal from "../ContactAvatarModal";
import toastError from "../../errors/toastError";
import {
  withAvatarCacheBust,
  handleContactAvatarError,
  hasRealContactAvatar,
} from "../../helpers/contactAvatar";

const NOPICTURE = "/nopicture.png";

const useStyles = makeStyles(() => ({
  wrapper: {
    position: "relative",
    display: "inline-flex",
    lineHeight: 0,
  },
  avatar: {
    transition: "opacity 0.2s ease",
  },
  avatarLoading: {
    opacity: 0.55,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    pointerEvents: "none",
  },
}));

const ContactAvatar = ({
  contact,
  contactId,
  className,
  style,
  alt,
  onClick,
  disableModal = false,
}) => {
  const classes = useStyles();
  const socketManager = useContext(SocketContext);
  const refreshInFlightRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [imageBroken, setImageBroken] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [localContact, setLocalContact] = useState(contact || null);

  const resolvedContactId = localContact?.id ?? contactId ?? contact?.id;

  useEffect(() => {
    setLocalContact(contact || null);
  }, [contact]);

  useEffect(() => {
    setImageBroken(false);
    if (contact?.profilePicUrl) {
      setAvatarVersion(Date.now());
    }
  }, [contact?.profilePicUrl]);

  useEffect(() => {
    if (!resolvedContactId) return undefined;

    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleContactUpdate = (data) => {
      if (
        data?.action === "update" &&
        Number(data.contact?.id) === Number(resolvedContactId)
      ) {
        setLocalContact((prev) => ({ ...(prev || {}), ...data.contact }));
        setAvatarVersion(Date.now());
        setImageBroken(false);
        setLoading(false);
        refreshInFlightRef.current = false;
      }
    };

    socket.on(`company-${companyId}-contact`, handleContactUpdate);
    return () => {
      socket.off(`company-${companyId}-contact`, handleContactUpdate);
    };
  }, [resolvedContactId, socketManager]);

  const refreshProfilePic = useCallback(async () => {
    if (!resolvedContactId) {
      return null;
    }

    if (refreshInFlightRef.current) {
      return null;
    }

    refreshInFlightRef.current = true;
    setLoading(true);

    try {
      const { data } = await api.post(
        `/contacts/${resolvedContactId}/refresh-profile-pic`
      );
      const updated = data.contact || {
        ...(localContact || {}),
        profilePicUrl: data.profilePicUrl,
      };
      setLocalContact((prev) => ({ ...(prev || {}), ...updated }));
      setAvatarVersion(Date.now());
      setImageBroken(false);
      return updated;
    } catch (err) {
      toastError(err);
      return null;
    } finally {
      refreshInFlightRef.current = false;
      setLoading(false);
    }
  }, [resolvedContactId, localContact]);

  const handleAvatarError = (event) => {
    handleContactAvatarError(event);
    setImageBroken(true);
  };

  const handleClick = async (event) => {
    if (event && typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }

    if (onClick) {
      onClick(event);
    }

    if (event?.defaultPrevented || loading || !localContact) {
      return;
    }

    const hasVisiblePhoto =
      hasRealContactAvatar(localContact.profilePicUrl) && !imageBroken;

    if (!hasVisiblePhoto) {
      await refreshProfilePic();
      return;
    }

    if (!disableModal) {
      setModalOpen(true);
    }
  };

  if (!localContact) {
    return null;
  }

  const avatarSrc = imageBroken
    ? NOPICTURE
    : withAvatarCacheBust(localContact.profilePicUrl, avatarVersion);

  return (
    <>
      <span className={classes.wrapper} style={style}>
        <Avatar
          className={`${classes.avatar} ${loading ? classes.avatarLoading : ""} ${className || ""}`}
          src={avatarSrc}
          alt={alt || localContact.name || "contact_image"}
          onClick={handleClick}
          onError={handleAvatarError}
          style={{ cursor: loading ? "wait" : "pointer" }}
        />
        {loading && (
          <span className={classes.overlay}>
            <CircularProgress size={18} thickness={5} />
          </span>
        )}
      </span>

      {!disableModal && (
        <ContactAvatarModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          contact={localContact}
          imageBroken={imageBroken}
          loading={loading}
          onRequestRefresh={refreshProfilePic}
        />
      )}
    </>
  );
};

export default ContactAvatar;
