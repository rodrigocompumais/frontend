import { useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import newChatSound from "../../assets/new_chat.mp3";
import api from "../../services/api";

const usePendingTicketNotification = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  const pendingTicketsRef = useRef(new Set());

  // Inicializar elemento de áudio
  useEffect(() => {
    audioRef.current = new Audio(newChatSound);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Buscar tickets pendentes iniciais
  useEffect(() => {
    const fetchInitialPendingTickets = async () => {
      if (!user?.companyId) return;

      try {
        const { data } = await api.get("/tickets", {
          params: {
            status: "pending",
            showAll: false,
            pageNumber: 1,
            queueIds: JSON.stringify(user.queues?.map(q => q.id) || [])
          }
        });

        console.log("📋 Tickets pendentes iniciais:", data);

        if (data?.tickets && data.tickets.length > 0) {
          data.tickets.forEach(ticket => {
            pendingTicketsRef.current.add(ticket.id);
          });
          console.log("✅ Tickets pendentes carregados:", pendingTicketsRef.current.size);
          updateAudioState();
        } else {
          console.log("ℹ️ Nenhum ticket pendente encontrado inicialmente");
        }
      } catch (error) {
        console.error("❌ Erro ao buscar tickets pendentes iniciais:", error);
      }
    };

    fetchInitialPendingTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId]);

  // Controlar reprodução do áudio baseado no número de tickets pendentes
  const updateAudioState = () => {
    const hasPendingTickets = pendingTicketsRef.current.size > 0;
    
    if (hasPendingTickets && !isPlayingRef.current && audioRef.current) {
      // Há tickets pendentes e o áudio não está tocando
      audioRef.current.play().catch(err => {
        console.warn("Não foi possível tocar o áudio:", err);
      });
      isPlayingRef.current = true;
      console.log("🔊 Áudio iniciado - tickets pendentes:", pendingTicketsRef.current.size);
    } else if (!hasPendingTickets && isPlayingRef.current && audioRef.current) {
      // Não há mais tickets pendentes, parar o áudio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
      console.log("🔇 Áudio parado - sem tickets pendentes");
    }
  };

  // Escutar eventos de socket para monitorar tickets pendentes
  useEffect(() => {
    if (!user?.companyId) return;

    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);
    
    if (!socket) {
      return () => {};
    }

    const userQueueIds = user.queues?.map(q => q.id) || [];

    const shouldCountTicket = (ticket) => {
      // Contar apenas tickets que pertencem às filas do usuário
      if (!ticket.queueId) return true; // Tickets sem fila contam
      return userQueueIds.indexOf(ticket.queueId) > -1;
    };

    const handleTicket = (data) => {
      if (!data.ticket) return;
      
      const ticketId = data.ticket.id;
      const isPending = data.ticket.status === "pending";
      const belongsToUser = shouldCountTicket(data.ticket);

      if (data.action === "update" || data.action === "create") {
        if (isPending && belongsToUser) {
          // Adicionar ticket ao conjunto de pendentes
          pendingTicketsRef.current.add(ticketId);
        } else {
          // Remover ticket do conjunto (mudou de status ou não pertence mais ao usuário)
          pendingTicketsRef.current.delete(ticketId);
        }
        updateAudioState();
      }

      if (data.action === "delete") {
        // Ticket foi deletado, remover do conjunto
        pendingTicketsRef.current.delete(ticketId);
        updateAudioState();
      }
    };

    const handleReady = () => {
      socket.emit("joinNotification");
    };

    socket.on("ready", handleReady);
    socket.on(`company-${companyId}-ticket`, handleTicket);

    return () => {
      socket.off("ready", handleReady);
      socket.off(`company-${companyId}-ticket`, handleTicket);
      // Parar áudio ao desmontar
      if (isPlayingRef.current && audioRef.current) {
        audioRef.current.pause();
        isPlayingRef.current = false;
      }
      // Limpar conjunto
      pendingTicketsRef.current.clear();
    };
  }, [user, socketManager]);

  return null;
};

export default usePendingTicketNotification;

