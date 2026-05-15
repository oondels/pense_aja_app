import { commonApi, api } from './httpClient.js'
import { hasAnyPermission, hasPermission } from './permissionService.js'

export const getUserData = async (registration, userData, loading = null, emit = null) => {
  const dassOffice = localStorage.getItem("unidadeDass");
  if (loading) loading.value = true

  let message = "Contate a equipe de automação."
  try {
    const response = await commonApi.get(`/user/${registration}`, {
      params: { dassOffice },
    });

    userData.value = response.data    
  } catch (error) {
    console.error("Erro ao buscar dados do colaborador: ", error);
    if (emit) {
      emit("notify", {
        type: "error",
        title: "Error",
        message: error.response?.data.message ?? message,
        time: 3000
      });
    }
  } finally {
    if (loading) loading.value = false
  }
}

export const setUserRole = (user) => {
  const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");
  if (permissions.includes("rbac.manage")) return "automacao";
  if (permissions.includes("idea.exclude")) return "gerente";
  if (permissions.includes("idea.evaluate")) return "analista";
  return user.matricula ? "common-user" : "anonymous";
};

export const getUserPermission = () => {
  const matricula = sessionStorage.getItem("matricula");
  if (!matricula) {
    return false;
  }
  return hasAnyPermission([
    "idea.evaluate",
    "idea.exclude",
    "catalog.manage",
    "marketplace.request.approve",
    "reward.legacy.redeem",
  ]);
};

export const can = (permission) => hasPermission(permission);
export const canAny = (permissions) => hasAnyPermission(permissions);

export const getUserPointsHistory = async (registration, dassOffice) => {
  const response = await api.get(`/user/${registration}/points-history`, {
    params: { dassOffice },
  });
  return response.data;
};

export const createUserPointsAdjustment = async (registration, payload) => {
  const response = await api.post(`/user/${registration}/points-adjustments`, payload);
  return response.data;
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
