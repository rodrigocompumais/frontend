import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { has, isArray } from "lodash";

import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import moment from "moment";
const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [companyLanguage, setCompanyLanguage] = useState("pt");

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
        setIsAuth(true);
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  let isRefreshing = false;
  let failedRequestsQueue = [];

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error?.response?.status === 403 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await api.post("/auth/refresh_token");

          if (data) {
            localStorage.setItem("token", JSON.stringify(data.token));
            api.defaults.headers.Authorization = `Bearer ${data.token}`;

            failedRequestsQueue.forEach((request) => {
              request.resolve(data.token);
            });
            failedRequestsQueue = [];
          }

          return api(originalRequest);
        } catch (refreshError) {
          failedRequestsQueue.forEach((request) => {
            request.reject(refreshError);
          });
          failedRequestsQueue = [];

          localStorage.removeItem("token");
          localStorage.removeItem("companyId");
          localStorage.removeItem("ai_chat_messages");
          api.defaults.headers.Authorization = undefined;
          setIsAuth(false);

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (
        error?.response?.status === 401 ||
        (error?.response?.status === 403 && originalRequest._retry)
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        localStorage.removeItem("ai_chat_messages");
        api.defaults.headers.Authorization = undefined;
        setIsAuth(false);
      }

      return Promise.reject(error);
    }
  );

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (token) {
        try {
          const { data } = await api.post("/auth/refresh_token");
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          setIsAuth(true);
          setUser(data.user);
          
          // Carregar idioma da empresa
          if (data.user?.company?.language) {
            setCompanyLanguage(data.user.company.language);
          } else {
            // Buscar das configurações se não estiver no company
            try {
              const { data: langData } = await api.get("/translation/company-language");
              setCompanyLanguage(langData.language || "pt");
            } catch (err) {
              console.error("Erro ao buscar idioma:", err);
            }
          }
        } catch (err) {
          toastError(err);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId) {
      const socket = socketManager.getSocket(companyId);

      socket.on(`company-${companyId}-user`, (data) => {
        if (data.action === "update" && data.user.id === user.id) {
          setUser(data.user);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [socketManager, user]);

  const handleLogin = async (userData) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", userData);
      const {
        user: { companyId, id, company },
      } = data;

      if (has(company, "settings") && isArray(company.settings)) {
        const setting = company.settings.find(
          (s) => s.key === "campaignsEnabled"
        );
        if (setting && setting.value === "true") {
          localStorage.setItem("cshow", null); //regra pra exibir campanhas
        }
      }

      moment.locale("pt-br");
      const dueDate = data.user.company.dueDate;
      const hoje = moment(moment()).format("DD/MM/yyyy");
      const vencimento = moment(dueDate).format("DD/MM/yyyy");

      var diff = moment(dueDate).diff(moment(moment()).format());

      var before = moment(moment().format()).isBefore(dueDate);
      var dias = moment.duration(diff).asDays();

      // Permitir login mesmo com assinatura vencida
      // O sistema de rotas vai redirecionar para a página correta
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("companyId", companyId);
      localStorage.setItem("userId", id);
      localStorage.setItem("companyDueDate", vencimento);
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      setUser(data.user);
      setIsAuth(true);
      
      // Carregar idioma da empresa no login
      if (data.user?.company?.language) {
        setCompanyLanguage(data.user.company.language);
      } else {
        // Buscar das configurações
        try {
          const { data: langData } = await api.get("/translation/company-language");
          setCompanyLanguage(langData.language || "pt");
        } catch (err) {
          console.error("Erro ao buscar idioma:", err);
        }
      }
      
      if (before === true) {
        toast.success(i18n.t("auth.toasts.success"));
        if (Math.round(dias) < 5 && Math.round(dias) > 0) {
          toast.warn(
            `Sua assinatura vence em ${Math.round(dias)} ${
              Math.round(dias) === 1 ? "dia" : "dias"
            } `
          );
        }
        const route = typeof data.user?.defaultRoute === "string" ? data.user.defaultRoute.trim() : "";
        const allowedRoutes = ["dashboard", "tickets", "cozinha", "entregador", "garcom", "pedidos", "mesas", "forms", "lanchonetes"];
        const path = route && allowedRoutes.includes(route) ? `/${route}` : "/tickets";
        history.push(path);
      } else {
        // Assinatura vencida - redirecionar para página de vencimento
        toast.warn("Seu período de teste expirou. Renove sua assinatura para continuar.");
        history.push("/subscription-expired");
      }
      setLoading(false);

      //quebra linha
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      await api.delete("/auth/logout");
      setIsAuth(false);
      setUser({});
      localStorage.removeItem("token");
      localStorage.removeItem("companyId");
      localStorage.removeItem("userId");
      localStorage.removeItem("cshow");
      // Limpar histórico de conversas com IA
      localStorage.removeItem("ai_chat_messages");
      api.defaults.headers.Authorization = undefined;
      setLoading(false);
      history.push("/login");
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err) {
      toastError(err);
    }
  };

  return {
    isAuth,
    user,
    loading,
    companyLanguage,
    handleLogin,
    handleLogout,
    getCurrentUserInfo,
  };
};

export default useAuth;
