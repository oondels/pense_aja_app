import { randomUUID } from "crypto";
import { initializeDatabase } from "../config/database";
import MarketplaceCatalogItemEntity from "../models/MarketplaceCatalogItem";
import MarketplaceFulfillmentStepEntity from "../models/MarketplaceFulfillmentStep";
import MarketplaceRedemptionRequestEntity from "../models/MarketplaceRedemptionRequest";
import UnitMarketplacePolicyEntity from "../models/UnitMarketplacePolicy";
import UsuarioEntity from "../models/Usuario";
import { CustomError } from "../types/CustomError";
import {
  AuthenticatedSessionContext,
  CreateMarketplaceRequestInput,
  DassOffice,
  ExecuteFulfillmentInput,
  MarketplaceCatalogItemRecord,
  MarketplaceRequestListFilters,
  MarketplaceRequestListResponse,
  MarketplaceRequestRecord,
  MarketplaceRequestStatus,
  MarketplaceTransitionInput,
  UpsertCatalogItemInput,
} from "../types/contracts";
import { assertDassOffice } from "../utils/dassOffice";
import { AuditService } from "./audit.service";
import { LedgerService } from "./ledger.service";
import { VoucherAdapterService } from "./voucher-adapter.service";

interface MarketplaceRequestActor {
  registration: string;
  username: string;
}

const mapCatalogRow = (
  row: Record<string, unknown>
): MarketplaceCatalogItemRecord => ({
  id: String(row.id),
  legacyProductId: row.legacyProductId ? String(row.legacyProductId) : null,
  dassOffice: row.dassOffice as DassOffice,
  name: String(row.name),
  imageUrl: (row.imageUrl as string | null) ?? null,
  pointsCost: Number(row.pointsCost),
  itemType: row.itemType as MarketplaceCatalogItemRecord["itemType"],
  active: Boolean(row.active),
  availableQuantity:
    row.availableQuantity === null || row.availableQuantity === undefined
      ? null
      : Number(row.availableQuantity),
  metadata: (row.metadata as Record<string, unknown> | null) ?? null,
});

const mapRequestRow = (row: Record<string, unknown>): MarketplaceRequestRecord => ({
  id: Number(row.id),
  registration: String(row.registration),
  requesterName: (row.requesterName as string | null) ?? null,
  dassOffice: row.dassOffice as DassOffice,
  catalogItemId: String(row.catalogItemId),
  catalogItemName: row.catalogItemName ? String(row.catalogItemName) : null,
  catalogItemPointsCost:
    row.catalogItemPointsCost === null || row.catalogItemPointsCost === undefined
      ? null
      : Number(row.catalogItemPointsCost),
  catalogItemType: row.catalogItemType
    ? (row.catalogItemType as MarketplaceCatalogItemRecord["itemType"])
    : null,
  requestStatus: row.requestStatus as MarketplaceRequestRecord["requestStatus"],
  reservedLedgerEntryId: row.reservedLedgerEntryId
    ? Number(row.reservedLedgerEntryId)
    : null,
  approvalActorRegistration: row.approvalActorRegistration
    ? String(row.approvalActorRegistration)
    : null,
  approvalActorName: (row.approvalActorName as string | null) ?? null,
  fulfillmentType: String(row.fulfillmentType),
  legacyPrizeId: row.legacyPrizeId ? Number(row.legacyPrizeId) : null,
  createdAt: row.createdAt as string | Date,
  updatedAt: row.updatedAt as string | Date,
});

const releaseQueryRunner = async (queryRunner: any) => {
  if (!queryRunner.isReleased) {
    await queryRunner.release();
  }
};

const requestStatuses: MarketplaceRequestStatus[] = [
  "pending_approval",
  "approved",
  "rejected",
  "fulfillment_in_progress",
  "completed",
  "cancelled",
  "refunded",
];

