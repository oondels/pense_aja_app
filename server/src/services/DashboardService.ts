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

interface DimensionalData {
  manager: Array<{ label: string; count: number }>;
  sector: Array<{ label: string; count: number }>;
  factory: Array<{ label: string; count: number }>;
}

interface IdeaHighlight {
  id: number;
  title: string;
  description: string;
  author: string;
  avatarColor: string;
  date: string;
  status: string;
  category: string;
  sector: string;
  factory: string;
  likes: number;
  comments: number;
}

interface EngagementContributor {
  id: number;
  name: string;
  role: string;
  department: string;
  ideas: number;
  implemented: number;
  avatarColor: string;
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

  static async getDimensionalData(dassOffice: string, startDate?: Date, endDate?: Date): Promise<DimensionalData> {
    const client = await pool.connect();
    
    try {
      // Verificar se a unidade dass é válida
      const validOffices = ['SEST', 'SENAT', 'IEL'];
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

      // Query para dados por gerente
      const managerQuery = `
        SELECT 
          gerente as label,
          COUNT(*) as count
        FROM pense_aja.pense_aja_dass
        WHERE unidade_dass = $1 
          AND excluido = false
          AND gerente IS NOT NULL
          AND gerente != ''
          ${dateFilter}
        GROUP BY gerente
        ORDER BY count DESC
        LIMIT 10
      `;

      // Query para dados por setor
      const sectorQuery = `
        SELECT 
          setor as label,
          COUNT(*) as count
        FROM pense_aja.pense_aja_dass
        WHERE unidade_dass = $1 
          AND excluido = false
          AND setor IS NOT NULL
          AND setor != ''
          ${dateFilter}
        GROUP BY setor
        ORDER BY count DESC
        LIMIT 10
      `;

      // Query para dados por fábrica
      const factoryQuery = `
        SELECT 
          fabrica as label,
          COUNT(*) as count
        FROM pense_aja.pense_aja_dass
        WHERE unidade_dass = $1 
          AND excluido = false
          AND fabrica IS NOT NULL
          AND fabrica != ''
          ${dateFilter}
        GROUP BY fabrica
        ORDER BY count DESC
        LIMIT 10
      `;

      // Executar todas as queries em paralelo
      const [managerResult, sectorResult, factoryResult] = await Promise.all([
        client.query(managerQuery, params),
        client.query(sectorQuery, params),
        client.query(factoryQuery, params)
      ]);

      return {
        manager: managerResult.rows.map(row => ({
          label: row.label || 'Não informado',
          count: parseInt(row.count) || 0
        })),
        sector: sectorResult.rows.map(row => ({
          label: row.label || 'Não informado',
          count: parseInt(row.count) || 0
        })),
        factory: factoryResult.rows.map(row => ({
          label: row.label || 'Não informado',
          count: parseInt(row.count) || 0
        }))
      };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Erro ao buscar dados dimensionais:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados dimensionais");
    } finally {
      client.release();
    }
  }

