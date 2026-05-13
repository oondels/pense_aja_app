import { EntitySchema } from "typeorm";

export interface UnitScoringRule {
  id: string;
  unidade_dass: string;
  classification: string;
  label: string | null;
  description: string | null;
  score: string;
  display_order: number;
  active: boolean;
  active_from: Date | null;
  active_until: Date | null;
  metadata: Record<string, unknown> | null;
  createdat: Date;
  updatedat: Date;
}

const UnitScoringRuleEntity = new EntitySchema<UnitScoringRule>({
  name: "UnitScoringRule",
  tableName: "unit_scoring_rules",
  schema: "pense_aja",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    unidade_dass: {
      type: String,
    },
    classification: {
      type: String,
    },
    label: {
      type: String,
      nullable: true,
    },
    description: {
      type: String,
      nullable: true,
    },
    score: {
      type: "bigint",
    },
    display_order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    active_from: {
      type: "timestamptz",
      nullable: true,
    },
    active_until: {
      type: "timestamptz",
      nullable: true,
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

export default UnitScoringRuleEntity;
