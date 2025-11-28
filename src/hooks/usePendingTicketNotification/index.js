import { useEffect, useRef, useContext } from "react";
import useSound from "use-sound";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import newChatSound from "../../assets/new_chat.mp3";

const usePendingTicketNotification = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const [play, { stop }] = useSound(newChatSound, { 
    loop: true,
    volume: 0.5 
  });
  const isPlayingRef = useRef(false);
  const pendingTicketsRef = useRef(new Set());

  // Controlar reprodução do áudio baseado no número de tickets pendentes
  const updateAudioState = () => {
    const hasPendingTickets = pendingTicketsRef.current.size > 0;
    
    if (hasPendingTickets && !isPlayingRef.current) {
      // Há tickets pendentes e o áudio não está tocando
      play();
      isPlayingRef.current = true;
    } else if (!hasPendingTickets && isPlayingRef.current) {
      // Não há mais tickets pendentes, parar o áudio
      stop();
      isPlayingRef.current = false;
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
      if (isPlayingRef.current) {
        stop();
        isPlayingRef.current = false;
      }
      // Limpar conjunto
      pendingTicketsRef.current.clear();
    };
  }, [user, socketManager, play, stop]);

  return null;
};

export default usePendingTicketNotification;

