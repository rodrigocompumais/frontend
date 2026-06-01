import React, { useContext, useMemo } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePageAccess from "../../hooks/usePageAccess";

/**
 * Oculta itens de menu sem permissão. Enquanto os módulos carregam, mantém visível
 * (evita menu vazio / flicker); o cache em useCompanyModules torna isso breve.
 */
const NavPageGate = ({ pageKey, children }) => {
  const { user } = useContext(AuthContext);
  const { canAccessPage, loading } = usePageAccess();

  const allowed = useMemo(() => {
    if (!user || !pageKey) return false;
    if (loading) return true;
    return canAccessPage(user, pageKey);
  }, [user, pageKey, loading, canAccessPage]);

  if (!allowed) return null;

  return <>{children}</>;
};

export default NavPageGate;
