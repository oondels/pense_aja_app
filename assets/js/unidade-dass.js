import { api } from "../../src/services/httpClient.js";

function showUnidadePopup() {
  const unidadePopup = document.querySelector(".unidade-popup");
  const unidadeOverlay = document.querySelector(".unidade-popup-overlay");

  // Verifica se já definiu a unidade anteriormente
  const unidadeSaved = localStorage.getItem("unidadeDass");

  if (!unidadeSaved) {
    unidadeOverlay.classList.add("active");

    setTimeout(() => {
      unidadePopup.classList.add("active");
    }, 300);

    setTimeout(() => {
      document.getElementById("unidade-input").focus();
    }, 900);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const unidadeSubmit = document.getElementById("unidade-submit");
  const unidadeInput = document.getElementById("unidade-input");
  const validationMessage = document.querySelector(".unidade-validation-message");

  // Função para validar matrícula
  function submitMatricula() {
    const matricula = unidadeInput.value.trim();

    if (isNaN(Number(matricula))) {
      validationMessage.textContent = "Insira apenas números!";
      unidadeInput.classList.add("error");
      animateShake(unidadeInput);
      return;
    }

    if (!matricula) {
      validationMessage.textContent = "Por favor, informe sua matrícula";
      unidadeInput.classList.add("error");
      animateShake(unidadeInput);
      return;
    }

    if (matricula.length < 7) {
      validationMessage.textContent = "Matrícula deve ter no mínimo 7 dígitos";
      unidadeInput.classList.add("error");
      animateShake(unidadeInput);
      return;
    }

    api
      .get(`/user/unidade/${matricula}`)
      .then((response) => {
        const message = response.data.message;
        const unidade = response.data.dassOffice;

        localStorage.setItem("unidadeDass", unidade);
        showNotification("Sucesso!", message || "Matrícula validada com sucesso!", "success", 2000);

        closeUnidadePopup();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((error) => {
        const message = error.response.data.message;
        validationMessage.textContent = message || "Erro ao validar matrícula!";
        unidadeInput.classList.add("error");
        animateShake(unidadeInput);
      });
  }

  function animateShake(element) {
    element.style.animation = "shake 0.4s ease";
    setTimeout(() => {
      element.style.animation = "";
    }, 400);
  }

  function closeUnidadePopup() {
    const unidadePopup = document.querySelector(".unidade-popup");
    const unidadeOverlay = document.querySelector(".unidade-popup-overlay");

    unidadePopup.classList.remove("active");
    setTimeout(() => {
      unidadeOverlay.classList.remove("active");
    }, 300);
  }

  if (unidadeSubmit) {
    unidadeSubmit.addEventListener("click", submitMatricula);
  }

  if (unidadeInput) {
    unidadeInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        submitMatricula();
      }
    });

    unidadeInput.addEventListener("input", function () {
      unidadeInput.classList.remove("error");
      validationMessage.textContent = "";
    });
  }

  showUnidadePopup();
});
