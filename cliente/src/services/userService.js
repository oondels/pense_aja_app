import { commonApi } from './httpClient.js'

// TODO: Corrigir coleta de unidadeDass
export const getUserData = async (registration, userData, loading = null, notification = null) => {
  if (loading) loading.value = true
  
  let message = "Contate a equipe de automação."
  try {
    const response = await commonApi.get(`/user/${registration}`, {
      params: { dassOffice: "SEST" },
    });

    userData.value = response.data
  } catch (error) {
    console.error("Erro ao buscar dados do colaborador: ", error);
    if (notification) {
      notification.value.showPopup("error", "Erro!", error.response?.data.message ?? message, 3000)
    }
  } finally {
    if (loading) loading.value = false
  }
}