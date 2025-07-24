import { commonApi } from "./httpClient.js";

export const dashboardService = {
  /**
   * Busca dados do resumo do dashboard
   * @param {string} dassOffice - Unidade Dass (SEST, SENAT, IEL)
   * @param {string|Date} startDate - Data de início (opcional)
   * @param {string|Date} endDate - Data de fim (opcional)
   * @returns {Promise<Object>} Dados do resumo
   */
  async getSummaryData(dassOffice, startDate = null, endDate = null) {
    try {
      const params = {};

      if (startDate) {
        params.startDate = startDate instanceof Date ? startDate.toISOString() : startDate;
      }

      if (endDate) {
        params.endDate = endDate instanceof Date ? endDate.toISOString() : endDate;
      }

      const response = await commonApi.get(`/dashboard/summary/${dassOffice}`, { params });

      if (response.data.erro) {
        throw new Error(response.data.mensagem || 'Erro ao buscar dados do dashboard');
      }

      return response.data.dados;
    } catch (error) {
      console.error('Erro no serviço do dashboard:', error);
      throw error;
    }
  },

  /**
   * Busca dados mensais do dashboard
   * @param {string} dassOffice - Unidade Dass
   * @param {string|Date} startDate - Data de início (opcional)
   * @param {string|Date} endDate - Data de fim (opcional)
   * @returns {Promise<Array>} Dados mensais
   */
  async getMonthlyData(dassOffice, startDate = null, endDate = null) {
    try {
      const params = {};

      // if (startDate) {
      //   params.startDate = startDate instanceof Date ? startDate.toISOString() : startDate;
      // }

      // if (endDate) {
      //   params.endDate = endDate instanceof Date ? endDate.toISOString() : endDate;
      // }

      const response = await commonApi.get(`/dashboard/monthly/${dassOffice}`, { params });

      if (response.data.erro) {
        throw new Error(response.data.mensagem || 'Erro ao buscar dados mensais');
      }

      return response.data.dados;
    } catch (error) {
      console.error('Erro no serviço de dados mensais:', error);
      throw error;
    }
  },

  async getDimensionalData(dassOffice, startDate = null, endDate = null) {
    const params = {};
    if (startDate) {
      params.startDate = startDate instanceof Date ? startDate.toISOString() : startDate;
    }

    if (endDate) {
      params.endDate = endDate instanceof Date ? endDate.toISOString() : endDate;
    }

    const response = await commonApi.get(`/dashboard/dimensional/${dassOffice}`, { params });
    return response.data.dados
  },

  /**
   * Busca ideias em destaque
   * @param {string} dassOffice - Unidade Dass
   * @returns {Promise<Array>} Ideias em destaque
   */
  async getIdeaHighlights(dassOffice) {
    try {
      const response = await commonApi.get(`/dashboard/idea-highlights/${dassOffice}`);

      if (response.data.erro) {
        throw new Error(response.data.mensagem || 'Erro ao buscar ideias em destaque');
      }

      return response.data.dados;
    } catch (error) {
      console.error('Erro no serviço de ideias em destaque:', error);
      throw error;
    }
  }
};