  static async getIdeaHighlights(dassOffice: string): Promise<IdeaHighlight[]> {
    const client = await pool.connect();
    
    try {
      // Verificar se a unidade dass é válida
      const validOffices = ["SEST", "VDC", "ITB", "VDC-CONF", "STJ"];
      if (!validOffices.includes(dassOffice)) {
        throw new CustomError("Unidade Dass inválida", 400);
      }

      // Buscar as ideias mais relevantes baseadas em valor amortizado e status
      const query = `
        SELECT 
          id,
          nome_projeto as title,
          situacao_atual as description,
          nome as author,
          setor,
          fabrica,
          createdat,
          status_gerente,
          status_analista,
          valor_amortizado,
          CASE 
            WHEN status_gerente = 'APROVADO' AND status_analista = 'APROVADO' THEN 'Aprovada'
            WHEN status_gerente = 'REPROVADO' OR status_analista = 'REPROVADO' THEN 'Rejeitada'
            ELSE 'Pendente'
          END as status
        FROM pense_aja.pense_aja_dass
        WHERE unidade_dass = $1 
          AND excluido = false
          AND nome_projeto IS NOT NULL
          AND situacao_atual IS NOT NULL
        ORDER BY 
          CASE 
            WHEN status_gerente = 'APROVADO' AND status_analista = 'APROVADO' THEN valor_amortizado
            ELSE 0
          END DESC,
          createdat DESC
        LIMIT 6
      `;

      const result = await client.query(query, [dassOffice]);
      
      // Gerar cores de avatar baseadas no nome
      const getAvatarColor = (name: string): string => {
        const colors = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444', '#06B6D4'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
      };

      // Determinar categoria baseada no setor
      const getCategory = (sector: string): string => {
        const sectorLower = sector?.toLowerCase() || '';
        if (sectorLower.includes('prod') || sectorLower.includes('fab')) return 'Produção';
        if (sectorLower.includes('manu') || sectorLower.includes('mant')) return 'Manutenção';
        if (sectorLower.includes('quali')) return 'Qualidade';
        if (sectorLower.includes('log')) return 'Logística';
        if (sectorLower.includes('eng')) return 'Engenharia';
        if (sectorLower.includes('rh') || sectorLower.includes('pessoas')) return 'Desenvolvimento';
        return 'Outros';
      };

      // Simular likes e comments baseados no valor e status
      const getLikesAndComments = (value: number, status: string) => {
        const baseValue = Math.max(value || 0, 1000);
        const statusMultiplier = status === 'Aprovada' ? 1.5 : status === 'Pendente' ? 1.0 : 0.7;
        
        const likes = Math.floor((baseValue / 1000) * statusMultiplier * (Math.random() * 10 + 15));
        const comments = Math.floor(likes * 0.15 * (Math.random() + 0.5));
        
        return { likes: Math.min(likes, 99), comments: Math.min(comments, 25) };
      };

      const highlights: IdeaHighlight[] = result.rows.map((row, index) => {
        const { likes, comments } = getLikesAndComments(row.valor_amortizado, row.status);
        
        return {
          id: row.id,
          title: row.title || 'Projeto sem título',
          description: row.description?.substring(0, 150) + (row.description?.length > 150 ? '...' : '') || 'Sem descrição disponível',
          author: row.author || 'Autor desconhecido',
          avatarColor: getAvatarColor(row.author || 'A'),
          date: new Date(row.createdat).toISOString().split('T')[0],
          status: row.status,
          category: getCategory(row.setor),
          sector: row.setor || 'Não informado',
          factory: row.fabrica || 'Não informado',
          likes,
          comments
        };
      });

      return highlights;
    } catch (error) {
      console.error("Erro ao buscar ideias em destaque:", error);
      throw new CustomError("Erro interno do servidor ao buscar ideias em destaque");
    } finally {
      client.release();
    }
  }

