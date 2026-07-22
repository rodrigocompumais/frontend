/**
 * URL do backend.
 * Com REACT_APP_DEV_NETWORK=true, ao acessar via IP/hostname da rede
 * (ex.: http://192.168.0.10:3000), a API/socket usam o mesmo host na porta do backend.
 */
export function getBackendUrl() {
  const fallback = process.env.REACT_APP_BACKEND_URL || "";
  const enabled =
    process.env.REACT_APP_DEV_NETWORK === "true" ||
    process.env.REACT_APP_DEV_NETWORK === "1";

  if (!enabled || typeof window === "undefined") {
    return fallback;
  }

  const { hostname, protocol } = window.location;
  const port = process.env.REACT_APP_BACKEND_PORT || "4000";

  if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
    return `${protocol}//${hostname}:${port}`;
  }

  return fallback;
}

export default getBackendUrl;
