import axios from "axios";
import { getBackendUrl } from "../config/backendUrl";

const api = axios.create({
	baseURL: getBackendUrl(),
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
	// Recalcula baseURL a cada request (hostname pode mudar em dev na rede)
	config.baseURL = getBackendUrl();
	return config;
});

export const openApi = axios.create({
	baseURL: getBackendUrl()
});

openApi.interceptors.request.use((config) => {
	config.baseURL = getBackendUrl();
	return config;
});

export default api;