const normalizePage = (value?: string | number) => {
  const page = Number(value ?? 1);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const normalizeLimit = (value?: string | number) => {
  const limit = Number(value ?? 5);
  if (!Number.isFinite(limit) || limit <= 0) return 5;
  return Math.min(Math.floor(limit), 50);
};

const normalizeStatus = (status?: string) => {
  if (!status) return undefined;
  if (!requestStatuses.includes(status as MarketplaceRequestStatus)) {
    throw new CustomError("Status de solicitação inválido.", 400);
  }
  return status as MarketplaceRequestStatus;
};

const normalizeRegistration = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const registration = String(value).trim();
  if (!/^\d+$/.test(registration)) {
    throw new CustomError("Matrícula inválida para consulta de marketplace.", 400);
  }
  return registration;
};

const applyRequestSelects = (query: any) =>
  query
    .select("request.id", "id")
    .addSelect("request.matricula", "registration")
    .addSelect("usuario.nome", "requesterName")
    .addSelect("request.unidade_dass", "dassOffice")
    .addSelect("request.catalog_item_id", "catalogItemId")
    .addSelect("catalog.name", "catalogItemName")
    .addSelect("catalog.points_cost", "catalogItemPointsCost")
    .addSelect("catalog.item_type", "catalogItemType")
    .addSelect("request.request_status", "requestStatus")
    .addSelect("request.reserved_ledger_entry_id", "reservedLedgerEntryId")
    .addSelect("request.approval_actor_registration", "approvalActorRegistration")
    .addSelect("request.approval_actor_name", "approvalActorName")
    .addSelect("request.fulfillment_type", "fulfillmentType")
    .addSelect("request.legacy_prize_id", "legacyPrizeId")
    .addSelect("request.createdat", "createdAt")
    .addSelect("request.updatedat", "updatedAt");

