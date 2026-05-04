import { EntitySchema } from "typeorm";

export interface UnitScoringRule {
  id: string;
  unidade_dass: string;
  classification: string;
  score: string;
  active: boolean;
  active_from: Date | null;
  active_until: Date | null;
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
    score: {
      type: "bigint",
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
    createdat: {
      type: "timestamptz",
    },
    updatedat: {
      type: "timestamptz",
    },
  },
});

export default UnitScoringRuleEntity;
