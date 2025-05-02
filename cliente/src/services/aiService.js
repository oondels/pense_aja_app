import { commonApi } from "./httpClient.js"

export const improveText = async (situationBefore, situationNow, projectName, loading) => {
  loading.value = true

  try {
    const response = await commonApi.post("/ai/improve-text", {
      situationBefore,
      situationNow,
      projectName
    })

    return response.data
  } catch (error) {
    console.error("Erro ao melhorar o texto:", error);
  } finally {
    loading.value = false
  }

}