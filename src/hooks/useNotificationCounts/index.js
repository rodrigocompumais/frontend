import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import api from "../../services/api";

const useNotificationCounts = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const pendingTicketsRef = useRef(new Set());
  const ticketUnreadCountsRef = useRef(new Map()); // ticketId -> unreadCount

  // Buscar contadores iniciais
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.companyId) return;

      try {
        // Buscar tickets pendentes
        const ticketsResponse = await api.get("/tickets", {
          params: {
            status: "pending",
            showAll: false,
            pageNumber: 1,
            queueIds: JSON.stringify(user.queues?.map(q => q.id) || [])
          }
        });

        // Armazenar tickets pendentes
        if (ticketsResponse.data?.tickets) {
          ticketsResponse.data.tickets.forEach(ticket => {
            if (ticket.status === "pending") {
              pendingTicketsRef.current.add(ticket.id);
            }
          });
        }
        setPendingTicketsCount(pendingTicketsRef.current.size);

        // Buscar mensagens não lidas
        const messagesResponse = await api.get("/tickets", {
          params: {
            withUnreadMessages: true,
            showAll: false,
            pageNumber: 1,
            queueIds: JSON.stringify(user.queues?.map(q => q.id) || [])
          }
        });

        // Contar total de mensagens não lidas
        let unreadCount = 0;
        if (messagesResponse.data?.tickets) {
          messagesResponse.data.tickets.forEach(ticket => {
            const unread = ticket.unreadMessages || 0;
            if (unread > 0) {
              ticketUnreadCountsRef.current.set(ticket.id, unread);
              unreadCount += unread;
            }
          });
        }
        setUnreadMessagesCount(unreadCount);
      } catch (error) {
        console.error("Erro ao buscar contadores de notificação:", error);
      }
    };

    fetchCounts();
  }, [user?.companyId, user?.queues]);

  // Escutar eventos de socket para atualizar contadores
  useEffect(() => {
    if (!user?.companyId) return;

    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);
    
    if (!socket) {
      return () => {};
    }

    const userQueueIds = user.queues?.map(q => q.id) || [];

    const shouldCountTicket = (ticket) => {
      if (!ticket.queueId) return true;
      return userQueueIds.indexOf(ticket.queueId) > -1;
    };

    const handleTicket = (data) => {
      if (!data.ticket) return;
      
      const ticketId = data.ticket.id;
      const isPending = data.ticket.status === "pending";
      const belongsToUser = shouldCountTicket(data.ticket);

      if (data.action === "update" || data.action === "create") {
        const wasPending = pendingTicketsRef.current.has(ticketId);
        
        if (isPending && belongsToUser) {
          // Adicionar ticket aos pendentes se não estava antes
          if (!wasPending) {
            pendingTicketsRef.current.add(ticketId);
            setPendingTicketsCount(pendingTicketsRef.current.size);
          }
        } else {
          // Remover ticket dos pendentes se estava antes
          if (wasPending) {
            pendingTicketsRef.current.delete(ticketId);
            setPendingTicketsCount(pendingTicketsRef.current.size);
          }
        }

        // Atualizar contador de mensagens não lidas
        if (data.ticket.unreadMessages !== undefined && belongsToUser) {
          const oldUnread = ticketUnreadCountsRef.current.get(ticketId) || 0;
          const newUnread = data.ticket.unreadMessages || 0;
          
          ticketUnreadCountsRef.current.set(ticketId, newUnread);
          
          // Recalcular total
          let totalUnread = 0;
          ticketUnreadCountsRef.current.forEach(count => {
            totalUnread += count;
          });
          setUnreadMessagesCount(totalUnread);
        }
      }

      if (data.action === "delete") {
        // Ticket deletado, remover de ambos os contadores
        const wasPending = pendingTicketsRef.current.delete(ticketId);
        if (wasPending) {
          setPendingTicketsCount(pendingTicketsRef.current.size);
        }
        
        const hadUnread = ticketUnreadCountsRef.current.has(ticketId);
        if (hadUnread) {
          const unreadCount = ticketUnreadCountsRef.current.get(ticketId) || 0;
          ticketUnreadCountsRef.current.delete(ticketId);
          setUnreadMessagesCount(prev => Math.max(0, prev - unreadCount));
        }
      }
    };

    const handleMessage = (data) => {
      if (!data.message) return;
      
      const ticketId = data.message.ticketId;
      if (!ticketId) return;

      if (data.action === "create" && !data.message.fromMe) {
        // Nova mensagem recebida, incrementar contador do ticket
        const currentUnread = ticketUnreadCountsRef.current.get(ticketId) || 0;
        ticketUnreadCountsRef.current.set(ticketId, currentUnread + 1);
        
        // Recalcular total
        let totalUnread = 0;
        ticketUnreadCountsRef.current.forEach(count => {
          totalUnread += count;
        });
        setUnreadMessagesCount(totalUnread);
      } else if (data.action === "update") {
        // Mensagem atualizada (pode ter sido lida)
        // Quando uma mensagem é marcada como lida, geralmente o ticket é atualizado
        // então vamos confiar no evento de ticket para atualizar o contador
      }
    };

    const handleReady = () => {
      socket.emit("joinNotification");
    };

    socket.on("ready", handleReady);
    socket.on(`company-${companyId}-ticket`, handleTicket);
    socket.on(`company-${companyId}-appMessage`, handleMessage);

    return () => {
      socket.off("ready", handleReady);
      socket.off(`company-${companyId}-ticket`, handleTicket);
      socket.off(`company-${companyId}-appMessage`, handleMessage);
    };
  }, [user, socketManager]);

  return {
    pendingTicketsCount,
    unreadMessagesCount,
    totalNotifications: pendingTicketsCount + unreadMessagesCount
  };
};

export default useNotificationCounts;
