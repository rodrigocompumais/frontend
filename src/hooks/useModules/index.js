import api from "../../services/api";

const useModules = () => {
  const list = async () => {
    const { data } = await api.get("/modules");
    return data;
  };

  const listAvailable = async () => {
    const { data } = await api.get("/company/modules/available");
    return data.modules || [];
  };

  const save = async (moduleData) => {
    const { data } = await api.post("/modules", moduleData);
    return data;
  };

  const update = async (id, moduleData) => {
    const { data } = await api.put(`/modules/${id}`, moduleData);
    return data;
  };

  const remove = async (id) => {
    const { data } = await api.delete(`/modules/${id}`);
    return data;
  };

  return {
    list,
    listAvailable,
    save,
    update,
    remove,
  };
};

export default useModules;
