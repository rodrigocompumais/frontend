import { useEffect, useRef, useContext, useCallback } from "react";
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
  const isManuallyPausedRef = useRef(false);
  const debounceTimeoutRef = useRef(null);
  const lastPlayedTicketsRef = useRef(new Set());

  // Inicializar elemento de áudio (sem loop - sempre toca apenas uma vez)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(newChatSound);
      audioRef.current.volume = 0.5;
      audioRef.current.loop = false; // Sempre sem loop
    }
  }, []);

  // Limpar áudio ao desmontar
  useEffect(() => {
    return () => {
      // Limpar debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Limpar refs
      isPlayingRef.current = false;
      isManuallyPausedRef.current = false;
      lastPlayedTicketsRef.current.clear();
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

        if (process.env.NODE_ENV !== 'production') {
          console.log("📋 Tickets pendentes iniciais:", data);
        }

        if (data?.tickets && data.tickets.length > 0) {
          data.tickets.forEach(ticket => {
            pendingTicketsRef.current.add(ticket.id);
          });
          if (process.env.NODE_ENV !== 'production') {
            console.log("✅ Tickets pendentes carregados:", pendingTicketsRef.current.size);
          }
          updateAudioState();
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.log("ℹ️ Nenhum ticket pendente encontrado inicialmente");
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("❌ Erro ao buscar tickets pendentes iniciais:", error);
        }
      }
    };

    fetchInitialPendingTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.companyId]);

  // Controlar reprodução do áudio baseado no número de tickets pendentes
  const updateAudioState = useCallback((newTicketId = null) => {
    // Limpar timeout anterior se existir (debounce)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce de 100ms para evitar múltiplas chamadas
    debounceTimeoutRef.current = setTimeout(() => {
      const hasPendingTickets = pendingTicketsRef.current.size > 0;

      // Se foi pausado manualmente, não tocar
      if (isManuallyPausedRef.current && hasPendingTickets) {
        if (process.env.NODE_ENV !== 'production') {
          console.log("🔇 Áudio pausado manualmente - ignorando atualização");
        }
        return;
      }

      // Se não há tickets pendentes, parar o áudio
      if (!hasPendingTickets) {
        if (isPlayingRef.current && audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          isPlayingRef.current = false;
          lastPlayedTicketsRef.current.clear();
          if (process.env.NODE_ENV !== 'production') {
            console.log("🔇 Áudio parado - sem tickets pendentes");
          }
        }
        isManuallyPausedRef.current = false; // Reset pausa manual quando não há tickets
        return;
      }

      // Sempre tocar apenas uma vez por NOVO ticket (sem loop)
      if (audioRef.current) {
        audioRef.current.loop = false;
        
        // Tocar apenas se houver um NOVO ticket que ainda não tocou som
        if (newTicketId && !lastPlayedTicketsRef.current.has(newTicketId) && !isManuallyPausedRef.current) {
          lastPlayedTicketsRef.current.add(newTicketId);
          
          audioRef.current.onended = () => {
            isPlayingRef.current = false;
            if (process.env.NODE_ENV !== 'production') {
              console.log("🔇 Áudio parado - reprodução única concluída");
            }
          };
          
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => {
            if (process.env.NODE_ENV !== 'production') {
              console.warn("Não foi possível tocar o áudio:", err);
            }
            isPlayingRef.current = false;
          });
          isPlayingRef.current = true;
          if (process.env.NODE_ENV !== 'production') {
            console.log("🔊 Áudio iniciado (único) - novo ticket:", newTicketId);
          }
        }
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escutar eventos customizados para pausa manual do áudio
  useEffect(() => {
    const handlePauseAudio = () => {
      if (audioRef.current && isPlayingRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        isPlayingRef.current = false;
        isManuallyPausedRef.current = true;
        if (process.env.NODE_ENV !== 'production') {
          console.log("⏸️ Áudio pausado manualmente pelo usuário");
        }
      } else {
        isManuallyPausedRef.current = true;
        if (process.env.NODE_ENV !== 'production') {
          console.log("⏸️ Pausa manual ativada (sem áudio tocando)");
        }
      }
    };

    const handleResumeAudio = () => {
      isManuallyPausedRef.current = false;
      if (process.env.NODE_ENV !== 'production') {
        console.log("▶️ Pausa manual desativada - áudio pode tocar novamente");
      }
      // Atualizar estado para verificar se deve tocar
      if (pendingTicketsRef.current.size > 0) {
        updateAudioState();
      }
    };

    // Escutar eventos customizados
    window.addEventListener("pausePendingTicketAudio", handlePauseAudio);
    window.addEventListener("resumePendingTicketAudio", handleResumeAudio);

    return () => {
      window.removeEventListener("pausePendingTicketAudio", handlePauseAudio);
      window.removeEventListener("resumePendingTicketAudio", handleResumeAudio);
    };
  }, [updateAudioState]);

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

      if (process.env.NODE_ENV !== 'production') {
        console.log(`🎫 Evento de ticket [${data.action}]:`, {
          ticketId,
          status: data.ticket.status,
          isPending,
          belongsToUser,
          currentPendingCount: pendingTicketsRef.current.size
        });
      }

      if (data.action === "update" || data.action === "create") {
        const wasPending = pendingTicketsRef.current.has(ticketId);
        
        if (isPending && belongsToUser) {
          // Adicionar ticket ao conjunto de pendentes
          pendingTicketsRef.current.add(ticketId);
          if (!wasPending) {
            if (process.env.NODE_ENV !== 'production') {
              console.log(`➕ Ticket ${ticketId} adicionado aos pendentes`);
            }
            // Passar o ID do novo ticket para tocar som apenas para novos tickets
            updateAudioState(ticketId);
          } else {
            // Ticket já estava pendente, apenas atualizar estado sem tocar som
            updateAudioState();
          }
        } else {
          // Remover ticket do conjunto (mudou de status ou não pertence mais ao usuário)
          if (wasPending) {
            pendingTicketsRef.current.delete(ticketId);
            lastPlayedTicketsRef.current.delete(ticketId);
            if (process.env.NODE_ENV !== 'production') {
              console.log(`➖ Ticket ${ticketId} removido dos pendentes (status: ${data.ticket.status})`);
            }
          }
          updateAudioState();
        }
      }

      if (data.action === "delete") {
        // Ticket foi deletado, remover do conjunto
        const wasDeleted = pendingTicketsRef.current.delete(ticketId);
        lastPlayedTicketsRef.current.delete(ticketId);
        if (wasDeleted && process.env.NODE_ENV !== 'production') {
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
      // Limpar debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Parar áudio ao desmontar
      if (isPlayingRef.current && audioRef.current) {
        audioRef.current.pause();
        isPlayingRef.current = false;
      }
      // Limpar conjuntos
      pendingTicketsRef.current.clear();
      lastPlayedTicketsRef.current.clear();
    };
  }, [user, socketManager]);

  return null;
};

export default usePendingTicketNotification;

