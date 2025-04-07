document.addEventListener("DOMContentLoaded", () => {
  const penseAjaButton = document.querySelector("#openMenu");
  const img = document.querySelector("#imgPenseAja");

  // Animação imagem
  penseAjaButton.addEventListener("mouseover", () => {
    img.src = img.dataset.srcHover;
  });
  penseAjaButton.addEventListener("mouseleave", () => {
    img.src = img.dataset.srcNormal;
  });

  const getUserData = async (matricula) => {
    const matriculaLoading = document.querySelector(".penseaja-spinner");
    const userInfo = document.querySelector(".user-penseaja-info");

    try {
      const userData = await axios.get(`http://10.110.20.192:2512/user/${matricula}`);
      userInfo.classList.remove("hidden");

      // Atualiza dados do usuario
      document.querySelector(".user-name").innerHTML = userData.data.nome;
      document.querySelector(".user-gerente").innerHTML = userData.data.gerente;
    } catch (error) {
      showNotification("Error", "Erro ao buscar dados do funcionário. Tente novamente mais tarde!", "error");
      console.error("Erro ao buscar dados do funcionário: ", error);
    } finally {
      matriculaLoading.classList.add("hidden");
      matriculaInput.disabled = false;
    }
  };

  // Abrir cadastro pense e aja
  const matriculaInput = document.querySelector("#penseaja-matricula");
  penseAjaButton.addEventListener("click", () => {
    const matriculaUserLogado = sessionStorage.getItem("matricula");
    if (matriculaUserLogado) {
      matriculaInput.value = matriculaUserLogado;

      getUserData(matriculaUserLogado);
    }

    document.querySelector("#penseaja-popup").classList.remove("hidden");
    setTimeout(() => {
      matriculaInput.focus();
    }, 500);
  });

  // Coleta de dados do user pelo matrícula
  matriculaInput.addEventListener("input", async (event) => {
    const matriculaLoading = document.querySelector(".penseaja-spinner");
    const userInfo = document.querySelector(".user-penseaja-info");
    const matriculaValue = event.target.value;

    if (matriculaValue.length >= 7) {
      matriculaInput.disabled = true;
      matriculaLoading.classList.remove("hidden");
      getUserData(matriculaValue);
    } else {
      userInfo.classList.add("hidden");
    }
  });

  const registerPenseAja = async (matricula) => {
    try {
      const projectName = document.querySelector("#penseaja-projeto");
      const projectDate = document.querySelector("#penseaja-data");
      const situationBefore = document.querySelector("#penseaja-anterior").value;
      const situationNow = document.querySelector("#penseaja-atual").value;
      const checkboxes = document.querySelectorAll(".penseaja-checkbox input:checked");
      const selectedCheckboxes = Array.from(checkboxes).map((checkbox) => checkbox.nextElementSibling.innerText);

      if (!projectName.value || !projectDate.value || !situationBefore || !situationNow) {
        showNotification("Warning", "Preencha todos os campos necessários.", "warning");
        return;
      }
    } catch (error) {
      console.error("Erro ao cadastrar pense aja: ", error);
      showNotification("Error", "Erro ao buscar dados do funcionário. Tente novamente mais tarde!", "error");
    }
  };

  const registerButton = document.querySelector(".penseaja-submit-button");
  registerButton.addEventListener("click", () => registerPenseAja(matriculaInput.value));
});
