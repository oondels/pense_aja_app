import { EntitySchema } from "typeorm";

export interface RbacSessionSnapshot {
  id: number;
  session_key: string;
  matricula: string;
  unidade_dass: string;
  permissions: string[];
  version: number;
  expires_at: Date;
  createdat: Date;
  updatedat: Date;
}

const RbacSessionSnapshotEntity = new EntitySchema<RbacSessionSnapshot>({
  name: "RbacSessionSnapshot",
  tableName: "rbac_session_snapshots",
  schema: "pense_aja",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    session_key: {
      type: String,
      unique: true,
    },
    matricula: {
      type: "bigint",
    },
    unidade_dass: {
      type: String,
    },
    permissions: {
      type: "jsonb",
    },
    version: {
      type: Number,
      default: 1,
    },
    expires_at: {
      type: "timestamptz",
    },
    createdat: {
      type: "timestamptz",
    },
    updatedat: {
      type: "timestamptz",
    },
  },
});

export default RbacSessionSnapshotEntity;
