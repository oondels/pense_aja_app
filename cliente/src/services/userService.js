import { api } from './httpClient.js'

export const getUserData = async (registration, userData) => {
  const response = await api.get(`/user/${registration}`, {
    params: { dassOffice: "SEST" },
  });

  userData.value = response.data
}