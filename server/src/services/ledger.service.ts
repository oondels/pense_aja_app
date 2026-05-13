import { randomUUID } from "crypto";
import { QueryRunner } from "typeorm";
import { initializeDatabase } from "../config/database";
import PointsBalanceProjectionEntity from "../models/PointsBalanceProjection";
import PointsLedgerEntryEntity from "../models/PointsLedgerEntry";
import {
  AuthenticatedSessionContext,
  CreatePointsAdjustmentInput,
  DassOffice,
  LedgerEntryType,
  PointsAdjustmentResponse,
  UserLedgerHistoryItem,
} from "../types/contracts";
import { CustomError } from "../types/CustomError";
import { AuditService } from "./audit.service";

interface CreateLedgerEntryInput {
  registration: string;
  dassOffice: DassOffice;
  entryType: LedgerEntryType;
  amount: number;
  sourceType: string;
  sourceId: string;
  correlationId: string;
  reason?: string | null;
  relatedEntryId?: string | number | null;
  createdByRegistration?: string | null;
  createdByName?: string | null;
  metadata?: Record<string, unknown> | null;
}

const toPositiveInteger = (value: number) => Math.max(0, Math.trunc(value));
const ledgerTypes: LedgerEntryType[] = [
  "earn",
  "reverse",
  "reserve",
  "commit",
  "release",
  "refund",
];

export const calculateBalanceProjection = (aggregate: {
  totalEarned: number;
  totalReservedRaw: number;
  totalCommitted: number;
  totalRefunded: number;
  totalReversed: number;
}) => {
  const totalReserved = Math.max(aggregate.totalReservedRaw, 0);
  const availableBalance =
    aggregate.totalEarned -
    aggregate.totalReversed -
    aggregate.totalCommitted -
    totalReserved +
    aggregate.totalRefunded;

  return {
    totalEarned: aggregate.totalEarned,
    totalReserved,
    totalCommitted: aggregate.totalCommitted,
    totalRefunded: aggregate.totalRefunded,
    totalReversed: aggregate.totalReversed,
    availableBalance,
  };
};

