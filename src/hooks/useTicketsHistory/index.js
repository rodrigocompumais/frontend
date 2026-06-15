import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const EMPTY_ARRAY = Object.freeze([]);

const stableArrayKey = (value) => JSON.stringify(value ?? EMPTY_ARRAY);

const useTicketsHistory = (filters = {}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [count, setCount] = useState(0);
  const abortRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const {
    searchParam = "",
    dateFrom = "",
    dateTo = "",
    queueIds = EMPTY_ARRAY,
    whatsappIds = EMPTY_ARRAY,
    userIds = EMPTY_ARRAY,
    tags = EMPTY_ARRAY,
    groupBy = "contact",
  } = filters;

  const queueIdsKey = useMemo(() => stableArrayKey(queueIds), [queueIds]);
  const whatsappIdsKey = useMemo(() => stableArrayKey(whatsappIds), [whatsappIds]);
  const userIdsKey = useMemo(() => stableArrayKey(userIds), [userIds]);
  const tagsKey = useMemo(() => stableArrayKey(tags), [tags]);

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
            queueIds: queueIdsKey,
            whatsappIds: whatsappIdsKey,
            users: userIdsKey,
            tags: tagsKey,
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
        loadingMoreRef.current = false;
      }
    },
    [
      searchParam,
      dateFrom,
      dateTo,
      queueIdsKey,
      whatsappIdsKey,
      userIdsKey,
      tagsKey,
      groupBy,
    ]
  );

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchGroups(1, true);
    }, searchParam ? 400 : 0);
    return () => clearTimeout(delay);
  }, [fetchGroups, searchParam]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    fetchGroups(pageNumber + 1, false);
  }, [loading, hasMore, pageNumber, fetchGroups]);

  const searchGlobal = useCallback(
    async (query) => {
      if (!query || query.trim().length < 3) return [];
      try {
        const { data } = await api.get("/tickets/history/search", {
          params: {
            query: query.trim(),
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            queueIds: queueIdsKey,
            whatsappIds: whatsappIdsKey,
            users: userIdsKey,
            tags: tagsKey,
          },
        });
        return data.results || [];
      } catch (err) {
        toastError(err);
        return [];
      }
    },
    [dateFrom, dateTo, queueIdsKey, whatsappIdsKey, userIdsKey, tagsKey]
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
