import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const sumUserUnreads = (records = [], userId) => {
  let total = 0;
  records.forEach((chat) => {
    (chat.users || []).forEach((chatUser) => {
      if (Number(chatUser.userId) === Number(userId)) {
        total += Number(chatUser.unreads || 0);
      }
    });
  });
  return total;
};

const useInternalChatUnreadCount = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!user?.companyId || !user?.id) return;

    const fetchInitial = async () => {
      try {
        const { data } = await api.get("/chats", {
          params: { pageNumber: 1 }
        });
        const records = Array.isArray(data?.records) ? data.records : [];
        setUnreadChatCount(sumUserUnreads(records, user.id));
      } catch (_) {
        // silencioso: contador é complementar e não deve quebrar UI
      }
    };

    fetchInitial();
  }, [user?.companyId, user?.id]);

  useEffect(() => {
    if (!user?.companyId || !user?.id) return;

    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);
    if (!socket) return () => {};

    const handleChat = (data) => {
      if (!data || !data.chat) return;
      const chat = data.chat;
      const chatUser = (chat.users || []).find(
        (u) => Number(u.userId) === Number(user.id)
      );
      if (!chatUser) return;

      // Recalcular via API para evitar drift em eventos parciais e manter precisão.
      api
        .get("/chats", { params: { pageNumber: 1 } })
        .then(({ data: result }) => {
          const records = Array.isArray(result?.records) ? result.records : [];
          setUnreadChatCount(sumUserUnreads(records, user.id));
        })
        .catch(() => {});
    };

    socket.on(`company-${companyId}-chat`, handleChat);
    return () => {
      socket.off(`company-${companyId}-chat`, handleChat);
    };
  }, [user?.companyId, user?.id, socketManager]);

  return { unreadChatCount };
};

export default useInternalChatUnreadCount;
