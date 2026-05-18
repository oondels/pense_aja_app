import { api, commonApi } from './httpClient.js'

export const marketplaceService = {
  async listCatalog(dassOffice) {
    const response = await commonApi.get(`/marketplace/catalog/${dassOffice}`)
    return response.data
  },

  async upsertCatalog(dassOffice, items) {
    const response = await api.put(`/marketplace/catalog/${dassOffice}`, items)
    return response.data
  },

  async createRequest(payload) {
    const response = await api.post('/marketplace/requests', payload)
    return response.data
  },

  async listRequests(dassOffice, params = {}) {
    const response = await api.get('/marketplace/requests', {
      params: { dassOffice, ...params },
    })
    return response.data
  },

  async listMyRequests(dassOffice, params = {}) {
    const response = await api.get('/marketplace/requests/me', {
      params: { dassOffice, ...params },
    })
    return response.data
  },

  async listPublicRequests(params = {}) {
    const response = await commonApi.get('/marketplace/requests/public', {
      params,
    })
    return response.data
  },

  async approveRequest(id, payload) {
    const response = await api.put(`/marketplace/requests/${id}/approve`, payload)
    return response.data
  },

  async rejectRequest(id, payload) {
    const response = await api.put(`/marketplace/requests/${id}/reject`, payload)
    return response.data
  },

  async refundRequest(id, payload) {
    const response = await api.put(`/marketplace/requests/${id}/refund`, payload)
    return response.data
  },
}
