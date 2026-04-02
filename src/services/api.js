import axios from "axios";

const api = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL,
	withCredentials: true,
});

// Cardápio e rotas públicas: bust de cache via query (evita preflight CORS por headers custom em GET).
// Headers Cache-Control/Pragma no *pedido* tornam o GET "não-simples" e quebram em aba anônima se o CORS não listar esses headers.
api.interceptors.request.use((config) => {
	const u = config.url || "";
	if (u.includes("/public/")) {
		const method = (config.method || "get").toLowerCase();
		if (method === "get") {
			config.params = { ...(config.params || {}), _: Date.now() };
		}
	}
	return config;
});

export const openApi = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL
});

export default api;
