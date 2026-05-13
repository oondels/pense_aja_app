import { EntitySchema } from "typeorm";

export interface PointsLedgerEntry {
  id: number;
  matricula: string;
  unidade_dass: string;
  entry_type: string;
  amount: string;
  status: string;
  source_type: string;
  source_id: string;
  related_entry_id: string | null;
  correlation_id: string;
  reason: string | null;
  created_by_registration: string | null;
  created_by_name: string | null;
  metadata: Record<string, unknown> | null;
  createdat: Date;
}

const PointsLedgerEntryEntity = new EntitySchema<PointsLedgerEntry>({
  name: "PointsLedgerEntry",
  tableName: "points_ledger_entries",
  schema: "pense_aja",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    matricula: {
      type: "bigint",
    },
    unidade_dass: {
      type: String,
    },
    entry_type: {
      type: String,
    },
    amount: {
      type: "bigint",
    },
    status: {
      type: String,
      default: "confirmed",
    },
    source_type: {
      type: String,
    },
    source_id: {
      type: String,
    },
    related_entry_id: {
      type: "bigint",
      nullable: true,
    },
    correlation_id: {
      type: String,
    },
    reason: {
      type: "text",
      nullable: true,
    },
    created_by_registration: {
      type: "bigint",
      nullable: true,
    },
    created_by_name: {
      type: String,
      nullable: true,
    },
    metadata: {
      type: "jsonb",
      nullable: true,
    },
    createdat: {
      type: "timestamptz",
    },
  },
});

export default PointsLedgerEntryEntity;
