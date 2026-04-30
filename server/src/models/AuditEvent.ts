import { EntitySchema } from "typeorm";

export interface AuditEvent {
  id: number;
  event_type: string;
  aggregate_type: string;
  aggregate_id: string;
  unidade_dass: string;
  actor_registration: string | null;
  actor_role: string | null;
  reason: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  correlation_id: string;
  createdat: Date;
}

const AuditEventEntity = new EntitySchema<AuditEvent>({
  name: "AuditEvent",
  tableName: "audit_events",
  schema: "pense_aja",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    event_type: {
      type: String,
    },
    aggregate_type: {
      type: String,
    },
    aggregate_id: {
      type: String,
    },
    unidade_dass: {
      type: String,
    },
    actor_registration: {
      type: "bigint",
      nullable: true,
    },
    actor_role: {
      type: String,
      nullable: true,
    },
    reason: {
      type: "text",
      nullable: true,
    },
    before_state: {
      type: "jsonb",
      nullable: true,
    },
    after_state: {
      type: "jsonb",
      nullable: true,
    },
    metadata: {
      type: "jsonb",
      nullable: true,
    },
    correlation_id: {
      type: String,
    },
    createdat: {
      type: "timestamptz",
    },
  },
});

export default AuditEventEntity;
