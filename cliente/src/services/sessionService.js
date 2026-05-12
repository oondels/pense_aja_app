import { api } from './httpClient.js'

export const getSessionContext = async (dassOffice) => {
  const response = await api.get(`/user/session-context/${dassOffice}`)
  return response.data
}
