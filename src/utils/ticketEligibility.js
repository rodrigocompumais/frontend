export const normalizeNumber = value => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getUserQueueIds = user =>
  (user?.queues || []).map(queue => normalizeNumber(queue?.id)).filter(id => id !== null);

export const canUserAccessTicket = (ticket, user, options = {}) => {
  const { allowUnassignedPending = true, allowUnassignedWithoutQueue = true } = options;
  if (!ticket || !user?.id) return false;

  const ticketUserId = normalizeNumber(ticket.userId);
  const userId = normalizeNumber(user.id);
  const ticketQueueId = normalizeNumber(ticket.queueId);
  const userQueueIds = new Set(getUserQueueIds(user));

  if (ticketUserId !== null) {
    return ticketUserId === userId;
  }

  if (!allowUnassignedPending && !allowUnassignedWithoutQueue) {
    return false;
  }

  if (ticket.status === "pending") {
    if (!allowUnassignedPending) return false;
    if (ticketQueueId === null) return allowUnassignedWithoutQueue;
    return userQueueIds.has(ticketQueueId);
  }

  if (ticketQueueId === null) {
    return allowUnassignedWithoutQueue;
  }

  return userQueueIds.has(ticketQueueId);
};

export const canNotifyBrowserForTicket = (ticket, user) =>
  canUserAccessTicket(ticket, user, {
    allowUnassignedPending: true,
    allowUnassignedWithoutQueue: true
  });
