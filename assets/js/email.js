const emailPopup = document.querySelector(".email-popup");
const emailOverlay = document.querySelector(".email-popup-overlay");

export const checkUserEmail = () => {
  const email = sessionStorage.getItem("haveEmail");
  const usuario = sessionStorage.getItem("usuario");

  // Verificar se o email já foi coletado
  if (usuario && !email) {
    setTimeout(() => {
      // Reiniciar a animação do ícone e Força reflow
      const animatedElements = document.querySelectorAll(
        ".email-popup-icon, .email-popup-header h3, .email-popup-body p, .email-input-container, .email-popup-footer"
      );
      animatedElements.forEach((element) => {
        element.style.animation = "none";
        void element.offsetWidth;
        element.style.animation = "";
      });

      showEmailPopup();
    }, 3000);
  }
};

export const showEmailPopup = () => {
  emailOverlay.classList.add("active");
  setTimeout(() => {
    emailPopup.classList.add("active");
  }, 100);
};

export const closeEmailPopup = () => {
  emailPopup.classList.remove("active");
  setTimeout(() => {
    emailOverlay.classList.remove("active");
  }, 300);
};

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    showEmailPopup();
  }, 0);

  const currentYear = new Date().getFullYear();
  const yearElement = document.getElementById("email-copyright-year");
  if (yearElement) {
    yearElement.textContent = currentYear;
  }

  // Elementos do popup
  const emailInput = document.getElementById("email-input");
  const emailSubmit = document.getElementById("email-submit");
  const emailSkip = document.getElementById("email-skip");
  const emailClose = document.querySelector(".email-popup-close");
  const emailNoEmail = document.querySelector("#email-no-email");
  const validationMessage = document.querySelector(".email-validation-message");

  // Validar email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidDassEmail(email) {
    return email.includes("@grupodass.com.br");
  }

  function submitEmail() {
    const email = emailInput.value.trim();

    if (!email) {
      validationMessage.textContent = "Por favor, informe seu email";
      emailInput.classList.add("error");
      animateShake(emailInput);
      return;
    }

    if (!isValidEmail(email)) {
      validationMessage.textContent = "Email inválido";
      emailInput.classList.add("error");
      animateShake(emailInput);
      return;
    }

    if (!isValidDassEmail(email)) {
      validationMessage.textContent = "Insira um email do Grupo Dass!";
      emailInput.classList.add("error");
      animateShake(emailInput);
      return;
    }

    const userMatricula = sessionStorage.getItem("matricula");
    if (!userMatricula) {
      validationMessage.textContent = "Erro ao buscar matrícula do usuário, contate equipe de automação!";
      emailInput.classList.add("error");
      animateShake(emailInput);
      return;
    }

    let message = "";
    let error = false;
    axios
      .put("http://localhost:3041/api/user-email", {
        newEmail: email,
        matricula: userMatricula,
      })
      .then((response) => {
        message = response.data.message;
      })
      .catch((error) => {
        console.error("Erro ao cadastrar email do usuário: ", error);
        message = error.response ? error.response.data.message : "Erro desconhecido";
        error = true;
      });

    emailInput.value = "";
    validationMessage.textContent = "";

    closeEmailPopup();
    setTimeout(() => {
      Swal.fire({
        icon: error ? "warning" : "success",
        title: error ? "Erro" : "Sucesso",
        html: `<div style = "display:flex;text-align:center;flex-direction:column">
                    <div><strong>${message || "Erro Desconhecido!"}</strong></div>
                  </div>`,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 1500,
      });
    }, 700);
  }

  function animateShake(element) {
    element.style.animation = "shake 0.4s ease";
    setTimeout(() => {
      element.style.animation = "";
    }, 400);
  }

  // Event listeners
  emailSubmit.addEventListener("click", submitEmail);
  emailInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      submitEmail();
    }
  });

  // Resetar validação ao digitar
  emailInput.addEventListener("input", function () {
    emailInput.classList.remove("error");
    validationMessage.textContent = "";
  });

  // Fechar popup
  emailClose.addEventListener("click", closeEmailPopup);
  emailSkip.addEventListener("click", function () {
    closeEmailPopup();
  });

  // Sem Email
  emailNoEmail.addEventListener("click", function () {
    localStorage.setItem("emailProvided", "true");
    closeEmailPopup();
  });

  // Fechar ao clicar fora
  emailOverlay.addEventListener("click", function (e) {
    if (e.target === emailOverlay) {
      closeEmailPopup();
    }
  });
});
