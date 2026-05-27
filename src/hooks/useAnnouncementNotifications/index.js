import React, { useEffect, useContext, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import {
  getPriorityColor,
  getPriorityLabel,
} from "../../utils/announcementPriority";

const NO_NOTIFICATION_PATHS = ["/garcom", "/cozinha"];

const truncateText = (text, maxLen) => {
  if (!text || typeof text !== "string") return "";
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
};

const useAnnouncementNotifications = () => {
  const location = useLocation();
  const history = useHistory();
  const socketManager = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!user?.id || !user?.companyId) return;

    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);

    if (!socket) return;

    const handleAnnouncement = (data) => {
      if (NO_NOTIFICATION_PATHS.includes(pathnameRef.current)) return;
      if (data.action !== "create") return;

      const record = data.record;
      if (!record || record.status === false) return;

      const title = record.title || i18n.t("announcements.title");
      const preview = truncateText(record.text || "", 90);
      const priorityLabel = getPriorityLabel(record.priority);
      const borderColor = getPriorityColor(record.priority);

      const toastId = `announcement-create-${record.id}`;
      toast.info(
        <div
          onClick={() => history.push("/announcements")}
          style={{ cursor: "pointer" }}
          role="presentation"
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
          {preview && (
            <div style={{ fontSize: "0.875rem", opacity: 0.92 }}>{preview}</div>
          )}
          <div style={{ fontSize: "0.75rem", opacity: 0.75, marginTop: 6 }}>
            {priorityLabel} · {i18n.t("announcements.toast.newBadge")}
          </div>
        </div>,
        {
          toastId,
          autoClose: 8000,
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            borderLeft: `4px solid ${borderColor}`,
          },
        }
      );
    };

    socket.on(`company-announcement`, handleAnnouncement);

    return () => {
      socket.off(`company-announcement`, handleAnnouncement);
    };
  }, [user, socketManager, history]);
};

export default useAnnouncementNotifications;
