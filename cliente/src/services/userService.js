import { commonApi, api } from './httpClient.js'

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

export const setUserRole = (user) => {
  if (!user.matricula) {
    return "common-user";
  }
  if (user.funcao?.toLowerCase().includes("analista")) {
    return "analista";
  }
  if (user.funcao?.toLowerCase().includes("gerente")) {
    return "gerente";
  }
  if (user.funcao?.toLowerCase().includes("automacao")) {
    return "automacao";
  }
};

export const getUserPermission = () => {
  const matricula = sessionStorage.getItem("matricula");
  const funcao = sessionStorage.getItem("funcao");
  if (!matricula) {
    return false;
  }
  if (
    funcao?.toLowerCase().includes("analista") ||
    funcao?.toLowerCase().includes("gerente") ||
    funcao?.toLowerCase().includes("automacao")
  ) {
    return true;
  }
};

export const formateName = (name) => {
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0]} ${names[names.length - 1]}`;
  }
  return names[0];
};

export const updateUserData = async (userData, loading, notification, formData, dassOffice) => {
  let message = "";
  loading.value = true;
  try {
    const response = await api.put(`/user/${userData?.matricula}`, {
      formData: formData,
      dassOffice
     });

    message = response.data?.message || "Sucesso ao atualiazar configurações do usuário.";
    if (!formData.authorized_notifications_apps.includes('pense_aja')) {
      sessionStorage.setItem("notification", "false");
    }

    notification.value.showPopup("success", "Sucesso!", message, 1500);
    setTimeout(() => {
      window.location.reload()
    }, 1600);
  } catch (error) {
    console.error("Erro ao atualizar dados do usuario: ", error);
    message = error.response?.data?.message || "Erro ao atualizar configurações do usuário.";
    notification.value.showPopup("error", "Erro", message, 4000);
    error = true;
  } finally {
    loading.value = false;
  }
}
