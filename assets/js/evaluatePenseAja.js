import ip from "./ip.js";
import CacheManager from "./cacheManager.js";

document.addEventListener("DOMContentLoaded", () => {
  // Botões de avaliação pense aja (A, B, C)
  const classificationButtons = document.querySelectorAll(
    'input[name="avaliacao-pense-aja"]'
  );

  // Coleta avaliação e Exibe campo de justificativa
  let avaliacaoPenseAja;
  const justifyEvaluation = document.querySelector(".justifica-avaliacao");
  classificationButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      avaliacaoPenseAja = event.target.value;
      justifyEvaluation.classList.remove("hidden");
    });
  });

  // Enviar avaliação
  const evaluatePenseAja = async (action) => {
    const dassOffice = localStorage.getItem("unidadeDass");
    const penseAjaId = sessionStorage.getItem("penseAjaEmAvaliacao");
    if (!penseAjaId) return console.log("Sem pense aja selecionado.");

    const replicavel = document.querySelector("#replicavel").checked;
    const emEspera = document.querySelector("#em-espera").checked;
    const justificativa = document.querySelector(
      "#justificativa-avaliacao"
    ).value;
    const a3Mae = document.querySelector("#a3-penseAja").value || "";

    if (!dassOffice) {
      showNotification("Atenção!", "warning", 2000);
      return;
    }
    
    if (!avaliacaoPenseAja && action !== "EXCLUIR") {
      showNotification(
        "Atenção!",
        "Campos obrigatórios estão ausentes: Avaliação",
        "warning",
        2000
      );
      return;
    }

    if (!justificativa && action !== "EXCLUIR") {
      showNotification(
        "Atenção!",
        "Campos obrigatórios estão ausentes: Justificativa",
        "warning",
        2000
      );
      return;
    }

    try {
      const response = await axios.put(
        `${ip}:2512/pense-aja/avaliar/${penseAjaId}`,
        {
          avaliacao: avaliacaoPenseAja,
          emEspera: emEspera,
          replicavel: replicavel,
          justificativa: justificativa,
          dassOffice: dassOffice,
          status: action,
          a3Mae: a3Mae,
        }
      );

      // Atualiza os dados em cache
      CacheManager.updatePenseAjaInCache(penseAjaId, response.data.data);
      showNotification("Sucesso!", response.data.message, "success", 2000);
    } catch (error) {
      if (error.status === 500) {
        showNotification("Erro!", error.response.data.message, "error", 3000);
      } else {
        showNotification(
          "Aviso!",
          error.response.data.message,
          "warning",
          3000
        );
      }
      console.error("Erro ao avaliar pense aja.", error);
    } finally {
      // Reseta valores
      sessionStorage.removeItem("penseAjaEmAvaliacao");
      classificationButtons.forEach((button) => {
        button.checked = false;
      });
      document.querySelector("#justificativa-avaliacao").value = "";
      justifyEvaluation.classList.add("hidden");
      document.querySelector("#replicavel").checked = false;
      document.querySelector("#em-espera").checked = false;
      document.querySelector("#a3-penseAja").value = "";
      avaliacaoPenseAja = undefined;

      setTimeout(() => {
        // Fecha o modal de avaliação
        const avaliarContainer = document.querySelector(".avaliar-container");
        const avaliarContent = document.querySelector(".avaliar-content");
        if (avaliarContainer && avaliarContent) {
          avaliarContainer.classList.remove("active");
          avaliarContent.classList.remove("active");
        }
      }, 1000);
    }
  };

  // Aprovar, reprovar e excluir pense e aja
  const actionButtons = document.querySelectorAll(".avaliar-btn");
  actionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const clickedButton = event.target.closest(".avaliar-btn");
      if (!clickedButton) return;

      let action;
      if (clickedButton.classList.contains("avaliar-btn-aprovar")) {
        action = "APROVAR";
      } else if (clickedButton.classList.contains("avaliar-btn-reprovar")) {
        action = "REPROVAR";
      } else if (clickedButton.classList.contains("avaliar-btn-excluir")) {
        action = "EXCLUIR";
      } else {
        action = "CANCELAR";
      }

      evaluatePenseAja(action);
    });
  });
});
