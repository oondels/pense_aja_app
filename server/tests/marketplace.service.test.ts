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
      })
    );
  });
});
