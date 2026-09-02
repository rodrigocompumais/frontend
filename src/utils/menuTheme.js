/**
 * Tema automático do cardápio público: deriva a paleta completa da cor da
 * marca (form.primaryColor) + opções simples em form.settings.menuTheme:
 *   { mode: "light" | "dark", fontFamily: string, background: "neutral" | "white" | "tinted" }
 *
 * O visual padrão (sem menuTheme salvo) é idêntico ao antigo hardcoded.
 */

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const hexToRgb = (hex) => {
  let h = String(hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

export const rgbToHex = ({ r, g, b }) =>
  "#" +
  [r, g, b]
    .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
    .join("");

/** Luminância relativa (WCAG) */
export const luminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const conv = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * conv(rgb.r) + 0.7152 * conv(rgb.g) + 0.0722 * conv(rgb.b);
};

/** Razão de contraste WCAG entre duas cores (1 a 21) */
export const contrast = (hexA, hexB) => {
  const la = luminance(hexA);
  const lb = luminance(hexB);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/** Mistura duas cores: amount 0 = cor A, 1 = cor B */
export const mix = (hexA, hexB, amount) => {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return hexA;
  const t = clamp(amount, 0, 1);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
};

export const lighten = (hex, amount) => mix(hex, "#ffffff", amount);
export const darken = (hex, amount) => mix(hex, "#000000", amount);

/** Cor com alpha em notação hex de 8 dígitos */
export const alpha = (hex, a) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const aa = clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, "0");
  return rgbToHex(rgb) + aa;
};

/** Texto legível sobre a cor dada (branco ou quase-preto) */
export const readableTextOn = (bgHex) =>
  contrast("#ffffff", bgHex) >= 3 ? "#ffffff" : "#1a1a1a";

/** Garante contraste mínimo da cor sobre um fundo, clareando/escurecendo aos poucos */
const ensureContrast = (colorHex, bgHex, minRatio, towards) => {
  let c = colorHex;
  for (let i = 0; i < 12 && contrast(c, bgHex) < minRatio; i++) {
    c = mix(c, towards, 0.12);
  }
  return c;
};

export const MENU_FONT_OPTIONS = [
  { value: "", label: "Padrão do sistema" },
  { value: "'Inter', sans-serif", label: "Inter (moderna)" },
  { value: "'Poppins', sans-serif", label: "Poppins (arredondada)" },
  { value: "'Montserrat', sans-serif", label: "Montserrat (geométrica)" },
  { value: "'Open Sans', sans-serif", label: "Open Sans (neutra)" },
  { value: "'Playfair Display', serif", label: "Playfair Display (elegante)" },
  { value: "'Source Serif 4', serif", label: "Source Serif (serifada)" },
];

/**
 * Constrói a paleta do cardápio.
 * Retorna tokens estáveis usados no PublicMenuForm e no preview do builder.
 */
export const buildMenuTheme = (form) => {
  const settings = form?.settings || {};
  const opts = settings.menuTheme || {};
  const mode = opts.mode === "dark" ? "dark" : "light";
  const background = ["neutral", "white", "tinted"].includes(opts.background)
    ? opts.background
    : "neutral";
  const fontFamily = opts.fontFamily || "";

  const rawPrimary = hexToRgb(form?.primaryColor) ? form.primaryColor : "#1a1a1a";

  if (mode === "dark") {
    const cardBg = "#1e1e1e";
    // Cor da marca muito escura fica invisível no fundo escuro — clareia até ler
    const primary = ensureContrast(rawPrimary, cardBg, 2.6, "#ffffff");
    const pageBg =
      background === "white"
        ? "#0f0f0f"
        : background === "tinted"
        ? mix("#121212", primary, 0.08)
        : "#121212";
    return {
      mode,
      fontFamily,
      primary,
      primarySoft: alpha(primary, 0.18),
      primaryText: readableTextOn(primary),
      pageBg,
      cardBg,
      headerBg: cardBg,
      textPrimary: "#f5f5f5",
      textSecondary: "#a3a3a3",
      border: "#2e2e2e",
      borderSoft: "#262626",
      chipBg: "#27272a",
      chipText: "#d4d4d8",
      inputBg: "#262626",
      skeleton: "#2e2e2e",
      overlay: "rgba(30,30,30,0.92)",
    };
  }

  // Modo claro (default) — tokens iguais ao visual hardcoded anterior
  const cardBg = "#ffffff";
  const primary = ensureContrast(rawPrimary, cardBg, 2.2, "#000000");
  const pageBg =
    background === "white"
      ? "#ffffff"
      : background === "tinted"
      ? mix("#ffffff", primary, 0.06)
      : "#f5f5f5";
  return {
    mode,
    fontFamily,
    primary,
    primarySoft: alpha(primary, 0.08),
    primaryText: readableTextOn(primary),
    pageBg,
    cardBg,
    headerBg: cardBg,
    textPrimary: "#1a1a1a",
    textSecondary: "#666666",
    border: "#eeeeee",
    borderSoft: "#f0f0f0",
    chipBg: "#f1f5f9",
    chipText: "#475569",
    inputBg: "#fafafa",
    skeleton: "#e2e8f0",
    overlay: "rgba(255,255,255,0.92)",
  };
};

/**
 * Converte o tema em CSS custom properties.
 * Aplicadas no documentElement para alcançar também os Dialogs (portais).
 */
export const themeToCssVars = (theme) => ({
  "--menu-font": theme.fontFamily || "inherit",
  "--menu-primary": theme.primary,
  "--menu-primary-soft": theme.primarySoft,
  "--menu-primary-text": theme.primaryText,
  "--menu-page-bg": theme.pageBg,
  "--menu-card-bg": theme.cardBg,
  "--menu-header-bg": theme.headerBg,
  "--menu-text": theme.textPrimary,
  "--menu-text-2": theme.textSecondary,
  "--menu-border": theme.border,
  "--menu-border-soft": theme.borderSoft,
  "--menu-chip-bg": theme.chipBg,
  "--menu-chip-text": theme.chipText,
  "--menu-input-bg": theme.inputBg,
  "--menu-skeleton": theme.skeleton,
  "--menu-overlay": theme.overlay,
});
