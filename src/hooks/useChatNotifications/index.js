import React, { useEffect, useContext, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";

const useChatNotifications = () => {
  const location = useLocation();
  const history = useHistory();
  const socketManager = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const currentChatIdRef = useRef(null);

  // Extrair ID do chat da URL atual
  useEffect(() => {
    const pathMatch = location.pathname.match(/\/chats\/([^\/]+)/);
    if (pathMatch) {
      currentChatIdRef.current = pathMatch[1];
    } else {
      currentChatIdRef.current = null;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user?.id || !user?.companyId) return;

    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);
    
    if (!socket) return;

    const handleChatMessage = (data) => {
      if (data.action !== "new-message") return;

      const { newMessage, chat } = data;
      
      // Verificar se o usuário atual é participante do chat (exceto o remetente)
      const userIds = chat.users?.map((userObj) => userObj.userId) || [];
      const isParticipant = userIds.includes(user.id);
      const isSender = newMessage.senderId === user.id;

      // Não notificar se o usuário não é participante ou se é o remetente
      if (!isParticipant || isSender) return;

      // Verificar se o chat está sendo visualizado atualmente
      const chatUuid = chat.uuid;
      const isViewingChat = currentChatIdRef.current === chatUuid;

      // Não notificar se o usuário está visualizando o chat
      if (isViewingChat) return;

      // Obter informações do remetente
      // Buscar o usuário no array de users do chat
      const chatUser = chat.users?.find((cu) => cu.userId === newMessage.senderId);
      const sender = chatUser?.user || newMessage.sender;
      const senderName = sender?.name || "Usuário";
      const senderAvatar = sender?.avatar || null;

      // Prévia da mensagem (truncar se necessário)
      let messagePreview = newMessage.message || "";
      if (newMessage.mediaName) {
        messagePreview = `📎 ${newMessage.mediaName}`;
      } else if (messagePreview.length > 50) {
        messagePreview = messagePreview.substring(0, 50) + "...";
      }

      // Exibir toast
      const toastId = `chat-${chat.id}-${newMessage.id}`;
      toast.info(
        <div onClick={() => history.push(`/chats/${chatUuid}`)} style={{ cursor: "pointer" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{senderName}</div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>{messagePreview}</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: 4 }}>
            Chat interno
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

    socket.on(`company-${companyId}-chat`, handleChatMessage);

    return () => {
      socket.off(`company-${companyId}-chat`, handleChatMessage);
    };
  }, [user, socketManager, history]);
};

export default useChatNotifications;
