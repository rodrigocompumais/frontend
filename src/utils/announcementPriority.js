import { i18n } from "../translate/i18n";

export const PRIORITY_HIGH = 1;
export const PRIORITY_MEDIUM = 2;
export const PRIORITY_LOW = 3;

export const normalizePriority = (priority) => {
  const n = Number(priority);
  if (n === PRIORITY_HIGH || n === PRIORITY_MEDIUM || n === PRIORITY_LOW) return n;
  return PRIORITY_LOW;
};

export const getPriorityColor = (priority) => {
  const p = normalizePriority(priority);
  if (p === PRIORITY_HIGH) return "#d32f2f";
  if (p === PRIORITY_MEDIUM) return "#ed6c02";
  return "#757575";
};

export const getPriorityLabel = (priority) => {
  const p = normalizePriority(priority);
  if (p === PRIORITY_HIGH) return i18n.t("announcements.high");
  if (p === PRIORITY_MEDIUM) return i18n.t("announcements.medium");
  return i18n.t("announcements.low");
};

export const getPriorityBorderLeft = (priority) => {
  return `4px solid ${getPriorityColor(priority)}`;
};

/** Menor número = maior prioridade */
export const getHighestPriority = (announcements = []) => {
  if (!announcements.length) return null;
  return announcements.reduce(
    (best, item) => {
      const p = normalizePriority(item.priority);
      return p < best ? p : best;
    },
    normalizePriority(announcements[0].priority)
  );
};

export const sortAnnouncementsByPriority = (announcements = []) =>
  [...announcements].sort((a, b) => {
    const pa = normalizePriority(a.priority);
    const pb = normalizePriority(b.priority);
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

const seenStorageKey = (userId) => `announcements_seen_v1_${userId}`;

export const getSeenAnnouncementIds = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(seenStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
};

export const markAnnouncementsSeen = (userId, announcementIds = []) => {
  if (!userId || !announcementIds.length) return;
  const existing = new Set(getSeenAnnouncementIds(userId));
  announcementIds.forEach((id) => existing.add(Number(id)));
  localStorage.setItem(seenStorageKey(userId), JSON.stringify([...existing]));
};

export const filterUnseenAnnouncements = (announcements, userId) => {
  const seen = new Set(getSeenAnnouncementIds(userId));
  return sortAnnouncementsByPriority(
    announcements.filter((a) => a?.status !== false && !seen.has(Number(a.id)))
  );
};
