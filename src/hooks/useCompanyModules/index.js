import { useState, useEffect, useCallback, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const MODULE_LANCHONETES = "lanchonetes";
const MODULE_AGENDAMENTO = "agendamento";

const useCompanyModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuth } = useContext(AuthContext);

  const fetchModules = useCallback(async () => {
    const companyId = localStorage.getItem("companyId");
    if (!companyId || !isAuth) {
      setModules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get("/company/modules");
      setModules(data.modules || []);
    } catch (err) {
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  useEffect(() => {
    if (isAuth && user?.companyId) {
      fetchModules();
    } else {
      setModules([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, user?.companyId]);

  const hasModule = (moduleName) => modules.includes(moduleName);
  const hasLanchonetes = hasModule(MODULE_LANCHONETES);
  const hasAgendamento = hasModule(MODULE_AGENDAMENTO);

  return {
    modules,
    loading,
    hasModule,
    hasLanchonetes,
    hasAgendamento,
    refetch: fetchModules,
  };
};

export default useCompanyModules;
export { MODULE_LANCHONETES, MODULE_AGENDAMENTO };
