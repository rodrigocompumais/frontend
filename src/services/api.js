import axios from "axios";

const api = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL,
	withCredentials: true,
});

// Cardápio e rotas públicas: evitar cache HTTP/CDN de JSON antigo (horários, settings).
api.interceptors.request.use((config) => {
	const u = config.url || "";
	if (u.includes("/public/")) {
		config.headers = config.headers || {};
		config.headers["Cache-Control"] = "no-cache";
		config.headers["Pragma"] = "no-cache";
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
