export const filterMenuProducts = (products) =>
  (products || []).filter(
    (p) => p.isMenuProduct !== false && (!p.variablePrice || (p.variations && p.variations.length > 0))
  );

const parseMenuSettings = (settings) => {
  let value = settings;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
};

/** null = cardápio completo. [] = personalizado sem itens. */
export const menuProductIdsForSettings = (settings) => {
  const raw = parseMenuSettings(settings);
  if (!raw) return null;
  if (String(raw.menuCatalogMode || "").trim().toLowerCase() !== "custom") return null;
  if (!Array.isArray(raw.menuProductIds)) return [];
  const ids = raw.menuProductIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
  return Array.from(new Set(ids));
};

export const filterProductsByMenuCatalog = (products, settings) => {
  const ids = menuProductIdsForSettings(settings);
  if (ids == null) return products || [];
  if (ids.length === 0) return [];
  const allowed = new Set(ids);
  return (products || []).filter((product) => allowed.has(Number(product.id)));
};

export const hasAddonsToShow = (product) => {
  if (product?.isCombo) return false;
  const g = product?.addOnGroup;
  if (!g) return false;
  const subsWithItems = (g.subgroups || []).filter((sg) => (sg.items || []).length > 0);
  const rootItems = g.items || [];
  return subsWithItems.length > 0 || rootItems.length > 0;
};

export const getAddonRuleViolations = (product, addons) => {
  const g = product?.addOnGroup;
  if (!g) return [];
  const violations = [];
  const list = addons || [];
  const countFor = (items) =>
    (items || []).reduce(
      (sum, it) => sum + (list.find((a) => a.addOnItemId === it.id)?.quantity ?? 0),
      0
    );
  const check = (label, count, required, min, max) => {
    const effMin = required ? Math.max(1, Number(min) || 0) : Number(min) || 0;
    if (effMin > 0 && count < effMin) {
      violations.push(`Escolha pelo menos ${effMin} em "${label}"`);
    }
    if (max != null && Number(max) > 0 && count > Number(max)) {
      violations.push(`Escolha no máximo ${Number(max)} em "${label}"`);
    }
  };
  (g.subgroups || []).forEach((sg) => {
    if (!(sg.required || Number(sg.minItems) > 0 || sg.maxItems != null)) return;
    check(sg.name, countFor(sg.items), sg.required === true, sg.minItems, sg.maxItems);
  });
  const rootItems = g.items || [];
  if (rootItems.length > 0 && (g.required || Number(g.minItems) > 0 || g.maxItems != null)) {
    check(g.name, countFor(rootItems), g.required === true, g.minItems, g.maxItems);
  }
  return violations;
};

export const getAddonRuleLabel = (rules) => {
  if (!rules) return null;
  const required = rules.required === true;
  const min = required ? Math.max(1, Number(rules.minItems) || 0) : Number(rules.minItems) || 0;
  const max = rules.maxItems != null ? Number(rules.maxItems) : null;
  if (!required && min <= 0 && max == null) return null;
  const parts = [];
  if (min > 0 && max != null && min === max) parts.push(`escolha ${min}`);
  else {
    if (min > 0) parts.push(`mín. ${min}`);
    if (max != null) parts.push(`máx. ${max}`);
  }
  return { required: required || min > 0, text: parts.join(" • ") };
};

export const normalizeVariationKey = (value) => String(value || "").trim().toLowerCase();

const stripAccents = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Remove pontuação/espaços e prefixos comuns (Tamanho G, Tam. Grande). */
const cleanVariationLabel = (value) =>
  stripAccents(normalizeVariationKey(value))
    .replace(/[.\-_/]/g, "")
    .replace(/\s+/g, "")
    .replace(/^(tamanho|tam|size)/, "");

/**
 * Equivalência de tamanhos entre cadastros:
 * P / Pequena  |  M / Média  |  G / Grande  |  GG / Gigante / Família
 */
const SIZE_LETTER_KEYS = {
  p: "p",
  pp: "p",
  peq: "p",
  m: "m",
  med: "m",
  g: "g",
  grd: "g",
  gg: "gg",
  ggg: "ggg",
  xg: "gg",
  xl: "gg",
};

const SIZE_WORD_KEYS = [
  ["extragrande", "gg"],
  ["gigante", "gg"],
  ["familiar", "gg"],
  ["familia", "gg"],
  ["brotinho", "broto"],
  ["broto", "broto"],
  ["individual", "broto"],
  ["pequena", "p"],
  ["pequeno", "p"],
  ["media", "m"],
  ["medio", "m"],
  ["grande", "g"],
];

