import { api } from "./httpClient"

export const evaluatePenseAja = async (evaluationData, notification, dialog) => {
  if (!evaluationData.avaliacao && evaluationData.status !== "exclude" && evaluationData.status !== "reprove") {
    notification.value.showPopup(
      "warning",
      "Atenção!",
      "Campos obrigatórios estão ausentes: Avaliação",
      3500
    );
    return;
  }

  if (!evaluationData.justificativa && evaluationData.status !== "exclude") {
    notification.value.showPopup(
      "warning",
      "Atenção!",
      "Campos obrigatórios estão ausentes: Justificativa",
      3500
    );
    return;
  }

  try {
    const response = await api.put(
      `/pense-aja/avaliar/${evaluationData.id}`,
      evaluationData
    );

    notification.value.showPopup("success", "Sucesso!", response.data.message, 3500);
    dialog.value = false
    return response.data;
  } catch (error) {
    if (error.status === 500) {
      notification.value.showPopup("error", "Erro!", error?.response?.data?.message || "Erro ao avaliar pense aja, tente novamente!", 3500);
    } else {
      notification.value.showPopup("warning", "Aviso!", error?.response?.data?.message || "Erro ao avaliar pense aja, tente novamente!", 3500);
    }
    console.error("Erro ao avaliar pense aja.", error);
  }
};