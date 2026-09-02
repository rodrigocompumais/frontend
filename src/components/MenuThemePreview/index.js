import React, { useMemo, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";
import { buildMenuTheme } from "../../utils/menuTheme";
import { FONT_IMPORTS } from "../../utils/formAppearanceStyles";

/**
 * Preview ao vivo do cardápio público: mock leve (header, tabs, cards,
 * sticky bar e bottom nav) renderizado com o tema derivado do estado atual
 * do builder — atualiza em tempo real, sem salvar.
 */
const MenuThemePreview = ({ form }) => {
  const t = useMemo(() => buildMenuTheme(form), [form]);

  useEffect(() => {
    const fontImport = FONT_IMPORTS[t.fontFamily];
    if (!fontImport) return;
    const link = document.createElement("link");
    link.href = fontImport;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, [t.fontFamily]);

  const productCard = (name, desc, price) => (
    <Box
      style={{
        display: "flex",
        gap: 8,
        backgroundColor: t.cardBg,
        borderRadius: 10,
        padding: 8,
        marginBottom: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <Box
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          backgroundColor: t.skeleton,
          flexShrink: 0,
        }}
      />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Typography
          style={{ fontSize: 11, fontWeight: 600, color: t.textPrimary, lineHeight: 1.3 }}
          noWrap
        >
          {name}
        </Typography>
        <Typography
          style={{ fontSize: 9, color: t.textSecondary, lineHeight: 1.3 }}
          noWrap
        >
          {desc}
        </Typography>
        <Typography style={{ fontSize: 11, fontWeight: 700, color: t.textPrimary }}>
          {price}
        </Typography>
      </Box>
      <Box
        style={{
          alignSelf: "center",
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `1.5px solid ${t.primary}`,
          color: t.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        +
      </Box>
    </Box>
  );

  return (
    <Box
      style={{
        width: 240,
        margin: "0 auto",
        borderRadius: 28,
        border: "10px solid #1f2937",
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        fontFamily: t.fontFamily || "inherit",
        backgroundColor: t.pageBg,
      }}
    >
      {/* Banner */}
      <Box style={{ height: 52, backgroundColor: t.primary, opacity: 0.85 }} />

      {/* Barra da loja */}
      <Box
        style={{
          backgroundColor: t.headerBg,
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        {form?.logoUrl ? (
          <img src={form.logoUrl} alt="Logo" style={{ height: 16, maxWidth: 90, objectFit: "contain" }} />
        ) : (
          <Typography style={{ fontSize: 11, fontWeight: 700, color: t.textPrimary }}>
            {form?.name || "Sua loja"}
          </Typography>
        )}
        <Box
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: "#1b5e20",
            backgroundColor: "#e8f5e9",
            borderRadius: 999,
            padding: "2px 6px",
          }}
        >
          Aberto
        </Box>
      </Box>

      {/* Chips de informações */}
      <Box
        style={{
          backgroundColor: t.headerBg,
          padding: "0 10px 8px",
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        {["40-60 min", "Entrega"].map((c) => (
          <Box
            key={c}
            style={{
              fontSize: 8,
              fontWeight: 600,
              color: t.chipText,
              backgroundColor: t.chipBg,
              borderRadius: 999,
              padding: "2px 7px",
            }}
          >
            {c}
          </Box>
        ))}
      </Box>

      {/* Tabs */}
      <Box
        style={{
          backgroundColor: t.headerBg,
          display: "flex",
          gap: 12,
          padding: "8px 10px 0",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <Typography
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: t.primary,
            borderBottom: `2px solid ${t.primary}`,
            paddingBottom: 6,
          }}
        >
          Pizzas
        </Typography>
        <Typography
          style={{ fontSize: 10, fontWeight: 600, color: t.textSecondary, paddingBottom: 6 }}
        >
          Bebidas
        </Typography>
        <Typography
          style={{ fontSize: 10, fontWeight: 600, color: t.textSecondary, paddingBottom: 6 }}
        >
          Sobremesas
        </Typography>
      </Box>

      {/* Cards de produto */}
      <Box style={{ padding: 10 }}>
        {productCard("Pizza Calabresa", "Molho, mussarela e calabresa", "R$ 39,90")}
        {productCard("Pizza Marguerita", "Molho, mussarela e manjericão", "R$ 42,90")}

        {/* Sticky cart bar */}
        <Box
          style={{
            marginTop: 10,
            backgroundColor: t.primary,
            color: t.primaryText,
            borderRadius: 8,
            padding: "7px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 10,
            fontWeight: 700,
            boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
          }}
        >
          <span>Ver carrinho</span>
          <span>R$ 82,80</span>
        </Box>
      </Box>

      {/* Bottom nav */}
      <Box
        style={{
          backgroundColor: t.headerBg,
          borderTop: `1px solid ${t.border}`,
          display: "flex",
          justifyContent: "space-around",
          padding: "6px 0",
        }}
      >
        <Typography style={{ fontSize: 8, fontWeight: 700, color: t.textPrimary }}>Início</Typography>
        <Typography style={{ fontSize: 8, color: t.textSecondary }}>Buscar</Typography>
        <Typography style={{ fontSize: 8, color: t.textSecondary }}>Carrinho</Typography>
      </Box>
    </Box>
  );
};

export default MenuThemePreview;
