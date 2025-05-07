import { api, commonApi } from "./httpClient"

// TODO: Atualizar coleta de Unidade Dass
export const registerPenseAja = async (penseAjaData, matricula, notification, userData) => {
  let dassOffice = "SEST"
  if (!dassOffice) {
    notification.value.showPopup("warning", "Aviso!", "Unidade do colaborador não encontrada.", 3000)
    return;
  }

  if (!penseAjaData?.projectName || !penseAjaData?.projectDate || !penseAjaData?.situationBefore || !penseAjaData?.situationNow) {
    emit("notify", {
      type: "warning",
      title: "Aviso!",
      message: "Preencha todos os campos necessários.",
      time: 3000
    });
    return;
  }

  if (!userData) {
    emit("notify", {
      type: "warning",
      title: "Aviso!",
      message: "Dados do usuário não encontrados.",
      time: 3000
    });
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

    emit("notify", {
      type: "success",
      title: "Sucesso!",
      message: "Pense e Aja cadastrado com sucesso!",
      time: 3000
    });

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("Erro ao cadastrar pense aja: ", error);

    emit("notify", {
      type: "error",
      title: "Erro!",
      message: error.response?.data?.message ||
        "Erro ao cadastrar Pense e Aja. Tente novamente mais tarde!",
      time: 3000
    });
  }
};