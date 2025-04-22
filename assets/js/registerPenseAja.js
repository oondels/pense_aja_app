import ip from "./ip.js";

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

  // Dados do cadastrante
  let userData = null;
  const getUserData = async (matricula) => {
    if (!dassOffice) {
      showNotification("Warning", "Unidade Dass não informada.", "warning");
      return;
    }

    const matriculaLoading = document.querySelector(".penseaja-spinner");
    const userInfo = document.querySelector(".user-penseaja-info");

    try {
      userData = await axios.get(
        `${ip}:2512/user/${matricula}`,
        {
          params: { dassOffice: dassOffice },
        }
      );
      userData = userData.data;
      userInfo.classList.remove("hidden");

      // Atualiza dados do usuario
      document.querySelector(".user-name").innerHTML = userData.nome;
      document.querySelector(".user-gerente").innerHTML = userData.gerente;
    } catch (error) {
      showNotification(
        "Error",
        "Erro ao buscar dados do funcionário. Tente novamente mais tarde!",
        "error"
      );
      console.error("Erro ao buscar dados do funcionário: ", error);
    } finally {
      matriculaLoading.classList.add("hidden");
      matriculaInput.disabled = false;
    }
  };

  // Abrir cadastro pense e aja
  const matriculaInput = document.querySelector("#penseaja-matricula");
  const matriculaLoading = document.querySelector(".penseaja-spinner");
  penseAjaButton.addEventListener("click", () => {
    const matriculaUserLogado = sessionStorage.getItem("matricula");
    if (matriculaUserLogado) {
      matriculaInput.value = matriculaUserLogado;
      matriculaLoading.classList.remove("hidden");

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

  // Ganhos Pense Aja
  const formGanhos = document.querySelector("#ganhos-form");
  function mostrarCampoGanho() {
    const valorSelecionado = document.getElementById("ganho-penseaja");

    if (valorSelecionado.checked) {
      formGanhos.classList.remove("hidden");
      return;
    }
    formGanhos.classList.add("hidden");
  }
  const ganhoSelect = document.getElementById("ganho-penseaja");
  ganhoSelect.addEventListener("change", mostrarCampoGanho);

  const registerPenseAja = async (matricula) => {
    const areaMelhoria = document.querySelector("#penseaja-projeto-area").value
    const projectName = document.querySelector("#penseaja-projeto").value;
    const projectDate = document.querySelector("#penseaja-data").value;
    const situationBefore = document.querySelector("#penseaja-anterior").value;
    const situationNow = document.querySelector("#penseaja-atual").value;
    const checkboxes = document.querySelectorAll(
      ".penseaja-checkbox input:checked"
    );
    const selectedCheckboxes = Array.from(checkboxes).map(
      (checkbox) => checkbox.nextElementSibling.innerText
    );
    const ganhos = document.querySelectorAll(
      ".penseaja-checkbox-ganho input:checked"
    );
    const selectedGanhos = Array.from(ganhos).map(
      (checkbox) => checkbox.nextElementSibling.innerText
    );
    const ganhoDetalhes = document.querySelector("#ganhos-descricao").value
    // if (!dassOffice) {
    //   showNotification(
    //     "Warning",
    //     "Unidade do colaborador não encontrada.",
    //     "warning"
    //   );
    //   return;
    // }

    // if (!projectName || !projectDate || !situationBefore || !situationNow) {
    //   showNotification(
    //     "Warning",
    //     "Preencha todos os campos necessários.",
    //     "warning"
    //   );
    //   return;
    // }

    // if (!userData) {
    //   showNotification(
    //     "Warning",
    //     "Dados do usuário não encontrados.",
    //     "warning"
    //   );
    //   return;
    // }

    try {
      let turno;
      switch (userData.nome_setor.slice(-1)) {
        case "A":
          turno = "A";
          break;
        case "B":
          turno = "B";
          break;
        case "C":
          turno = "C";
        default:
          turno = "N";
          break;
      }

      const response = await axios.post(
        `${ip}:2512/pense-aja/${dassOffice}`,
        {
          registration: matricula,
          userName: userData.nome,
          turno: turno,
          setor: userData.nome_setor,
          gerente: userData.gerente,
          nome: projectName,
          createDate: projectDate,
          situationBefore: situationBefore,
          situationNow: situationNow,
          perdas: selectedCheckboxes || [],
          ganhos: selectedGanhos || [],
          ganhoDetalhes: ganhoDetalhes || "",
          areaMelhoria: areaMelhoria 
        }
      );

      showNotification(
        "Sucesso!",
        response.data.message || "Pense e Aja cadastrado com sucesso!",
        "success"
      );

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Erro ao cadastrar pense aja: ", error);

      showNotification(
        "Error",
        error.respons.data.message ||
          "Erro ao cadastrar Pense e Aja. Tente novamente mais tarde!",
        "error"
      );
    }
  };

  const registerButton = document.querySelector(".penseaja-submit-button");
  registerButton.addEventListener("click", () =>
    registerPenseAja(matriculaInput.value)
  );
});
