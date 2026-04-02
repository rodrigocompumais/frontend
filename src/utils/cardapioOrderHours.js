/**
 * Espelha a lógica de backend_compuchat/src/services/FormServices/EvaluateCardapioOrderHours.ts
 */

const WEEKDAY_LONG_TO_KEY = {
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
};

const DEFAULT_CLOSED_MESSAGE =
  "No momento não estamos aceitando pedidos. Confira nosso horário de funcionamento.";

const DAY_LABELS_PT = {
  sunday: "Domingo",
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
};

const DAY_ORDER = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const TZ_LABELS_PT = {
  "America/Sao_Paulo": "Brasília",
  "America/Manaus": "Manaus",
  "America/Fortaleza": "Fortaleza",
  "America/Recife": "Recife",
  "America/Belem": "Belém",
  "America/Cuiaba": "Cuiabá",
};

/**
 * Intervalo legível (mesma lógica de virada que a avaliação de horário).
 * @param {string} start
 * @param {string} end
 * @returns {string}
 */
export function formatOrderHoursTimeRange(start, end) {
  const s = (start && String(start).trim()) || "09:00";
  const e = (end && String(end).trim()) || "22:00";
  const startM = parseTimeToMinutes(s);
  const endM = parseTimeToMinutes(e);
  if (startM != null && endM != null && endM < startM) {
    return `das ${s} às ${e} (até o dia seguinte)`;
  }
  return `das ${s} às ${e}`;
}

function formatYmdToPtBr(ymd) {
  const t = String(ymd || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return t;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Textos para exibir ao cliente quando o cardápio está fora do horário (lista + rodapé).
 * @param {object|null|undefined} settings
 * @returns {{ title: string; lines: string[]; footnotes: string[] }}
 */
export function getCardapioOrderHoursScheduleSummary(settings) {
  const s = settings || {};
  const lines = [];
  const footnotes = [];

  if (!s.orderHoursEnabled) {
    return { title: "", lines: [], footnotes: [] };
  }

  const tz = String(s.orderHoursTimezone || "America/Sao_Paulo");
  const tzPt = TZ_LABELS_PT[tz] || tz;
  footnotes.push(`Horários no fuso: ${tzPt}.`);

  const mode = String(s.orderHoursMode || "simple");
  if (mode === "weekly") {
    const wd = s.orderHoursWeekdays || {};
    for (const key of DAY_ORDER) {
      const label = DAY_LABELS_PT[key];
      const d = wd[key];
      if (!d || !d.enabled) {
        lines.push(`${label}: fechado`);
      } else {
        lines.push(`${label}: ${formatOrderHoursTimeRange(d.startTime, d.endTime)}`);
      }
    }
  } else {
    const start = String(s.orderHoursStart ?? "09:00");
    const end = String(s.orderHoursEnd ?? "22:00");
    lines.push(`Todos os dias: ${formatOrderHoursTimeRange(start, end)}`);
  }

  const closed = Array.isArray(s.orderHoursClosedDates)
    ? s.orderHoursClosedDates.map((d) => String(d).trim()).filter(Boolean)
    : [];
  if (closed.length > 0) {
    const pretty = [...closed].map(formatYmdToPtBr).sort();
    footnotes.push(`Sem pedidos nas datas: ${pretty.join(", ")}.`);
  }

  return {
    title: "Horário de funcionamento para pedidos",
    lines,
    footnotes,
  };
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function getLocalPartsInTimezone(date, timeZone) {
  const tz = timeZone || "America/Sao_Paulo";
  const dtfDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dtfWeek = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
  });
  const dtfTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateKey = dtfDate.format(date);
  const weekdayLong = dtfWeek.format(date).toLowerCase();
  const dayKey = WEEKDAY_LONG_TO_KEY[weekdayLong];
  if (!dayKey) {
    throw new Error(`Weekday not mapped: ${weekdayLong}`);
  }

  const timeParts = dtfTime.formatToParts(date);
  let hour = 0;
  let minute = 0;
  for (let i = 0; i < timeParts.length; i++) {
    const p = timeParts[i];
    if (p.type === "hour") hour = Number(p.value);
    if (p.type === "minute") minute = Number(p.value);
  }

  return {
    minutes: hour * 60 + minute,
    dayKey,
    dateKey,
  };
}

function isMinutesWithinOrderWindow(currentMinutes, startStr, endStr) {
  const start = parseTimeToMinutes(startStr);
  const end = parseTimeToMinutes(endStr);
  if (start == null || end == null) return true;

  if (end >= start) {
    return currentMinutes >= start && currentMinutes < end;
  }
  return currentMinutes >= start || currentMinutes < end;
}

function getDefaultMessage(settings) {
  const custom = String(settings.orderHoursMessage ?? "").trim();
  return custom || DEFAULT_CLOSED_MESSAGE;
}

/**
 * @param {object|null|undefined} settings
 * @param {Date} [at]
 * @returns {{ allowed: boolean; message: string }}
 */
export default function evaluateCardapioOrderHours(settings, at = new Date()) {
  const s = settings || {};
  if (!s.orderHoursEnabled) {
    return { allowed: true, message: "" };
  }

  const tz = String(s.orderHoursTimezone || "America/Sao_Paulo");
  const message = getDefaultMessage(s);

  let parts;
  try {
    parts = getLocalPartsInTimezone(at, tz);
  } catch {
    return { allowed: true, message: "" };
  }

  const closedDates = Array.isArray(s.orderHoursClosedDates)
    ? s.orderHoursClosedDates.map((d) => String(d).trim()).filter(Boolean)
    : [];
  if (closedDates.includes(parts.dateKey)) {
    return { allowed: false, message };
  }

  const mode = String(s.orderHoursMode || "simple");

  if (mode === "weekly") {
    const weekdays = s.orderHoursWeekdays || {};
    const dayCfg = weekdays[parts.dayKey];
    if (!dayCfg || !dayCfg.enabled) {
      return { allowed: false, message };
    }
    const startT = dayCfg.startTime ?? "09:00";
    const endT = dayCfg.endTime ?? "22:00";
    if (!isMinutesWithinOrderWindow(parts.minutes, startT, endT)) {
      return { allowed: false, message };
    }
    return { allowed: true, message: "" };
  }

  const start = String(s.orderHoursStart ?? "09:00");
  const end = String(s.orderHoursEnd ?? "22:00");
  if (!isMinutesWithinOrderWindow(parts.minutes, start, end)) {
    return { allowed: false, message };
  }

  return { allowed: true, message: "" };
}
