import { commonApi } from "./httpClient.js";
import {setPenseAjaStatus} from "./penseAjaService.js"

export const reportService = {
  /**
   * Busca dados completos para relatório do dashboard
   * @param {string} dassOffice - Unidade Dass (SEST, SENAT, IEL)
   * @param {string|Date} startDate - Data de início
   * @param {string|Date} endDate - Data de fim
   * @returns {Promise<Object>} Dados completos para relatório
   */
  async getReportData(dassOffice, startDate, endDate) {
    try {
      const params = {
        startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
        endDate: endDate instanceof Date ? endDate.toISOString() : endDate
      };

      const response = await commonApi.get(`/pense-aja/${dassOffice}`, { params });
      if (response.data?.erro) {
        throw new Error(response.data.mensagem || 'Erro ao buscar dados para relatório');
      }

      return response.data;
    } catch (error) {
      console.error('Erro no serviço de relatório:', error);
      throw error;
    }
  },

  /**
   * Busca dados agregados por período para análises
   * @param {string} dassOffice - Unidade Dass
   * @param {string|Date} startDate - Data de início
   * @param {string|Date} endDate - Data de fim
   * @returns {Promise<Object>} Dados agregados
   */
  async getAggregatedData(dassOffice, startDate, endDate) {
    try {
      const penseAjaData = await this.getReportData(dassOffice, startDate, endDate);

      // Agregações personalizadas
      const aggregations = {
        bySetor: {},
        byGerente: {},
        byFabrica: {},
        byTurno: {},
        byStatus: {},
        byMonth: {},
        totalMetrics: {
          total: 0,
          aprovados: 0,
          reprovados: 0,
          pendentes: 0,
          emEspera: 0,
          visto_analista: 0,
          visto_gerente: 0
        }
      };

      penseAjaData.forEach(item => {
        const setor = item.setor || 'Não informado';
        const gerente = item.gerente || 'Não informado';
        const fabrica = item.fabrica || 'Não informado';
        const turno = item.turno || 'Não informado';

        const month = new Date(item.createdat).toISOString().slice(0, 7);

        // Determinar status
        const status = setPenseAjaStatus(item);

        // Agregações
        [setor, gerente, fabrica, turno, status, month].forEach((key, index) => {
          const aggKey = ['bySetor', 'byGerente', 'byFabrica', 'byTurno', 'byStatus', 'byMonth'][index];
          if (!aggregations[aggKey][key]) {
            aggregations[aggKey][key] = { total: 0, aprovados: 0, reprovados: 0, pendentes: 0, emEspera: 0 };
          }
          aggregations[aggKey][key].total++;

          if (status === 'AVALIADO') aggregations[aggKey][key].aprovados++;
          else if (status === 'REPROVADO') aggregations[aggKey][key].reprovados++;
          else if (status === 'EM ESPERA') aggregations[aggKey][key].emEspera++;
          else if (status === 'VISTO PELO ANALISTA') aggregations[aggKey][key].visto_analista++;
          else if (status === 'VISTO PELO GERENTE') aggregations[aggKey][key].visto_gerente++;
          else aggregations[aggKey][key].pendentes++;
        });

        // Métricas totais
        aggregations.totalMetrics.total++;
        if (status === 'AVALIADO') aggregations.totalMetrics.aprovados++;
        else if (status === 'REPROVADO') aggregations.totalMetrics.reprovados++;
        else if (status === 'EM ESPERA') aggregations.totalMetrics.emEspera++;
        else if (status === 'VISTO PELO ANALISTA') aggregations.totalMetrics.visto_analista++;
        else if (status === 'VISTO PELO GERENTE') aggregations.totalMetrics.visto_gerente++;
        else aggregations.totalMetrics.pendentes++;
      });

      return {
        rawData: penseAjaData,
        aggregations
      };
    } catch (error) {
      console.error('Erro ao agregar dados:', error);
      throw error;
    }
  },

  /**
   * Formata dados para exportação em diferentes formatos
   * @param {Object} data - Dados brutos
   * @param {string} format - Formato de exportação ('xlsx', 'csv', 'json')
   * @returns {Object} Dados formatados
   */
  formatDataForExport(data, format = 'xlsx') {
    const formatters = {
      xlsx: this.formatForXLSX,
      csv: this.formatForCSV,
      json: this.formatForJSON
    };

    const formatter = formatters[format] || formatters.xlsx;
    return formatter(data);
  },

  formatForXLSX(data) {
    return {
      sheets: {
        'Dados Completos': data.rawData.map(item => ({
          'ID': item.id,
          'Nome': item.nome,
          'Matrícula': item.matricula,
          'Setor': item.setor,
          'Gerente': item.gerente,
          'Fábrica': item.fabrica,
          'Projeto': item.nome_projeto,
          'Turno': item.turno,
          'Data Criação': new Date(item.criado || item.createdat).toLocaleDateString('pt-BR'),
          'Situação Anterior': item.situacao_anterior,
          'Situação Atual': item.situacao_atual,
          'Status': this.getStatus(item),
          'Gerente Aprovador': item.gerente_aprovador || 'Não avaliado',
          'Analista Avaliador': item.analista_avaliador || 'Não avaliado'
        })),
        'Resumo por Setor': Object.entries(data.aggregations.bySetor).map(([setor, dados]) => ({
          'Setor': setor,
          'Total': dados.total,
          'Aprovados': dados.aprovados,
          'Reprovados': dados.reprovados,
          'Pendentes': dados.pendentes,
          'Em Espera': dados.emEspera,
          'Taxa Aprovação (%)': ((dados.aprovados / dados.total) * 100).toFixed(2)
        }))
      }
    };
  },

  getStatus(item) {
    if (item.status_gerente === "REPROVADO" || item.status_analista === "REPROVADO") {
      return "REPROVADO";
    } else if (item.em_espera === "1") {
      return "EM ESPERA";
    } else if (!item.gerente_aprovador && !item.analista_avaliador) {
      return "SEM ANÁLISE";
    } else if (item.gerente_aprovador && !item.analista_avaliador) {
      return "AGUARDANDO ANÁLISE";
    } else if (item.status_gerente === "APROVADO" && item.status_analista === "APROVADO") {
      return "APROVADO";
    } else {
      return "EM ANÁLISE";
    }
  }
};
