import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import * as database from "../src/config/database";
import { AuditService } from "../src/services/audit.service";
import { EvaluationWorkflowService } from "../src/services/evaluation-workflow.service";
import { LedgerService } from "../src/services/ledger.service";
import { PenseAjaService } from "../src/services/pense-aja.service";
import { UnitSettingsService } from "../src/services/unit-settings.service";

const WORKFLOW_ANALYST = {
  stepCode: "analyst_review",
  requiredPermission: "idea.evaluate",
  reviewSlot: "analista" as const,
  terminalStatus: null,
};

const BASE_IDEA = {
  id: 42,
  matricula: "1234567",
  unidade_dass: "SEST",
  excluido: false,
  nome: "João",
  nome_projeto: "Projeto X",
  setor: "Produção",
  turno: "A",
  gerente: "Maria",
  data_realizada: new Date("2024-01-01"),
  situacao_anterior: "antes",
  situacao_atual: "depois",
  classificacao: null,
  a3_mae: "",
  em_espera: "0",
  replicavel: "0",
  createdat: new Date(),
  updatedat: new Date(),
};

const ACTOR = {
  registration: "9999999",
  username: "Analista",
  dassOffice: "SEST" as const,
  permissions: ["idea.evaluate"],
  roles: [],
  unitConfig: {} as any,
};

const buildEvalData = (overrides: Record<string, unknown> = {}) => ({
  dassOffice: "SEST",
  status: "approve",
  usuario: "Analista",
  funcao: "analista",
  justificativa: "Aprovado",
  avaliacao: "3",
  a3Mae: "",
  emEspera: false,
  replicavel: false,
  actorRegistration: "9999999",
  permissions: ["idea.evaluate"],
  ...overrides,
});

const mockScoringRule = (score = 3, classification = "A") =>
  vi.spyOn(UnitSettingsService, "getScoringRule").mockResolvedValue({
    id: "rule-id",
    dassOffice: "SEST",
    classification,
    label: classification,
    description: null,
    score,
    displayOrder: 1,
    active: true,
    activeFrom: null,
    activeUntil: null,
    metadata: null,
  });

const mockMaxBonus = (points = 2) =>
  vi.spyOn(UnitSettingsService, "getMaxEvaluationBonusPoints").mockResolvedValue(points);