export const LedgerService = {
  async createEntry(queryRunner: QueryRunner, input: CreateLedgerEntryInput) {
    const repository = queryRunner.manager.getRepository(PointsLedgerEntryEntity);
    const amount = toPositiveInteger(input.amount);

    if (!ledgerTypes.includes(input.entryType)) {
      throw new Error(`Tipo de lançamento inválido: ${input.entryType}`);
    }

    if (amount <= 0) {
      throw new Error("Lançamento de ledger deve possuir valor positivo.");
    }

    return repository.save(
      repository.create({
        matricula: input.registration,
        unidade_dass: input.dassOffice,
        entry_type: input.entryType,
        amount: String(amount),
        status: "confirmed",
        source_type: input.sourceType,
        source_id: input.sourceId,
        related_entry_id: input.relatedEntryId
          ? String(input.relatedEntryId)
          : null,
        correlation_id: input.correlationId,
        reason: input.reason ?? null,
        created_by_registration: input.createdByRegistration ?? null,
        created_by_name: input.createdByName ?? null,
        metadata: input.metadata ?? null,
        createdat: new Date(),
      })
    );
  },

  async syncBalanceProjection(
    queryRunner: QueryRunner,
    registration: string,
    dassOffice: DassOffice
  ) {
    const rows = (await queryRunner.query(
      `
        SELECT
          COALESCE(SUM(CASE WHEN entry_type = 'earn' THEN amount ELSE 0 END), 0) AS total_earned,
          COALESCE(SUM(CASE WHEN entry_type = 'reserve' THEN amount ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN entry_type = 'release' THEN amount ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN entry_type = 'commit' THEN amount ELSE 0 END), 0) AS total_reserved_raw,
          COALESCE(SUM(CASE WHEN entry_type = 'commit' THEN amount ELSE 0 END), 0) AS total_committed,
          COALESCE(SUM(CASE WHEN entry_type = 'refund' THEN amount ELSE 0 END), 0) AS total_refunded,
          COALESCE(SUM(CASE WHEN entry_type = 'reverse' THEN amount ELSE 0 END), 0) AS total_reversed
        FROM pense_aja.points_ledger_entries
        WHERE matricula = $1
          AND unidade_dass = $2
          AND status = 'confirmed'
      `,
      [registration, dassOffice]
    )) as Array<{
      total_earned: string;
      total_reserved_raw: string;
      total_committed: string;
      total_refunded: string;
      total_reversed: string;
    }>;

    const aggregate = rows[0] ?? {
      total_earned: "0",
      total_reserved_raw: "0",
      total_committed: "0",
      total_refunded: "0",
      total_reversed: "0",
    };

    const projection = calculateBalanceProjection({
      totalEarned: Number(aggregate.total_earned),
      totalReservedRaw: Number(aggregate.total_reserved_raw),
      totalCommitted: Number(aggregate.total_committed),
      totalRefunded: Number(aggregate.total_refunded),
      totalReversed: Number(aggregate.total_reversed),
    });
    const repository = queryRunner.manager.getRepository(PointsBalanceProjectionEntity);
    const existing = await repository.findOne({
      where: {
        matricula: registration,
        unidade_dass: dassOffice,
      },
    });
    const now = new Date();

    if (existing) {
      await repository.update(
        { id: existing.id },
        {
          total_earned: String(projection.totalEarned),
          total_reserved: String(projection.totalReserved),
          total_committed: String(projection.totalCommitted),
          total_refunded: String(projection.totalRefunded),
          total_reversed: String(projection.totalReversed),
          available_balance: String(projection.availableBalance),
          updatedat: now,
        }
      );
      return;
    }

    await repository.save(
      repository.create({
        matricula: registration,
        unidade_dass: dassOffice,
        total_earned: String(projection.totalEarned),
        total_reserved: String(projection.totalReserved),
        total_committed: String(projection.totalCommitted),
        total_refunded: String(projection.totalRefunded),
        total_reversed: String(projection.totalReversed),
        available_balance: String(projection.availableBalance),
        updatedat: now,
      })
    );
  },

  async getProjectedBalance(registration: number, dassOffice: DassOffice) {
    const dataSource = await initializeDatabase();
    return dataSource.getRepository(PointsBalanceProjectionEntity).findOne({
      where: {
        matricula: String(registration),
        unidade_dass: dassOffice,
      },
    });
  },

  async createManualAdjustment(
    registration: string,
    input: CreatePointsAdjustmentInput,
    actor: AuthenticatedSessionContext
  ): Promise<PointsAdjustmentResponse> {
    const amount = toPositiveInteger(Number(input.amount));
    const reason = String(input.reason || "").trim();

    if (!amount) {
      throw new CustomError("Ajuste de pontuação deve possuir valor positivo.", 400);
    }

    if (!reason) {
      throw new CustomError("Justificativa do ajuste de pontuação é obrigatória.", 400);
    }

    if (input.direction !== "credit" && input.direction !== "debit") {
      throw new CustomError("Direção do ajuste de pontuação inválida.", 400);
    }

    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();
    const correlationId = randomUUID();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await this.syncBalanceProjection(queryRunner, registration, input.dassOffice);

      const projectionRepository = queryRunner.manager.getRepository(
        PointsBalanceProjectionEntity
      );
      const projection = await projectionRepository.findOne({
        where: {
          matricula: registration,
          unidade_dass: input.dassOffice,
        },
      });
      const availableBalance = Number(projection?.available_balance ?? 0);

      if (input.direction === "debit" && amount > availableBalance) {
        throw new CustomError(
          "Ajuste de subtração não pode deixar saldo disponível negativo.",
          400
        );
      }

      const entry = await this.createEntry(queryRunner, {
        registration,
        dassOffice: input.dassOffice,
        entryType: input.direction === "credit" ? "earn" : "reverse",
        amount,
        sourceType: "manual_adjustment",
        sourceId: correlationId,
        correlationId,
        reason,
        createdByRegistration: actor.registration,
        createdByName: actor.username,
        metadata: {
          direction: input.direction,
          adjustedRegistration: registration,
        },
      });

      await this.syncBalanceProjection(queryRunner, registration, input.dassOffice);
      const updatedProjection = await projectionRepository.findOne({
        where: {
          matricula: registration,
          unidade_dass: input.dassOffice,
        },
      });

      await AuditService.recordEvent(queryRunner, {
        eventType: "points.adjusted",
        aggregateType: "user_points",
        aggregateId: registration,
        dassOffice: input.dassOffice,
        actorRegistration: actor.registration,
        actorRole: "points.adjust",
        reason,
        beforeState: {
          availableBalance,
        },
        afterState: {
          availableBalance: Number(updatedProjection?.available_balance ?? 0),
        },
        metadata: {
          direction: input.direction,
          amount,
          ledgerEntryId: Number(entry.id),
        },
        correlationId,
      });

      await queryRunner.commitTransaction();
      return {
        id: Number(entry.id),
        registration,
        dassOffice: input.dassOffice,
        direction: input.direction,
        amount,
        reason,
        availableBalance: Number(updatedProjection?.available_balance ?? 0),
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  },

  async getSourceNetAmount(
    queryRunner: QueryRunner,
    input: {
      registration: string;
      dassOffice: DassOffice;
      sourceType: string;
      sourceId: string;
    }
  ): Promise<{ netAmount: number; latestEarnEntryId: number | null }> {
    const rows = (await queryRunner.query(
      `
        SELECT
          COALESCE(SUM(CASE WHEN entry_type = 'earn' THEN amount ELSE 0 END), 0)
            - COALESCE(SUM(CASE WHEN entry_type = 'reverse' THEN amount ELSE 0 END), 0) AS net_amount,
          (
            SELECT id
            FROM pense_aja.points_ledger_entries latest
            WHERE latest.matricula = $1
              AND latest.unidade_dass = $2
              AND latest.source_type = $3
              AND latest.source_id = $4
              AND latest.entry_type = 'earn'
              AND latest.status = 'confirmed'
            ORDER BY latest.createdat DESC, latest.id DESC
            LIMIT 1
          ) AS latest_earn_entry_id
        FROM pense_aja.points_ledger_entries
        WHERE matricula = $1
          AND unidade_dass = $2
          AND source_type = $3
          AND source_id = $4
          AND status = 'confirmed'
      `,
      [input.registration, input.dassOffice, input.sourceType, input.sourceId]
    )) as Array<{ net_amount: string; latest_earn_entry_id: string | null }>;

    return {
      netAmount: Number(rows[0]?.net_amount ?? 0),
      latestEarnEntryId: rows[0]?.latest_earn_entry_id
        ? Number(rows[0].latest_earn_entry_id)
        : null,
    };
  },

  async getUserLedgerHistory(
    registration: number,
    dassOffice: DassOffice
  ): Promise<UserLedgerHistoryItem[]> {
    const dataSource = await initializeDatabase();
    const rows = await dataSource
      .getRepository(PointsLedgerEntryEntity)
      .createQueryBuilder("ledger")
      .select("ledger.id", "id")
      .addSelect("ledger.entry_type", "entryType")
      .addSelect("ledger.amount", "amount")
      .addSelect("ledger.source_type", "sourceType")
      .addSelect("ledger.source_id", "sourceId")
      .addSelect("ledger.related_entry_id", "relatedEntryId")
      .addSelect("ledger.reason", "reason")
      .addSelect("ledger.correlation_id", "correlationId")
      .addSelect("ledger.created_by_registration", "createdByRegistration")
      .addSelect("ledger.created_by_name", "createdByName")
      .addSelect("ledger.createdat", "createdAt")
      .addSelect("ledger.unidade_dass", "dassOffice")
      .where("ledger.matricula = :registration", {
        registration: String(registration),
      })
      .andWhere("ledger.unidade_dass = :dassOffice", { dassOffice })
      .orderBy("ledger.createdat", "DESC")
      .getRawMany<UserLedgerHistoryItem>();

    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
      amount: Number(row.amount),
      relatedEntryId: row.relatedEntryId ? Number(row.relatedEntryId) : null,
      createdByRegistration: row.createdByRegistration
        ? String(row.createdByRegistration)
        : null,
    }));
  },
};
