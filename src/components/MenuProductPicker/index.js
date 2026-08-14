import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  makeStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import {
  buildHalfAndHalfMenuItemPayload,
  buildNormalMenuItemPayload,
  filterMenuProducts,
  findOptionByVariationLabel,
  formatMoney,
  getAddonRuleLabel,
  getAddonRuleViolations,
  getFlavorProductsForHalfAndHalf,
  getItemDetails,
  getProductGroups,
  hasAddonsToShow,
  productMatchesHalfAndHalfVariation,
  sumAddonsTotal,
} from "../../utils/menuProductHelpers";

const useStyles = makeStyles((theme) => ({
  catalogContent: {
    padding: theme.spacing(0, 2, 2),
    minHeight: 320,
  },
  searchField: {
    marginBottom: theme.spacing(1.5),
  },
  productCard: {
    marginBottom: theme.spacing(2),
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
  },
  productImage: {
    width: 88,
    height: 88,
    objectFit: "cover",
    borderRadius: 10,
    marginRight: theme.spacing(2),
    flexShrink: 0,
  },
  productCardContent: {
    display: "flex",
    alignItems: "flex-start",
  },
  productName: {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#1a1a1a",
    marginBottom: theme.spacing(0.5),
  },
  productDescription: {
    color: "#666",
    fontSize: "0.8125rem",
    marginBottom: theme.spacing(1),
  },
  productValue: {
    fontWeight: 700,
    fontSize: "1rem",
    color: "#1a1a1a",
  },
  detailHero: {
    width: "100%",
    maxHeight: 220,
    objectFit: "cover",
    display: "block",
  },
  detailClose: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
    "&:hover": {
      backgroundColor: "#fff",
    },
  },
  detailSectionTitle: {
    fontWeight: 700,
    fontSize: "0.95rem",
    marginBottom: theme.spacing(1),
  },
  requiredChip: {
    display: "inline-block",
    marginLeft: 8,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: "0.65rem",
    fontWeight: 700,
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    verticalAlign: "middle",
  },
  optionalChip: {
    display: "inline-block",
    marginLeft: 8,
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: "0.65rem",
    fontWeight: 700,
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    verticalAlign: "middle",
  },
  halfFlavorCard: {
    width: "100%",
    border: "1px solid #ececec",
    borderRadius: 10,
    backgroundColor: "#fff",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },
  detailFooter: {
    position: "sticky",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 0, 0),
    marginTop: theme.spacing(2),
    backgroundColor: "#fff",
    borderTop: "1px solid #eee",
  },
  detailStepper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ececec",
    borderRadius: 10,
    padding: "2px 4px",
  },
}));

