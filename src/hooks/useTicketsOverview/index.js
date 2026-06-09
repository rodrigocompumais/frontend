import { useState, useCallback, useEffect, useRef, useContext } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";

const emptyOverview = {
  summary: {
    onlineAttendants: 0,
    potentials: 0,
    newMessages: 0,
    active: 0,
    pending: 0,
    returns: 0,
  },
  queues: [],
  users: [],
};

const useTicketsOverview = ({ showAllTickets, selectedQueueIds, enabled = true }) => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const [data, setData] = useState(emptyOverview);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchOverview = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const { data: response } = await api.get("/tickets/overview", {
        params: {
          showAll: showAllTickets ? "true" : "false",
          queueIds: JSON.stringify(selectedQueueIds || []),
        },
      });
      setData(response || emptyOverview);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [enabled, showAllTickets, selectedQueueIds]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (!enabled || !user?.companyId) return undefined;

    const companyId = user.companyId;
    const socket = socketManager.getSocket(companyId);
    if (!socket) return undefined;

    const scheduleRefresh = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        fetchOverview();
      }, 2500);
    };

    const handleTicket = () => scheduleRefresh();
    const handleAppMessage = () => scheduleRefresh();

    socket.on(`company-${companyId}-ticket`, handleTicket);
    socket.on(`company-${companyId}-appMessage`, handleAppMessage);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      socket.off(`company-${companyId}-ticket`, handleTicket);
      socket.off(`company-${companyId}-appMessage`, handleAppMessage);
    };
  }, [enabled, user?.companyId, fetchOverview, socketManager]);

  return { data, loading, refresh: fetchOverview };
};

export default useTicketsOverview;
