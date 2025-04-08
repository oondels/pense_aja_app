document.addEventListener("DOMContentLoaded", () => {
  const dassOffice = localStorage.getItem("unidadeDass") || null;
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
    if (!dassOffice) {
      showNotification("Warning", "Unidade Dass não informada.", "warning");
      return;
    }

    const matriculaLoading = document.querySelector(".penseaja-spinner");
    const userInfo = document.querySelector(".user-penseaja-info");

    try {
      const userData = await axios.get(`http://10.110.20.192:2512/user/${matricula}`, {
        params: { dassOffice: dassOffice },
      });
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

  // Tooltip IA
  const AiButton = document.querySelector("#ai-button");
  const toolTipContainer = document.querySelector(".ai-tooltip");
  AiButton.addEventListener("mouseover", () => {
    toolTipContainer.classList.add("visible");
  });
  AiButton.addEventListener("mouseout", () => {
    toolTipContainer.classList.remove("visible");
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
    const projectName = document.querySelector("#penseaja-projeto").value;
    const projectDate = document.querySelector("#penseaja-data").value;
    const situationBefore = document.querySelector("#penseaja-anterior").value;
    const situationNow = document.querySelector("#penseaja-atual").value;
    const checkboxes = document.querySelectorAll(".penseaja-checkbox input:checked");
    const selectedCheckboxes = Array.from(checkboxes).map((checkbox) => checkbox.nextElementSibling.innerText);

    if (!dassOffice) {
      showNotification("Warning", "Unidade do colaborador não encontrada.", "warning");
      return;
    }

    if (!projectName || !projectDate || !situationBefore || !situationNow) {
      showNotification("Warning", "Preencha todos os campos necessários.", "warning");
      return;
    }

    try {
      const response = await axios.post(`http://10.110.20.192:2512/${dassOffice}`, {
        nome: projectName,
        createDate: projectDate,
        situationBefore: situationBefore,
        situationNow: situationNow,
        perdas: selectedCheckboxes || [],
        registration: matricula,
        dassOffice: dassOffice
      });
    } catch (error) {
      console.error("Erro ao cadastrar pense aja: ", error);
      showNotification("Error", "Erro ao buscar dados do funcionário. Tente novamente mais tarde!", "error");
    }
  };

  const registerButton = document.querySelector(".penseaja-submit-button");
  registerButton.addEventListener("click", () => registerPenseAja(matriculaInput.value));
});
