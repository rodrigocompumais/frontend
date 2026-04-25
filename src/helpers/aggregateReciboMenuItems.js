/** Espelha a lógica de backend_compuchat/src/services/ReciboServices/aggregateReciboMenuItems.ts */

export function menuItemLineTotal(item) {
  const qty = Number(item.quantity) || 0;
  const pv = Number(item.productValue) || 0;
  const at = Number(item.addonsTotal) || 0;
  return Math.round((pv + at) * qty * 100) / 100;
}

export function fingerprintMenuItem(item) {
  const addonIds = (item.addons || [])
    .map((a) => a.addOnItemId)
    .filter((id) => id != null)
    .sort((a, b) => Number(a) - Number(b));
  const parts = [
    item.type || "",
    item.productId ?? "",
    (item.productName || "").trim(),
    Number(item.productValue) || 0,
    Number(item.addonsTotal) || 0,
    addonIds.join(","),
    item.half1ProductId ?? "",
    item.half2ProductId ?? ""
  ];
  return JSON.stringify(parts);
}

export function aggregateReciboMenuItems(pedidos) {
  const map = new Map();
  for (const pedido of pedidos || []) {
    for (const item of pedido.menuItems || []) {
      const key = fingerprintMenuItem(item);
      const qty = Number(item.quantity) || 0;
      const pv = Number(item.productValue) || 0;
      const at = Number(item.addonsTotal) || 0;
      const unit = Math.round((pv + at) * 100) / 100;
      const existing = map.get(key);
      if (existing) {
        existing.qty += qty;
      } else {
        map.set(key, { name: (item.productName || "Item").trim() || "Item", qty, unit });
      }
    }
  }
  return Array.from(map.values()).map((v) => ({
    productName: v.name,
    quantity: v.qty,
    unitValue: v.unit,
    lineTotal: Math.round(v.qty * v.unit * 100) / 100
  }));
}

export function isPlaceholderMesaPhone(number) {
  if (number == null || String(number).trim() === "") return true;
  return String(number).toUpperCase().startsWith("SEMTELEFONE");
}
