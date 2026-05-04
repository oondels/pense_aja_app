import { EntitySchema } from "typeorm";

export interface UnitWorkflowStep {
  id: string;
  unidade_dass: string;
  step_code: string;
  step_order: number;
  required_permission: string;
  terminal_status: string | null;
  active: boolean;
  metadata: Record<string, unknown> | null;
  createdat: Date;
  updatedat: Date;
}

const UnitWorkflowStepEntity = new EntitySchema<UnitWorkflowStep>({
  name: "UnitWorkflowStep",
  tableName: "unit_workflow_steps",
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
    step_code: {
      type: String,
    },
    step_order: {
      type: Number,
    },
    required_permission: {
      type: String,
    },
    terminal_status: {
      type: String,
      nullable: true,
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

export default UnitWorkflowStepEntity;
