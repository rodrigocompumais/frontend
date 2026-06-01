import { useState, useEffect, useCallback, useContext, useRef } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const MODULE_LANCHONETES = "lanchonetes";
const MODULE_AGENDAMENTO = "agendamento";

/** Cache por empresa — evita múltiplas requisições e “piscar” do menu de páginas. */
const cacheByCompany = new Map();
let inflightByCompany = new Map();

export const invalidateCompanyModulesCache = (companyId) => {
  if (companyId != null) {
    cacheByCompany.delete(companyId);
    inflightByCompany.delete(companyId);
  } else {
    cacheByCompany.clear();
    inflightByCompany.clear();
  }
};

const readCache = (companyId) => {
  if (companyId == null) return null;
  return cacheByCompany.get(companyId) ?? null;
};

const fetchModulesForCompany = async (companyId) => {
  const cached = readCache(companyId);
  if (cached) return cached;

  if (!inflightByCompany.has(companyId)) {
    const promise = api
      .get("/company/modules")
      .then((res) => {
        const modules = res.data?.modules || [];
        cacheByCompany.set(companyId, modules);
        return modules;
      })
      .catch(() => {
        cacheByCompany.set(companyId, []);
        return [];
      })
      .finally(() => {
        inflightByCompany.delete(companyId);
      });
    inflightByCompany.set(companyId, promise);
  }

  return inflightByCompany.get(companyId);
};

const useCompanyModules = () => {
  const { user, isAuth } = useContext(AuthContext);
  const companyId = user?.companyId;
  const companyIdRef = useRef(companyId);

  const initialCached = companyId != null ? readCache(companyId) : null;

  const [modules, setModules] = useState(() => initialCached || []);
  const [loading, setLoading] = useState(() => {
    if (!isAuth || companyId == null) return false;
    return initialCached == null;
  });

  const fetchModules = useCallback(
    async (force = false) => {
      if (!isAuth || companyId == null) {
        setModules([]);
        setLoading(false);
        return;
      }

      if (force) {
        invalidateCompanyModulesCache(companyId);
      }

      const cached = readCache(companyId);
      if (cached && !force) {
        setModules(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchModulesForCompany(companyId);
        if (companyIdRef.current === companyId) {
          setModules(data);
        }
      } finally {
        if (companyIdRef.current === companyId) {
          setLoading(false);
        }
      }
    },
    [isAuth, companyId]
  );

  useEffect(() => {
    companyIdRef.current = companyId;
    if (isAuth && companyId != null) {
      fetchModules(false);
    } else {
      setModules([]);
      setLoading(false);
    }
  }, [isAuth, companyId, fetchModules]);

  const hasModule = (moduleName) => modules.includes(moduleName);
  const hasLanchonetes = hasModule(MODULE_LANCHONETES);
  const hasAgendamento = hasModule(MODULE_AGENDAMENTO);

  return {
    modules,
    loading,
    hasModule,
    hasLanchonetes,
    hasAgendamento,
    refetch: () => fetchModules(true),
  };
};

export default useCompanyModules;
export { MODULE_LANCHONETES, MODULE_AGENDAMENTO };