  static async getEngagementData(dassOffice: string, startDate?: Date, endDate?: Date): Promise<EngagementContributor[]> {
    const client = await pool.connect();
    
    try {
      let dateFilter = '';
      const queryParams: any[] = [dassOffice];
      
      if (startDate && endDate) {
        dateFilter = 'AND data_realizada BETWEEN $2 AND $3';
        queryParams.push(startDate, endDate);
      } else if (startDate) {
        dateFilter = 'AND data_realizada >= $2';
        queryParams.push(startDate);
      } else if (endDate) {
        dateFilter = 'AND data_realizada <= $2';
        queryParams.push(endDate);
      }

      
      const query = `
        SELECT 
          nome,
          setor,
          COUNT(*) as total_ideas,
          COUNT(CASE WHEN status_gerente = 'APROVAR' THEN 1 END) as implemented_ideas
        FROM pense_aja.pense_aja_dass 
        WHERE unidade_dass = $1 
          AND excluido = false 
          ${dateFilter}
        GROUP BY nome, setor
        HAVING COUNT(*) > 0
        ORDER BY COUNT(*) DESC, COUNT(CASE WHEN status_gerente = 'APROVAR' THEN 1 END) DESC
        LIMIT 10
      `;

      const result = await client.query(query, queryParams);
      
      // Gerar cores de avatar baseadas no nome
      const getAvatarColor = (name: string): string => {
        const colors = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#F59E0B'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
      };

      // Mapear setores para departamentos mais legíveis
      const getDepartment = (sector: string): string => {
        const sectorLower = sector?.toLowerCase() || '';
        if (sectorLower.includes('prod') || sectorLower.includes('fab')) return 'Produção';
        if (sectorLower.includes('manu') || sectorLower.includes('mant')) return 'Manutenção';
        if (sectorLower.includes('quali')) return 'Qualidade';
        if (sectorLower.includes('log')) return 'Logística';
        if (sectorLower.includes('eng')) return 'Engenharia';
        if (sectorLower.includes('rh') || sectorLower.includes('pessoas')) return 'Recursos Humanos';
        if (sectorLower.includes('admin')) return 'Administrativo';
        if (sectorLower.includes('seg')) return 'Segurança';
        return sector || 'Outros';
      };

      // Gerar cargos fictícios baseados no setor e número de ideias
      const getRole = (sector: string, totalIdeas: number): string => {
        const department = getDepartment(sector);
        const roles: { [key: string]: string[] } = {
          'Produção': ['Operador de Produção', 'Supervisor de Produção', 'Técnico de Produção', 'Coordenador de Produção'],
          'Manutenção': ['Técnico de Manutenção', 'Mecânico Industrial', 'Eletricista Industrial', 'Supervisor de Manutenção'],
          'Qualidade': ['Técnico de Qualidade', 'Analista de Qualidade', 'Inspetor de Qualidade', 'Coordenador de Qualidade'],
          'Logística': ['Analista de Logística', 'Operador de Empilhadeira', 'Conferente', 'Supervisor de Logística'],
          'Engenharia': ['Engenheiro de Processos', 'Técnico em Automação', 'Analista de Processos', 'Engenheiro de Produção'],
          'Recursos Humanos': ['Analista de RH', 'Assistente de RH', 'Coordenador de RH', 'Especialista em Treinamento'],
          'Administrativo': ['Assistente Administrativo', 'Analista Administrativo', 'Coordenador Administrativo', 'Auxiliar Administrativo'],
          'Segurança': ['Técnico de Segurança', 'Engenheiro de Segurança', 'Inspetor de Segurança', 'Coordenador de Segurança']
        };

        const departmentRoles = roles[department] || ['Colaborador', 'Técnico', 'Analista', 'Coordenador'];
        
        // Escolher cargo baseado no número de ideias (mais ideias = cargo mais senior)
        let roleIndex;
        if (totalIdeas >= 15) roleIndex = 3; // Coordenador/Senior
        else if (totalIdeas >= 10) roleIndex = 2; // Analista/Técnico Senior
        else if (totalIdeas >= 5) roleIndex = 1; // Técnico/Analista
        else roleIndex = 0; // Operador/Assistente
        
        return departmentRoles[Math.min(roleIndex, departmentRoles.length - 1)];
      };

      const contributors: EngagementContributor[] = result.rows.map((row, index) => ({
        id: index + 1,
        name: row.nome,
        role: getRole(row.setor, parseInt(row.total_ideas)),
        department: getDepartment(row.setor),
        ideas: parseInt(row.total_ideas),
        implemented: parseInt(row.implemented_ideas),
        avatarColor: getAvatarColor(row.nome)
      }));

      return contributors;
    } catch (error) {
      console.error("Erro ao buscar dados de engajamento:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados de engajamento");
    } finally {
      client.release();
    }
  }
}