const MenuProductPicker = ({
  open,
  onClose,
  products: rawProducts = [],
  onAddItem,
  title = "Adicionar produto",
  brandPrimary = "#e53935",
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const detailFullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const brandSoft = `${brandPrimary}14`;

  const products = useMemo(() => filterMenuProducts(rawProducts), [rawProducts]);
  const groups = useMemo(() => getProductGroups(products), [products]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState(0);
  const [selectedVariationOption, setSelectedVariationOption] = useState({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailAddons, setDetailAddons] = useState([]);
  const [detailObservation, setDetailObservation] = useState("");
  const [detailHalfMode, setDetailHalfMode] = useState(false);
  const [detailHalfFlavorId, setDetailHalfFlavorId] = useState(null);
  const [detailVariationOptionId, setDetailVariationOptionId] = useState(null);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setActiveGroup(0);
      closeProductDetail();
    }
  }, [open]);

  useEffect(() => {
    if (activeGroup >= groups.length) setActiveGroup(0);
  }, [groups.length, activeGroup]);

  const filteredProducts = useMemo(() => {
    const groupName = groups[activeGroup];
    if (!groupName) return [];
    const q = String(searchQuery || "").trim().toLowerCase();
    return products.filter((p) => {
      if ((p.grupo || "Outros") !== groupName) return false;
      if (!q) return true;
      const name = String(p.name || "").toLowerCase();
      const desc = String(p.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [products, groups, activeGroup, searchQuery]);

  const openProductDetail = (product, { halfMode = false } = {}) => {
    if (!product) return;
    setDetailProduct(product);
    setDetailQty(1);
    setDetailAddons([]);
    setDetailObservation("");
    setDetailHalfMode(halfMode);
    setDetailHalfFlavorId(null);
    const hasVars = product.variations && product.variations.length > 0;
    setDetailVariationOptionId(
      hasVars
        ? selectedVariationOption[product.id] ?? product.variations[0]?.options?.[0]?.id ?? null
        : null
    );
    setDetailOpen(true);
  };

  const closeProductDetail = () => {
    setDetailOpen(false);
    setDetailProduct(null);
    setDetailAddons([]);
    setDetailObservation("");
    setDetailHalfMode(false);
    setDetailHalfFlavorId(null);
  };

  const getDetailVariationLabel = () => {
    if (!detailProduct || detailVariationOptionId == null) return null;
    const option = detailProduct.variations?.[0]?.options?.find(
      (o) => o.id === detailVariationOptionId
    );
    return option?.label || null;
  };

  const getDetailBasePrice = () => {
    if (!detailProduct) return 0;
    if (detailVariationOptionId != null && detailProduct.variations?.length > 0) {
      const option = detailProduct.variations[0]?.options?.find(
        (o) => o.id === detailVariationOptionId
      );
      if (option) return parseFloat(option.value) || 0;
    }
    return parseFloat(detailProduct.value) || 0;
  };

  const getDetailUnitPrice = () => {
    if (!detailProduct) return 0;
    const basePrice = getDetailBasePrice();
    if (!detailHalfMode || detailHalfFlavorId == null) return basePrice;
    const half2 = products.find((p) => p.id === detailHalfFlavorId);
    if (!half2) return basePrice;
    const half2Option = findOptionByVariationLabel(half2, getDetailVariationLabel());
    const v2 = half2Option ? parseFloat(half2Option.value) || 0 : parseFloat(half2.value) || 0;
    const rule = detailProduct.halfAndHalfPriceRule || "max";
    if (rule === "fixed") return basePrice;
    if (rule === "average") return (basePrice + v2) / 2;
    return Math.max(basePrice, v2);
  };

  const getDetailAddonQuantity = (addOnItemId) =>
    detailAddons.find((a) => a.addOnItemId === addOnItemId)?.quantity ?? 0;

  const setDetailAddonQuantity = (item, quantity) => {
    const { addOnItemId, label, value } = item;
    if (quantity <= 0) {
      setDetailAddons((prev) => prev.filter((a) => a.addOnItemId !== addOnItemId));
      return;
    }
    setDetailAddons((prev) => {
      const idx = prev.findIndex((a) => a.addOnItemId === addOnItemId);
      const entry = { addOnItemId, label, value: Number(value) || 0, quantity };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  };

  const confirmProductDetail = () => {
    if (!detailProduct) return;
    const qty = Math.max(1, parseInt(detailQty, 10) || 1);
    const addonsWithQty = detailAddons.filter((a) => (a.quantity ?? 1) > 0);
    const obs = String(detailObservation || "").trim();
    const productForAddons = products.find((p) => p.id === detailProduct.id) || detailProduct;

    if (detailVariationOptionId != null) {
      setSelectedVariationOption((prev) => ({
        ...prev,
        [detailProduct.id]: detailVariationOptionId,
      }));
    }

    if (detailHalfMode) {
      if (detailHalfFlavorId == null) {
        toast.error("Escolha o segundo sabor");
        return;
      }
      const half2 = products.find((p) => p.id === detailHalfFlavorId);
      if (!half2) {
        toast.error("Segundo sabor indisponível");
        return;
      }
      const half2Option = findOptionByVariationLabel(half2, getDetailVariationLabel());
      if (hasAddonsToShow(productForAddons) && addonsWithQty.length === 0) {
        const violations = getAddonRuleViolations(productForAddons, []);
        if (violations.length > 0) {
          toast.error(violations[0]);
          return;
        }
      }
      const halfViolations = getAddonRuleViolations(productForAddons, addonsWithQty);
      if (halfViolations.length > 0) {
        toast.error(halfViolations[0]);
        return;
      }
      const payload = buildHalfAndHalfMenuItemPayload({
        products,
        baseProduct: detailProduct,
        half2ProductId: detailHalfFlavorId,
        half1OptionId: detailVariationOptionId || null,
        half2OptionId: half2Option?.id || null,
        quantity: qty,
        addons: addonsWithQty,
        observation: obs,
      });
      onAddItem(payload);
      closeProductDetail();
      onClose();
      return;
    }

    const violations = getAddonRuleViolations(detailProduct, addonsWithQty);
    if (violations.length > 0) {
      toast.error(violations[0]);
      return;
    }

    const payload = buildNormalMenuItemPayload({
      product: detailProduct,
      variationOptionId: detailVariationOptionId,
      quantity: qty,
      addons: addonsWithQty,
      observation: obs,
    });
    onAddItem(payload);
    closeProductDetail();
    onClose();
  };

  const renderDetailAddonRow = (it, isLast) => {
    const qty = getDetailAddonQuantity(it.id);
    const addonRef = { addOnItemId: it.id, label: it.label, value: it.value };
    return (
      <Box
        key={it.id}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        style={{
          padding: "10px 0",
          borderBottom: isLast ? "none" : "1px solid #f0f0f0",
        }}
      >
        <Box flex={1} pr={1}>
          <Typography variant="body2" style={{ fontWeight: 500, lineHeight: 1.3 }}>
            {it.label}
          </Typography>
          {Number(it.value) > 0 && (
            <Typography variant="caption" style={{ color: brandPrimary, fontWeight: 700 }}>
              + {formatMoney(it.value)}
            </Typography>
          )}
        </Box>
        {qty === 0 ? (
          <IconButton
            size="small"
            onClick={() => setDetailAddonQuantity(addonRef, 1)}
            style={{
              border: `1.5px solid ${brandPrimary}`,
              color: brandPrimary,
              borderRadius: 8,
              padding: 5,
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            style={{
              border: `1.5px solid ${brandPrimary}`,
              borderRadius: 8,
              backgroundColor: brandSoft,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setDetailAddonQuantity(addonRef, qty - 1)}
              style={{ color: brandPrimary, padding: 5 }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" style={{ minWidth: 22, textAlign: "center", fontWeight: 700 }}>
              {qty}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setDetailAddonQuantity(addonRef, qty + 1)}
              style={{ color: brandPrimary, padding: 5 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  };

  const renderAddonSection = (title, rules, items, keyPrefix) => {
    if (!items || items.length === 0) return null;
    const rule = getAddonRuleLabel(rules);
    return (
      <Box
        key={keyPrefix}
        mb={1.5}
        style={{ border: "1px solid #ececec", borderRadius: 12, overflow: "hidden" }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          style={{ backgroundColor: "#fafafa", padding: "10px 12px" }}
        >
          <Typography variant="body2" style={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {rule ? (
            <span className={rule.required ? classes.requiredChip : classes.optionalChip}>
              {rule.required ? "Obrigatório" : ""}
              {rule.text ? `${rule.required ? " • " : ""}${rule.text}` : ""}
            </span>
          ) : (
            <span className={classes.optionalChip}>Opcional</span>
          )}
        </Box>
        <Box style={{ padding: "0 12px" }}>
          {items.map((it, idx) => renderDetailAddonRow(it, idx === items.length - 1))}
        </Box>
      </Box>
    );
  };

  const renderProductCard = (product) => {
    const hasVariations = !product.isCombo && product.variations && product.variations.length > 0;
    const firstVariation = hasVariations ? product.variations[0] : null;
    const selectedOptionId = hasVariations
      ? selectedVariationOption[product.id] ?? firstVariation?.options?.[0]?.id
      : null;
    const displayPrice = hasVariations
      ? getItemDetails(product, selectedOptionId).productValue
      : parseFloat(product.value || 0);
    const comboItemsList = product.isCombo
      ? (product.comboItems || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];
    const isHalfAndHalf = !product.isCombo && product.allowsHalfAndHalf === true;

    return (
      <Card
        key={product.id}
        className={classes.productCard}
        onClick={() => openProductDetail(product)}
        elevation={0}
        variant="outlined"
      >
        <CardContent>
          <Box className={classes.productCardContent}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={classes.productImage}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <Box className={classes.productImage} style={{ backgroundColor: "#f3f4f6" }} />
            )}
            <Box flex={1} minWidth={0}>
              <Typography className={classes.productName}>
                {product.name}
                {product.isCombo ? " (Combo)" : ""}
              </Typography>
              {product.description && (
                <Typography className={classes.productDescription}>{product.description}</Typography>
              )}
              {comboItemsList.length > 0 && (
                <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                  {comboItemsList
                    .map((ci) => {
                      const q = Number(ci.quantity) || 1;
                      const base = ci.product?.name || `Produto #${ci.productId}`;
                      const label = ci.variationOption?.label;
                      const name = label ? `${base} - ${label}` : base;
                      return q > 1 ? `${q}x ${name}` : name;
                    })
                    .join(" · ")}
                </Typography>
              )}
              {hasVariations && firstVariation && (
                <FormControl
                  variant="outlined"
                  size="small"
                  fullWidth
                  style={{ marginBottom: 8 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <InputLabel>{firstVariation.name}</InputLabel>
                  <Select
                    value={selectedOptionId ?? ""}
                    onChange={(e) =>
                      setSelectedVariationOption((prev) => ({
                        ...prev,
                        [product.id]: Number(e.target.value),
                      }))
                    }
                    label={firstVariation.name}
                  >
                    {firstVariation.options.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.label} - {formatMoney(opt.value)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                <Typography className={classes.productValue}>{formatMoney(displayPrice)}</Typography>
                <Box display="flex" alignItems="center" onClick={(e) => e.stopPropagation()}>
                  {isHalfAndHalf && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openProductDetail(product, { halfMode: true })}
                      style={{
                        marginRight: 8,
                        borderColor: brandPrimary,
                        color: brandPrimary,
                        textTransform: "none",
                      }}
                    >
                      Meio a meio
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openProductDetail(product)}
                    style={{
                      backgroundColor: brandPrimary,
                      color: "#fff",
                      textTransform: "none",
                    }}
                  >
                    Escolher
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderDetailSheet = () => {
    if (!detailProduct) return null;
    const isComboDetail = detailProduct.isCombo === true;
    const g = isComboDetail ? null : detailProduct.addOnGroup;
    const hasVars = !isComboDetail && detailProduct.variations && detailProduct.variations.length > 0;
    const firstVariation = hasVars ? detailProduct.variations[0] : null;
    const unitPrice = getDetailUnitPrice();
    const qtyNum = Math.max(1, parseInt(detailQty, 10) || 1);
    const lineTotal = (unitPrice + (isComboDetail ? 0 : sumAddonsTotal(detailAddons))) * qtyNum;
    const detailComboItems = isComboDetail
      ? (detailProduct.comboItems || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];
    const halfFlavors = detailHalfMode
      ? getFlavorProductsForHalfAndHalf(products, detailProduct, getDetailVariationLabel(), {
          excludeProductId: detailProduct.id,
        })
      : [];
    const selectedHalfFlavor =
      detailHalfFlavorId != null ? products.find((p) => p.id === detailHalfFlavorId) : null;

    return (
      <Dialog
        open={detailOpen}
        onClose={closeProductDetail}
        fullScreen={detailFullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            position: "relative",
            overflow: "hidden",
            ...(detailFullScreen ? {} : { borderRadius: 16 }),
          },
        }}
      >
        <Box style={{ position: "relative" }}>
          {detailProduct.imageUrl ? (
            <img
              src={detailProduct.imageUrl}
              alt={detailProduct.name}
              className={classes.detailHero}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <Box style={{ height: 12 }} />
          )}
          <IconButton
            className={classes.detailClose}
            size="small"
            onClick={closeProductDetail}
            aria-label="Fechar"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent style={{ paddingBottom: 12 }}>
          <Typography variant="h6" style={{ fontWeight: 700, lineHeight: 1.25 }}>
            {detailProduct.name}
            {isComboDetail ? " (Combo)" : ""}
          </Typography>
          {detailProduct.description && (
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 6 }}>
              {detailProduct.description}
            </Typography>
          )}
          {detailComboItems.length > 0 && (
            <Box mt={1.5}>
              <Typography className={classes.detailSectionTitle} gutterBottom>
                Inclui
              </Typography>
              {detailComboItems.map((ci) => {
                const q = Number(ci.quantity) || 1;
                const base = ci.product?.name || `Produto #${ci.productId}`;
                const label = ci.variationOption?.label;
                const name = label ? `${base} - ${label}` : base;
                return (
                  <Typography
                    key={ci.id || `${ci.productId}_${ci.variationOptionId || 0}`}
                    variant="body2"
                    color="textSecondary"
                    style={{ marginBottom: 2 }}
                  >
                    {q > 1 ? `${q}x ` : ""}
                    {name}
                  </Typography>
                );
              })}
            </Box>
          )}
          <Typography style={{ fontWeight: 700, marginTop: 8, color: brandPrimary }}>
            {formatMoney(unitPrice)}
          </Typography>

          {hasVars && firstVariation && (
            <Box mt={2}>
              <Typography className={classes.detailSectionTitle} gutterBottom>
                {firstVariation.name}
                <span className={classes.requiredChip}>Obrigatório</span>
              </Typography>
              {firstVariation.options.map((opt) => {
                const selected = detailVariationOptionId === opt.id;
                return (
                  <Box
                    key={opt.id}
                    component="button"
                    type="button"
                    className={classes.halfFlavorCard}
                    style={{
                      padding: "8px 12px",
                      marginBottom: 6,
                      ...(selected
                        ? {
                            borderColor: brandPrimary,
                            backgroundColor: brandSoft,
                            boxShadow: `0 0 0 1px ${brandPrimary}`,
                          }
                        : {}),
                    }}
                    onClick={() => {
                      setDetailVariationOptionId(opt.id);
                      if (detailHalfFlavorId != null) {
                        const flavor = products.find((p) => p.id === detailHalfFlavorId);
                        if (
                          !flavor ||
                          !productMatchesHalfAndHalfVariation(
                            flavor,
                            opt.label,
                            detailProduct.variations?.[0]?.name || null
                          )
                        ) {
                          setDetailHalfFlavorId(null);
                        }
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" style={{ fontWeight: selected ? 700 : 500 }}>
                        {opt.label}
                      </Typography>
                      <Typography variant="body2" style={{ fontWeight: 700 }}>
                        {formatMoney(opt.value)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {!isComboDetail && detailProduct.allowsHalfAndHalf === true && (
            <Box mt={2}>
              <Box
                display="flex"
                style={{ border: "1px solid #ececec", borderRadius: 10, overflow: "hidden" }}
              >
                <Box
                  component="button"
                  type="button"
                  flex={1}
                  onClick={() => {
                    setDetailHalfMode(false);
                    setDetailHalfFlavorId(null);
                  }}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    backgroundColor: !detailHalfMode ? brandPrimary : "transparent",
                    color: !detailHalfMode ? "#fff" : "#666",
                  }}
                >
                  Inteira
                </Box>
                <Box
                  component="button"
                  type="button"
                  flex={1}
                  onClick={() => setDetailHalfMode(true)}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    padding: "10px 8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    backgroundColor: detailHalfMode ? brandPrimary : "transparent",
                    color: detailHalfMode ? "#fff" : "#666",
                  }}
                >
                  2 sabores (meio a meio)
                </Box>
              </Box>

              {detailHalfMode && (
                <Box mt={1.5}>
                  <Typography className={classes.detailSectionTitle} gutterBottom>
                    Escolha o segundo sabor
                    <span className={classes.requiredChip}>Obrigatório</span>
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                    Metade 1: <strong>{detailProduct.name}</strong>
                    {getDetailVariationLabel() ? ` (${getDetailVariationLabel()})` : ""}
                  </Typography>
                  {halfFlavors.length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                      Nenhum outro sabor disponível
                      {getDetailVariationLabel() ? ` no tamanho ${getDetailVariationLabel()}` : ""}.
                    </Typography>
                  )}
                  <Box style={{ maxHeight: 260, overflowY: "auto" }}>
                    {halfFlavors.map((flavor) => {
                      const selected = detailHalfFlavorId === flavor.id;
                      const flavorOption = findOptionByVariationLabel(flavor, getDetailVariationLabel());
                      const flavorPrice = flavorOption
                        ? parseFloat(flavorOption.value) || 0
                        : parseFloat(flavor.value) || 0;
                      return (
                        <Box
                          key={flavor.id}
                          component="button"
                          type="button"
                          className={classes.halfFlavorCard}
                          style={{
                            padding: "8px 10px",
                            marginBottom: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            ...(selected
                              ? {
                                  borderColor: brandPrimary,
                                  backgroundColor: brandSoft,
                                  boxShadow: `0 0 0 1px ${brandPrimary}`,
                                }
                              : {}),
                          }}
                          onClick={() => setDetailHalfFlavorId(selected ? null : flavor.id)}
                        >
                          {flavor.imageUrl && (
                            <img
                              src={flavor.imageUrl}
                              alt={flavor.name}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                          <Box flex={1} style={{ textAlign: "left", minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              style={{ fontWeight: selected ? 700 : 500, lineHeight: 1.25 }}
                            >
                              {flavor.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                            {formatMoney(flavorPrice)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  {selectedHalfFlavor && (
                    <Typography
                      variant="caption"
                      style={{ display: "block", marginTop: 4, color: brandPrimary, fontWeight: 700 }}
                    >
                      Meio a meio: {detailProduct.name} / {selectedHalfFlavor.name} —{" "}
                      {formatMoney(getDetailUnitPrice())}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {hasAddonsToShow(detailProduct) && (
            <Box mt={2}>
              <Typography className={classes.detailSectionTitle} gutterBottom>
                Monte do seu jeito
              </Typography>
              {(g.subgroups || [])
                .filter((sg) => (sg.items || []).length > 0)
                .map((sg) => renderAddonSection(sg.name, sg, sg.items, `sg-${sg.id}`))}
              {(g.items || []).length > 0 &&
                renderAddonSection(g.name, g, g.items, `root-${g.id || "addons"}`)}
            </Box>
          )}

          <TextField
            label="Observação (opcional)"
            value={detailObservation}
            onChange={(e) => setDetailObservation(e.target.value)}
            inputProps={{ maxLength: 200 }}
            variant="outlined"
            size="small"
            fullWidth
            multiline
            minRows={2}
            style={{ marginTop: 16 }}
          />

          <Box className={classes.detailFooter}>
            <Box className={classes.detailStepper}>
              <IconButton
                size="small"
                onClick={() => setDetailQty((q) => Math.max(1, (parseInt(q, 10) || 1) - 1))}
                disabled={qtyNum <= 1}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>
                {qtyNum}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setDetailQty((q) => (parseInt(q, 10) || 1) + 1)}
                style={{ color: brandPrimary }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={confirmProductDetail}
              disabled={detailHalfMode && detailHalfFlavorId == null}
              style={{
                backgroundColor:
                  detailHalfMode && detailHalfFlavorId == null ? "#bdbdbd" : brandPrimary,
                color: "#fff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 10,
                padding: "10px 16px",
              }}
            >
              {detailHalfMode && detailHalfFlavorId == null
                ? "Escolha o segundo sabor"
                : `Adicionar • ${formatMoney(lineTotal)}`}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Dialog open={open && !detailOpen} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle>
          {title}
          <IconButton
            size="small"
            onClick={onClose}
            style={{ position: "absolute", right: 8, top: 8 }}
            aria-label="Fechar"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.catalogContent}>
          <TextField
            className={classes.searchField}
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          {groups.length > 0 && (
            <Tabs
              value={activeGroup}
              onChange={(_, v) => setActiveGroup(v)}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
            >
              {groups.map((group, idx) => (
                <Tab key={group} label={group} value={idx} />
              ))}
            </Tabs>
          )}
          {filteredProducts.length === 0 ? (
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
              Nenhum produto encontrado.
            </Typography>
          ) : (
            <Box mt={2}>{filteredProducts.map(renderProductCard)}</Box>
          )}
        </DialogContent>
      </Dialog>
      {renderDetailSheet()}
    </>
  );
};

export default MenuProductPicker;
