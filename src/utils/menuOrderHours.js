/**
 * Horário de pedidos do cardápio (módulo Lanchonetes).
 * Configuração em form.settings: orderHoursEnabled, orderHoursStart, orderHoursEnd, orderHoursTimezone, orderHoursMessage.
 */

const DEFAULT_TZ = "America/Sao_Paulo";

export function parseTimeToMinutes(s) {
  if (s == null || s === "") return null;
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function getMinutesInTimeZone(now, timeZone) {
  const tz = timeZone || DEFAULT_TZ;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    return hour * 60 + minute;
  } catch {
    return getMinutesInTimeZone(now, DEFAULT_TZ);
  }
}

/**
 * @param {object|undefined} settings — form.settings
 * @param {Date} [now]
 */
export function isWithinMenuOrderHours(settings, now = new Date()) {
  if (!settings || !settings.orderHoursEnabled) return true;
  const startS = settings.orderHoursStart;
  const endS = settings.orderHoursEnd;
  if (!startS || !endS) return true;
  const startM = parseTimeToMinutes(startS);
  const endM = parseTimeToMinutes(endS);
  if (startM == null || endM == null) return true;
  if (startM === endM) return true;
  const tz = settings.orderHoursTimezone || DEFAULT_TZ;
  const cur = getMinutesInTimeZone(now, tz);
  if (startM < endM) {
    return cur >= startM && cur <= endM;
  }
  return cur >= startM || cur <= endM;
}

export function getMenuOrderHoursLabel(settings) {
  const start = settings?.orderHoursStart || "";
  const end = settings?.orderHoursEnd || "";
  const tz = settings?.orderHoursTimezone || DEFAULT_TZ;
  const tzLabel =
    tz === "America/Sao_Paulo"
      ? "Brasília"
      : tz === "America/Fortaleza" || tz === "America/Recife" || tz === "America/Maceio"
        ? "Brasil (Nordeste)"
        : tz === "America/Manaus"
          ? "Manaus"
          : tz;
  return { start, end, tzLabel };
}

/**
 * Mensagem formal exibida quando o cardápio está fora do horário.
 */
export function getMenuOrderHoursClosedMessage(settings) {
  const custom = (settings?.orderHoursMessage || "").trim();
  if (custom) return custom;
  const { start, end, tzLabel } = getMenuOrderHoursLabel(settings);
  return (
    "Prezado cliente, informamos que, no momento, não estamos recebendo pedidos pelo cardápio digital. " +
    `Nosso horário de atendimento para pedidos é das ${start || "—"} às ${end || "—"} ` +
    `(horário de ${tzLabel}). Agradecemos a compreensão.`
  );
}
