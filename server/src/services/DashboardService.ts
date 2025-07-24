import pool from "../config/db";
import { CustomError } from "../types/CustomError";

interface SummaryData {
  totalIdeas: number;
  implementedIdeas: number;
  pendingIdeas: number;
  rejectedIdeas: number;
  approvedByManager: number;
  inAnalysis: number;
  totalValue: number;
  avgValue: number;
}

interface MonthlyData {
  month: string;
  count: number;
  value: number;
}

interface PeriodFilter {
  start?: Date;
  end?: Date;
}

export class DashboardService {
  static async getSummaryData(dassOffice: string, startDate?: Date, endDate?: Date): Promise<SummaryData> {
    const client = await pool.connect();
    
    try {
      // Verificar se a unidade dass é válida
      const validOffices = ["SEST", "VDC", "ITB", "VDC-CONF", "STJ"];
      if (!validOffices.includes(dassOffice)) {
        throw new CustomError("Unidade Dass inválida", 400);
      }

      // Construir filtros de data
      let dateFilter = '';
      const params: any[] = [dassOffice];
      
      if (startDate && endDate) {
        dateFilter = ' AND createdat BETWEEN $2 AND $3';
        params.push(startDate.toISOString(), endDate.toISOString());
      } else if (startDate) {
        dateFilter = ' AND createdat >= $2';
        params.push(startDate.toISOString());
      } else if (endDate) {
        dateFilter = ' AND createdat <= $2';
        params.push(endDate.toISOString());
      }

      const query = `
        SELECT 
          COUNT(*) as total_ideas,
          COUNT(CASE WHEN status_analista = 'APROVADO' THEN 1 END) as implemented_ideas,
          COUNT(CASE WHEN status_gerente IS NULL OR status_analista IS NULL THEN 1 END) as pending_ideas,
          COUNT(CASE WHEN status_gerente = 'REPROVADO' OR status_analista = 'REPROVADO' THEN 1 END) as rejected_ideas,
          COUNT(CASE WHEN status_gerente = 'APROVADO' THEN 1 END) as approved_by_manager,
          COUNT(CASE WHEN status_gerente = 'APROVADO' AND status_analista IS NULL THEN 1 END) as in_analysis,
          COALESCE(SUM(valor_amortizado), 0) as total_value,
          COALESCE(AVG(valor_amortizado), 0) as avg_value
        FROM pense_aja.pense_aja_dass
        WHERE unidade_dass = $1 
          AND excluido = false
          ${dateFilter}
      `;

      const result = await client.query(query, params);
      
      if (result.rows.length === 0) {
        return {
          totalIdeas: 0,
          implementedIdeas: 0,
          pendingIdeas: 0,
          rejectedIdeas: 0,
          approvedByManager: 0,
          inAnalysis: 0,
          totalValue: 0,
          avgValue: 0
        };
      }

      const data = result.rows[0];
      
      return {
        totalIdeas: parseInt(data.total_ideas) || 0,
        implementedIdeas: parseInt(data.implemented_ideas) || 0,
        pendingIdeas: parseInt(data.pending_ideas) || 0,
        rejectedIdeas: parseInt(data.rejected_ideas) || 0,
        approvedByManager: parseInt(data.approved_by_manager) || 0,
        inAnalysis: parseInt(data.in_analysis) || 0,
        totalValue: parseFloat(data.total_value) || 0,
        avgValue: parseFloat(data.avg_value) || 0
      };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Erro ao buscar dados do dashboard:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados do dashboard");
    } finally {
      client.release();
    }
  }

  static async getMonthlyData(dassOffice: string, startDate?: Date, endDate?: Date): Promise<MonthlyData[]> {
    const client = await pool.connect();
    
    try {
      // Verificar se a unidade dass é válida
      const validOffices = ["SEST", "VDC", "ITB", "VDC-CONF", "STJ"];
      if (!validOffices.includes(dassOffice)) {
        throw new CustomError("Unidade Dass inválida", 400);
      }

      // Construir filtros de data
      let dateFilter = '';
      const params: any[] = [dassOffice];
      
      // if (startDate && endDate) {
      //   dateFilter = ' AND createdat BETWEEN $2 AND $3';
      //   params.push(startDate.toISOString(), endDate.toISOString());
      // } else if (startDate) {
      //   dateFilter = ' AND createdat >= $2';
      //   params.push(startDate.toISOString());
      // } else if (endDate) {
      //   dateFilter = ' AND createdat <= $2';
      //   params.push(endDate.toISOString());
      // }
      const query = `
        SELECT 
          TO_CHAR(createdat, 'YYYY-MM') as month_year,
          TO_CHAR(createdat, 'Mon') as month_name,
          COUNT(*) as count,
          COALESCE(SUM(valor_amortizado), 0) as total_value
        FROM pense_aja.pense_aja_dass
        WHERE unidade_dass = $1 
          AND excluido = false
          AND createdat >= DATE_TRUNC('year', CURRENT_DATE)
          AND createdat <= CURRENT_DATE
        GROUP BY TO_CHAR(createdat, 'YYYY-MM'), TO_CHAR(createdat, 'Mon'), EXTRACT(MONTH FROM createdat)
        ORDER BY TO_CHAR(createdat, 'YYYY-MM')
      `;

      const result = await client.query(query, params);
      
      if (result.rows.length === 0) {
        return [];
      }

      // Mapear os nomes dos meses para português
      const monthsMap: { [key: string]: string } = {
        'Jan': 'Jan',
        'Feb': 'Fev',
        'Mar': 'Mar',
        'Apr': 'Abr',
        'May': 'Mai',
        'Jun': 'Jun',
        'Jul': 'Jul',
        'Aug': 'Ago',
        'Sep': 'Set',
        'Oct': 'Out',
        'Nov': 'Nov',
        'Dec': 'Dez'
      };

      return result.rows.map(row => ({
        month: monthsMap[row.month_name] || row.month_name,
        count: parseInt(row.count) || 0,
        value: parseFloat(row.total_value) || 0
      }));

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Erro ao buscar dados mensais:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados mensais");
    } finally {
      client.release();
    }
  }
}
