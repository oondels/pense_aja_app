import { api, commonApi } from './httpClient.js'

export const ideaService = {
  async listIdeas(dassOffice, filters = {}) {
    const response = await commonApi.get(`/pense-aja/${dassOffice}`, {
      params: filters,
    })
    return response.data
  },

  async getIdea(dassOffice, id) {
    const response = await commonApi.get(`/pense-aja/${dassOffice}/${id}`)
    return response.data
  },

  async getIdeaAudit(dassOffice, id) {
    const response = await api.get(`/pense-aja/${dassOffice}/${id}/audit`)
    return response.data
  },

  async evaluateIdea(id, payload) {
    const response = await api.put(`/pense-aja/avaliar/${id}`, payload)
    return response.data
  },
}
