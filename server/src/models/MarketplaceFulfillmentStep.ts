import { EntitySchema } from "typeorm";

export interface MarketplaceFulfillmentStep {
  id: string;
  redemption_request_id: string;
  step_type: string;
  step_status: string;
  actor_registration: string | null;
  actor_name: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdat: Date;
  updatedat: Date;
}

const MarketplaceFulfillmentStepEntity =
  new EntitySchema<MarketplaceFulfillmentStep>({
    name: "MarketplaceFulfillmentStep",
    tableName: "marketplace_fulfillment_steps",
    schema: "pense_aja",
    columns: {
      id: {
        type: "uuid",
        primary: true,
        generated: "uuid",
      },
      redemption_request_id: {
        type: "bigint",
      },
      step_type: {
        type: String,
      },
      step_status: {
        type: String,
      },
      actor_registration: {
        type: "bigint",
        nullable: true,
      },
      actor_name: {
        type: String,
        nullable: true,
      },
      notes: {
        type: "text",
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

export default MarketplaceFulfillmentStepEntity;
