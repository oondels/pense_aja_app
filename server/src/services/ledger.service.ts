import { QueryRunner } from "typeorm";
import { initializeDatabase } from "../config/database";
import PointsBalanceProjectionEntity from "../models/PointsBalanceProjection";
import PointsLedgerEntryEntity from "../models/PointsLedgerEntry";
import {
  DassOffice,
  LedgerEntryType,
  UserLedgerHistoryItem,
} from "../types/contracts";

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

export const LedgerService = {
  async createEntry(queryRunner: QueryRunner, input: CreateLedgerEntryInput) {
    const repository = queryRunner.manager.getRepository(PointsLedgerEntryEntity);
    const amount = toPositiveInteger(input.amount);

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
            - COALESCE(SUM(CASE WHEN entry_type = 'commit' THEN amount ELSE 0 END), 0) AS total_reserved,
          COALESCE(SUM(CASE WHEN entry_type = 'commit' THEN amount ELSE 0 END), 0) AS total_committed,
          COALESCE(SUM(CASE WHEN entry_type = 'reverse' THEN amount ELSE 0 END), 0) AS total_reversed
        FROM pense_aja.points_ledger_entries
        WHERE matricula = $1
          AND unidade_dass = $2
          AND status = 'confirmed'
      `,
      [registration, dassOffice]
    )) as Array<{
      total_earned: string;
      total_reserved: string;
      total_committed: string;
      total_reversed: string;
    }>;

    const aggregate = rows[0] ?? {
      total_earned: "0",
      total_reserved: "0",
      total_committed: "0",
      total_reversed: "0",
    };

    const totalEarned = Number(aggregate.total_earned);
    const totalReserved = Number(aggregate.total_reserved);
    const totalCommitted = Number(aggregate.total_committed);
    const totalReversed = Number(aggregate.total_reversed);
    const availableBalance =
      totalEarned - totalReserved - totalCommitted - totalReversed;
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
          total_earned: String(totalEarned),
          total_reserved: String(totalReserved),
          total_committed: String(totalCommitted),
          total_reversed: String(totalReversed),
          available_balance: String(availableBalance),
          updatedat: now,
        }
      );
      return;
    }

    await repository.save(
      repository.create({
        matricula: registration,
        unidade_dass: dassOffice,
        total_earned: String(totalEarned),
        total_reserved: String(totalReserved),
        total_committed: String(totalCommitted),
        total_reversed: String(totalReversed),
        available_balance: String(availableBalance),
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
