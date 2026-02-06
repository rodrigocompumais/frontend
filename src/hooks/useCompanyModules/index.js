import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

const MODULE_LANCHONETES = "lanchonetes";

const useCompanyModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    try {
      const { data } = await api.get("/company/modules");
      setModules(data.modules || []);
    } catch (err) {
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const hasModule = (moduleName) => modules.includes(moduleName);
  const hasLanchonetes = hasModule(MODULE_LANCHONETES);

  return {
    modules,
    loading,
    hasModule,
    hasLanchonetes,
    refetch: fetchModules,
  };
};

export default useCompanyModules;
export { MODULE_LANCHONETES };
