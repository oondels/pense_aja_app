import { api } from "../../src/services/httpClient.js";

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
      userData = await api.get(`/user/${matricula}`, {
        params: { dassOffice: dassOffice },
      });
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
    if (!AiButton.classList.contains("disabled-button")) {
      toolTipContainer.classList.add("visible");
    }
  });
  AiButton.addEventListener("mouseout", () => {
    if (!AiButton.classList.contains("disabled-button")) {
      toolTipContainer.classList.remove("visible");
    }
  });

  // Reescreve texto com IA
  AiButton.addEventListener("click", async () => {
    const loading = document.querySelector(".spinner-ai");
    loading.classList.remove("hidden");

    // Aplica animação de carregamento nos textareas
    const beforeTextarea = document.querySelector("#penseaja-anterior");
    const afterTextarea = document.querySelector("#penseaja-atual");

    // Salvar o conteúdo atual dos campos
    const originalBeforeText = beforeTextarea.value;
    const originalAfterText = afterTextarea.value;

    // Adicionar classes de animação e tornar os campos somente leitura durante o processamento
    beforeTextarea.classList.add("ai-processing");
    afterTextarea.classList.add("ai-processing");
    beforeTextarea.readOnly = true;
    afterTextarea.readOnly = true;

    // Adicionar indicadores de progresso
    addProgressBar(beforeTextarea);
    addProgressBar(afterTextarea);

    // Adicionar efeito de digitação
    beforeTextarea.classList.add("ai-typing");
    afterTextarea.classList.add("ai-typing");

    // Adicionar o efeito de texto processando
    beforeTextarea.classList.add("ai-processing-text");
    afterTextarea.classList.add("ai-processing-text");

    try {
      const projectName = document.querySelector("#penseaja-projeto");
      const response = await api.post("/ai/improve-text", {
        situationBefore: originalBeforeText.trim(),
        situationNow: originalAfterText.trim(),
        projectName: projectName.value.trim(),
      });

      // Atualiza campos com resposta da IA
      const { before, after } = response.data.result;

      // Remover classes de animação
      beforeTextarea.classList.remove(
        "ai-processing",
        "ai-typing",
        "ai-processing-text"
      );
      afterTextarea.classList.remove(
        "ai-processing",
        "ai-typing",
        "ai-processing-text"
      );

      // Adicionar animação de destaque para mostrar que o texto foi atualizado
      beforeTextarea.classList.add("ai-highlight");
      afterTextarea.classList.add("ai-highlight");

      showNotification(
        "Sucesso",
        "Texto melhorado com Inteligência Artificial!",
        "success",
        3000
      );

      AiButton.classList.add("disabled-button");
      AiButton.disabled = true;

      // Atualizar o texto com animação
      animateTextUpdate(beforeTextarea, before);
      animateTextUpdate(afterTextarea, after);

      // Remover a classe de destaque após a animação
      setTimeout(() => {
        beforeTextarea.classList.remove("ai-highlight");
        afterTextarea.classList.remove("ai-highlight");

        // Adicionar classe de animação de conclusão
        beforeTextarea.classList.add("ai-text-update");
        afterTextarea.classList.add("ai-text-update");

        // Remover após a animação terminar
        setTimeout(() => {
          beforeTextarea.classList.remove("ai-text-update");
          afterTextarea.classList.remove("ai-text-update");
        }, 500);
      }, 2000);
    } catch (error) {
      console.error("Erro ao usar IA: ", error);

      // Remover barras de progresso
      removeProgressBar(beforeTextarea);
      removeProgressBar(afterTextarea);

      // Restaurar o texto original em caso de erro
      beforeTextarea.value = originalBeforeText;
      afterTextarea.value = originalAfterText;

      // Mostrar notificação de erro
      showNotification(
        "Erro",
        "Não foi possível reescrever o texto. Tente novamente mais tarde.",
        "error",
        3000
      );
    } finally {
      // Remover todas as classes de animação e restaurar a editabilidade
      beforeTextarea.classList.remove(
        "ai-processing",
        "ai-typing",
        "ai-processing-text",
        "ai-placeholder"
      );
      afterTextarea.classList.remove(
        "ai-processing",
        "ai-typing",
        "ai-processing-text",
        "ai-placeholder"
      );
      beforeTextarea.readOnly = false;
      afterTextarea.readOnly = false;

      // Esconder o spinner
      document.querySelector(".spinner-ai").classList.add("hidden");
    }
  });

  // Funções auxiliares para as animações de IA
  function addProgressBar(element) {
    const progressContainer = document.createElement("div");
    progressContainer.className = "ai-progress-container";
    const progressBar = document.createElement("div");
    progressBar.className = "ai-progress-bar";
    progressContainer.appendChild(progressBar);
    element.parentElement.style.position = "relative";
    element.parentElement.appendChild(progressContainer);
  }

  function removeProgressBar(element) {
    const progressContainer = element.parentElement.querySelector(
      ".ai-progress-container"
    );
    if (progressContainer) {
      element.parentElement.removeChild(progressContainer);
    }
  }

  function animateTextUpdate(element, newText) {
    // Criar efeito de texto sendo digitado
    if (!newText) throw new Error("Erro ao gerar resposta do servidor de IA.");
    // Limpar o campo
    element.value = "";

    // Adicionar um efeito de digitação com velocidade variável para parecer mais natural
    let i = 0;
    const typingSpeed = () => Math.floor(Math.random() * 9) + 3; // Entre 3ms e 12ms

    const typeChar = () => {
      if (i < newText.length) {
        element.value += newText.charAt(i);
        i++;
        // Ajustar o scroll do textarea para mostrar o texto sendo digitado
        element.scrollTop = element.scrollHeight;
        // Chamar a próxima letra com velocidade variável
        setTimeout(typeChar, typingSpeed());
      }
    };

    typeChar();
  }

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
    const areaMelhoria = document.querySelector("#penseaja-projeto-area").value;
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
    const ganhoDetalhes = document.querySelector("#ganhos-descricao").value;
    if (!dassOffice) {
      showNotification(
        "Warning",
        "Unidade do colaborador não encontrada.",
        "warning"
      );
      return;
    }

    if (!projectName || !projectDate || !situationBefore || !situationNow) {
      showNotification(
        "Warning",
        "Preencha todos os campos necessários.",
        "warning"
      );
      return;
    }

    if (!userData) {
      showNotification(
        "Warning",
        "Dados do usuário não encontrados.",
        "warning"
      );
      return;
    }

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

      const response = await api.post(`/pense-aja/${dassOffice}`, {
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
        areaMelhoria: areaMelhoria,
      });

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
