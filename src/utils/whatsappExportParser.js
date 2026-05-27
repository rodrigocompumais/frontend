import { parse, isValid } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const LINE_REGEX =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2})\s+-\s+(?:(.+?):\s*)?(.*)$/;

const MEDIA_PLACEHOLDERS = [
  "<mídia oculta>",
  "<midia oculta>",
  "<media omitted>",
  "‎<attached:",
];

const SYSTEM_PATTERNS = [
  /criptografia de ponta a ponta/i,
  /end-to-end encrypted/i,
  /está na sua lista de contatos/i,
  /is in your contacts/i,
  /as mensagens e ligações são protegidas/i,
  /messages and calls are end-to-end/i,
  /você criou o grupo/i,
  /you created group/i,
  /mudou o assunto/i,
  /changed the subject/i,
  /adicionou/i,
  /added/i,
  /saiu/i,
  /left/i,
  /removeu/i,
  /removed/i,
];

export const isMediaPlaceholder = (text) => {
  if (!text || typeof text !== "string") return false;
  const lower = text.trim().toLowerCase();
  return MEDIA_PLACEHOLDERS.some((p) => lower === p || lower.startsWith(p));
};

export const isSystemLine = (author, body) => {
  const combined = `${author || ""} ${body || ""}`.trim();
  if (!combined) return true;
  if (!author && body) {
    return SYSTEM_PATTERNS.some((p) => p.test(body));
  }
  return SYSTEM_PATTERNS.some((p) => p.test(combined));
};

const parseDateTime = (datePart, timePart) => {
  const time = timePart.trim();
  const candidates = [
    `dd/MM/yyyy HH:mm`,
    `d/M/yyyy HH:mm`,
    `dd/MM/yy HH:mm`,
    `M/d/yyyy HH:mm`,
    `M/d/yy HH:mm`,
  ];
  for (const fmt of candidates) {
    const d = parse(`${datePart} ${time}`, fmt, new Date(), { locale: ptBR });
    if (isValid(d)) return d;
  }
  return null;
};

export const extractChatTitleHint = (fileName) => {
  if (!fileName) return null;
  const base = fileName.replace(/\.(txt|zip)$/i, "");
  const m = base.match(/(?:conversa do whatsapp com|whatsapp chat with)\s+(.+)/i);
  return m ? m[1].trim() : null;
};

/**
 * @param {string} rawText
 * @param {{ fileName?: string }} [options]
 */
export const parseWhatsAppExport = (rawText, options = {}) => {
  const lines = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const messages = [];
  const participantsSet = new Set();
  let systemLinesSkipped = 0;
  let mediaPlaceholderCount = 0;
  let current = null;

  const flush = () => {
    if (!current) return;
    const body = (current.bodyParts || []).join("\n").trim();
    const author = current.author;
    if (isSystemLine(author, body)) {
      systemLinesSkipped += 1;
      current = null;
      return;
    }
    const isMedia = isMediaPlaceholder(body);
    if (isMedia) mediaPlaceholderCount += 1;
    if (author) participantsSet.add(author);
    messages.push({
      datetime: current.datetime,
      author: author || null,
      body: isMedia ? body : body || "",
      isMedia,
    });
    current = null;
  };

  for (const line of lines) {
    const match = line.match(LINE_REGEX);
    if (match) {
      flush();
      const [, datePart, timePart, authorPart, bodyPart] = match;
      const datetime = parseDateTime(datePart, timePart);
      const author = authorPart ? authorPart.trim() : null;
      const body = (bodyPart || "").trim();
      current = {
        datetime: datetime || new Date(0),
        author,
        bodyParts: body ? [body] : [],
      };
    } else if (current && line.trim()) {
      current.bodyParts.push(line);
    }
  }
  flush();

  const chatTitleHint =
    extractChatTitleHint(options.fileName) ||
    extractChatTitleHint(options.txtFileName);

  return {
    messages,
    participants: Array.from(participantsSet).sort(),
    systemLinesSkipped,
    mediaPlaceholderCount,
    chatTitleHint,
  };
};

/** Heurística: qual participante é o contacto */
export const suggestParticipantMapping = (participants, contactName, chatTitleHint) => {
  const mapping = {};
  if (!participants.length) return mapping;

  const norm = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const contactNorm = norm(contactName);
  const titleNorm = norm(chatTitleHint);

  let contactAuthor = null;
  let bestScore = 0;

  for (const p of participants) {
    const pNorm = norm(p);
    let score = 0;
    if (contactNorm && (pNorm.includes(contactNorm) || contactNorm.includes(pNorm))) {
      score += 3;
    }
    if (titleNorm && (pNorm.includes(titleNorm) || titleNorm.includes(pNorm))) {
      score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      contactAuthor = p;
    }
  }

  if (!contactAuthor && participants.length === 2) {
    contactAuthor = participants[0];
  } else if (!contactAuthor) {
    contactAuthor = participants[0];
  }

  for (const p of participants) {
    mapping[p] = p === contactAuthor ? "contact" : "me";
  }
  return mapping;
};

export default parseWhatsAppExport;
