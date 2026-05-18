import { SelectQueryBuilder } from "typeorm";
import { initializeDatabase } from "../config/database";
import PenseAjaDassEntity from "../models/PenseAjaDass";
import { CustomError } from "../types/CustomError";
import {
  DashboardDimensionalData,
  DashboardEngagementContributor,
  DashboardIdeaHighlight,
  DashboardMonthlyData,
  DashboardReportData,
  DashboardReportDimensionRow,
  DashboardReportEvaluationMetrics,
  DashboardReportIdeaRow,
  DashboardReportMarketplace,
  DashboardSummaryData,
  DashboardSummaryOptions,
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

const implementedExpression = [
  "(idea.em_espera IS NULL OR idea.em_espera != '1')",
  "(idea.status_gerente = 'approve' OR idea.status_analista = 'approve')",
].join(" AND ");
const rejectedExpression =
  "idea.status_gerente = 'reprove' OR idea.status_analista = 'reprove'";
const pendingExpression = `NOT (${implementedExpression}) AND NOT (${rejectedExpression})`;

const normalizeStatus = (status?: string | null) =>
  String(status ?? "").trim().toLowerCase();

const isApproved = (status?: string | null) => normalizeStatus(status) === "approve";
const isRejected = (status?: string | null) => normalizeStatus(status) === "reprove";

const getCanonicalStatus = (idea: {
  em_espera?: string | null;
  status_gerente?: string | null;
  status_analista?: string | null;
}) => {
  if (isRejected(idea.status_gerente) || isRejected(idea.status_analista)) {
    return "Reprovada";
  }
  if (idea.em_espera === "1") {
    return "Em espera";
  }
  if (isApproved(idea.status_gerente) || isApproved(idea.status_analista)) {
    return "Implementada";
  }
  return "Pendente";
};

const toRate = (value: number, total: number) =>
  total > 0 ? Number(((value / total) * 100).toFixed(2)) : 0;

const buildReportDateFilter = (
  alias: string,
  column: string,
  startDate: Date | undefined,
  endDate: Date | undefined,
  params: unknown[]
) => {
  const clauses: string[] = [];
  if (startDate) {
    params.push(startDate.toISOString());
    clauses.push(`${alias}.${column} >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate.toISOString());
    clauses.push(`${alias}.${column} < ($${params.length}::timestamptz + interval '1 day')`);
  }
  return clauses.length ? ` AND ${clauses.join(" AND ")}` : "";
};

const emptyDimension = (label: string): DashboardReportDimensionRow => ({
  label,
  total: 0,
  implemented: 0,
  rejected: 0,
  pending: 0,
  waiting: 0,
  adminReviewed: 0,
  ideaEvaluatorReviewed: 0,
  implementationRate: 0,
});

const incrementDimension = (
  map: Map<string, DashboardReportDimensionRow>,
  label: string,
  idea: DashboardReportIdeaRow
) => {
  const safeLabel = label || "Não informado";
  const current = map.get(safeLabel) ?? emptyDimension(safeLabel);
  current.total += 1;
  if (idea.canonicalStatus === "Implementada") current.implemented += 1;
  if (idea.canonicalStatus === "Reprovada") current.rejected += 1;
  if (idea.canonicalStatus === "Pendente") current.pending += 1;
  if (idea.canonicalStatus === "Em espera") current.waiting += 1;
  if (idea.adminStatus) current.adminReviewed += 1;
  if (idea.ideaEvaluatorStatus) current.ideaEvaluatorReviewed += 1;
  current.implementationRate = toRate(current.implemented, current.total);
  map.set(safeLabel, current);
};

const mapDimensionRows = (map: Map<string, DashboardReportDimensionRow>) =>
  [...map.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));

const buildEvaluationMetrics = (
  ideas: DashboardReportIdeaRow[]
): DashboardReportEvaluationMetrics => {
  const build = (
    statusKey: "adminStatus" | "ideaEvaluatorStatus",
    evaluatorKey: "adminEvaluator" | "ideaEvaluator"
  ) => {
    const summary = {
      totalReviewed: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      waiting: ideas.filter((idea) => idea.canonicalStatus === "Em espera").length,
      reviewRate: 0,
      approvalRate: 0,
      ranking: [] as DashboardReportEvaluationMetrics["adminReview"]["ranking"],
    };
    const ranking = new Map<string, (typeof summary.ranking)[number]>();

    for (const idea of ideas) {
      const status = normalizeStatus(idea[statusKey]);
      if (!status) {
        summary.pending += 1;
        continue;
      }

      summary.totalReviewed += 1;
      if (status === "approve") summary.approved += 1;
      if (status === "reprove") summary.rejected += 1;

      const evaluatorName = idea[evaluatorKey] || "Não informado";
      const current =
        ranking.get(evaluatorName) ?? {
          evaluatorName,
          totalReviewed: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          approvalRate: 0,
        };
      current.totalReviewed += 1;
      if (status === "approve") current.approved += 1;
      if (status === "reprove") current.rejected += 1;
      current.approvalRate = toRate(current.approved, current.totalReviewed);
      ranking.set(evaluatorName, current);
    }

    summary.reviewRate = toRate(summary.totalReviewed, ideas.length);
    summary.approvalRate = toRate(summary.approved, summary.totalReviewed);
    summary.ranking = [...ranking.values()].sort(
      (a, b) => b.totalReviewed - a.totalReviewed || a.evaluatorName.localeCompare(b.evaluatorName)
    );
    return summary;
  };

  return {
    adminReview: build("adminStatus", "adminEvaluator"),
    ideaEvaluatorReview: build("ideaEvaluatorStatus", "ideaEvaluator"),
  };
};

export class DashboardService {
  static async getSummaryData(
    dassOffice: string,
    startDate?: Date,
    endDate?: Date,
    options: DashboardSummaryOptions = {}
  ): Promise<DashboardSummaryData> {
    try {
      validateDassOffice(dassOffice);

      const dataSource = await initializeDatabase();
      const result = dataSource
        .getRepository(PenseAjaDassEntity)
        .createQueryBuilder("idea")
        .select("COUNT(*)", "total_ideas")
        .addSelect(
          `COUNT(CASE WHEN ${implementedExpression} THEN 1 END)`,
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

      const summary: DashboardSummaryData = {
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

      if (options.includeReport) {
        summary.report = await this.buildReportData(
          dataSource,
          dassOffice,
          startDate,
          endDate,
          summary
        );
      }

      return summary;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Erro ao buscar dados do dashboard:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados do dashboard");
    }
  }

  private static async buildReportData(
    dataSource: Awaited<ReturnType<typeof initializeDatabase>>,
    dassOffice: string,
    startDate: Date | undefined,
    endDate: Date | undefined,
    summary: DashboardSummaryData
  ): Promise<DashboardReportData> {
    const ideaParams: unknown[] = [dassOffice];
    const ideaDateFilter = buildReportDateFilter(
      "idea",
      "createdat",
      startDate,
      endDate,
      ideaParams
    );
    const marketplaceParams: unknown[] = [dassOffice];
    const marketplaceDateFilter = buildReportDateFilter(
      "request",
      "createdat",
      startDate,
      endDate,
      marketplaceParams
    );

    const [ideaRows, marketplaceRows] = await Promise.all([
      dataSource.query(
        `
          SELECT
            idea.id,
            idea.matricula,
            idea.nome,
            idea.setor,
            idea.gerente,
            idea.fabrica,
            idea.turno,
            idea.nome_projeto,
            idea.createdat,
            idea.data_realizada,
            idea.status_gerente,
            idea.status_analista,
            idea.classificacao,
            idea.em_espera,
            idea.situacao_anterior,
            idea.situacao_atual,
            idea.ganhos,
            idea.gerente_aprovador,
            idea.data_aprogerente,
            idea.justificativa_gerente,
            idea.analista_avaliador,
            idea.data_avaanalista,
            idea.justificativa_analista,
            COALESCE(points.valor, 0) AS pontuacao
          FROM pense_aja.pense_aja_dass idea
          LEFT JOIN (
            SELECT
              ledger.source_id,
              COALESCE(SUM(CASE WHEN ledger.entry_type = 'earn' THEN ledger.amount ELSE 0 END), 0)
                - COALESCE(SUM(CASE WHEN ledger.entry_type = 'reverse' THEN ledger.amount ELSE 0 END), 0) AS valor
            FROM pense_aja.points_ledger_entries ledger
            WHERE ledger.unidade_dass = $1
              AND ledger.source_type IN ('idea_evaluation', 'idea_evaluation_bonus')
              AND ledger.status = 'confirmed'
            GROUP BY ledger.source_id
          ) points ON points.source_id = idea.id::text
          WHERE idea.unidade_dass = $1
            AND idea.excluido = false
            ${ideaDateFilter}
          ORDER BY idea.createdat DESC, idea.id DESC
        `,
        ideaParams
      ) as Promise<Array<Record<string, unknown>>>,
      dataSource.query(
        `
          SELECT
            COUNT(DISTINCT request.id) FILTER (WHERE request.request_status IN ('pending_approval', 'approved', 'fulfillment_in_progress')) AS pending,
            COUNT(DISTINCT request.id) FILTER (WHERE request.request_status = 'completed') AS completed,
            COUNT(DISTINCT request.id) FILTER (WHERE request.request_status = 'refunded') AS refunded,
            COUNT(DISTINCT request.id) FILTER (WHERE request.request_status = 'rejected') AS rejected,
            COUNT(DISTINCT request.id) FILTER (WHERE request.request_status = 'cancelled') AS cancelled,
            COALESCE(SUM(CASE WHEN ledger.entry_type = 'commit' THEN ledger.amount ELSE 0 END), 0) AS points_committed,
            COALESCE(SUM(CASE WHEN ledger.entry_type = 'reserve' THEN ledger.amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN ledger.entry_type IN ('commit', 'release') THEN ledger.amount ELSE 0 END), 0) AS points_reserved,
            COALESCE(SUM(CASE WHEN ledger.entry_type = 'refund' THEN ledger.amount ELSE 0 END), 0) AS points_refunded
          FROM pense_aja.marketplace_redemption_requests request
          LEFT JOIN pense_aja.points_ledger_entries ledger
            ON ledger.source_type = 'marketplace_redemption'
           AND ledger.source_id = request.id::text
           AND ledger.status = 'confirmed'
          WHERE request.unidade_dass = $1
            ${marketplaceDateFilter}
        `,
        marketplaceParams
      ) as Promise<Array<Record<string, unknown>>>,
    ]);

    const ideas = ideaRows.map((row): DashboardReportIdeaRow => {
      const statusInput = {
        em_espera: row.em_espera as string | null,
        status_gerente: row.status_gerente as string | null,
        status_analista: row.status_analista as string | null,
      };

      return {
        id: Number(row.id),
        registration: String(row.matricula),
        collaboratorName: String(row.nome ?? ""),
        sector: String(row.setor ?? "Não informado"),
        manager: String(row.gerente ?? "Não informado"),
        factory: String(row.fabrica ?? "Não informado"),
        shift: String(row.turno ?? "Não informado"),
        projectName: String(row.nome_projeto ?? ""),
        createdAt: row.createdat as string | Date,
        realizedAt: (row.data_realizada as string | Date | null) ?? null,
        canonicalStatus: getCanonicalStatus(statusInput),
        classification: (row.classificacao as string | null) ?? null,
        points: Number(row.pontuacao) || 0,
        previousSituation: String(row.situacao_anterior ?? ""),
        currentSituation: String(row.situacao_atual ?? ""),
        gains: row.ganhos ?? null,
        adminEvaluator: (row.gerente_aprovador as string | null) ?? null,
        adminStatus: (row.status_gerente as string | null) ?? null,
        adminReviewedAt: (row.data_aprogerente as string | Date | null) ?? null,
        adminJustification: (row.justificativa_gerente as string | null) ?? null,
        ideaEvaluator: (row.analista_avaliador as string | null) ?? null,
        ideaEvaluatorStatus: (row.status_analista as string | null) ?? null,
        ideaEvaluatorReviewedAt: (row.data_avaanalista as string | Date | null) ?? null,
        ideaEvaluatorJustification: (row.justificativa_analista as string | null) ?? null,
      };
    });

    const dimensions = {
      sector: new Map<string, DashboardReportDimensionRow>(),
      manager: new Map<string, DashboardReportDimensionRow>(),
      factory: new Map<string, DashboardReportDimensionRow>(),
      shift: new Map<string, DashboardReportDimensionRow>(),
      status: new Map<string, DashboardReportDimensionRow>(),
    };
    const monthlyMap = new Map<string, DashboardReportDimensionRow & { month: string; points: number }>();

    for (const idea of ideas) {
      incrementDimension(dimensions.sector, idea.sector, idea);
      incrementDimension(dimensions.manager, idea.manager, idea);
      incrementDimension(dimensions.factory, idea.factory, idea);
      incrementDimension(dimensions.shift, idea.shift, idea);
      incrementDimension(dimensions.status, idea.canonicalStatus, idea);

      const month = new Date(idea.createdAt).toISOString().slice(0, 7);
      const current = monthlyMap.get(month) ?? {
        ...emptyDimension(month),
        month,
        points: 0,
      };
      current.total += 1;
      if (idea.canonicalStatus === "Implementada") current.implemented += 1;
      if (idea.canonicalStatus === "Reprovada") current.rejected += 1;
      if (idea.canonicalStatus === "Pendente") current.pending += 1;
      if (idea.canonicalStatus === "Em espera") current.waiting += 1;
      if (idea.adminStatus) current.adminReviewed += 1;
      if (idea.ideaEvaluatorStatus) current.ideaEvaluatorReviewed += 1;
      current.implementationRate = toRate(current.implemented, current.total);
      current.points += idea.points;
      monthlyMap.set(month, current);
    }

    const marketplaceRaw = marketplaceRows[0] ?? {};
    const marketplace: DashboardReportMarketplace = {
      pending: Number(marketplaceRaw.pending) || 0,
      completed: Number(marketplaceRaw.completed) || 0,
      refunded: Number(marketplaceRaw.refunded) || 0,
      rejected: Number(marketplaceRaw.rejected) || 0,
      cancelled: Number(marketplaceRaw.cancelled) || 0,
      pointsCommitted: Number(marketplaceRaw.points_committed) || 0,
      pointsReserved: Math.max(Number(marketplaceRaw.points_reserved) || 0, 0),
      pointsRefunded: Number(marketplaceRaw.points_refunded) || 0,
    };

    return {
      metadata: {
        dassOffice,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        version: "1.0",
      },
      kpis: {
        totalIdeas: summary.totalIdeas,
        implementedIdeas: summary.implementedIdeas,
        pendingIdeas: summary.pendingIdeas,
        rejectedIdeas: summary.rejectedIdeas,
        inAnalysis: summary.inAnalysis,
        implementationRate: toRate(summary.implementedIdeas, summary.totalIdeas),
        totalValue: summary.totalValue,
        avgValue: summary.avgValue,
        totalPointsEarned: summary.totalPointsEarned ?? 0,
        totalPointsRedeemed: summary.totalPointsRedeemed ?? 0,
        totalPointsReserved: summary.totalPointsReserved ?? 0,
        marketplacePending: summary.marketplacePending ?? 0,
        marketplaceCompleted: summary.marketplaceCompleted ?? 0,
      },
      evaluationMetrics: buildEvaluationMetrics(ideas),
      ideas,
      dimensions: {
        sector: mapDimensionRows(dimensions.sector),
        manager: mapDimensionRows(dimensions.manager),
        factory: mapDimensionRows(dimensions.factory),
        shift: mapDimensionRows(dimensions.shift),
        status: mapDimensionRows(dimensions.status),
      },
      monthly: [...monthlyMap.values()].sort((a, b) => a.month.localeCompare(b.month)),
      marketplace,
    };
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
          `COUNT(*) FILTER (WHERE ${implementedExpression})`,
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
              WHEN ${implementedExpression} THEN 'Aprovada'
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
              WHEN ${implementedExpression} THEN idea.valor_amortizado
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
      if (error instanceof CustomError) {
        throw error;
      }
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
          `COUNT(CASE WHEN ${implementedExpression} THEN 1 END)`,
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
        .addOrderBy(`COUNT(CASE WHEN ${implementedExpression} THEN 1 END)`, "DESC")
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
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Erro ao buscar dados de engajamento:", error);
      throw new CustomError("Erro interno do servidor ao buscar dados de engajamento");
    }
  }
}
