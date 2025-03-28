import ip from "./ip.js";

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

    axios
      .get(`${ip}:3041/api/check-user-registration/${matricula}`)
      .then((response) => {
        const message = response.data.message;
        const unidade = response.data.unidade;

        localStorage.setItem("unidadeDass", unidade);
        Swal.fire({
          icon: "success",
          title: "Matrícula Validada!",
          text: message || "Matrícula validada com sucesso!",
          timer: 2000,
          showConfirmButton: false,
        });

        closeUnidadePopup();
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
