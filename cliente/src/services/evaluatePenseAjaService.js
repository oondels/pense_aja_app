import { api } from "./httpClient"

export const evaluatePenseAja = async (evaluationData, notification) => {
  if (!evaluationData.avaliacao && evaluationData.status !== "EXCLUIR") {
    notification.value.showPopup(
      "warning",
      "Atenção!",
      "Campos obrigatórios estão ausentes: Avaliação",
      2000
    );
    return;
  }

  if (!evaluationData.justificativa && evaluationData.status !== "EXCLUIR") {
    notification.value.showPopup(
      "warning",
      "Atenção!",
      "Campos obrigatórios estão ausentes: Justificativa",
      2000
    );
    return;
  }

  try {
    const response = await api.put(
      `/pense-aja/avaliar/${evaluationData.id}`,
      evaluationData
    );

    notification.value.showPopup("success", "Sucesso!", response.data.message, 2000);
  } catch (error) {
    if (error.status === 500) {
      notification.value.showPopup("error", "Erro!", error.response.data.message, 3000);
    } else {
      notification.value.showPopup("warning", "Aviso!", error.response.data.message, 3000);
    }
    console.error("Erro ao avaliar pense aja.", error);
  } finally {
    setTimeout(() => {
      // TODO: Implementar o refresh da lista
      window.location.reload();
    }, 1500);
  }
};