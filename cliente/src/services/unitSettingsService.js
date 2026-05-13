import { api } from './httpClient.js'

export const unitSettingsService = {
  async getSettings(dassOffice) {
    const response = await api.get(`/unit-settings/${dassOffice}`)
    return response.data
  },

  async updateSettings(dassOffice, payload) {
    const response = await api.put(`/unit-settings/${dassOffice}`, payload)
    return response.data
  },
}
