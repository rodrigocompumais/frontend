import useCompanyModules from "../useCompanyModules";
import {
  canAccessPage as canAccessPageBase,
  canAccessPath as canAccessPathBase,
  getFirstAccessiblePath as getFirstAccessiblePathBase,
  hasAnyPageAccess as hasAnyPageAccessBase,
  getEffectivePageKeys as getEffectivePageKeysBase,
} from "../../constants/pagePermissions";

const usePageAccess = () => {
  const { hasLanchonetes, hasAgendamento, loading } = useCompanyModules();
  const moduleFlags = { hasLanchonetes, hasAgendamento };

  return {
    loading,
    moduleFlags,
    hasLanchonetes,
    hasAgendamento,
    canAccessPage: (user, pageKey) =>
      canAccessPageBase(user, pageKey, moduleFlags),
    canAccessPath: (user, pathname) =>
      canAccessPathBase(user, pathname, moduleFlags),
    getFirstAccessiblePath: (user) =>
      getFirstAccessiblePathBase(user, moduleFlags),
    hasAnyPageAccess: (user, pageKeys) =>
      hasAnyPageAccessBase(user, pageKeys, moduleFlags),
    getEffectivePageKeys: (user) =>
      getEffectivePageKeysBase(user, moduleFlags),
  };
};

export default usePageAccess;
