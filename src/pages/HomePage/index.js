import React from "react";
import { CircularProgress, Box } from "@material-ui/core";
import Dashboard from "../Dashboard";
import LanchonetesHub from "../LanchonetesHub";
import useCompanyModules from "../../hooks/useCompanyModules";

/**
 * Página inicial: quando o módulo Lanchonetes está ativo, mostra o Hub Lanchonetes.
 * Caso contrário, mostra o Dashboard convencional.
 */
const HomePage = () => {
  const { hasLanchonetes, loading } = useCompanyModules();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return hasLanchonetes ? <LanchonetesHub /> : <Dashboard />;
};

export default HomePage;
