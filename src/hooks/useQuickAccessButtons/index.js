import { useState, useCallback, useEffect } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useQuickAccessButtons = () => {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(false);

  const list = useCallback(async (includeHidden = false) => {
    setLoading(true);
    try {
      const { data } = await api.get("/user-quick-buttons", {
        params: { includeHidden },
      });
      setButtons(data.buttons || []);
      return data.buttons || [];
    } catch (err) {
      toastError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (buttonData) => {
    try {
      const { data } = await api.post("/user-quick-buttons", buttonData);
      setButtons((prev) => [...prev, data]);
      toast.success("Botão criado com sucesso!");
      return data;
    } catch (err) {
      toastError(err);
      throw err;
    }
  }, []);

  const update = useCallback(async (buttonId, buttonData) => {
    try {
      const { data } = await api.put(`/user-quick-buttons/${buttonId}`, buttonData);
      setButtons((prev) =>
        prev.map((btn) => (btn.id === buttonId ? data : btn))
      );
      toast.success("Botão atualizado com sucesso!");
      return data;
    } catch (err) {
      toastError(err);
      throw err;
    }
  }, []);

  const remove = useCallback(async (buttonId) => {
    try {
      await api.delete(`/user-quick-buttons/${buttonId}`);
      setButtons((prev) => prev.filter((btn) => btn.id !== buttonId));
      toast.success("Botão removido com sucesso!");
    } catch (err) {
      toastError(err);
      throw err;
    }
  }, []);

  const reorder = useCallback(async (buttonsOrder) => {
    try {
      await api.put("/user-quick-buttons/reorder", { buttons: buttonsOrder });
      // Atualizar ordem local
      setButtons((prev) => {
        const updated = [...prev];
        buttonsOrder.forEach(({ id, order }) => {
          const index = updated.findIndex((btn) => btn.id === id);
          if (index !== -1) {
            updated[index].order = order;
          }
        });
        return updated.sort((a, b) => a.order - b.order);
      });
      toast.success("Ordem atualizada com sucesso!");
    } catch (err) {
      toastError(err);
      throw err;
    }
  }, []);

  // Carregar botões ao inicializar
  useEffect(() => {
    list();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    buttons,
    loading,
    list,
    create,
    update,
    remove,
    reorder,
  };
};

export default useQuickAccessButtons;
