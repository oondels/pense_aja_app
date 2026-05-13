import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import * as database from "../src/config/database";
import { DashboardService } from "../src/services/dashboard.service";

const buildQueryBuilder = (rawOneResult: object, rawManyResult: object[] = []) => ({
  select: vi.fn().mockReturnThis(),
  addSelect: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  andWhere: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  addOrderBy: vi.fn().mockReturnThis(),
  groupBy: vi.fn().mockReturnThis(),
  addGroupBy: vi.fn().mockReturnThis(),
  having: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  getRawOne: vi.fn().mockResolvedValue(rawOneResult),
  getRawMany: vi.fn().mockResolvedValue(rawManyResult),
});

const buildDataSource = (qb: ReturnType<typeof buildQueryBuilder>, queryResults: unknown[][]) => ({
  getRepository: vi.fn(() => ({
    createQueryBuilder: vi.fn(() => qb),
  })),
  query: vi
    .fn()
    .mockResolvedValueOnce(queryResults[0] ?? [])
    .mockResolvedValueOnce(queryResults[1] ?? [])
    .mockResolvedValueOnce(queryResults[2] ?? []),
});

const HIGHLIGHT_ROW = {
  id: "1",
  title: "Projeto Teste",
  description: "Situação atual descrita",
  author: "João",
  setor: "Produção",
  fabrica: "F1",
  createdat: new Date("2024-01-15"),
  valor_amortizado: "1000",
  status: "Aprovada",
};

const IMPLEMENTED_EXPRESSION_PARTS = [
  "(idea.em_espera IS NULL OR idea.em_espera != '1')",
  "(idea.status_gerente = 'approve' OR idea.status_analista = 'approve')",
];

const expectImplementedExpression = (sql: string) => {
  for (const part of IMPLEMENTED_EXPRESSION_PARTS) {
    expect(sql).toContain(part);
  }
  expect(sql).not.toContain(
    "idea.status_gerente = 'approve' AND idea.status_analista = 'approve'"
  );
};

