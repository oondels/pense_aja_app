import { api } from './httpClient.js'

export const rbacService = {
  async listRoles(dassOffice) {
    const response = await api.get('/user/rbac/roles', {
      params: { dassOffice },
    })
    return response.data
  },

  async listAssignments(filters = {}) {
    const response = await api.get('/user/rbac/assignments', {
      params: filters,
    })
    return response.data
  },

  async createAssignment(payload) {
    const response = await api.post('/user/rbac/assignments', payload)
    return response.data
  },

  async updateAssignment(id, payload) {
    const response = await api.put(`/user/rbac/assignments/${id}`, payload)
    return response.data
  },

  async deleteAssignment(id, dassOffice) {
    await api.delete(`/user/rbac/assignments/${id}`, {
      params: { dassOffice },
    })
  },
}
