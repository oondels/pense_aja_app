import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import * as database from "../src/config/database";
import { AuditService } from "../src/services/audit.service";
import { LedgerService } from "../src/services/ledger.service";
import { MarketplaceService } from "../src/services/marketplace.service";

describe("MarketplaceService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists requests with requester names from user table", async () => {
    const leftJoin = vi.fn().mockReturnThis();
    const queryBuilder = {
      leftJoin,
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      clone: vi.fn().mockReturnValue({ getCount: vi.fn().mockResolvedValue(1) }),
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      getRawMany: vi.fn().mockResolvedValue([
        {
          id: "77",
          registration: "1234567",
          requesterName: "Usuario Teste",
          dassOffice: "SEST",
          catalogItemId: "catalog-1",
          catalogItemName: "Caneca",
          catalogItemPointsCost: "25",
          catalogItemType: "physical",
          requestStatus: "pending_approval",
          reservedLedgerEntryId: "10",
          approvalActorRegistration: null,
          approvalActorName: null,
          fulfillmentType: "physical_delivery",
          legacyPrizeId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    };

    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      getRepository: () => ({
        createQueryBuilder: () => queryBuilder,
      }),
    } as any);

    const result = await MarketplaceService.listRequests({
      dassOffice: "SEST",
      registration: "1234567",
    });

    expect(result.data[0]).toMatchObject({
      registration: "1234567",
      requesterName: "Usuario Teste",
    });
    expect(leftJoin).toHaveBeenCalledWith(
      expect.anything(),
      "usuario",
      "usuario.matricula = request.matricula"
    );
  });

  it("should sync balance projection before locking available balance", async () => {
    const calls: string[] = [];
    const catalogRepository = {
      findOne: vi.fn().mockResolvedValue({
        id: "catalog-1",
        item_type: "physical",
        points_cost: "25",
        available_quantity: null,
      }),
    };
    const requestRepository = {
      create: vi.fn((entity) => entity),
      save: vi.fn(async (entity) => ({ ...entity, id: 77 })),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    const queryRunner = {
      connect: vi.fn(),
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      rollbackTransaction: vi.fn(),
      release: vi.fn(),
      isTransactionActive: true,
      isReleased: false,
      query: vi.fn(async () => {
        calls.push("lock-balance");
        return [{ available_balance: "100" }];
      }),
      manager: {
        getRepository: vi.fn((entity) => {
          const name = (entity as any).options?.name;
          return name === "MarketplaceCatalogItem"
            ? catalogRepository
            : requestRepository;
        }),
      },
    } as any;

    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockImplementation(
      async () => {
        calls.push("sync-projection");
      }
    );
    vi.spyOn(LedgerService, "createEntry").mockResolvedValue({ id: 10 } as any);
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();
    vi.spyOn(MarketplaceService, "getRequestById").mockResolvedValue({
      id: 77,
      registration: "1234567",
      requesterName: "Usuario Teste",
      dassOffice: "SEST",
      catalogItemId: "catalog-1",
      requestStatus: "pending_approval",
      reservedLedgerEntryId: 10,
      approvalActorRegistration: null,
      approvalActorName: null,
      fulfillmentType: "physical_delivery",
      legacyPrizeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await MarketplaceService.createRequest(
      {
        registration: "1234567",
        dassOffice: "SEST",
        catalogItemId: "catalog-1",
      },
      {
        registration: "operator",
        username: "Operador",
      }
    );

    expect(calls.slice(0, 2)).toEqual(["sync-projection", "lock-balance"]);
    expect(LedgerService.syncBalanceProjection).toHaveBeenCalledWith(
      queryRunner,
      "operator",
      "SEST"
    );
    expect(requestRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        matricula: "operator",
        reserved_ledger_entry_id: null,
      })
    );
    expect(LedgerService.createEntry).toHaveBeenCalledWith(
      queryRunner,
      expect.objectContaining({
        entryType: "reserve",
        sourceType: "marketplace_redemption",
        sourceId: "77",
        metadata: expect.objectContaining({ catalogItemId: "catalog-1" }),
      })
    );
    expect(requestRepository.update).toHaveBeenCalledWith(
      { id: 77 },
      expect.objectContaining({ reserved_ledger_entry_id: "10" })
    );
  });

  it("allows multiple requests for the same catalog item with different ledger sources", async () => {
    let nextRequestId = 77;
    let nextLedgerId = 10;
    const catalogRepository = {
      findOne: vi.fn().mockResolvedValue({
        id: "catalog-1",
        item_type: "physical",
        points_cost: "25",
        available_quantity: null,
      }),
    };
    const requestRepository = {
      create: vi.fn((entity) => entity),
      save: vi.fn(async (entity) => ({ ...entity, id: nextRequestId++ })),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    const queryRunner = {
      connect: vi.fn(),
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      rollbackTransaction: vi.fn(),
      release: vi.fn(),
      isTransactionActive: true,
      isReleased: false,
      query: vi.fn(async () => [{ available_balance: "100" }]),
      manager: {
        getRepository: vi.fn((entity) => {
          const name = (entity as any).options?.name;
          return name === "MarketplaceCatalogItem"
            ? catalogRepository
            : requestRepository;
        }),
      },
    } as any;

    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockImplementation(
      async () => ({ id: nextLedgerId++ } as any)
    );
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();
    vi.spyOn(MarketplaceService, "getRequestById").mockResolvedValue({} as any);

    await MarketplaceService.createRequest(
      { registration: "1234567", dassOffice: "SEST", catalogItemId: "catalog-1" },
      { registration: "1234567", username: "Usuario" }
    );
    await MarketplaceService.createRequest(
      { registration: "1234567", dassOffice: "SEST", catalogItemId: "catalog-1" },
      { registration: "1234567", username: "Usuario" }
    );

    expect(createEntry.mock.calls.map((call) => call[1].sourceId)).toEqual([
      "77",
      "78",
    ]);
    expect(createEntry.mock.calls.map((call) => call[1].metadata?.catalogItemId)).toEqual([
      "catalog-1",
      "catalog-1",
    ]);
  });
});