describe("DashboardService — getSummaryData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns zeroed metrics when no data exists", async () => {
    const qb = buildQueryBuilder({});
    const dataSource = buildDataSource(qb, [
      [{ total_earned: "0", total_committed: "0", total_refunded: "0", total_reserved: "0" }],
      [{ pending: "0", completed: "0" }],
    ]);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue(dataSource as any);

    const result = await DashboardService.getSummaryData("SEST");

    expect(result.totalIdeas).toBe(0);
    expect(result.implementedIdeas).toBe(0);
    expect(result.totalPointsEarned).toBe(0);
    expect(result.marketplacePending).toBe(0);
  });

  it("correctly computes totalPointsRedeemed as committed minus refunded", async () => {
    const qb = buildQueryBuilder({
      total_ideas: "10",
      implemented_ideas: "5",
      pending_ideas: "3",
      rejected_ideas: "2",
      approved_by_manager: "4",
      in_analysis: "1",
      total_value: "1000",
      avg_value: "100",
    });
    const dataSource = buildDataSource(qb, [
      [{ total_earned: "500", total_committed: "200", total_refunded: "50", total_reserved: "30" }],
      [{ pending: "2", completed: "8" }],
    ]);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue(dataSource as any);

    const result = await DashboardService.getSummaryData("SEST");

    expect(result.totalIdeas).toBe(10);
    expect(result.implementedIdeas).toBe(5);
    expect(result.totalPointsEarned).toBe(500);
    expect(result.totalPointsRedeemed).toBe(150); // 200 - 50
    expect(result.totalPointsReserved).toBe(30);
    expect(result.marketplacePending).toBe(2);
    expect(result.marketplaceCompleted).toBe(8);
  });

  it("counts implemented ideas by any approval when not waiting", async () => {
    const qb = buildQueryBuilder({
      total_ideas: "3",
      implemented_ideas: "2",
      pending_ideas: "1",
      rejected_ideas: "0",
      approved_by_manager: "1",
      in_analysis: "1",
      total_value: "0",
      avg_value: "0",
    });
    const dataSource = buildDataSource(qb, [
      [{ total_earned: "0", total_committed: "0", total_refunded: "0", total_reserved: "0" }],
      [{ pending: "0", completed: "0" }],
    ]);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue(dataSource as any);

    await DashboardService.getSummaryData("SEST");

    const implementedCall = qb.addSelect.mock.calls.find(
      (call) => call[1] === "implemented_ideas"
    );
    const pendingCall = qb.addSelect.mock.calls.find(
      (call) => call[1] === "pending_ideas"
    );

    expectImplementedExpression(String(implementedCall?.[0] ?? ""));
    expectImplementedExpression(String(pendingCall?.[0] ?? ""));
  });

  it("throws CustomError 400 for invalid dassOffice", async () => {
    await expect(
      DashboardService.getSummaryData("INVALID")
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("DashboardService — getMonthlyData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the implemented expression for monthly approved totals", async () => {
    const qb = buildQueryBuilder({}, []);
    const dataSource = buildDataSource(qb, []);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue(dataSource as any);

    await DashboardService.getMonthlyData("SEST");

    const monthlyImplementedCall = qb.addSelect.mock.calls.find(
      (call) => call[1] === "total_aprovados"
    );

    expectImplementedExpression(String(monthlyImplementedCall?.[0] ?? ""));
  });
});

describe("DashboardService — getEngagementData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an array for valid dassOffice", async () => {
    const rows = [
      { nome: "Ana", setor: "Produção", total_ideas: "5", implemented_ideas: "3" },
      { nome: "Bruno", setor: "Logística", total_ideas: "2", implemented_ideas: "1" },
    ];
    const qb = buildQueryBuilder({}, rows);
    const dataSource = buildDataSource(qb, []);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue(dataSource as any);

    const result = await DashboardService.getEngagementData("SEST");

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it("uses the implemented expression for contributor implemented totals", async () => {
    const rows = [
      { nome: "Ana", setor: "Produção", total_ideas: "5", implemented_ideas: "3" },
    ];
    const qb = buildQueryBuilder({}, rows);
    const dataSource = buildDataSource(qb, []);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue(dataSource as any);

    await DashboardService.getEngagementData("SEST");

    const implementedCall = qb.addSelect.mock.calls.find(
      (call) => call[1] === "implemented_ideas"
    );
    const orderCall = qb.addOrderBy.mock.calls.find((call) =>
      String(call[0]).includes("COUNT(CASE WHEN")
    );

    expectImplementedExpression(String(implementedCall?.[0] ?? ""));
    expectImplementedExpression(String(orderCall?.[0] ?? ""));
  });

  it("throws CustomError 400 for invalid dassOffice", async () => {
    await expect(
      DashboardService.getEngagementData("XPTO")
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("DashboardService — getIdeaHighlights", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns up to 6 highlights with required fields", async () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({
      ...HIGHLIGHT_ROW,
      id: String(i + 1),
      title: `Projeto ${i + 1}`,
    }));
    const qb = buildQueryBuilder({}, rows);
    const dataSource = buildDataSource(qb, []);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue(dataSource as any);

    const result = await DashboardService.getIdeaHighlights("SEST");

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(6);
    expect(result[0]).toMatchObject({
      id: 1,
      title: "Projeto 1",
      likes: 0,
      comments: 0,
      syntheticEngagement: false,
    });

    const statusCall = qb.addSelect.mock.calls.find(
      (call) => call[1] === "status"
    );
    const orderCall = qb.orderBy.mock.calls.find((call) =>
      String(call[0]).includes("valor_amortizado")
    );

    expectImplementedExpression(String(statusCall?.[0] ?? ""));
    expectImplementedExpression(String(orderCall?.[0] ?? ""));
  });

  it("truncates description longer than 150 characters", async () => {
    const longDescription = "A".repeat(200);
    const qb = buildQueryBuilder({}, [{ ...HIGHLIGHT_ROW, description: longDescription }]);
    const dataSource = buildDataSource(qb, []);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue(dataSource as any);

    const result = await DashboardService.getIdeaHighlights("SEST");

    expect(result[0].description).toHaveLength(153); // 150 + "..."
    expect(result[0].description.endsWith("...")).toBe(true);
  });

  it("throws CustomError 400 for invalid dassOffice", async () => {
    await expect(
      DashboardService.getIdeaHighlights("UNKNOWN")
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