export const MarketplaceService = {
  async listCatalog(dassOffice: string): Promise<MarketplaceCatalogItemRecord[]> {
    const validDassOffice = assertDassOffice(dassOffice);
    const dataSource = await initializeDatabase();
    const rows = await dataSource
      .getRepository(MarketplaceCatalogItemEntity)
      .createQueryBuilder("item")
      .select("item.id", "id")
      .addSelect("item.legacy_product_id", "legacyProductId")
      .addSelect("item.unidade_dass", "dassOffice")
      .addSelect("item.name", "name")
      .addSelect("item.image_url", "imageUrl")
      .addSelect("item.points_cost", "pointsCost")
      .addSelect("item.item_type", "itemType")
      .addSelect("item.active", "active")
      .addSelect("item.available_quantity", "availableQuantity")
      .addSelect("item.metadata", "metadata")
      .where("item.unidade_dass = :dassOffice", { dassOffice: validDassOffice })
      .andWhere("item.active = true")
      .orderBy("item.name", "ASC")
      .getRawMany<Record<string, unknown>>();

    return rows.map(mapCatalogRow);
  },

  async upsertCatalogItems(
    dassOffice: string,
    items: UpsertCatalogItemInput[],
    actor: AuthenticatedSessionContext
  ): Promise<MarketplaceCatalogItemRecord[]> {
    const validDassOffice = assertDassOffice(dassOffice);
    if (!Array.isArray(items) || !items.length) {
      throw new CustomError("Informe ao menos um item de catálogo.", 400);
    }

    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const repository = queryRunner.manager.getRepository(MarketplaceCatalogItemEntity);
      const now = new Date();

      for (const item of items) {
        if (!item.name || item.pointsCost <= 0) {
          throw new CustomError("Dados inválidos para item de catálogo.", 400);
        }

        if (item.id) {
          const current = await repository.findOne({
            where: { id: String(item.id), unidade_dass: validDassOffice },
          });
          if (!current) {
            throw new CustomError("Item de catálogo não encontrado.", 404);
          }

          await AuditService.recordEvent(queryRunner, {
            eventType: "catalog.item.updated",
            aggregateType: "catalog_item",
            aggregateId: current.id,
            dassOffice: validDassOffice,
            actorRegistration: actor.registration,
            actorRole: "catalog.manage",
            beforeState: {
              name: current.name,
              points_cost: Number(current.points_cost),
              active: current.active,
              item_type: current.item_type,
            },
            afterState: {
              name: item.name,
              points_cost: item.pointsCost,
              active: item.active ?? current.active,
              item_type: item.itemType ?? current.item_type,
            },
            correlationId: randomUUID(),
          });

          await repository.update(
            { id: String(item.id), unidade_dass: validDassOffice },
            {
              name: item.name,
              image_url: item.imageUrl ?? current.image_url,
              points_cost: String(item.pointsCost),
              item_type: item.itemType ?? current.item_type,
              active: item.active ?? current.active,
              available_quantity:
                item.availableQuantity === undefined
                  ? current.available_quantity
                  : item.availableQuantity === null
                    ? null
                    : String(item.availableQuantity),
              metadata: (item.metadata ?? current.metadata) as any,
              updated_by: actor.registration,
              updatedat: now,
            }
          );
        } else {
          const created = await repository.save(
            repository.create({
              legacy_product_id: null,
              unidade_dass: validDassOffice,
              name: item.name,
              image_url: item.imageUrl ?? null,
              points_cost: String(item.pointsCost),
              item_type: item.itemType ?? "physical",
              active: item.active ?? true,
              available_quantity:
                item.availableQuantity === null || item.availableQuantity === undefined
                  ? null
                  : String(item.availableQuantity),
              metadata: item.metadata ?? null,
              created_by: actor.registration,
              updated_by: actor.registration,
              createdat: now,
              updatedat: now,
            })
          );

          await AuditService.recordEvent(queryRunner, {
            eventType: "catalog.item.created",
            aggregateType: "catalog_item",
            aggregateId: created.id,
            dassOffice: validDassOffice,
            actorRegistration: actor.registration,
            actorRole: "catalog.manage",
            afterState: {
              name: created.name,
              points_cost: Number(created.points_cost),
              item_type: created.item_type,
            },
            correlationId: randomUUID(),
          });
        }
      }

      await queryRunner.commitTransaction();
      return this.listCatalog(validDassOffice);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },

  async createRequest(
    input: CreateMarketplaceRequestInput,
    actor: MarketplaceRequestActor
  ): Promise<MarketplaceRequestRecord> {
    const validDassOffice = assertDassOffice(input.dassOffice);
    const registration = String(actor.registration);
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await LedgerService.syncBalanceProjection(
        queryRunner,
        registration,
        validDassOffice
      );

      const balanceRows = (await queryRunner.query(
        `
          SELECT available_balance
          FROM pense_aja.points_balance_projection
          WHERE matricula = $1
            AND unidade_dass = $2
          FOR UPDATE
        `,
        [registration, validDassOffice]
      )) as Array<{ available_balance: string }>;

      const catalogRepository = queryRunner.manager.getRepository(
        MarketplaceCatalogItemEntity
      );
      const item = await catalogRepository.findOne({
        where: {
          id: String(input.catalogItemId),
          unidade_dass: validDassOffice,
          active: true,
        },
      });

      if (!item) {
        throw new CustomError("Item de catálogo não encontrado.", 404);
      }

      if (
        item.available_quantity !== null &&
        Number(item.available_quantity) <= 0
      ) {
        throw new CustomError("Item sem disponibilidade para resgate.", 400);
      }

      const availableBalance = Number(balanceRows[0]?.available_balance ?? 0);

      if (availableBalance < Number(item.points_cost)) {
        throw new CustomError("Pontos insuficientes para solicitar resgate.", 400);
      }

      const now = new Date();
      const correlationId = randomUUID();
      const requestRepository = queryRunner.manager.getRepository(
        MarketplaceRedemptionRequestEntity
      );
      const request = await requestRepository.save(
        requestRepository.create({
          matricula: registration,
          unidade_dass: validDassOffice,
          catalog_item_id: String(item.id),
          request_status: "pending_approval",
          reserved_ledger_entry_id: null,
          approval_actor_registration: null,
          approval_actor_name: null,
          fulfillment_type:
            item.item_type === "voucher" ? "voucher_issue" : "physical_delivery",
          legacy_prize_id: null,
          createdat: now,
          updatedat: now,
        })
      );

      const reserveEntry = await LedgerService.createEntry(queryRunner, {
        registration,
        dassOffice: validDassOffice,
        entryType: "reserve",
        amount: Number(item.points_cost),
        sourceType: "marketplace_redemption",
        sourceId: String(request.id),
        correlationId,
        reason: input.reason ?? "Reserva de saldo para solicitação de resgate.",
        createdByRegistration: actor.registration,
        createdByName: actor.username,
        metadata: {
          catalogItemId: String(item.id),
          itemType: item.item_type,
        },
      });

      await requestRepository.update(
        { id: request.id },
        { reserved_ledger_entry_id: String(reserveEntry.id), updatedat: now }
      );

      await AuditService.recordEvent(queryRunner, {
        eventType: "marketplace.request.created",
        aggregateType: "marketplace_redemption",
        aggregateId: request.id,
        dassOffice: validDassOffice,
        actorRegistration: actor.registration,
        actorRole: "authenticated_user",
        reason: input.reason ?? null,
        afterState: {
          request_status: "pending_approval",
          catalog_item_id: String(item.id),
          reserved_ledger_entry_id: Number(reserveEntry.id),
        },
        correlationId,
      });

      await LedgerService.syncBalanceProjection(
        queryRunner,
        registration,
        validDassOffice
      );

      await queryRunner.commitTransaction();
      return this.getRequestById(String(request.id), validDassOffice);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },

  async listRequests(
    filters: MarketplaceRequestListFilters
  ): Promise<MarketplaceRequestListResponse> {
    const validDassOffice = assertDassOffice(filters.dassOffice);
    const page = normalizePage(filters.page);
    const limit = normalizeLimit(filters.limit);
    const status = normalizeStatus(filters.status ? String(filters.status) : undefined);
    const registration = normalizeRegistration(filters.registration);
    const dataSource = await initializeDatabase();
    const query = dataSource
      .getRepository(MarketplaceRedemptionRequestEntity)
      .createQueryBuilder("request")
      .leftJoin(
        MarketplaceCatalogItemEntity as any,
        "catalog",
        "catalog.id::text = request.catalog_item_id AND catalog.unidade_dass = request.unidade_dass"
      )
      .leftJoin(
        UsuarioEntity as any,
        "usuario",
        "usuario.matricula = request.matricula"
      )
      .where("request.unidade_dass = :dassOffice", { dassOffice: validDassOffice })
      .orderBy("request.updatedat", "DESC");

    if (status) {
      query.andWhere("request.request_status = :status", { status });
    }

    if (registration) {
      query.andWhere("request.matricula = :registration", { registration });
    }

    const total = await query.clone().getCount();
    const rows = await applyRequestSelects(query)
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return {
      data: rows.map(mapRequestRow),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async listPublicRequests(
    filters: MarketplaceRequestListFilters
  ): Promise<MarketplaceRequestListResponse> {
    if (!filters.registration) {
      throw new CustomError("Matrícula obrigatória para consulta pública.", 400);
    }

    return this.listRequests(filters);
  },

  async listOwnRequests(
    filters: MarketplaceRequestListFilters,
    registration: string | number | undefined
  ): Promise<MarketplaceRequestListResponse> {
    if (!registration) {
      throw new CustomError("Matrícula autenticada obrigatória.", 400);
    }

    return this.listRequests({
      ...filters,
      registration,
    });
  },

  async getRequestById(id: string, dassOffice: DassOffice): Promise<MarketplaceRequestRecord> {
    const dataSource = await initializeDatabase();
    const query = dataSource
      .getRepository(MarketplaceRedemptionRequestEntity)
      .createQueryBuilder("request")
      .leftJoin(
        MarketplaceCatalogItemEntity as any,
        "catalog",
        "catalog.id::text = request.catalog_item_id AND catalog.unidade_dass = request.unidade_dass"
      )
      .leftJoin(
        UsuarioEntity as any,
        "usuario",
        "usuario.matricula = request.matricula"
      )
      .where("request.id = :id", { id: Number(id) })
      .andWhere("request.unidade_dass = :dassOffice", { dassOffice });

    const row = await applyRequestSelects(query)
      .getRawOne();

    if (!row) {
      throw new CustomError("Solicitação de marketplace não encontrada.", 404);
    }

    return mapRequestRow(row);
  },

  async approveRequest(
    id: string,
    input: MarketplaceTransitionInput,
    actor: AuthenticatedSessionContext
  ) {
    return this.transitionRequest(id, input, actor, {
      expected: ["pending_approval"],
      status: "completed",
      eventType: "marketplace.request.approved",
      ledgerEntryType: "commit",
      setApprovalActor: true,
    });
  },

  async rejectRequest(
    id: string,
    input: MarketplaceTransitionInput,
    actor: AuthenticatedSessionContext
  ) {
    return this.transitionRequest(id, input, actor, {
      expected: ["pending_approval"],
      status: "rejected",
      eventType: "marketplace.request.rejected",
      ledgerEntryType: "release",
    });
  },

  async executeFulfillment(
    id: string,
    input: ExecuteFulfillmentInput,
    actor: AuthenticatedSessionContext
  ) {
    const validDassOffice = assertDassOffice(input.dassOffice);
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const requestRepository = queryRunner.manager.getRepository(
        MarketplaceRedemptionRequestEntity
      );
      const request = await requestRepository.findOne({
        where: { id: Number(id), unidade_dass: validDassOffice },
        lock: { mode: "pessimistic_write" },
      });

      if (!request) {
        throw new CustomError("Solicitação de marketplace não encontrada.", 404);
      }

      if (!["approved", "fulfillment_in_progress"].includes(request.request_status)) {
        throw new CustomError("Solicitação não está aprovada para fulfillment.", 409);
      }

      const now = new Date();
      const stepType = input.stepType ?? request.fulfillment_type;
      await queryRunner.manager.getRepository(MarketplaceFulfillmentStepEntity).save({
        redemption_request_id: String(request.id),
        step_type: stepType,
        step_status: "completed",
        actor_registration: actor.registration,
        actor_name: actor.username,
        notes: input.notes ?? null,
        metadata: input.metadata ?? null,
        createdat: now,
        updatedat: now,
      });

      if (stepType === "voucher_issue") {
        const policy = await queryRunner.manager
          .getRepository(UnitMarketplacePolicyEntity)
          .findOne({ where: { unidade_dass: validDassOffice } });
        await VoucherAdapterService.issueVoucher(queryRunner, {
          redemptionRequestId: request.id,
          adapter: policy?.voucher_adapter ?? "noop",
          payload: {
            redemptionRequestId: Number(request.id),
            registration: String(request.matricula),
            catalogItemId: String(request.catalog_item_id),
          },
        });
      }

      await requestRepository.update(
        { id: request.id },
        {
          request_status: "fulfillment_in_progress",
          updatedat: now,
        }
      );

      await AuditService.recordEvent(queryRunner, {
        eventType: "marketplace.fulfillment.executed",
        aggregateType: "marketplace_redemption",
        aggregateId: request.id,
        dassOffice: validDassOffice,
        actorRegistration: actor.registration,
        actorRole: "marketplace.fulfillment.execute",
        reason: input.reason ?? input.notes ?? null,
        beforeState: { request_status: request.request_status },
        afterState: {
          request_status: "fulfillment_in_progress",
          step_type: stepType,
        },
        metadata: input.metadata ?? null,
        correlationId: randomUUID(),
      });

      await queryRunner.commitTransaction();
      return this.getRequestById(id, validDassOffice);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },

  async completeRequest(
    id: string,
    input: MarketplaceTransitionInput,
    actor: AuthenticatedSessionContext
  ) {
    return this.transitionRequest(id, input, actor, {
      expected: ["approved", "fulfillment_in_progress"],
      status: "completed",
      eventType: "marketplace.request.completed",
      ledgerEntryType: "commit",
    });
  },

  async cancelRequest(
    id: string,
    input: MarketplaceTransitionInput,
    actor: AuthenticatedSessionContext
  ) {
    return this.transitionRequest(id, input, actor, {
      expected: ["pending_approval", "approved", "fulfillment_in_progress"],
      status: "cancelled",
      eventType: "marketplace.request.cancelled",
      ledgerEntryType: "release",
    });
  },

  async refundRequest(
    id: string,
    input: MarketplaceTransitionInput,
    actor: AuthenticatedSessionContext
  ) {
    return this.transitionRequest(id, input, actor, {
      expected: ["completed"],
      status: "refunded",
      eventType: "marketplace.request.refunded",
      ledgerEntryType: "refund",
    });
  },

  async transitionRequest(
    id: string,
    input: MarketplaceTransitionInput,
    actor: AuthenticatedSessionContext,
    transition: {
      expected: string[];
      status: string;
      eventType: string;
      ledgerEntryType?: "release" | "commit" | "refund";
      setApprovalActor?: boolean;
    }
  ): Promise<MarketplaceRequestRecord> {
    const validDassOffice = assertDassOffice(input.dassOffice);
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const requestRepository = queryRunner.manager.getRepository(
        MarketplaceRedemptionRequestEntity
      );
      const request = await requestRepository.findOne({
        where: { id: Number(id), unidade_dass: validDassOffice },
      });
      
      if (!request) {
        throw new CustomError("Solicitação de marketplace não encontrada.", 404);
      }

      if (!transition.expected.includes(request.request_status)) {
        throw new CustomError("Transição de marketplace inválida.", 409);
      }

      const item = await queryRunner.manager
        .getRepository(MarketplaceCatalogItemEntity)
        .findOne({
          where: {
            id: String(request.catalog_item_id),
            unidade_dass: validDassOffice,
          },
        });

      if (!item) {
        throw new CustomError("Item de catálogo não encontrado.", 404);
      }

      const correlationId = randomUUID();
      if (transition.ledgerEntryType) {
        await LedgerService.createEntry(queryRunner, {
          registration: String(request.matricula),
          dassOffice: validDassOffice,
          entryType: transition.ledgerEntryType,
          amount: Number(item.points_cost),
          sourceType: "marketplace_redemption",
          sourceId: String(request.id),
          relatedEntryId: request.reserved_ledger_entry_id,
          correlationId,
          reason: input.reason ?? null,
          createdByRegistration: actor.registration,
          createdByName: actor.username,
          metadata: {
            previousStatus: request.request_status,
            newStatus: transition.status,
            catalogItemId: String(item.id),
          },
        });
      }

      await requestRepository.update(
        { id: request.id },
        {
          request_status: transition.status,
          approval_actor_registration:
            transition.setApprovalActor
              ? actor.registration
              : request.approval_actor_registration,
          approval_actor_name:
            transition.setApprovalActor
              ? actor.username
              : request.approval_actor_name,
          updatedat: new Date(),
        }
      );

      await LedgerService.syncBalanceProjection(
        queryRunner,
        String(request.matricula),
        validDassOffice
      );

      await AuditService.recordEvent(queryRunner, {
        eventType: transition.eventType,
        aggregateType: "marketplace_redemption",
        aggregateId: request.id,
        dassOffice: validDassOffice,
        actorRegistration: actor.registration,
        actorRole: transition.eventType,
        reason: input.reason ?? null,
        beforeState: { request_status: request.request_status },
        afterState: { request_status: transition.status },
        metadata: input.metadata ?? null,
        correlationId,
      });

      await queryRunner.commitTransaction();
      return this.getRequestById(id, validDassOffice);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await releaseQueryRunner(queryRunner);
    }
  },
};
