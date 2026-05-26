export const normalizeNumber = value => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getUserQueueIds = user =>
  (user?.queues || []).map(queue => normalizeNumber(queue?.id)).filter(id => id !== null);

/** Acesso à fila do ticket (inclui allTicket para tickets sem fila). */
export const userHasQueueAccess = (queueId, user) => {
  if (!user?.id) return false;
  if (user.profile === "admin") return true;

  const normalizedQueueId = normalizeNumber(queueId);
  if (normalizedQueueId === null) {
    return user.allTicket === "enabled";
  }

  const userQueueIds = getUserQueueIds(user);
  return userQueueIds.includes(normalizedQueueId);
};

/** Pode abrir/visualizar o ticket (atribuído ao usuário ou fila permitida). */
export const canUserViewTicket = (ticket, user) => {
  if (!ticket || !user?.id) return false;
  if (user.profile === "admin") return true;

  const ticketUserId = normalizeNumber(ticket.userId);
  const userId = normalizeNumber(user.id);
  if (ticketUserId !== null && ticketUserId === userId) {
    return true;
  }

  return userHasQueueAccess(ticket.queueId, user);
};

/** Pode enviar mensagens no ticket (aberto + atribuído ao usuário ou aberto na fila dele). */
export const canUserSendTicketMessages = (ticket, user) => {
  if (!ticket || !user?.id) return false;
  if (ticket.status !== "open") return false;
  if (user.profile === "admin") return true;

  const ticketUserId = normalizeNumber(ticket.userId);
  const userId = normalizeNumber(user.id);
  if (ticketUserId !== null) {
    return ticketUserId === userId;
  }

  return userHasQueueAccess(ticket.queueId, user);
};

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
