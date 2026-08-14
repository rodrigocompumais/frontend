const EXCLUDED_AUTO_TYPES = new Set(["name", "phone", "supplierName", "sellerName"]);

export const isSensitivePieceAgainLabel = (label) =>
  /cpf|cart[aã]o|card|senha|password|cvv|cvc|token|c[oó]digo|pin/i.test(String(label || ""));

export const isPieceAgainStorableField = (field) => {
  const meta = field?.metadata || {};
  const autoType = String(meta.autoFieldType || "");
  if (meta.isAutoField && EXCLUDED_AUTO_TYPES.has(autoType)) return false;
  if (field.fieldType === "phone" || field.fieldType === "email") return false;
  if (field.fieldType === "file") return false;
  const label = String(field.label || "").trim();
  if (!label || isSensitivePieceAgainLabel(label)) return false;
  if (meta.isAutoField) return false;
  if ((field.order ?? 0) < 2) return false;
  return field.id != null;
};

export const listPieceAgainStorableFields = (fields = []) =>
  [...fields]
    .filter(isPieceAgainStorableField)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const resolvePieceAgainStoredFieldIds = (settings, fields = []) => {
  const storable = listPieceAgainStorableFields(fields);
  const storableIds = new Set(storable.map((f) => Number(f.id)));
  const configured = settings?.pieceAgainStoredFieldIds;
  if (!Array.isArray(configured)) {
    return storable.map((f) => Number(f.id));
  }
  if (configured.length === 0) {
    return [];
  }
  return configured.map((id) => Number(id)).filter((id) => id > 0 && storableIds.has(id));
};

export const isPieceAgainFieldStored = (field, storedFieldIds) =>
  field?.id != null && storedFieldIds.includes(Number(field.id));

export const buildPieceAgainPrefillFromAnswers = (answers, fields, storedFieldIds) => {
  const prefillByLabel = {};
  fields.forEach((field) => {
    if (!isPieceAgainFieldStored(field, storedFieldIds)) return;
    if (!isPieceAgainStorableField(field)) return;
    const label = String(field.label || "").trim();
    if (!label) return;
    const val = answers[field.id];
    if (val === undefined || val === null || val === "") return;
    if (Array.isArray(val)) {
      if (val.length === 0) return;
      prefillByLabel[label] = "__json__:" + JSON.stringify(val);
    } else {
      const s = String(val);
      if (!s.trim()) return;
      prefillByLabel[label] = s;
    }
  });
  return prefillByLabel;
};

export const filterPrefillToStoredFields = (prefillByLabel, fields, storedFieldIds) => {
  const allowedLabels = new Set(
    fields
      .filter((f) => isPieceAgainFieldStored(f, storedFieldIds))
      .map((f) => String(f.label || "").trim().toLowerCase())
      .filter(Boolean)
  );
  const filtered = {};
  Object.entries(prefillByLabel || {}).forEach(([label, value]) => {
    const key = String(label || "").trim().toLowerCase();
    if (!key || !allowedLabels.has(key)) return;
    if (value == null || String(value).trim() === "") return;
    filtered[label] = value;
  });
  return filtered;
};
