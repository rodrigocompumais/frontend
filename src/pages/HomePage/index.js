import React from "react";
import { CircularProgress, Box } from "@material-ui/core";
import Dashboard from "../Dashboard";
import LanchonetesHub from "../LanchonetesHub";
import AgendamentoHub from "../AgendamentoHub";
import useCompanyModules from "../../hooks/useCompanyModules";

/**
 * Página inicial: quando o módulo Agendamento está ativo, mostra o AgendamentoHub.
 * Quando o módulo Lanchonetes está ativo (e não Agendamento tem prioridade), mostra o LanchonetesHub.
 * Caso contrário, mostra o Dashboard convencional.
 */
const HomePage = () => {
  const { hasLanchonetes, hasAgendamento, loading } = useCompanyModules();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (hasAgendamento) return <AgendamentoHub />;
  if (hasLanchonetes) return <LanchonetesHub />;
  return <Dashboard />;
};

export default HomePage;
