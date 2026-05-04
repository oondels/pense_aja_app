import { EntitySchema } from "typeorm";

export interface UnitConfig {
  id: string;
  unidade_dass: string;
  active: boolean;
  metadata: Record<string, unknown> | null;
  createdat: Date;
  updatedat: Date;
}

const UnitConfigEntity = new EntitySchema<UnitConfig>({
  name: "UnitConfig",
  tableName: "unit_configs",
  schema: "pense_aja",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    unidade_dass: {
      type: String,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: "jsonb",
      nullable: true,
    },
    createdat: {
      type: "timestamptz",
    },
    updatedat: {
      type: "timestamptz",
    },
  },
});

export default UnitConfigEntity;
