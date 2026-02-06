/**
 * Gera estilos dinâmicos para formulários públicos com base nas configurações de aparência.
 */

const BOX_SHADOWS = {
  none: "none",
  soft: "0 2px 8px rgba(0,0,0,0.06)",
  medium: "0 4px 20px rgba(0,0,0,0.08)",
  strong: "0 8px 40px rgba(0,0,0,0.12)",
};

const PAGE_BACKGROUNDS = {
  default: "#f5f5f5",
  white: "#ffffff",
  dark: "#1a1a2e",
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  pattern: "radial-gradient(circle at 25% 25%, #f8f9fa 0%, #e9ecef 100%)",
};

export const getFormAppearanceStyles = (form) => {
  const app = form?.settings?.appearance || {};
  const primaryColor = form?.primaryColor || "#1976d2";

  const borderRadius = app.borderRadius === "9999" ? 9999 : parseInt(app.borderRadius || "12", 10);
  const maxWidth = app.maxWidth === "full" ? "100%" : `${parseInt(app.maxWidth || "600", 10)}px`;
  const boxShadow = BOX_SHADOWS[app.boxShadow] || BOX_SHADOWS.medium;
  const pageBg = PAGE_BACKGROUNDS[app.pageBackground] || PAGE_BACKGROUNDS.default;

  let cardBackground = "transparent";
  if (app.backgroundStyle === "white") {
    cardBackground = "#ffffff";
  } else if (app.backgroundStyle === "gradient") {
    cardBackground = `linear-gradient(135deg, ${primaryColor}08 0%, ${primaryColor}15 100%)`;
  } else {
    cardBackground = primaryColor ? `${primaryColor}08` : "#ffffff";
  }

  const spacingMultiplier = { compact: 0.75, default: 1, relaxed: 1.35 }[app.spacing] || 1;
  const titleSize = { small: "1.35rem", default: "1.75rem", large: "2.25rem" }[app.titleSize] || "1.75rem";

  const fieldBorderRadius = app.fieldBorderRadius === "full" ? 9999 : parseInt(app.fieldBorderRadius || "8", 10);
  const buttonBorderRadius = { rounded: 8, pill: 9999, sharp: 0 }[app.buttonStyle] ?? 8;

  return {
    rootStyle: {
      minHeight: "100vh",
      background: pageBg,
      fontFamily: app.fontFamily && app.fontFamily !== "inherit" ? app.fontFamily : undefined,
    },
    containerStyle: {
      maxWidth,
    },
    formPaperStyle: {
      borderRadius,
      boxShadow,
      background: cardBackground,
      padding: `${24 * spacingMultiplier}px`,
    },
    titleStyle: {
      fontSize: titleSize,
      color: primaryColor,
    },
    fieldVariant: app.fieldStyle || "outlined",
    fieldInputProps: {
      style: {
        borderRadius: fieldBorderRadius,
      },
    },
    submitButtonStyle: {
      borderRadius: buttonBorderRadius,
      backgroundColor: primaryColor,
    },
    spacingMultiplier,
  };
};

export const FONT_IMPORTS = {
  "'Inter', sans-serif": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  "'Poppins', sans-serif": "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  "'Montserrat', sans-serif": "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
  "'Open Sans', sans-serif": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
  "'Playfair Display', serif": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
  "'Source Serif 4', serif": "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap",
};
