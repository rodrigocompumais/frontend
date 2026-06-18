export function roundMoney(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function calcMenuItemLineTotal(item) {
  const qty = Number(item.quantity) || 0;
  const pv = Number(item.productValue) || 0;
  const at = Number(item.addonsTotal) || 0;
  return roundMoney((pv + at) * qty);
}

export function calcSubtotalFromMenuItems(items) {
  if (!Array.isArray(items)) return 0;
  return roundMoney(items.reduce((sum, item) => sum + calcMenuItemLineTotal(item), 0));
}

export function calcSubtotalFromPdvItens(itens) {
  if (!Array.isArray(itens)) return 0;
  return roundMoney(
    itens.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const val = Number(item.productValue) ?? 0;
      return sum + qty * val;
    }, 0)
  );
}

export function applyDiscount(subtotal, descontoInput) {
  const base = roundMoney(Math.max(0, Number(subtotal) || 0));
  const tipo = descontoInput?.tipo;
  const valorInformado = Number(descontoInput?.valor);

  if (
    !tipo ||
    (tipo !== "fixed" && tipo !== "percent") ||
    !Number.isFinite(valorInformado) ||
    valorInformado <= 0
  ) {
    return {
      subtotal: base,
      desconto: 0,
      total: base,
      descontoTipo: null,
      descontoValor: null,
    };
  }

  let desconto = 0;
  if (tipo === "fixed") {
    desconto = Math.min(valorInformado, base);
  } else {
    desconto = Math.min(roundMoney((base * valorInformado) / 100), base);
  }
  desconto = roundMoney(desconto);
  const total = roundMoney(Math.max(0, base - desconto));

  return {
    subtotal: base,
    desconto,
    total,
    descontoTipo: tipo,
    descontoValor: roundMoney(valorInformado),
  };
}

export function buildDescontoPayload(descontoTipo, descontoValorInput) {
  if (!descontoTipo || !descontoValorInput) return null;
  const valor = Number(String(descontoValorInput).replace(",", "."));
  if (!Number.isFinite(valor) || valor <= 0) return null;
  return { tipo: descontoTipo, valor };
}
