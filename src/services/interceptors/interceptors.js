export function attachInterceptors(api, apiAuth) {
  let isRefreshing = false;
  let queue = [];

  const enqueue = () => {
    return new Promise((resolve, reject) => queue.push({ resolve, reject }));
  };

  async function handle401(error, instance, authInstance) {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) throw error;

    original._retry = true;
    // Verifica se já existe refresh em andamento
    if (isRefreshing) {
      await enqueue(); // Espera concluir
      return instance(original); // Repete requisição
    }

    isRefreshing = true;
    try {
      console.log("Token expirado, atualizando token...");

      const response = await authInstance.post("/auth/token/refresh", null, {
        withCredentials: true,
      });
      sessionStorage.setItem(
        "expirationTime",
        response.data.tokenExpirationTime
      );

      queue.forEach((p) => p.resolve());
      queue = [];

      return instance(original); // Repete requisição pendente
    } catch (e) {
      queue.forEach((p) => p.reject(e));
      queue = [];

      if (e.response?.status === 401 || e.response?.status === 403) {
        showNotification(
          "Sessão expirada",
          "Sua sessão expirou. Você precisará fazer login novamente.",
          "warning",
          3000
        );

        setTimeout(() => {
          sessionStorage.clear();
          window.location.reload();
        }, 3000);
      } else {
        console.error("Erro temporário no refresh de token:", e);
      }

      throw e;
    } finally {
      isRefreshing = false;
    }
  }

  api.interceptors.request.use(async (config) => {
    if (
      isTokenNearExpiration() &&
      !isRefreshing &&
      !config.url.includes("/auth/token/refresh")
    ) {
      console.log("Token próximo de expirar, atualizando...");
      isRefreshing = true;

      try {
        // Tenta renovar o token antes de prosseguir com a requisição original
        const response = await apiAuth.post("/auth/token/refresh", null, {
          withCredentials: true,
        });
        sessionStorage.setItem("expirationTime", response.data.tokenExpirationTime);
      } catch (error) {
        console.warn("Falha no refresh proativo:", error);
      } finally {
        isRefreshing = false;
      }
    }

    return config;
  });

  // Intercepta as instâncias de
  api.interceptors.response.use(
    (res) => res,
    (err) => handle401(err, api, apiAuth)
  );

  apiAuth.interceptors.response.use(
    (res) => res,
    (err) => handle401(err, apiAuth, apiAuth)
  );
}

// TODO: adicionar expiration time do token no sesisonStorage
// Verifica se o token irá expirar em menos de 30s
function isTokenNearExpiration() {
  const expiryTime = sessionStorage.getItem("TokenExpiration");
  if (expiryTime) {
    console.log("Buscando novo auth TOken");

    return parseInt(expiryTime) - Date.now() / 1000 < 30;
  }

  return false;
}
