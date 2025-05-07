import { authApi } from "./httpClient";

export const login = (username, password, loading, emit) => {
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
      sessionStorage.setItem("gerente", decoded.gerente);
      sessionStorage.setItem("setor", decoded.setor);
      sessionStorage.setItem("expirationTime", data.tokenExpirationTime)

      emit("notify", {
        type: "success",
        title: "Sucesso",
        message: "Login realizado com sucesso!",
        time: 1500
      });

      setTimeout(() => {
        window.location.reload();
      }, 1600);
    })
    .catch((error) => {
      emit("notify", {
        type: "error",
        title: "Error",
        message: "Erro ao realizar login. Tente novamente.",
        time: 1500
      });
      console.error("Erro ao fazer login:", error);
    })
    .finally(() => {
      loading.value = false
    });
};

export const checkLogin = async (username, password, loading) => {
  let result
  await authApi.post("/auth/login", { usuario: username, senha: password },)
    .then(() => {
      result = true
    })
    .catch((error) => {
      console.error("Erro ao fazer login:", error);

      result = false;
    })

  return result
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