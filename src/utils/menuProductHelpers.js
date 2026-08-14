export const filterMenuProducts = (products) =>
  (products || []).filter(
    (p) => p.isMenuProduct !== false && (!p.variablePrice || (p.variations && p.variations.length > 0))
  );

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

export const findOptionByVariationLabel = (product, variationLabel) => {
  if (!product?.variations?.length || !variationLabel) return null;
  const needle = normalizeVariationKey(variationLabel);
  for (const variation of product.variations) {
    const option = (variation.options || []).find(
      (opt) => normalizeVariationKey(opt.label) === needle
    );
    if (option) return option;
  }
  return null;
};

export const productMatchesHalfAndHalfVariation = (
  product,
  baseVariationLabel,
  baseVariationName = null
) => {
  if (!baseVariationLabel) return true;
  if (!product?.variations?.length) return false;
  const needleLabel = normalizeVariationKey(baseVariationLabel);
  const needleName = baseVariationName ? normalizeVariationKey(baseVariationName) : null;
  return product.variations.some((variation) => {
    if (needleName && normalizeVariationKey(variation.name) !== needleName) return false;
    return (variation.options || []).some(
      (opt) => normalizeVariationKey(opt.label) === needleLabel
    );
  });
};

export const getFlavorProductsForHalfAndHalf = (
  products,
  baseProduct,
  baseVariationLabel = null,
  { excludeProductId = null } = {}
) => {
  if (!baseProduct) return [];
  const grupoFilter = baseProduct.halfAndHalfGrupo || baseProduct.grupo || null;
  const baseVariationName = baseProduct.variations?.[0]?.name || null;
  let filtered = (products || []).filter((p) => {
    if (excludeProductId != null && p.id === excludeProductId) return false;
    if (grupoFilter) return (p.grupo || "") === grupoFilter;
    return true;
  });
  if (baseVariationLabel && baseProduct.variations && baseProduct.variations.length > 0) {
    filtered = filtered.filter((p) =>
      productMatchesHalfAndHalfVariation(p, baseVariationLabel, baseVariationName)
    );
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
