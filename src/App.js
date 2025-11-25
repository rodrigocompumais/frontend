import React, { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";

import {enUS, ptBR, esES} from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { SocketContext, SocketManager } from './context/Socket/SocketContext';

import Routes from "./routes";

const queryClient = new QueryClient();

const App = () => {
    const [locale, setLocale] = useState();

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const preferredTheme = window.localStorage.getItem("preferredTheme");
    const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
        }),
        []
    );

    const theme = React.useMemo(() => createTheme(
        {
            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: '8px',
                    height: '8px',
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
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
                    main: "#0EA5E9", // azul da LP (cta gradient)
                    contrastText: mode === "light" ? "#FFFFFF" : "#F9FAFB",
                },
                secondary: {
                    main: "#22C55E", // verde da LP
                    contrastText: mode === "light" ? "#FFFFFF" : "#0B1120",
                },
                background: {
                    default: mode === "light" ? "#F5F5F5" : "#020617", // fundo geral
                    paper: mode === "light" ? "#FFFFFF" : "#0B1120",   // cards / superfícies
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
                barraSuperior: "linear-gradient(to right, #0EA5E9, #22C55E)",
                boxticket: mode === "light" ? "#FFFFFF" : "#020617",
                campaigntab: mode === "light" ? "#FFFFFF" : "#020617",
                mediainput: mode === "light" ? "#FFFFFF" : "#020617",
            },
            mode,
        },
        locale
    ), [mode, locale]);

    useEffect(() => {
        const i18nlocale = localStorage.getItem("i18nextLng");
        const browserLocale = i18nlocale?.substring(0, 2) ?? 'pt';

        if (browserLocale === "pt"){
            setLocale(ptBR);
        }else if( browserLocale === "en" ) {
            setLocale(enUS)
        }else if( browserLocale === "es" )
            setLocale(esES)

    }, []);

    useEffect(() => {
        window.localStorage.setItem("preferredTheme", mode);
    }, [mode]);



    return (
        <ColorModeContext.Provider value={{ colorMode }}>
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                  <SocketContext.Provider value={SocketManager}>
                      <Routes />
                  </SocketContext.Provider>
                </QueryClientProvider>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default App;
