/**
 * Rótulos de mesa/comanda sem duplicar "Mesa Mesa 1" ou "Mesa Comanda 5".
 */

/**
 * Cartão de mesa no grid (nome/número podem já vir com prefixo).
 * @param {{ name?: string, number?: string, type?: string, id?: number }} mesa
 */
export function formatMesaComandaTitle(mesa) {
  if (!mesa) return "";
  const displayName = (mesa.name || mesa.number || (mesa.id != null ? String(mesa.id) : "")).trim();
  if (!displayName) {
    return mesa.type === "comanda" ? "Comanda" : "Mesa";
  }
  const expectedPrefix = mesa.type === "comanda" ? "Comanda " : "Mesa ";
  const lower = displayName.toLowerCase();
  const alreadyHasPrefix = lower.startsWith("mesa ") || lower.startsWith("comanda ");
  return alreadyHasPrefix ? displayName : expectedPrefix + displayName;
}

/** Texto curto no card de pedido (ao lado do protocolo): Delivery | Mesa | Comanda */
export function formatOrderKindShort(metadata) {
  if (!metadata || metadata.orderType === "delivery") return "Delivery";
  const raw = String(metadata.tableNumber ?? "").trim().toLowerCase();
  if (raw.startsWith("comanda")) return "Comanda";
  if (raw.startsWith("mesa")) return "Mesa";
  if (metadata.mesaType === "comanda" || metadata.tableMesaType === "comanda") return "Comanda";
  return "Mesa";
}

/**
 * Uma única string para badge / listagem (ex.: "Mesa 1", "Comanda 12").
 * Se tableNumber já começa com "Mesa " ou "Comanda ", devolve como está.
 */
export function formatOrderTableBadge(metadata) {
  if (!metadata || metadata.orderType === "delivery") return "";
  const raw = String(metadata.tableNumber ?? metadata.tableId ?? "").trim();
  if (!raw) return "";
  const low = raw.toLowerCase();
  if (low.startsWith("mesa ") || low.startsWith("comanda ")) return raw;
  const tipo =
    metadata.mesaType === "comanda" || metadata.tableMesaType === "comanda"
      ? "Comanda"
      : "Mesa";
  return `${tipo} ${raw}`;
}

/** Respostas / detalhe: uma linha sem prefixo duplicado */
export function formatMetadataTableDisplay(metadata) {
  if (!metadata) return "-";
  if (metadata.orderType === "delivery") return "Delivery";
  const t = formatOrderTableBadge(metadata);
  return t || String(metadata.tableId ?? "-");
}
