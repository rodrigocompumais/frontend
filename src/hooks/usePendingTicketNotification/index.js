import { useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import newChatSound from "../../assets/new_chat.mp3";
import api from "../../services/api";

const STORAGE_KEY_PREFIX = "repeatPendingChatSound";

const getStoredRepeatPreference = (userId) => {
  if (!userId) return null;
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${userId}`);
    return stored === null ? null : stored === "true";
  } catch {
    return null;
  }
};

const usePendingTicketNotification = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  const pendingTicketsRef = useRef(new Set());

  // Ler preferência "repetir som": localStorage tem prioridade; se nunca definido, padrão é true (repetir)
  const getShouldRepeat = () => {
    const stored = getStoredRepeatPreference(user?.id);
    if (stored !== null) return stored;
    const fromUser = user?.repeatPendingChatSound;
    if (fromUser === true || fromUser === 1) return true;
    if (fromUser === false || fromUser === 0) return false;
    return true; // padrão quando backend não envia ou envia null
  };

  // Inicializar elemento de áudio. Só preencher localStorage a partir do backend quando o valor for explícito (true/false)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(newChatSound);
      audioRef.current.volume = 0.5;
    }

    const key = user?.id ? `${STORAGE_KEY_PREFIX}_${user.id}` : null;
    const fromApi = user?.repeatPendingChatSound;
    const explicitBool = fromApi === true || fromApi === false || fromApi === 1 || fromApi === 0;
    if (key) {
      const stored = localStorage.getItem(key);
      if (stored === null && explicitBool) {
        localStorage.setItem(key, String(fromApi === true || fromApi === 1));
      }
      // Se o backend não envia valor explícito e estava "false" por sync antigo, limpar para voltar ao padrão (true)
      if (stored === "false" && !explicitBool) {
        localStorage.removeItem(key);
      }
    }

    if (audioRef.current) {
      audioRef.current.loop = getShouldRepeat();
    }
  }, [user?.id, user?.repeatPendingChatSound]);

  // Limpar áudio ao desmontar
  useEffect(() => {
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
    const shouldRepeat = getShouldRepeat();

    if (audioRef.current) {
      audioRef.current.loop = shouldRepeat;
      if (shouldRepeat) {
        audioRef.current.onended = null;
      } else {
        audioRef.current.onended = () => {
          isPlayingRef.current = false;
          console.log("🔇 Áudio parado - reprodução única concluída");
        };
      }
    }

    if (hasPendingTickets && !isPlayingRef.current && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.warn("Não foi possível tocar o áudio:", err);
      });
      isPlayingRef.current = true;
      console.log("🔊 Áudio iniciado - tickets pendentes:", pendingTicketsRef.current.size, "Repetir:", shouldRepeat);
    } else if (!hasPendingTickets && isPlayingRef.current && audioRef.current) {
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

      console.log(`🎫 Evento de ticket [${data.action}]:`, {
        ticketId,
        status: data.ticket.status,
        isPending,
        belongsToUser,
        currentPendingCount: pendingTicketsRef.current.size
      });

      if (data.action === "update" || data.action === "create") {
        const wasPending = pendingTicketsRef.current.has(ticketId);
        
        if (isPending && belongsToUser) {
          // Adicionar ticket ao conjunto de pendentes
          pendingTicketsRef.current.add(ticketId);
          if (!wasPending) {
            console.log(`➕ Ticket ${ticketId} adicionado aos pendentes`);
          }
        } else {
          // Remover ticket do conjunto (mudou de status ou não pertence mais ao usuário)
          if (wasPending) {
            pendingTicketsRef.current.delete(ticketId);
            console.log(`➖ Ticket ${ticketId} removido dos pendentes (status: ${data.ticket.status})`);
          }
        }
        updateAudioState();
      }

      if (data.action === "delete") {
        // Ticket foi deletado, remover do conjunto
        const wasDeleted = pendingTicketsRef.current.delete(ticketId);
        if (wasDeleted) {
          console.log(`🗑️ Ticket ${ticketId} deletado dos pendentes`);
        }
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