export const canonicalSizeKey = (label) => {
  const n = cleanVariationLabel(label);
  if (!n) return "";
  if (SIZE_LETTER_KEYS[n]) return SIZE_LETTER_KEYS[n];
  for (const [word, key] of SIZE_WORD_KEYS) {
    if (n === word || n.includes(word)) return key;
  }
  return n;
};

export const variationLabelsMatch = (a, b) => {
  const ca = canonicalSizeKey(a);
  const cb = canonicalSizeKey(b);
  return Boolean(ca) && ca === cb;
};

export const findOptionByVariationLabel = (product, variationLabel) => {
  if (!product?.variations?.length || !variationLabel) return null;
  for (const variation of product.variations) {
    const option = (variation.options || []).find((opt) =>
      variationLabelsMatch(opt.label, variationLabel)
    );
    if (option) return option;
  }
  return null;
};

const normalizeGrupoKey = (value) => String(value || "").trim().toLowerCase();

export const productMatchesHalfAndHalfVariation = (
  product,
  baseVariationLabel,
  _baseVariationName = null
) => {
  if (!baseVariationLabel) return true;
  // Sabor sem variação cadastrada ainda pode ser a outra metade
  if (!product?.variations?.length) return true;
  return product.variations.some((variation) =>
    (variation.options || []).some((opt) => variationLabelsMatch(opt.label, baseVariationLabel))
  );
};

/**
 * Lista sabores para a segunda metade.
 * - Combos nunca entram.
 * - halfAndHalfGrupo vazio no cadastro = "qualquer grupo": inclui o grupo do
 *   produto e sabores de outros grupos que também permitem meio a meio.
 * - Match de tamanho só pelo rótulo da opção (G, M, P), sem exigir o mesmo
 *   nome da variação ("Tamanho" vs "Tamanhos").
 */
export const getFlavorProductsForHalfAndHalf = (
  products,
  baseProduct,
  baseVariationLabel = null,
  { excludeProductId = null } = {}
) => {
  if (!baseProduct) return [];
  const explicitGrupo = String(baseProduct.halfAndHalfGrupo || "").trim();
  const ownGrupo = String(baseProduct.grupo || "").trim();
  let filtered = (products || []).filter((p) => {
    if (!p || (excludeProductId != null && p.id === excludeProductId)) return false;
    if (p.isCombo) return false;
    if (explicitGrupo) return normalizeGrupoKey(p.grupo) === normalizeGrupoKey(explicitGrupo);
    if (!ownGrupo) return true;
    if (normalizeGrupoKey(p.grupo) === normalizeGrupoKey(ownGrupo)) return true;
    return p.allowsHalfAndHalf === true;
  });
  if (baseVariationLabel && baseProduct.variations && baseProduct.variations.length > 0) {
    filtered = filtered.filter((p) => productMatchesHalfAndHalfVariation(p, baseVariationLabel));
  }
  return filtered;
};

export const computeHalfAndHalfUnitValue = (
  base,
  half1,
  half2,
  half1OptionId = null,
  half2OptionId = null,
  baseVariationOptionId = null
) => {
  if (!base || !half1 || !half2) return 0;
  const rule = base.halfAndHalfPriceRule || "max";

  let v1 = parseFloat(half1.value) || 0;
  let v2 = parseFloat(half2.value) || 0;

  const opt1 = half1OptionId || baseVariationOptionId;
  if (opt1 && half1.variations && half1.variations.length > 0) {
    const option = half1.variations[0]?.options?.find((o) => o.id === opt1);
    if (option) v1 = parseFloat(option.value) || 0;
  }

  if (half2OptionId && half2.variations && half2.variations.length > 0) {
    const option = half2.variations[0]?.options?.find((o) => o.id === half2OptionId);
    if (option) v2 = parseFloat(option.value) || 0;
  }

  if (rule === "max") return Math.max(v1, v2);
  if (rule === "fixed") {
    if (base.variations && base.variations.length > 0 && baseVariationOptionId) {
      const option = base.variations[0]?.options?.find((o) => o.id === baseVariationOptionId);
      if (option) return parseFloat(option.value) || 0;
    }
    return parseFloat(base.value) || 0;
  }
  if (rule === "average") return (v1 + v2) / 2;
  return Math.max(v1, v2);
};

