export const PAGE_DEFINITIONS = [
  { key: "tickets-finalizadas", group: "atendimento", pathPrefix: "/tickets/finalizadas" },
  { key: "tickets", group: "atendimento", pathPrefix: "/tickets" },
  { key: "dashboard", group: "atendimento", pathPrefix: "/dashboard" },
  { key: "kanban", group: "atendimento", pathPrefix: "/kanban" },
  { key: "chats", group: "atendimento", pathPrefix: "/chats" },
  { key: "quick-messages", group: "atendimento", pathPrefix: "/quick-messages" },
  { key: "todolist", group: "gestao", pathPrefix: "/todolist" },
  { key: "schedules", group: "gestao", pathPrefix: "/schedules" },
  { key: "contacts", group: "gestao", pathPrefix: "/contacts" },
  { key: "tags", group: "gestao", pathPrefix: "/tags" },
  { key: "forms", group: "gestao", pathPrefix: "/forms" },
  { key: "products", group: "gestao", pathPrefix: "/products", requiredModule: "lanchonetes" },
  { key: "lanchonetes", group: "gestao", pathPrefix: "/lanchonetes", requiredModule: "lanchonetes" },
  { key: "agendamento", group: "gestao", pathPrefix: "/agendamento", requiredModule: "agendamento" },
  { key: "pdv", group: "gestao", pathPrefix: "/pdv", requiredModule: "lanchonetes" },
  { key: "pedidos", group: "gestao", pathPrefix: "/pedidos", requiredModule: "lanchonetes" },
  { key: "mesas", group: "gestao", pathPrefix: "/mesas", requiredModule: "lanchonetes" },
  { key: "campaigns", group: "automacao", pathPrefix: "/campaigns" },
  { key: "contact-lists", group: "automacao", pathPrefix: "/contact-lists" },
  { key: "flowbuilders", group: "automacao", pathPrefix: "/flowbuilders" },
  { key: "flowbuilder", group: "automacao", pathPrefix: "/flowbuilder" },
  { key: "phrase-lists", group: "automacao", pathPrefix: "/phrase-lists" },
  { key: "campaigns-config", group: "automacao", pathPrefix: "/campaigns-config" },
  { key: "prompts", group: "automacao", pathPrefix: "/prompts" },
  { key: "users", group: "administracao", pathPrefix: "/users" },
  { key: "connections", group: "administracao", pathPrefix: "/connections" },
  { key: "queues", group: "administracao", pathPrefix: "/queues" },
  { key: "files", group: "administracao", pathPrefix: "/files" },
  { key: "queue-integration", group: "administracao", pathPrefix: "/queue-integration" },
  { key: "messages-api", group: "administracao", pathPrefix: "/messages-api" },
  { key: "financeiro", group: "administracao", pathPrefix: "/financeiro" },
  { key: "announcements", group: "administracao", pathPrefix: "/announcements", superOnly: true },
  { key: "helps", group: "sistema", pathPrefix: "/helps" },
  { key: "help-articles", group: "sistema", pathPrefix: "/help-articles" },
  { key: "settings", group: "sistema", pathPrefix: "/settings" },
  { key: "quick-access-buttons-settings", group: "sistema", pathPrefix: "/quick-access-buttons-settings" },
  { key: "subscription", group: "sistema", pathPrefix: "/subscription" },
  { key: "garcom", group: "operacional", pathPrefix: "/garcom", requiredModule: "lanchonetes" },
  { key: "cozinha", group: "operacional", pathPrefix: "/cozinha", requiredModule: "lanchonetes" },
  { key: "entregador", group: "operacional", pathPrefix: "/entregador", requiredModule: "lanchonetes" },
];

export const ALL_PAGE_KEYS = PAGE_DEFINITIONS.map((p) => p.key);

export const BASE_DEFAULT_USER_PAGE_KEYS = [
  "tickets",
  "tickets-finalizadas",
  "kanban",
  "chats",
  "quick-messages",
  "todolist",
  "schedules",
  "contacts",
  "tags",
  "forms",
  "campaigns",
  "contact-lists",
  "flowbuilders",
  "flowbuilder",
  "phrase-lists",
  "campaigns-config",
  "prompts",
  "helps",
  "help-articles",
];

