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

    const theme = createTheme(
        {
            scrollbarStyles: {
                "&::-webkit-scrollbar": {
                    width: '8px',
                    height: '8px',
                },
                "&::-webkit-scrollbar-thumb": {
                    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
                    backgroundColor: "#1976D2",
                },
            },
            scrollbarStylesSoft: {
                "&::-webkit-scrollbar": {
                    width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: mode === "light" ? "#F3F3F3" : "#333333",
                },
            },
            palette: {
                type: "dark",
                primary: {
                    main: "#0EA5E9", // azul da LP (cta gradient)
                    contrastText: "#F9FAFB",
                },
                secondary: {
                    main: "#22C55E", // verde da LP
                    contrastText: "#0B1120",
                },
                background: {
                    default: "#020617", // fundo geral escuro
                    paper: "#0B1120",   // cards / superfícies
                },
                text: {
                    primary: "#E5E7EB",
                    secondary: "#9CA3AF",
                },
                dark: { main: "#020617" },
                light: { main: "#0B1120" },
                tabHeaderBackground: "#020617",
                optionsBackground: "#0F172A",
                options: "#0F172A",
                fontecor: "#22C55E",
                fancyBackground: "#020617",
                bordabox: "#1F2937",
                newmessagebox: "#020617",
                inputdigita: "#020617",
                contactdrawer: "#020617",
                announcements: "#020617",
                login: "rgba(15, 23, 42, 0.98)",
                announcementspopover: "#020617",
                chatlist: "#020617",
                boxlist: "#020617",
                boxchatlist: "#020617",
                total: "#020617",
                messageIcons: "#9CA3AF",
                inputBackground: "#020617",
                barraSuperior: "linear-gradient(to right, #0EA5E9, #22C55E)",
                boxticket: "#020617",
                campaigntab: "#020617",
                mediainput: "#020617",
            },
            mode,
        },
        locale
    );

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
