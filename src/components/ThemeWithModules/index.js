import React, { useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { enUS, ptBR, esES } from "@material-ui/core/locale";
import ColorModeContext from "../../layout/themeContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanyModules from "../../hooks/useCompanyModules";

const PRIMARY_BLUE = "#0EA5E9";
const PRIMARY_AMBER = "#F59E0B";
const PRIMARY_AGENDAMENTO = "#171717";
const BARRA_GRADIENT_BLUE = "linear-gradient(to right, #0EA5E9, #38BDF8)";
const BARRA_GRADIENT_AMBER = "linear-gradient(to right, #F59E0B, #FBBF24)";
const BARRA_GRADIENT_AGENDAMENTO = "linear-gradient(to right, #171717, #404040)";

const ThemeWithModules = ({ children }) => {
  const { mode, locale } = useContext(ColorModeContext);
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();
  const { hasLanchonetes, hasAgendamento } = useCompanyModules();

  const onAgendamentoRoute = pathname && pathname.startsWith("/agendamento");
  const useAgendamentoTheme = Boolean(
    user && hasAgendamento && (onAgendamentoRoute || !hasLanchonetes)
  );
  const useLanchonetesTheme = Boolean(user && hasLanchonetes && !useAgendamentoTheme);

  const theme = useMemo(() => {
    const primaryMain = useAgendamentoTheme ? PRIMARY_AGENDAMENTO : useLanchonetesTheme ? PRIMARY_AMBER : PRIMARY_BLUE;
    const barraSuperior = useAgendamentoTheme ? BARRA_GRADIENT_AGENDAMENTO : useLanchonetesTheme ? BARRA_GRADIENT_AMBER : BARRA_GRADIENT_BLUE;

    return createTheme(
      {
        scrollbarStyles: {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
            backgroundColor: mode === "light" ? "#BDBDBD" : "#1976D2",
          },
        },
        scrollbarStylesSoft: {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: mode === "light" ? "#E0E0E0" : "#333333",
          },
        },
        palette: {
          type: mode,
          primary: {
            main: primaryMain,
            contrastText: mode === "light" ? "#FFFFFF" : "#F9FAFB",
          },
          secondary: {
            main: "#22C55E",
            contrastText: mode === "light" ? "#FFFFFF" : "#0B1120",
          },
          background: {
            default: mode === "light" ? "#F5F5F5" : "#020617",
            paper: mode === "light" ? "#FFFFFF" : "#0B1120",
          },
          text: {
            primary: mode === "light" ? "#1F2937" : "#E5E7EB",
            secondary: mode === "light" ? "#6B7280" : "#9CA3AF",
          },
          dark: { main: mode === "light" ? "#F5F5F5" : "#020617" },
          light: { main: mode === "light" ? "#FFFFFF" : "#0B1120" },
          tabHeaderBackground: mode === "light" ? "#FFFFFF" : "#020617",
          optionsBackground: mode === "light" ? "#F9FAFB" : "#0F172A",
          options: mode === "light" ? "#F9FAFB" : "#0F172A",
          fontecor: "#22C55E",
          fancyBackground: mode === "light" ? "#F5F5F5" : "#020617",
          bordabox: mode === "light" ? "#E5E7EB" : "#1F2937",
          newmessagebox: mode === "light" ? "#FFFFFF" : "#020617",
          inputdigita: mode === "light" ? "#FFFFFF" : "#020617",
          contactdrawer: mode === "light" ? "#FFFFFF" : "#020617",
          announcements: mode === "light" ? "#FFFFFF" : "#020617",
          login: mode === "light" ? "rgba(255, 255, 255, 0.98)" : "rgba(15, 23, 42, 0.98)",
          announcementspopover: mode === "light" ? "#FFFFFF" : "#020617",
          chatlist: mode === "light" ? "#FFFFFF" : "#020617",
          boxlist: mode === "light" ? "#FFFFFF" : "#020617",
          boxchatlist: mode === "light" ? "#FFFFFF" : "#020617",
          total: mode === "light" ? "#FFFFFF" : "#020617",
          messageIcons: mode === "light" ? "#6B7280" : "#9CA3AF",
          inputBackground: mode === "light" ? "#FFFFFF" : "#020617",
          barraSuperior,
          boxticket: mode === "light" ? "#FFFFFF" : "#020617",
          campaigntab: mode === "light" ? "#FFFFFF" : "#020617",
          mediainput: mode === "light" ? "#FFFFFF" : "#020617",
        },
        mode,
      },
      locale || ptBR
    );
  }, [mode, locale, pathname, useLanchonetesTheme, useAgendamentoTheme]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ThemeWithModules;