export const LANCHONETE_DEFAULT_USER_PAGE_KEYS = [
  "products",
  "lanchonetes",
  "pdv",
  "pedidos",
  "mesas",
  "garcom",
  "cozinha",
  "entregador",
];

export const AGENDAMENTO_DEFAULT_USER_PAGE_KEYS = ["agendamento"];

export const DEFAULT_USER_PAGE_KEYS = [
  ...BASE_DEFAULT_USER_PAGE_KEYS,
  ...LANCHONETE_DEFAULT_USER_PAGE_KEYS,
  ...AGENDAMENTO_DEFAULT_USER_PAGE_KEYS,
];

export const ADMIN_PAGE_KEYS = PAGE_DEFINITIONS.filter(
  (p) => p.group === "administracao"
).map((p) => p.key);

export const PAGE_GROUP_ORDER = [
  "atendimento",
  "gestao",
  "automacao",
  "administracao",
  "sistema",
  "operacional",
];

/** Opções do campo "Página inicial (após login)" no modal de usuário */
export const DEFAULT_ROUTE_OPTIONS = [
  { value: "", label: "Padrão (Atendimentos)", pageKey: "tickets" },
  { value: "dashboard", label: "Dashboard" },
  { value: "tickets", label: "Atendimentos" },
  { value: "cozinha", label: "Cozinha", requiredModule: "lanchonetes" },
  { value: "entregador", label: "Entregador", requiredModule: "lanchonetes" },
  { value: "garcom", label: "Garçom", requiredModule: "lanchonetes" },
  { value: "pedidos", label: "Pedidos", requiredModule: "lanchonetes" },
  { value: "mesas", label: "Mesas", requiredModule: "lanchonetes" },
  { value: "forms", label: "Formulários" },
  { value: "lanchonetes", label: "Lanchonetes", requiredModule: "lanchonetes" },
  { value: "pdv", label: "PDV", requiredModule: "lanchonetes" },
  { value: "products", label: "Produtos", requiredModule: "lanchonetes" },
];

const SORTED_PATH_RULES = [...PAGE_DEFINITIONS].sort(
  (a, b) => b.pathPrefix.length - a.pathPrefix.length
);

export const isPageAvailableForModules = (pageKey, moduleFlags = {}) => {
  const def = PAGE_DEFINITIONS.find((p) => p.key === pageKey);
  if (!def?.requiredModule) return true;
  if (def.requiredModule === "lanchonetes") return Boolean(moduleFlags.hasLanchonetes);
  if (def.requiredModule === "agendamento") return Boolean(moduleFlags.hasAgendamento);
  return true;
};

export const isDefaultRouteAvailableForModules = (routeValue, moduleFlags = {}) => {
  const option = DEFAULT_ROUTE_OPTIONS.find((o) => o.value === (routeValue || ""));
  if (!option) return true;
  if (!option.requiredModule) return true;
  if (option.requiredModule === "lanchonetes") return Boolean(moduleFlags.hasLanchonetes);
  if (option.requiredModule === "agendamento") return Boolean(moduleFlags.hasAgendamento);
  return true;
};

export const getDefaultUserPageKeysForModules = (moduleFlags = {}) => {
  const keys = [...BASE_DEFAULT_USER_PAGE_KEYS];
  if (moduleFlags.hasLanchonetes) {
    keys.push(...LANCHONETE_DEFAULT_USER_PAGE_KEYS);
  }
  if (moduleFlags.hasAgendamento) {
    keys.push(...AGENDAMENTO_DEFAULT_USER_PAGE_KEYS);
  }
  return keys;
};

export const filterPageDefinitionsByModules = (moduleFlags = {}) =>
  PAGE_DEFINITIONS.filter((p) => isPageAvailableForModules(p.key, moduleFlags));

export const filterDefaultRouteOptionsByModules = (moduleFlags = {}) =>
  DEFAULT_ROUTE_OPTIONS.filter((o) => {
    if (!o.requiredModule) return true;
    if (o.requiredModule === "lanchonetes") return Boolean(moduleFlags.hasLanchonetes);
    if (o.requiredModule === "agendamento") return Boolean(moduleFlags.hasAgendamento);
    return true;
  });