export const getProductGroups = (products) => {
  const set = new Set();
  (products || []).forEach((p) => set.add(p.grupo || "Outros"));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
};

export const getItemDetails = (product, variationOptionId) => {
  let productValue = parseFloat(product?.value) || 0;
  let productName = product?.name || "";
  let idUniplus = product?.idUniplus || null;

  if (variationOptionId != null && product?.variations?.length > 0) {
    const option = product.variations[0]?.options?.find((o) => o.id === variationOptionId);
    if (option) {
      productValue = parseFloat(option.value) || 0;
      productName = `${product.name} - ${option.label}`;
      idUniplus = option.idUniplus || product.idUniplus || null;
    }
  }

  return { productValue, productName, variationOptionId, idUniplus };
};

export const expandAddonsForPayload = (addons, itemQuantity) => {
  const list = (addons || []).filter((a) => (a.quantity ?? 1) > 0);
  if (!list.length) return [];
  return list.flatMap((a) =>
    Array((a.quantity ?? 1) * (itemQuantity || 1))
      .fill(null)
      .map(() => ({
        addOnItemId: a.addOnItemId,
        label: a.label,
        value: a.value,
        ...(a.idUniplus ? { idUniplus: a.idUniplus } : {}),
      }))
  );
};

export const sumAddonsTotal = (addons) =>
  (addons || []).reduce((sum, a) => sum + (Number(a.value) || 0) * (a.quantity ?? 1), 0);

export const buildNormalMenuItemPayload = ({
  product,
  variationOptionId,
  quantity,
  addons,
  observation,
}) => {
  const { productValue, productName, idUniplus } = getItemDetails(product, variationOptionId);
  const addonsExpanded = expandAddonsForPayload(addons, quantity);
  const addonsTotal = product.isCombo ? 0 : sumAddonsTotal(addons);
  const obs = String(observation || "").trim();

  return {
    ...(product.isCombo ? { type: "combo" } : {}),
    productId: product.id,
    quantity: Math.max(1, Number(quantity) || 1),
    productName: productName || product.name,
    productValue,
    grupo: product.grupo || "Outros",
    ...(variationOptionId ? { variationOptionId, optionId: variationOptionId } : {}),
    ...(idUniplus ? { idUniplus } : {}),
    ...(obs && { observation: obs }),
    ...(!product.isCombo && addonsExpanded.length > 0 && { addons: addonsExpanded }),
    addonsTotal,
  };
};

export const buildHalfAndHalfMenuItemPayload = ({
  products,
  baseProduct,
  half2ProductId,
  half1OptionId,
  half2OptionId,
  quantity,
  addons,
  observation,
}) => {
  const half1 = baseProduct;
  const half2 = (products || []).find((p) => p.id === half2ProductId);
  const productValue = computeHalfAndHalfUnitValue(
    baseProduct,
    half1,
    half2,
    half1OptionId,
    half2OptionId,
    half1OptionId
  );
  const half1Option = half1OptionId
    ? half1?.variations?.[0]?.options?.find((o) => o.id === half1OptionId)
    : null;
  const half2Option = half2OptionId
    ? half2?.variations?.[0]?.options?.find((o) => o.id === half2OptionId)
    : null;
  const name1 = half1Option ? `${half1.name} - ${half1Option.label}` : half1?.name;
  const name2 = half2Option ? `${half2?.name} - ${half2Option.label}` : half2?.name;
  const productName = `${name1 || "Sabor 1"} / ${name2 || "Sabor 2"}`;
  const idUniplus = half1Option?.idUniplus || half1?.idUniplus || null;
  const addonsExpanded = expandAddonsForPayload(addons, quantity);
  const addonsTotal = sumAddonsTotal(addons);
  const obs = String(observation || "").trim();

  return {
    type: "halfAndHalf",
    productId: baseProduct.id,
    quantity: Math.max(1, Number(quantity) || 1),
    productName,
    productValue,
    half1ProductId: baseProduct.id,
    half2ProductId,
    half1OptionId: half1OptionId || null,
    half2OptionId: half2OptionId || null,
    baseOptionId: half1OptionId || null,
    grupo: baseProduct.grupo || "Outros",
    ...(idUniplus ? { idUniplus } : {}),
    ...(obs && { observation: obs }),
    ...(addonsExpanded.length > 0 && { addons: addonsExpanded }),
    addonsTotal,
  };
};

export const formatMoney = (value) =>
  `R$ ${Number(value || 0)
    .toFixed(2)
    .replace(".", ",")}`;
