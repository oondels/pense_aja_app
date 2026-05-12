import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import * as database from "../src/config/database";
import { AuditService } from "../src/services/audit.service";
import { LedgerService } from "../src/services/ledger.service";
import { MarketplaceService } from "../src/services/marketplace.service";

const ACTOR = {
  sessionKey: "key",
  registration: "9999999",
  username: "Operador",
  dassOffice: "SEST" as const,
  permissions: ["marketplace.request.approve"],
  snapshotVersion: 1,
  snapshotExpiresAt: new Date(),
};

const BASE_REQUEST = {
  id: 10,
  matricula: "1234567",
  catalog_item_id: "catalog-uuid",
  unidade_dass: "SEST",
  request_status: "pending_approval",
  reserved_ledger_entry_id: 5,
  approval_actor_registration: null,
  approval_actor_name: null,
  fulfillment_type: "physical_delivery",
  createdat: new Date(),
  updatedat: new Date(),
};

const BASE_ITEM = {
  id: "catalog-uuid",
  unidade_dass: "SEST",
  points_cost: "50",
  item_type: "physical",
  active: true,
};

const buildQueryRunner = (requestOverrides: Partial<typeof BASE_REQUEST> = {}) => {
  const request = { ...BASE_REQUEST, ...requestOverrides };
  const requestRepo = {
    findOne: vi.fn().mockResolvedValue(request),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const itemRepo = {
    findOne: vi.fn().mockResolvedValue(BASE_ITEM),
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
        const name = entity?.options?.name ?? "";
        return name === "MarketplaceCatalogItem" ? itemRepo : requestRepo;
      }),
    },
  } as any;
};

describe("MarketplaceService — workflow transitions and ledger entries", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockCommon = (queryRunner: any) => {
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();
    vi.spyOn(MarketplaceService, "getRequestById").mockResolvedValue({
      id: 10,
      registration: "1234567",
      dassOffice: "SEST",
      catalogItemId: "catalog-uuid",
      requestStatus: "completed",
      reservedLedgerEntryId: 5,
      approvalActorRegistration: null,
      approvalActorName: null,
      fulfillmentType: "physical_delivery",
      legacyPrizeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  it("approveRequest creates commit ledger entry linked to reserve", async () => {
    const queryRunner = buildQueryRunner({ request_status: "pending_approval" });
    mockCommon(queryRunner);
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);

    await MarketplaceService.approveRequest(
      "10",
      { dassOffice: "SEST" },
      ACTOR
    );

    expect(createEntry).toHaveBeenCalledOnce();
    const call = createEntry.mock.calls[0][1];
    expect(call.entryType).toBe("commit");
    expect(call.amount).toBe(50);
    expect(call.relatedEntryId).toBe(5);
    expect(call.sourceType).toBe("marketplace_redemption");
    expect(call.sourceId).toBe("10");
  });

  it("rejectRequest creates release ledger entry linked to reserve", async () => {
    const queryRunner = buildQueryRunner({ request_status: "pending_approval" });
    mockCommon(queryRunner);
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);

    await MarketplaceService.rejectRequest(
      "10",
      { dassOffice: "SEST" },
      ACTOR
    );

    expect(createEntry).toHaveBeenCalledOnce();
    const call = createEntry.mock.calls[0][1];
    expect(call.entryType).toBe("release");
    expect(call.amount).toBe(50);
    expect(call.relatedEntryId).toBe(5);
  });

  it("refundRequest creates refund ledger entry", async () => {
    const queryRunner = buildQueryRunner({ request_status: "completed" });
    mockCommon(queryRunner);
    const createEntry = vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);

    await MarketplaceService.refundRequest(
      "10",
      { dassOffice: "SEST" },
      ACTOR
    );

    expect(createEntry).toHaveBeenCalledOnce();
    const call = createEntry.mock.calls[0][1];
    expect(call.entryType).toBe("refund");
    expect(call.amount).toBe(50);
  });

  it("approveRequest rejects if request is not pending_approval", async () => {
    const queryRunner = buildQueryRunner({ request_status: "completed" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await expect(
      MarketplaceService.approveRequest("10", { dassOffice: "SEST" }, ACTOR)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("refundRequest rejects if request is not completed", async () => {
    const queryRunner = buildQueryRunner({ request_status: "pending_approval" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(LedgerService, "createEntry").mockResolvedValue({} as any);
    vi.spyOn(LedgerService, "syncBalanceProjection").mockResolvedValue();
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();

    await expect(
      MarketplaceService.refundRequest("10", { dassOffice: "SEST" }, ACTOR)
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("transition syncs balance projection after ledger entry", async () => {
    const calls: string[] = [];
    const queryRunner = buildQueryRunner({ request_status: "pending_approval" });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(LedgerService, "createEntry").mockImplementation(async () => {
      calls.push("create-entry");
      return {} as any;
    });
    vi.spyOn(LedgerService, "syncBalanceProjection").mockImplementation(async () => {
      calls.push("sync-projection");
    });
    vi.spyOn(AuditService, "recordEvent").mockResolvedValue();
    vi.spyOn(MarketplaceService, "getRequestById").mockResolvedValue({} as any);

    await MarketplaceService.approveRequest("10", { dassOffice: "SEST" }, ACTOR);

    const syncIndex = calls.indexOf("sync-projection");
    const entryIndex = calls.indexOf("create-entry");
    expect(syncIndex).toBeGreaterThan(entryIndex);
  });
});
