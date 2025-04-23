import { authApi, api } from "../../src/services/httpClient.js";

document.addEventListener("DOMContentLoaded", () => {
  // Login
  const loginContainer = document.querySelector("#login-popup");
  const logoutContainer = document.querySelector("#logout-popup");
  const userButton = document.querySelector("#openUser");
  userButton.addEventListener("click", () => {
    let container;
    const userData = sessionStorage.getItem("usuario");

    if (userData) {
      setTimeout(() => {
        document.querySelector(".usuario-name").innerHTML = userData;
        document.querySelector(".user-matricula").innerHTML =
          sessionStorage.getItem("matricula");
      }, 100);

      container = logoutContainer;
    } else {
      container = loginContainer;
    }

    container.classList.remove("hidden");
  });

  const closeLogin = document.querySelector("#login-close");
  closeLogin.addEventListener("click", () => {
    loginContainer.classList.add("hidden");
  });

  const revealPassword = document.querySelector("#toggle-password");
  revealPassword.addEventListener("click", () => {
    const passwordInput = document.querySelector("#login-password");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
  });

  // Realizar Login
  const login = () => {
    const loading = document.querySelector(".spinner");
    const warning = document.querySelector(".warning-content");
    const username = document.querySelector("#login-user").value;
    const password = document.querySelector("#login-password").value;

    if (!username || !password) {
      warning.classList.remove("hidden");
      setTimeout(() => {
        warning.classList.add("hidden");
      }, 2000);
      return;
    }
    loading.classList.remove("hidden");

    authApi
      .post(
        "/auth/login",
        { usuario: username, senha: password },
      )
      .then((response) => {
        const data = response.data;

        const decoded = JSON.parse(atob(data.userData));
        sessionStorage.setItem("matricula", decoded.matricula);
        sessionStorage.setItem("haveEmail", decoded.haveEmail);
        sessionStorage.setItem("usuario", decoded.usuario);
        sessionStorage.setItem("nome", decoded.nome);
        sessionStorage.setItem("funcao", decoded.funcao);

        showNotification(
          "Sucesso!",
          "Login realizado com sucesso!",
          "success",
          1500
        );
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch(() => {
        showNotification(
          "Erro",
          "Usuario ou senha incorretos.",
          "warning",
          1500
        );
      })
      .finally(() => {
        loading.classList.add("hidden");
      });
  };

  const loginButton = document.querySelector(".login-btn");
  const loginPassInput = document.querySelector("#login-password");
  loginButton.addEventListener("click", login);
  loginPassInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      login();
    }
  });

  // Esqueci Senha
  const forgotPassword = document.querySelector(".forgot-password");
  forgotPassword.addEventListener("click", () => {
    document.querySelector(".forgot-container").classList.remove("hidden");
  });

  const closeForgotPass = document.querySelector("#forgot-close");
  closeForgotPass.addEventListener("click", () => {
    document.querySelector(".forgot-container").classList.add("hidden");
  });

  const passwordInput = document.querySelector("#forgot-password");
  const passwordInputConfirm = document.querySelector(
    "#forgot-password-confirm"
  );
  const revealForgotPass = document.querySelectorAll(".forgot-pass");
  revealForgotPass.forEach((element) => {
    element.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordInputConfirm.type = "text";
      } else {
        passwordInput.type = "password";
        passwordInputConfirm.type = "password";
      }
    });
  });

  // Verifica se senhas estão iguais
  function checkPasswordsEqual() {
    const changePassword = document.querySelector("#changePassButton");
    if (passwordInput.value !== passwordInputConfirm.value) {
      passwordInputConfirm.classList.add("diff");
      passwordInput.classList.add("diff");
      changePassword.classList.add("diff");
    } else {
      passwordInputConfirm.classList.remove("diff");
      passwordInput.classList.remove("diff");
      changePassword.classList.remove("diff");
    }
  }
  passwordInput.addEventListener("input", checkPasswordsEqual);
  passwordInputConfirm.addEventListener("input", checkPasswordsEqual);

  // Logout
  const logoutButton = document.querySelector("#logout");
  logoutButton.addEventListener("click", () => {
    const loading = document.querySelector(".spinner-logout");
    loading.classList.remove("hidden");

    authApi
      .post(`/auth/logout`)
      .then(() => {
        sessionStorage.clear();

        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((error) => {
        showNotification(
          "Erro",
          "Erro ao efetuar logout. Tente novamente mais tarde!",
          "warning",
          3000
        );
        console.error("Erro ao efetuar logout: ", error);
      })
      .finally(() => {
        loading.classList.add("hidden");
      });
  });

  const testeProtectedRoute = async () => {
    api
      .get(`/pense-aja/protected`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          showNotification(
            "Acesso negado",
            error.response.data.message,
            "warning",
            4000
          );
        }
        console.error("Error: ", error);
      });
  };
  document
    .querySelector("#protected-route")
    .addEventListener("click", testeProtectedRoute);

  const closeLogout = document.querySelector("#logout-close");
  closeLogout.addEventListener("click", () => {
    logoutContainer.classList.add("hidden");
  });
});
