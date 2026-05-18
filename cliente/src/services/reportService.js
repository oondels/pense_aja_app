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
          else if (status === 'VISTO PELA MELHORIA CONTINUA') aggregations[aggKey][key].visto_analista++;
          else if (status === 'VISTO PELO GERENTE') aggregations[aggKey][key].visto_gerente++;
          else aggregations[aggKey][key].pendentes++;
        });

        // Métricas totais
        aggregations.totalMetrics.total++;
        if (status === 'AVALIADO') aggregations.totalMetrics.aprovados++;
        else if (status === 'REPROVADO') aggregations.totalMetrics.reprovados++;
        else if (status === 'EM ESPERA') aggregations.totalMetrics.emEspera++;
        else if (status === 'VISTO PELA MELHORIA CONTINUA') aggregations.totalMetrics.visto_analista++;
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

  formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR').format(date);
  },

  formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  },

  formatPercent(value) {
    return `${Number(value || 0).toFixed(2)}%`;
  },

  formatGains(value) {
    if (!value) return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  },

  buildReportFileName(report) {
    const metadata = report?.metadata || {};
    const unit = metadata.dassOffice || 'unidade';
    const start = metadata.startDate ? this.formatDate(metadata.startDate).replace(/\//g, '-') : 'inicio';
    const end = metadata.endDate ? this.formatDate(metadata.endDate).replace(/\//g, '-') : 'fim';
    return `relatorio-pense-aja-${unit}-${start}_a_${end}.xlsx`;
  },

  appendJsonSheet(XLSX, workBook, sheetName, rows, widths = []) {
    const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
    if (widths.length) {
      sheet['!cols'] = widths.map((width) => ({ wch: width }));
    }
    XLSX.utils.book_append_sheet(workBook, sheet, sheetName);
  },

  buildDashboardWorkbook(XLSX, report) {
    const workBook = XLSX.utils.book_new();
    const metadata = report.metadata || {};
    const kpis = report.kpis || {};
    const evaluation = report.evaluationMetrics || {};
    const dimensions = report.dimensions || {};
    const marketplace = report.marketplace || {};

    this.appendJsonSheet(XLSX, workBook, 'Resumo', [
      { Métrica: 'Unidade', Valor: metadata.dassOffice || '' },
      { Métrica: 'Período inicial', Valor: this.formatDate(metadata.startDate) },
      { Métrica: 'Período final', Valor: this.formatDate(metadata.endDate) },
      { Métrica: 'Gerado em', Valor: this.formatDateTime(metadata.generatedAt) },
      { Métrica: 'Total de ideias', Valor: kpis.totalIdeas || 0 },
      { Métrica: 'Ideias implementadas', Valor: kpis.implementedIdeas || 0 },
      { Métrica: 'Ideias pendentes', Valor: kpis.pendingIdeas || 0 },
      { Métrica: 'Ideias reprovadas', Valor: kpis.rejectedIdeas || 0 },
      { Métrica: 'Ideias em espera', Valor: kpis.inAnalysis || 0 },
      { Métrica: 'Taxa de implementação', Valor: this.formatPercent(kpis.implementationRate) },
      { Métrica: 'Pontos gerados', Valor: kpis.totalPointsEarned || 0 },
      { Métrica: 'Pontos resgatados', Valor: kpis.totalPointsRedeemed || 0 },
      { Métrica: 'Pontos reservados', Valor: kpis.totalPointsReserved || 0 },
      { Métrica: 'Resgates pendentes', Valor: kpis.marketplacePending || 0 },
      { Métrica: 'Resgates concluídos', Valor: kpis.marketplaceCompleted || 0 },
    ], [32, 24]);

    const evaluationSummaryRows = [
      { Grupo: 'Admin', ...(evaluation.adminReview || {}) },
      { Grupo: 'Avaliador de ideias', ...(evaluation.ideaEvaluatorReview || {}) },
    ].map(({ Grupo, totalReviewed, approved, rejected, pending, waiting, reviewRate, approvalRate }) => ({
      Grupo,
      'Total avaliadas': totalReviewed || 0,
      Aprovadas: approved || 0,
      Reprovadas: rejected || 0,
      Pendentes: pending || 0,
      'Em espera': waiting || 0,
      'Taxa de avaliação': this.formatPercent(reviewRate),
      'Taxa de aprovação': this.formatPercent(approvalRate),
    }));
    this.appendJsonSheet(XLSX, workBook, 'Resumo Avaliações', evaluationSummaryRows);

    const rankingRows = (rows = []) => rows.map((item) => ({
      Avaliador: item.evaluatorName,
      'Total avaliadas': item.totalReviewed || 0,
      Aprovadas: item.approved || 0,
      Reprovadas: item.rejected || 0,
      Pendentes: item.pending || 0,
      'Taxa de aprovação': this.formatPercent(item.approvalRate),
    }));
    this.appendJsonSheet(XLSX, workBook, 'Avaliações Admin', rankingRows(evaluation.adminReview?.ranking));
    this.appendJsonSheet(XLSX, workBook, 'Avaliações Ideias', rankingRows(evaluation.ideaEvaluatorReview?.ranking));

    this.appendJsonSheet(XLSX, workBook, 'Ideias', (report.ideas || []).map((idea) => ({
      ID: idea.id,
      Matrícula: idea.registration,
      Colaborador: idea.collaboratorName,
      Setor: idea.sector,
      Gerente: idea.manager,
      Fábrica: idea.factory,
      Turno: idea.shift,
      Projeto: idea.projectName,
      'Data criação': this.formatDate(idea.createdAt),
      'Data realizada': this.formatDate(idea.realizedAt),
      Status: idea.canonicalStatus,
      Classificação: idea.classification || '',
      Pontos: idea.points || 0,
      'Situação anterior': idea.previousSituation,
      'Situação atual': idea.currentSituation,
      Ganhos: this.formatGains(idea.gains),
      'Admin Avaliador': idea.adminEvaluator || '',
      'Status Admin': idea.adminStatus || '',
      'Data Avaliação Admin': this.formatDateTime(idea.adminReviewedAt),
      'Justificativa Admin': idea.adminJustification || '',
      'Avaliador de Ideias': idea.ideaEvaluator || '',
      'Status Avaliador': idea.ideaEvaluatorStatus || '',
      'Data Avaliação Avaliador': this.formatDateTime(idea.ideaEvaluatorReviewedAt),
      'Justificativa Avaliador': idea.ideaEvaluatorJustification || '',
    })));

    const dimensionRows = (rows = [], labelName) => rows.map((row) => ({
      [labelName]: row.label,
      Total: row.total || 0,
      Implementadas: row.implemented || 0,
      Reprovadas: row.rejected || 0,
      Pendentes: row.pending || 0,
      'Em espera': row.waiting || 0,
      'Avaliações Admin': row.adminReviewed || 0,
      'Avaliações Ideias': row.ideaEvaluatorReviewed || 0,
      'Taxa implementação': this.formatPercent(row.implementationRate),
    }));
    this.appendJsonSheet(XLSX, workBook, 'Por Setor', dimensionRows(dimensions.sector, 'Setor'));
    this.appendJsonSheet(XLSX, workBook, 'Por Gerente', dimensionRows(dimensions.manager, 'Gerente'));
    this.appendJsonSheet(XLSX, workBook, 'Por Fábrica', dimensionRows(dimensions.factory, 'Fábrica'));
    this.appendJsonSheet(XLSX, workBook, 'Por Turno', dimensionRows(dimensions.shift, 'Turno'));
    this.appendJsonSheet(XLSX, workBook, 'Por Status', dimensionRows(dimensions.status, 'Status'));

    this.appendJsonSheet(XLSX, workBook, 'Mensal', (report.monthly || []).map((row) => ({
      Mês: row.month,
      Total: row.total || 0,
      Implementadas: row.implemented || 0,
      Reprovadas: row.rejected || 0,
      Pendentes: row.pending || 0,
      'Em espera': row.waiting || 0,
      'Avaliações Admin': row.adminReviewed || 0,
      'Avaliações Ideias': row.ideaEvaluatorReviewed || 0,
      Pontos: row.points || 0,
      'Taxa implementação': this.formatPercent(row.implementationRate),
    })));

    this.appendJsonSheet(XLSX, workBook, 'Marketplace', [
      { Métrica: 'Pendentes', Valor: marketplace.pending || 0 },
      { Métrica: 'Concluídos', Valor: marketplace.completed || 0 },
      { Métrica: 'Estornados', Valor: marketplace.refunded || 0 },
      { Métrica: 'Rejeitados', Valor: marketplace.rejected || 0 },
      { Métrica: 'Cancelados', Valor: marketplace.cancelled || 0 },
      { Métrica: 'Pontos consumidos', Valor: marketplace.pointsCommitted || 0 },
      { Métrica: 'Pontos reservados', Valor: marketplace.pointsReserved || 0 },
      { Métrica: 'Pontos estornados', Valor: marketplace.pointsRefunded || 0 },
    ]);

    return workBook;
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
          'Analista Avaliador': item.analista_avaliador || 'Não avaliado',
          'Pontuação': item.pontuacao ?? ''
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
