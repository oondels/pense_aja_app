import { QueryRunner } from "typeorm";
import AuditEventEntity from "../models/AuditEvent";
import { AuditTimelineItem, DassOffice } from "../types/contracts";
import { initializeDatabase } from "../config/database";

interface RecordAuditEventInput {
  eventType: string;
  aggregateType: string;
  aggregateId: string | number;
  dassOffice: DassOffice;
  actorRegistration?: string | null;
  actorRole?: string | null;
  reason?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  correlationId: string;
}

export const AuditService = {
  async recordEvent(
    queryRunner: QueryRunner,
    input: RecordAuditEventInput
  ): Promise<void> {
    const repository = queryRunner.manager.getRepository(AuditEventEntity);
    await repository.save(
      repository.create({
        event_type: input.eventType,
        aggregate_type: input.aggregateType,
        aggregate_id: String(input.aggregateId),
        unidade_dass: input.dassOffice,
        actor_registration: input.actorRegistration ?? null,
        actor_role: input.actorRole ?? null,
        reason: input.reason ?? null,
        before_state: input.beforeState ?? null,
        after_state: input.afterState ?? null,
        metadata: input.metadata ?? null,
        correlation_id: input.correlationId,
        createdat: new Date(),
      })
    );
  },

  async getIdeaAuditTimeline(
    ideaId: string,
    dassOffice: DassOffice
  ): Promise<AuditTimelineItem[]> {
    const dataSource = await initializeDatabase();
    const rows = await dataSource
      .getRepository(AuditEventEntity)
      .createQueryBuilder("audit")
      .select("audit.id", "id")
      .addSelect("audit.event_type", "eventType")
      .addSelect("audit.aggregate_type", "aggregateType")
      .addSelect("audit.aggregate_id", "aggregateId")
      .addSelect("audit.unidade_dass", "dassOffice")
      .addSelect("audit.actor_registration", "actorRegistration")
      .addSelect("audit.actor_role", "actorRole")
      .addSelect("audit.reason", "reason")
      .addSelect("audit.before_state", "beforeState")
      .addSelect("audit.after_state", "afterState")
      .addSelect("audit.metadata", "metadata")
      .addSelect("audit.correlation_id", "correlationId")
      .addSelect("audit.createdat", "createdAt")
      .where("audit.aggregate_type = :aggregateType", { aggregateType: "idea" })
      .andWhere("audit.aggregate_id = :aggregateId", { aggregateId: String(ideaId) })
      .andWhere("audit.unidade_dass = :dassOffice", { dassOffice })
      .orderBy("audit.createdat", "DESC")
      .getRawMany<AuditTimelineItem>();

    return rows.map((row) => ({
      ...row,
      id: Number(row.id),
      aggregateId: String(row.aggregateId),
      actorRegistration: row.actorRegistration ? String(row.actorRegistration) : null,
    }));
  },
};