const buildQueryRunner = (ideaFindOnce: object, ideaFindTwice: object) => {
  const ideaRepo = {
    findOne: vi
      .fn()
      .mockResolvedValueOnce(ideaFindOnce)
      .mockResolvedValueOnce(ideaFindTwice),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const scoringRepo = {
    findOne: vi.fn().mockResolvedValue(null),
  };
  return {
    connect: vi.fn(),
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
    release: vi.fn(),
    isTransactionActive: true,
    isReleased: false,
    manager: {
      getRepository: vi.fn((entity: any) => {
        return entity?.options?.name === "PenseAjaDass" ? ideaRepo : scoringRepo;
      }),
    },
  } as any;
};

describe("PenseAjaService — ledger entries on evaluation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("first evaluation creates earn entry only", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, { ...BASE_IDEA, classificacao: "3" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockScoringRule(3);
    mockMaxBonus(2);
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null })
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null });
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await PenseAjaService.evaluatePenseAja("42", buildEvalData({ avaliacao: "3" }));

    const calls = createEntry.mock.calls.map((c) => c[1].entryType);
    expect(calls).toEqual(["earn"]);
  });

  it("re-evaluation with different score creates reverse + earn", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, { ...BASE_IDEA, classificacao: "3" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockScoringRule(3);
    mockMaxBonus(2);
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 50, latestEarnEntryId: 10 })
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null });
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    // avaliacao "3" resolve classificação A; regra configurada retorna 3.
    await PenseAjaService.evaluatePenseAja("42", buildEvalData({ avaliacao: "3" }));

    const calls = createEntry.mock.calls.map((c) => c[1].entryType);
    expect(calls).toEqual(["reverse", "earn"]);
  });

  it("re-evaluation with same score creates no ledger entries", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, { ...BASE_IDEA, classificacao: "3" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockScoringRule(3);
    mockMaxBonus(2);
    // netAmount = 3 == score configurado para A.
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 3, latestEarnEntryId: 10 })
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null });
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await PenseAjaService.evaluatePenseAja("42", buildEvalData({ avaliacao: "3" }));

    expect(createEntry).not.toHaveBeenCalled();
  });

  it("exclusion with existing score creates reverse entry only", async () => {
    const queryRunner = buildQueryRunner(
      BASE_IDEA,
      { ...BASE_IDEA, excluido: true }
    );
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockMaxBonus(2);
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 100, latestEarnEntryId: 5 })
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null });
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await PenseAjaService.evaluatePenseAja(
      "42",
      buildEvalData({ status: "exclude", avaliacao: undefined, permissions: ["idea.evaluate", "idea.exclude"] })
    );

    const calls = createEntry.mock.calls.map((c) => c[1].entryType);
    expect(calls).toEqual(["reverse"]);
  });

  it("exclusion without previous score creates no ledger entries", async () => {
    const queryRunner = buildQueryRunner(
      BASE_IDEA,
      { ...BASE_IDEA, excluido: true }
    );
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockMaxBonus(2);
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null })
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null });
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await PenseAjaService.evaluatePenseAja(
      "42",
      buildEvalData({ status: "exclude", avaliacao: undefined, permissions: ["idea.evaluate", "idea.exclude"] })
    );

    expect(createEntry).not.toHaveBeenCalled();
  });

  it("reproval with existing score creates reverse entry only", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, { ...BASE_IDEA, classificacao: null });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockMaxBonus(2);
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 75, latestEarnEntryId: 8 })
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null });
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await PenseAjaService.evaluatePenseAja(
      "42",
      buildEvalData({ status: "reprove", avaliacao: undefined })
    );

    const calls = createEntry.mock.calls.map((c) => c[1].entryType);
    expect(calls).toEqual(["reverse"]);
  });

  it("approved evaluation can grant configured bonus points", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, { ...BASE_IDEA, classificacao: "A" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockScoringRule(3);
    mockMaxBonus(2);
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null })
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null });
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await PenseAjaService.evaluatePenseAja(
      "42",
      buildEvalData({
        classification: "A",
        bonusPoints: 2,
        bonusJustification: "Impacto excepcional.",
      })
    );

    const calls = createEntry.mock.calls.map((c) => ({
      entryType: c[1].entryType,
      sourceType: c[1].sourceType,
      amount: c[1].amount,
    }));
    expect(calls).toEqual([
      { entryType: "earn", sourceType: "idea_evaluation", amount: 3 },
      { entryType: "earn", sourceType: "idea_evaluation_bonus", amount: 2 },
    ]);
  });

  it("re-evaluation replaces previous bonus points", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, { ...BASE_IDEA, classificacao: "A" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockScoringRule(3);
    mockMaxBonus(2);
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 3, latestEarnEntryId: 10 })
      .mockResolvedValueOnce({ netAmount: 2, latestEarnEntryId: 11 });
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await PenseAjaService.evaluatePenseAja(
      "42",
      buildEvalData({
        classification: "A",
        bonusPoints: 1,
        bonusJustification: "Ajuste da bonificação.",
      })
    );

    const calls = createEntry.mock.calls.map((c) => ({
      entryType: c[1].entryType,
      sourceType: c[1].sourceType,
      amount: c[1].amount,
      relatedEntryId: c[1].relatedEntryId,
    }));
    expect(calls).toEqual([
      {
        entryType: "reverse",
        sourceType: "idea_evaluation_bonus",
        amount: 2,
        relatedEntryId: 11,
      },
      {
        entryType: "earn",
        sourceType: "idea_evaluation_bonus",
        amount: 1,
        relatedEntryId: undefined,
      },
    ]);
  });

  it("bonus above unit limit throws 400", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, { ...BASE_IDEA, classificacao: "A" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    mockScoringRule(3);
    mockMaxBonus(1);
    vi.spyOn(LedgerService, "getSourceNetAmount")
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null })
      .mockResolvedValueOnce({ netAmount: 0, latestEarnEntryId: null });
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await expect(
      PenseAjaService.evaluatePenseAja(
        "42",
        buildEvalData({
          classification: "A",
          bonusPoints: 2,
          bonusJustification: "Impacto excepcional.",
        })
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("reproval with classification throws 400", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, BASE_IDEA);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    vi.spyOn(LedgerService, "getSourceNetAmount").mockResolvedValue({ netAmount: 0, latestEarnEntryId: null });
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await expect(
      PenseAjaService.evaluatePenseAja("42", buildEvalData({ status: "reprove", avaliacao: "1" }))
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("exclusion without idea.exclude permission throws 403", async () => {
    const queryRunner = buildQueryRunner(BASE_IDEA, BASE_IDEA);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(EvaluationWorkflowService, "resolveDecision").mockResolvedValue(WORKFLOW_ANALYST);
    vi.spyOn(LedgerService, "getSourceNetAmount").mockResolvedValue({ netAmount: 0, latestEarnEntryId: null });
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await expect(
      PenseAjaService.evaluatePenseAja(
        "42",
        buildEvalData({ status: "exclude", permissions: ["idea.evaluate"] })
      )
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
