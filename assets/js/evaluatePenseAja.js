import ip from "./ip.js";

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
    const a3Mae = document.querySelector("#a3-penseAja").value || ""

    if (!dassOffice) {
      showNotification(
        "Atenção!",
        "Unidade Dass do colaborador não identificada. Entre em contato com equipe de automação!",
        "warning",
        2000
      );
      return;
    }
    // if (!avaliacaoPenseAja) {
    //     showNotification("Atenção!", "Campos obrigatórios estão ausentes: Avaliação", "warning", 2000);
    //     return;
    // }
    // if (!justificativa) {
    //     showNotification("Atenção!", "Campos obrigatórios estão ausentes: Justificativa", "warning", 2000);
    //     return;
    // }

    // TODO: Após atualizar o registro, atualizar o cache no front-end
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
          a3Mae: a3Mae
        }
      );
      console.log(response.data);

      showNotification("Sucesso!", response.data.message, "success", 2000);
    } catch (error) {
      console.error(
        "Erro ao avaliar pense aja. Tente novamente mais tarde: ",
        error
      );

      showNotification("Erro!", error.response.data.message, "error", 2000);
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
