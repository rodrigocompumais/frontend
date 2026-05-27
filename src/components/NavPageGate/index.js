import React, { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePageAccess from "../../hooks/usePageAccess";

const NavPageGate = ({ pageKey, children }) => {
  const { user } = useContext(AuthContext);
  const { canAccessPage, loading } = usePageAccess();

  if (loading) return null;

  if (!canAccessPage(user, pageKey)) {
    return null;
  }

  return <>{children}</>;
};

export default NavPageGate;
