export const normalizeMesaSearch = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const getOcupanteNome = (mesa) => mesa?.contact?.name?.trim() || "";

export const mesaMatchesSearch = (mesa, query) => {
  if (!query) return true;
  const fields = [
    mesa?.number,
    mesa?.name,
    mesa?.contact?.name,
    mesa?.contact?.number,
  ];
  return fields.some((f) => normalizeMesaSearch(f).includes(query));
};
