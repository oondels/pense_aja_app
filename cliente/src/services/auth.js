import { authApi } from "./httpClient";

export const login = (username, password, loading) => {
  loading.value = true

  authApi.post("/auth/login", { usuario: username, senha: password },)
    .then((response) => {
      const data = response.data;

      const decoded = JSON.parse(atob(data.userData));
      sessionStorage.setItem("matricula", decoded.matricula);
      sessionStorage.setItem("haveEmail", decoded.haveEmail);
      sessionStorage.setItem("usuario", decoded.usuario);
      sessionStorage.setItem("nome", decoded.nome);
      sessionStorage.setItem("funcao", decoded.funcao);
      sessionStorage.setItem("expirationTime", data.tokenExpirationTime)

      alert("Success")
      setTimeout(() => {
        window.location.reload();
      }, 1600);
    })
    .catch((error) => {
      console.error("Erro ao fazer login:", error);

      alert("Erro ao fazer login")
    })
    .finally(() => {
      loading.value = false
    });
};

export const logout = (loading) => {
  loading.value = true

  authApi
    .post(`/auth/logout`)
    .then(() => {
      sessionStorage.clear();

      setTimeout(() => window.location.reload(), 100);
    })
    .catch((error) => {
      console.error("Erro ao efetuar logout: ", error);
    })
    .finally(() => {
      loading.value = false
    });
}