export const filterPageAccessForModules = (pageAccess, moduleFlags = {}) => {
  if (!pageAccess) return null;
  const granted = (pageAccess.granted || []).filter((key) =>
    isPageAvailableForModules(key, moduleFlags)
  );
  const denied = (pageAccess.denied || []).filter((key) =>
    isPageAvailableForModules(key, moduleFlags)
  );
  if (granted.length === 0 && denied.length === 0) return null;
  return { granted, denied };
};

export const getEffectivePageKeys = (user, moduleFlags = {}) => {
  if (!user) return new Set();
  if (user.profile === "admin") {
    return new Set(
      ALL_PAGE_KEYS.filter((key) => isPageAvailableForModules(key, moduleFlags))
    );
  }

  const defaultKeys = getDefaultUserPageKeysForModules(moduleFlags);
  const effective = new Set(defaultKeys);
  const granted = user.pageAccess?.granted || [];
  const denied = user.pageAccess?.denied || [];

  granted.forEach((key) => {
    if (isPageAvailableForModules(key, moduleFlags)) {
      effective.add(key);
    }
  });
  denied.forEach((key) => effective.delete(key));

  return effective;
};

export const canAccessPage = (user, pageKey, moduleFlags = {}) => {
  if (!user || !pageKey) return false;

  if (!isPageAvailableForModules(pageKey, moduleFlags)) {
    return false;
  }

  if (user.profile === "admin") {
    const def = PAGE_DEFINITIONS.find((p) => p.key === pageKey);
    if (def?.superOnly && !user.super) return false;
    return true;
  }

  return getEffectivePageKeys(user, moduleFlags).has(pageKey);
};

export const pathToPageKey = (pathname) => {
  const path = (pathname || "").split("?")[0].replace(/\/$/, "") || "/";
  for (const def of SORTED_PATH_RULES) {
    if (path === def.pathPrefix || path.startsWith(`${def.pathPrefix}/`)) {
      return def.key;
    }
  }
  return null;
};

const UNGUARDED_PATH_PREFIXES = ["/subscription-expired"];

export const canAccessPath = (user, pathname, moduleFlags = {}) => {
  const path = (pathname || "").split("?")[0];

  if (UNGUARDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return true;
  }

  const pageKey = pathToPageKey(path);
  if (!pageKey) {
    return user?.profile === "admin";
  }

  if (pageKey === "announcements" && !user?.super) {
    return false;
  }

  return canAccessPage(user, pageKey, moduleFlags);
};

export const hasAnyPageAccess = (user, pageKeys, moduleFlags = {}) =>
  pageKeys.some((key) => canAccessPage(user, key, moduleFlags));

export const getFirstAccessiblePath = (user, moduleFlags = {}) => {
  const defaultRoute =
    typeof user?.defaultRoute === "string" ? user.defaultRoute.trim() : "";

  if (
    defaultRoute &&
    isDefaultRouteAvailableForModules(defaultRoute, moduleFlags) &&
    canAccessPath(user, `/${defaultRoute}`, moduleFlags)
  ) {
    return `/${defaultRoute}`;
  }

  const preferred = [
    "/tickets",
    "/dashboard",
    "/pedidos",
    "/cozinha",
    "/garcom",
    "/entregador",
    "/forms",
    "/contacts",
  ];

  for (const path of preferred) {
    if (canAccessPath(user, path, moduleFlags)) return path;
  }

  for (const def of PAGE_DEFINITIONS) {
    if (canAccessPage(user, def.key, moduleFlags)) {
      return def.pathPrefix;
    }
  }

  return "/tickets";
};

export const effectiveSetToPageAccess = (selectedSet, moduleFlags = {}) => {
  const defaultSet = new Set(getDefaultUserPageKeysForModules(moduleFlags));
  const granted = [...selectedSet].filter((key) => !defaultSet.has(key));
  const denied = getDefaultUserPageKeysForModules(moduleFlags).filter(
    (key) => !selectedSet.has(key)
  );
  if (granted.length === 0 && denied.length === 0) return null;
  return { granted, denied };
};

export const pageAccessToEffectiveSet = (pageAccess, moduleFlags = {}) => {
  const set = new Set(getDefaultUserPageKeysForModules(moduleFlags));
  (pageAccess?.granted || []).forEach((key) => {
    if (isPageAvailableForModules(key, moduleFlags)) set.add(key);
  });
  (pageAccess?.denied || []).forEach((key) => set.delete(key));
  return set;
};
