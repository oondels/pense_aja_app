import { api, commonApi } from "./httpClient"

// TODO: Atualizar coleta de Unidade Dass
export const registerPenseAja = async (penseAjaData, matricula, notification, userData) => {
  let dassOffice = "SEST"
  if (!dassOffice) {
    notification.value.showPopup("warning", "Aviso!", "Unidade do colaborador não encontrada.", 3000)
    return;
  }

  if (!penseAjaData?.projectName || !penseAjaData?.projectDate || !penseAjaData?.situationBefore || !penseAjaData?.situationNow) {
    notification.value.showPopup("warning", "Aviso!", "Preencha todos os campos necessários.", 3000)
    return;
  }

  if (!userData) {
    notification.value.showPopup("warning", "Aviso!", "Dados do usuário não encontrados.", 3000)
    return;
  }

  try {
    let turno;
    switch (userData.setor.slice(-1)) {
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

    const response = await commonApi.post(`/pense-aja/${dassOffice}`, {
      registration: matricula,
      userName: userData.nome,
      turno: turno,
      setor: userData.setor,
      gerente: userData.gerente,
      nome: penseAjaData.projectName,
      createDate: penseAjaData.projectDate,
      situationBefore: penseAjaData.situationBefore,
      situationNow: penseAjaData.situationNow,
      perdas: penseAjaData.perdas || [],
      ganhos: penseAjaData.ganhos?.values || [],
      ganhoDetalhes: penseAjaData.ganhos?.justificativa || "",
      areaMelhoria: penseAjaData.setor,
    });

    notification.value.showPopup("success",
      "Sucesso!",
      response?.data?.message || "Pense e Aja cadastrado com sucesso!",
      2000)

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("Erro ao cadastrar pense aja: ", error);

    notification.value.showPopup("error",
      "Error",
      error.response?.data?.message ||
      "Erro ao cadastrar Pense e Aja. Tente novamente mais tarde!",
      3000)
  }
};