import { api } from "./httpClient"

export const purchaseItem = async (colaboradorData, product, analistaName, analistaUser, dassOffice, notification, loadingPass, dialog, emit) => {
  try {
    loadingPass.value = true;
    let message;
    const response = await api.put(`/pense-aja/purchase/${colaboradorData?.matricula}`, {
      product,
      colaboradorData,
      analista: { analistaName, analistaUser },
      dassOffice
    });
    message = response.data?.message || "Item resgatado com sucesso!";

    notification.value.showPopup('success', 'Sucesso', message, 1500);
    emit("updatePoints", true);
    // Fecha popup de resgate de premio
    setTimeout(() => {
      dialog.value = false;
    }, 1600);
  } catch (error) {
    message = error.response?.data?.message || "Erro ao resgatar item! Tente novamente.";
    console.error("Error purchasing item:", error);
    notification.value.showPopup('error', 'Erro', message, 1500);
    throw error;
  } finally {
    loadingPass.value = false;
  }
}