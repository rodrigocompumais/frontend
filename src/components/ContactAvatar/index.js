import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Avatar, makeStyles } from "@material-ui/core";
import { toast } from "react-toastify";
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

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: "relative",
    display: "inline-flex",
    lineHeight: 0,
    cursor: "pointer",
    borderRadius: "50%",
    // Tamanho padrão do Avatar do MUI; classes externas podem sobrescrever
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  loadingBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    pointerEvents: "none",
    zIndex: 1,
  },
  loadingRing: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 2,
    color: theme.palette.primary.main,
    animation: "$avatarRingSpin 0.9s linear infinite",
  },
  "@keyframes avatarRingSpin": {
    to: { transform: "rotate(360deg)" },
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
  const manualRefreshRef = useRef(false);
  const contactIdRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [imageBroken, setImageBroken] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [localContact, setLocalContact] = useState(contact || null);

  const resolvedContactId =
    localContact?.id ?? contactId ?? contact?.id ?? null;

  contactIdRef.current = resolvedContactId;

  useEffect(() => {
    setLocalContact((prev) => {
      if (!contact && !contactId) {
        return null;
      }
      return {
        ...(prev || {}),
        ...(contact || {}),
        id: contact?.id ?? contactId ?? prev?.id,
      };
    });
  }, [contact, contactId]);

  useEffect(() => {
    setImageBroken(false);
    if (contact?.profilePicUrl) {
      setAvatarVersion(Date.now());
    }
  }, [contact?.profilePicUrl]);

  useEffect(() => {
    return () => {
      refreshInFlightRef.current = false;
      manualRefreshRef.current = false;
    };
  }, []);

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
        if (!manualRefreshRef.current) {
          setLoading(false);
          refreshInFlightRef.current = false;
        }
      }
    };

    socket.on(`company-${companyId}-contact`, handleContactUpdate);
    return () => {
      socket.off(`company-${companyId}-contact`, handleContactUpdate);
    };
  }, [resolvedContactId, socketManager]);

  const refreshProfilePic = useCallback(async () => {
    const id = contactIdRef.current;
    if (!id) {
      return null;
    }

    if (refreshInFlightRef.current) {
      return null;
    }

    manualRefreshRef.current = true;
    refreshInFlightRef.current = true;
    setLoading(true);

    try {
      const { data } = await api.post(
        `/contacts/${id}/refresh-profile-pic`
      );
      const updatedContact = data.contact || {
        id,
        profilePicUrl: data.profilePicUrl,
      };
      setLocalContact((prev) => ({ ...(prev || {}), ...updatedContact, id }));
      setAvatarVersion(Date.now());
      setImageBroken(false);

      if (data.updated) {
        toast.success("Foto de perfil atualizada.");
      } else {
        toast.info(
          "Este contato não possui foto de perfil disponível no WhatsApp."
        );
      }

      return updatedContact;
    } catch (err) {
      toastError(err);
      return null;
    } finally {
      manualRefreshRef.current = false;
      refreshInFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  const handleAvatarError = (event) => {
    handleContactAvatarError(event);
    setImageBroken(true);
  };

  const handleClick = async (event) => {
    if (event && typeof event.stopPropagation === "function") {
      event.stopPropagation();
    }

    const hasVisiblePhoto =
      hasRealContactAvatar(localContact?.profilePicUrl) && !imageBroken;

    if (!hasVisiblePhoto && resolvedContactId) {
      await refreshProfilePic();
      return;
    }

    if (onClick) {
      onClick(event);
    }

    if (hasVisiblePhoto && !disableModal) {
      setModalOpen(true);
    }
  };

  if (!resolvedContactId && !localContact) {
    return null;
  }

  const displayContact = {
    ...(localContact || {}),
    id: resolvedContactId,
  };

  const avatarSrc = imageBroken
    ? NOPICTURE
    : withAvatarCacheBust(displayContact.profilePicUrl, avatarVersion);

  return (
    <>
      <span
        className={`${classes.wrapper} ${className || ""}`}
        style={style}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-busy={loading}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick(event);
          }
        }}
      >
        <Avatar
          className={classes.avatar}
          src={avatarSrc}
          alt={alt || displayContact.name || "contact_image"}
          onError={handleAvatarError}
        />
        {loading && (
          <>
            <span className={classes.loadingBackdrop} aria-hidden="true" />
            <svg
              className={classes.loadingRing}
              viewBox="0 0 40 40"
              aria-hidden="true"
            >
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="30 83"
              />
            </svg>
          </>
        )}
      </span>

      {!disableModal && (
        <ContactAvatarModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          contact={displayContact}
          imageBroken={imageBroken}
          loading={loading}
          onRequestRefresh={refreshProfilePic}
        />
      )}
    </>
  );
};

export default ContactAvatar;
