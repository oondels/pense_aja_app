import { EntitySchema } from "typeorm";

export interface MarketplaceRedemptionRequest {
  id: number;
  matricula: string;
  unidade_dass: string;
  catalog_item_id: string;
  request_status: string;
  reserved_ledger_entry_id: string | null;
  approval_actor_registration: string | null;
  approval_actor_name: string | null;
  fulfillment_type: string;
  legacy_prize_id: string | null;
  createdat: Date;
  updatedat: Date;
}

const MarketplaceRedemptionRequestEntity =
  new EntitySchema<MarketplaceRedemptionRequest>({
    name: "MarketplaceRedemptionRequest",
    tableName: "marketplace_redemption_requests",
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
      catalog_item_id: {
        type: "bigint",
      },
      request_status: {
        type: String,
      },
      reserved_ledger_entry_id: {
        type: "bigint",
        nullable: true,
      },
      approval_actor_registration: {
        type: "bigint",
        nullable: true,
      },
      approval_actor_name: {
        type: String,
        nullable: true,
      },
      fulfillment_type: {
        type: String,
      },
      legacy_prize_id: {
        type: "bigint",
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

export default MarketplaceRedemptionRequestEntity;
