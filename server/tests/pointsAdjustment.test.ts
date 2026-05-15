import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import * as database from "../src/config/database";
import { AuditService } from "../src/services/audit.service";
import { LedgerService } from "../src/services/ledger.service";

const ACTOR = {
  registration: "9999999",
  username: "Admin",
  dassOffice: "SEST" as const,
  permissions: ["points.adjust"],
  roles: [],
  unitConfig: {} as any,
};

const buildQueryRunner = (projectionRepo: object) =>
  ({
    connect: vi.fn(),
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
    release: vi.fn(),
    isTransactionActive: true,
    isReleased: false,
    manager: {
      getRepository: vi.fn(() => projectionRepo),
    },
  }) as any;

describe("LedgerService — manual points adjustment", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates credit adjustment with audit trail", async () => {
    const projectionRepo = {
      findOne: vi
        .fn()
        .mockResolvedValueOnce({ available_balance: "5" })
        .mockResolvedValueOnce({ available_balance: "8" }),
    };
    const queryRunner = buildQueryRunner(projectionRepo);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({
      id: 99,
    } as any);
    const audit = vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    const result = await LedgerService.createManualAdjustment(
      "1234567",
      {
        dassOffice: "SEST",
        direction: "credit",
        amount: 3,
        reason: "Correção de saldo.",
      },
      ACTOR
    );

    expect(createEntry).toHaveBeenCalledWith(
      queryRunner,
      expect.objectContaining({
        registration: "1234567",
        entryType: "earn",
        amount: 3,
        sourceType: "manual_adjustment",
        reason: "Correção de saldo.",
      })
    );
    expect(audit).toHaveBeenCalledWith(
      queryRunner,
      expect.objectContaining({
        eventType: "points.adjusted",
        aggregateId: "1234567",
      })
    );
    expect(result).toMatchObject({
      id: 99,
      registration: "1234567",
      direction: "credit",
      amount: 3,
      availableBalance: 8,
    });
  });

  it("blocks debit adjustment that would make available balance negative", async () => {
    const projectionRepo = {
      findOne: vi.fn().mockResolvedValueOnce({ available_balance: "2" }),
    };
    const queryRunner = buildQueryRunner(projectionRepo);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({
      id: 99,
    } as any);

    await expect(
      LedgerService.createManualAdjustment(
        "1234567",
        {
          dassOffice: "SEST",
          direction: "debit",
          amount: 3,
          reason: "Correção de saldo.",
        },
        ACTOR
      )
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(createEntry).not.toHaveBeenCalled();
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
