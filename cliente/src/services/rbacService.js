import { api } from './httpClient.js'

export const rbacService = {
  async listRoles(dassOffice) {
    try {
      const response = await api.get('/user/rbac/roles', {
        params: { dassOffice },
      })

      return response.data
    } catch (error) {
      console.error("Erro ao listar papeis RBAC: ", error);
      throw error;
    }
  },

  async listAssignments(filters = {}) {
    try {
      const response = await api.get('/user/rbac/assignments', {
        params: filters,
      })
      return response.data
    } catch (error) {
      console.error("Erro ao listar assignments RBAC: ", error);
      throw error;
    }
  },

  async createAssignment(payload) {
    try {
      const response = await api.post('/user/rbac/assignments', payload)
      return response.data
    } catch (error) {
      console.error("Erro ao criar papel RBAC: ", error);
      throw error;
    }
  },

  async updateAssignment(id, payload) {
    try {
      const response = await api.put(`/user/rbac/assignments/${id}`, payload)
      return response.data
    } catch (error) {
      console.error("Erro ao atualizar papel RBAC: ", error);
      throw error;
    }
  },

  async deleteAssignment(id, dassOffice) {
    try {
      await api.delete(`/user/rbac/assignments/${id}`)
    } catch (error) {
      console.error("Erro ao deletar papel RBAC: ", error);
      throw error;
    }
  },
}
