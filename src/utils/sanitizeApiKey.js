/** Remove caracteres invisíveis comuns ao colar chaves de API. */
export function sanitizeApiKeyInput(value) {
  if (value == null) return "";
  return String(value)
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r?\n/g, "")
    .trim();
}
