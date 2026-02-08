import React, { useEffect, useContext, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";

const NO_NOTIFICATION_PATHS = ["/garcom", "/cozinha"];

const useTicketNotifications = () => {
  const location = useLocation();
  const history = useHistory();
  const socketManager = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const currentTicketIdRef = useRef(null);
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Extrair ID do ticket da URL atual
  useEffect(() => {
    const pathMatch = location.pathname.match(/\/tickets\/([^\/]+)/);
    if (pathMatch) {
      currentTicketIdRef.current = pathMatch[1];
    } else {
      currentTicketIdRef.current = null;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user?.id || !user?.companyId) return;

    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);
    
    if (!socket) return;

    const handleAppMessage = (data) => {
      if (NO_NOTIFICATION_PATHS.includes(pathnameRef.current)) return;
      if (data.action !== "create") return;

      const { message, ticket, contact } = data;

      // Não notificar mensagens internas ou mensagens enviadas pelo próprio usuário
      if (message.isInternal || message.fromMe) return;

      // Se o ticket tem um responsável, notificar apenas para ele
      if (ticket.userId) {
        if (ticket.userId !== user.id) {
          return; // Não notificar se não é o responsável
        }
      } else {
        // Se não tem responsável, verificar se o usuário está na fila
        const isInQueue = user.queues?.some((queue) => queue.id === ticket.queueId) || false;
        if (!isInQueue && ticket.queueId) {
          return; // Não notificar se não está na fila e o ticket tem fila
        }
      }

      // Verificar se o ticket está sendo visualizado atualmente
      const ticketUuid = ticket.uuid;
      const isViewingTicket = currentTicketIdRef.current === ticketUuid;

      // Não notificar se o usuário está visualizando o ticket
      if (isViewingTicket) return;

      // Não notificar grupos
      if (ticket.isGroup) return;

      // Obter informações do contato
      const contactName = contact?.name || "Contato";
      const contactAvatar = contact?.profilePicUrl || contact?.urlPicture || null;

      // Prévia da mensagem (truncar se necessário)
      let messagePreview = message.body || "";
      if (message.mediaType && message.mediaType !== "conversation") {
        messagePreview = `📎 ${message.mediaType}`;
      } else if (messagePreview.length > 50) {
        messagePreview = messagePreview.substring(0, 50) + "...";
      }

      // Exibir toast
      const toastId = `ticket-${ticket.id}-${message.id}`;
      toast.info(
        <div onClick={() => history.push(`/tickets/${ticketUuid}`)} style={{ cursor: "pointer" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{contactName}</div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>{messagePreview}</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 4 }}>
            WhatsApp
          </div>
        </div>,
        {
          toastId,
          autoClose: 5000,
          position: "top-right",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    };

    socket.on("ready", () => socket.emit("joinNotification"));
    socket.on(`company-${companyId}-appMessage`, handleAppMessage);

    return () => {
      socket.off(`company-${companyId}-appMessage`, handleAppMessage);
    };
  }, [user, socketManager, history]);
};

export default useTicketNotifications;
