import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useTicketsHistory = (filters = {}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [count, setCount] = useState(0);
  const abortRef = useRef(null);

  const {
    searchParam = "",
    dateFrom = "",
    dateTo = "",
    queueIds = [],
    whatsappIds = [],
    userIds = [],
    tags = [],
    groupBy = "contact",
  } = filters;

  const fetchGroups = useCallback(
    async (page = 1, reset = false) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const { data } = await api.get("/tickets/history", {
          signal: abortRef.current.signal,
          params: {
            pageNumber: page,
            groupBy,
            searchParam: searchParam || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            queueIds: JSON.stringify(queueIds),
            whatsappIds: JSON.stringify(whatsappIds),
            users: JSON.stringify(userIds),
            tags: JSON.stringify(tags),
          },
        });

        const nextGroups = data.groups || [];
        setGroups((prev) => (reset ? nextGroups : [...prev, ...nextGroups]));
        setHasMore(Boolean(data.hasMore));
        setCount(data.count || 0);
        setPageNumber(page);
      } catch (err) {
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          toastError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchParam, dateFrom, dateTo, queueIds, whatsappIds, userIds, tags, groupBy]
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchGroups(1, true);
    }, searchParam ? 400 : 0);
    return () => clearTimeout(delay);
  }, [fetchGroups, searchParam]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchGroups(pageNumber + 1, false);
    }
  };

  const searchGlobal = useCallback(
    async (query) => {
      if (!query || query.trim().length < 3) return [];
      try {
        const { data } = await api.get("/tickets/history/search", {
          params: {
            query: query.trim(),
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            queueIds: JSON.stringify(queueIds),
            whatsappIds: JSON.stringify(whatsappIds),
            users: JSON.stringify(userIds),
            tags: JSON.stringify(tags),
          },
        });
        return data.results || [];
      } catch (err) {
        toastError(err);
        return [];
      }
    },
    [dateFrom, dateTo, queueIds, whatsappIds, userIds, tags]
  );

  return {
    groups,
    loading,
    hasMore,
    count,
    loadMore,
    refresh: () => fetchGroups(1, true),
    searchGlobal,
  };
};

export default useTicketsHistory;
