import { SelectQueryBuilder } from "typeorm";
import { initializeDatabase } from "../config/database";
import PenseAjaDassEntity from "../models/PenseAjaDass";
import { CustomError } from "../types/CustomError";
import {
  DashboardDimensionalData,
  DashboardEngagementContributor,
  DashboardIdeaHighlight,
  DashboardMonthlyData,
  DashboardSummaryData,
} from "../types/contracts";

const validOffices = ["SEST", "VDC", "ITB", "VDC-CONF", "STJ"];

const validateDassOffice = (dassOffice: string) => {
  if (!validOffices.includes(dassOffice)) {
    throw new CustomError("Unidade Dass inválida", 400);
  }
};

const applyDateFilter = (
  qb: SelectQueryBuilder<object>,
  alias: string,
  column: string,
  startDate?: Date,
  endDate?: Date
) => {
  if (startDate && endDate) {
    qb.andWhere(`${alias}.${column} BETWEEN :startDate AND :endDate`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return;
  }

  if (startDate) {
    qb.andWhere(`${alias}.${column} >= :startDate`, {
      startDate: startDate.toISOString(),
    });
  }

  if (endDate) {
    qb.andWhere(`${alias}.${column} <= :endDate`, {
      endDate: endDate.toISOString(),
    });
  }
};

const approvedExpression =
  "idea.status_gerente = 'approve' AND idea.status_analista = 'approve'";
const rejectedExpression =
  "idea.status_gerente = 'reprove' OR idea.status_analista = 'reprove'";
const pendingExpression = `NOT (${approvedExpression}) AND NOT (${rejectedExpression})`;

export class DashboardService {
  static async getSummaryData(
    dassOffice: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardSummaryData> {
    try {
      validateDassOffice(dassOffice);

      const dataSource = await initializeDatabase();
      const result = dataSource
        .getRepository(PenseAjaDassEntity)
        .createQueryBuilder("idea")
        .select("COUNT(*)", "total_ideas")
        .addSelect(
          `COUNT(CASE WHEN ${approvedExpression} THEN 1 END)`,
          "implemented_ideas"
        )
        .addSelect(
          `COUNT(CASE WHEN ${pendingExpression} THEN 1 END)`,
          "pending_ideas"
        )
        .addSelect(
          `COUNT(CASE WHEN ${rejectedExpression} THEN 1 END)`,
          "rejected_ideas"
        )
        .addSelect(
          "COUNT(CASE WHEN idea.status_gerente = 'approve' THEN 1 END)",
          "approved_by_manager"
        )
        .addSelect(
          "COUNT(CASE WHEN idea.em_espera = '1' THEN 1 END)",
          "in_analysis"
        )
        .addSelect("COALESCE(SUM(idea.valor_amortizado), 0)", "total_value")
        .addSelect("COALESCE(AVG(idea.valor_amortizado), 0)", "avg_value")
        .where("idea.unidade_dass = :dassOffice", { dassOffice })
        .andWhere("idea.excluido = false");

      applyDateFilter(result, "idea", "createdat", startDate, endDate);

      const [data, ledgerRows, marketplaceRows] = await Promise.all([
        result.getRawOne<{
        total_ideas?: string;
        implemented_ideas?: string;
        pending_ideas?: string;
        rejected_ideas?: string;
        approved_by_manager?: string;
        in_analysis?: string;
        total_value?: string;
        avg_value?: string;
        }>(),
        dataSource.query(
          `
            SELECT
              COALESCE(SUM(total_earned), 0) AS total_earned,
              COALESCE(SUM(total_committed), 0) AS total_committed,
              COALESCE(SUM(total_refunded), 0) AS total_refunded,
              COALESCE(SUM(total_reserved), 0) AS total_reserved
            FROM pense_aja.points_balance_projection
            WHERE unidade_dass = $1
          `,
          [dassOffice]
        ) as Promise<Array<{
          total_earned: string;
          total_committed: string;
          total_refunded: string;
          total_reserved: string;
        }>>,
        dataSource.query(
          `
            SELECT
              COUNT(*) FILTER (WHERE request_status IN ('pending_approval', 'approved', 'fulfillment_in_progress')) AS pending,
              COUNT(*) FILTER (WHERE request_status = 'completed') AS completed
            FROM pense_aja.marketplace_redemption_requests
            WHERE unidade_dass = $1
          `,
          [dassOffice]
        ) as Promise<Array<{ pending: string; completed: string }>>,
      ]);

      const ledger = ledgerRows[0] ?? {
        total_earned: "0",
        total_committed: "0",
        total_refunded: "0",
        total_reserved: "0",
      };
      const marketplace = marketplaceRows[0] ?? { pending: "0", completed: "0" };

      return {
        totalIdeas: Number(data?.total_ideas) || 0,
        implementedIdeas: Number(data?.implemented_ideas) || 0,
        pendingIdeas: Number(data?.pending_ideas) || 0,
        rejectedIdeas: Number(data?.rejected_ideas) || 0,
        approvedByManager: Number(data?.approved_by_manager) || 0,
        inAnalysis: Number(data?.in_analysis) || 0,
        totalValue: Number(data?.total_value) || 0,
        avgValue: Number(data?.avg_value) || 0,
        totalPointsEarned: Number(ledger.total_earned) || 0,
        totalPointsRedeemed:
          (Number(ledger.total_committed) || 0) -
          (Number(ledger.total_refunded) || 0),
        totalPointsReserved: Number(ledger.total_reserved) || 0,
        marketplacePending: Number(marketplace.pending) || 0,
        marketplaceCompleted: Number(marketplace.completed) || 0,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Erro ao buscar dados do dashboard:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados do dashboard");
    }
  }

  static async getMonthlyData(
    dassOffice: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardMonthlyData[]> {
    try {
      validateDassOffice(dassOffice);

      const dataSource = await initializeDatabase();
      const result = dataSource
        .getRepository(PenseAjaDassEntity)
        .createQueryBuilder("idea")
        .select("TO_CHAR(idea.createdat, 'YYYY-MM')", "month_year")
        .addSelect("TO_CHAR(idea.createdat, 'Mon')", "month_name")
        .addSelect("COUNT(*)", "count")
        .addSelect(
          `COUNT(*) FILTER (WHERE ${approvedExpression})`,
          "total_aprovados"
        )
        .where("idea.unidade_dass = :dassOffice", { dassOffice })
        .andWhere("idea.excluido = false");

      applyDateFilter(result, "idea", "createdat", startDate, endDate);

      const rows = await result
        .groupBy("TO_CHAR(idea.createdat, 'YYYY-MM')")
        .addGroupBy("TO_CHAR(idea.createdat, 'Mon')")
        .addGroupBy("EXTRACT(MONTH FROM idea.createdat)")
        .orderBy("TO_CHAR(idea.createdat, 'YYYY-MM')")
        .getRawMany<{
          month_name: string;
          count: string;
          total_aprovados: string;
        }>();

      const monthsMap: Record<string, string> = {
        Jan: "Jan",
        Feb: "Fev",
        Mar: "Mar",
        Apr: "Abr",
        May: "Mai",
        Jun: "Jun",
        Jul: "Jul",
        Aug: "Ago",
        Sep: "Set",
        Oct: "Out",
        Nov: "Nov",
        Dec: "Dez",
      };

      return rows.map((row) => ({
        month: monthsMap[row.month_name] || row.month_name,
        count: Number(row.count) || 0,
        value: Number(row.total_aprovados) || 0,
      }));
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Erro ao buscar dados mensais:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados mensais");
    }
  }

  static async getDimensionalData(
    dassOffice: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardDimensionalData> {
    try {
      validateDassOffice(dassOffice);

      const dataSource = await initializeDatabase();
      const repository = dataSource.getRepository(PenseAjaDassEntity);

      const buildDimensionQuery = (column: "gerente" | "setor" | "fabrica") => {
        const query = repository
          .createQueryBuilder("idea")
          .select(`idea.${column}`, "label")
          .addSelect("COUNT(*)", "count")
          .where("idea.unidade_dass = :dassOffice", { dassOffice })
          .andWhere("idea.excluido = false")
          .andWhere(`idea.${column} IS NOT NULL`)
          .andWhere(`idea.${column} != ''`);

        applyDateFilter(query, "idea", "createdat", startDate, endDate);

        return query
          .groupBy(`idea.${column}`)
          .orderBy("count", "DESC")
          .limit(10)
          .getRawMany<{ label: string | null; count: string }>();
      };

      const [managerRows, sectorRows, factoryRows] = await Promise.all([
        buildDimensionQuery("gerente"),
        buildDimensionQuery("setor"),
        buildDimensionQuery("fabrica"),
      ]);

      return {
        manager: managerRows.map((row) => ({
          label: row.label || "Não informado",
          count: Number(row.count) || 0,
        })),
        sector: sectorRows.map((row) => ({
          label: row.label || "Não informado",
          count: Number(row.count) || 0,
        })),
        factory: factoryRows.map((row) => ({
          label: row.label || "Não informado",
          count: Number(row.count) || 0,
        })),
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Erro ao buscar dados dimensionais:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados dimensionais");
    }
  }

  static async getIdeaHighlights(
    dassOffice: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardIdeaHighlight[]> {
    try {
      validateDassOffice(dassOffice);

      const dataSource = await initializeDatabase();
      const rows = await dataSource
        .getRepository(PenseAjaDassEntity)
        .createQueryBuilder("idea")
        .select("idea.id", "id")
        .addSelect("idea.nome_projeto", "title")
        .addSelect("idea.situacao_atual", "description")
        .addSelect("idea.nome", "author")
        .addSelect("idea.setor", "setor")
        .addSelect("idea.fabrica", "fabrica")
        .addSelect("idea.createdat", "createdat")
        .addSelect("idea.valor_amortizado", "valor_amortizado")
        .addSelect(
          `
            CASE
              WHEN ${approvedExpression} THEN 'Aprovada'
              WHEN ${rejectedExpression} THEN 'Rejeitada'
              ELSE 'Pendente'
            END
          `,
          "status"
        )
        .where("idea.unidade_dass = :dassOffice", { dassOffice })
        .andWhere("idea.excluido = false")
        .andWhere("idea.nome_projeto IS NOT NULL")
        .andWhere("idea.situacao_atual IS NOT NULL");

      applyDateFilter(rows, "idea", "createdat", startDate, endDate);

      const rawRows = await rows
        .orderBy(
          `
            CASE
              WHEN ${approvedExpression} THEN idea.valor_amortizado
              ELSE 0
            END
          `,
          "DESC"
        )
        .addOrderBy("idea.createdat", "DESC")
        .limit(6)
        .getRawMany<{
          id: string;
          title: string | null;
          description: string | null;
          author: string | null;
          setor: string | null;
          fabrica: string | null;
          createdat: Date;
          valor_amortizado: string | null;
          status: string;
        }>();

      const getAvatarColor = (name: string): string => {
        const colors = ["#3B82F6", "#10B981", "#F97316", "#8B5CF6", "#EF4444", "#06B6D4"];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
      };

      const getCategory = (sector: string): string => {
        const sectorLower = sector.toLowerCase();
        if (sectorLower.includes("prod") || sectorLower.includes("fab")) return "Produção";
        if (sectorLower.includes("manu") || sectorLower.includes("mant")) return "Manutenção";
        if (sectorLower.includes("quali")) return "Qualidade";
        if (sectorLower.includes("log")) return "Logística";
        if (sectorLower.includes("eng")) return "Engenharia";
        if (sectorLower.includes("rh") || sectorLower.includes("pessoas")) return "Desenvolvimento";
        return "Outros";
      };

      return rawRows.map((row) => {
        const description = row.description || "Sem descrição disponível";

        return {
          id: Number(row.id),
          title: row.title || "Projeto sem título",
          description:
            description.substring(0, 150) +
            (description.length > 150 ? "..." : ""),
          author: row.author || "Autor desconhecido",
          avatarColor: getAvatarColor(row.author || "A"),
          date: new Date(row.createdat).toISOString().split("T")[0],
          status: row.status,
          category: getCategory(row.setor || ""),
          sector: row.setor || "Não informado",
          factory: row.fabrica || "Não informado",
          likes: 0,
          comments: 0,
          syntheticEngagement: false,
        };
      });
    } catch (error) {
      console.error("Erro ao buscar ideias em destaque:", error);
      throw new CustomError("Erro interno do servidor ao buscar ideias em destaque");
    }
  }

  static async getEngagementData(
    dassOffice: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DashboardEngagementContributor[]> {
    try {
      validateDassOffice(dassOffice);

      const dataSource = await initializeDatabase();
      const query = dataSource
        .getRepository(PenseAjaDassEntity)
        .createQueryBuilder("idea")
        .select("idea.nome", "nome")
        .addSelect("idea.setor", "setor")
        .addSelect("COUNT(*)", "total_ideas")
        .addSelect(
          `COUNT(CASE WHEN ${approvedExpression} THEN 1 END)`,
          "implemented_ideas"
        )
        .where("idea.unidade_dass = :dassOffice", { dassOffice })
        .andWhere("idea.excluido = false");

      applyDateFilter(query, "idea", "data_realizada", startDate, endDate);

      const rows = await query
        .groupBy("idea.nome")
        .addGroupBy("idea.setor")
        .having("COUNT(*) > 0")
        .orderBy("COUNT(*)", "DESC")
        .addOrderBy(`COUNT(CASE WHEN ${approvedExpression} THEN 1 END)`, "DESC")
        .limit(10)
        .getRawMany<{
          nome: string;
          setor: string;
          total_ideas: string;
          implemented_ideas: string;
        }>();

      const getAvatarColor = (name: string): string => {
        const colors = [
          "#3B82F6",
          "#10B981",
          "#F97316",
          "#8B5CF6",
          "#EF4444",
          "#06B6D4",
          "#EC4899",
          "#F59E0B",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
      };

      const getDepartment = (sector: string): string => {
        const sectorLower = sector.toLowerCase();
        if (sectorLower.includes("prod") || sectorLower.includes("fab")) return "Produção";
        if (sectorLower.includes("manu") || sectorLower.includes("mant")) return "Manutenção";
        if (sectorLower.includes("quali")) return "Qualidade";
        if (sectorLower.includes("log")) return "Logística";
        if (sectorLower.includes("eng")) return "Engenharia";
        if (sectorLower.includes("rh") || sectorLower.includes("pessoas")) return "Recursos Humanos";
        if (sectorLower.includes("admin")) return "Administrativo";
        if (sectorLower.includes("seg")) return "Segurança";
        return sector || "Outros";
      };

      const getRole = (sector: string, totalIdeas: number): string => {
        const department = getDepartment(sector);
        const roles: Record<string, string[]> = {
          "Produção": [
            "Operador de Produção",
            "Supervisor de Produção",
            "Técnico de Produção",
            "Coordenador de Produção",
          ],
          "Manutenção": [
            "Técnico de Manutenção",
            "Mecânico Industrial",
            "Eletricista Industrial",
            "Supervisor de Manutenção",
          ],
          "Qualidade": [
            "Técnico de Qualidade",
            "Analista de Qualidade",
            "Inspetor de Qualidade",
            "Coordenador de Qualidade",
          ],
          "Logística": [
            "Analista de Logística",
            "Operador de Empilhadeira",
            "Conferente",
            "Supervisor de Logística",
          ],
          "Engenharia": [
            "Engenheiro de Processos",
            "Técnico em Automação",
            "Analista de Processos",
            "Engenheiro de Produção",
          ],
          "Recursos Humanos": [
            "Analista de RH",
            "Assistente de RH",
            "Coordenador de RH",
            "Especialista em Treinamento",
          ],
          "Administrativo": [
            "Assistente Administrativo",
            "Analista Administrativo",
            "Coordenador Administrativo",
            "Auxiliar Administrativo",
          ],
          "Segurança": [
            "Técnico de Segurança",
            "Engenheiro de Segurança",
            "Inspetor de Segurança",
            "Coordenador de Segurança",
          ],
        };

        const departmentRoles = roles[department] || [
          "Colaborador",
          "Técnico",
          "Analista",
          "Coordenador",
        ];

        if (totalIdeas >= 15) return departmentRoles[3];
        if (totalIdeas >= 10) return departmentRoles[2];
        if (totalIdeas >= 5) return departmentRoles[1];
        return departmentRoles[0];
      };

      return rows.map((row, index) => ({
        id: index + 1,
        name: row.nome,
        role: getRole(row.setor, Number(row.total_ideas)),
        department: getDepartment(row.setor),
        ideas: Number(row.total_ideas),
        implemented: Number(row.implemented_ideas),
        avatarColor: getAvatarColor(row.nome),
      }));
    } catch (error) {
      console.error("Erro ao buscar dados de engajamento:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados de engajamento");
    }
  }
}
