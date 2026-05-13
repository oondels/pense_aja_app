import { EntitySchema } from "typeorm";

export interface MarketplaceVoucherDelivery {
  id: string;
  redemption_request_id: string;
  adapter: string;
  delivery_status: string;
  external_reference: string | null;
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  error_message: string | null;
  createdat: Date;
  updatedat: Date;
}

const MarketplaceVoucherDeliveryEntity =
  new EntitySchema<MarketplaceVoucherDelivery>({
    name: "MarketplaceVoucherDelivery",
    tableName: "marketplace_voucher_deliveries",
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
      adapter: {
        type: String,
      },
      delivery_status: {
        type: String,
      },
      external_reference: {
        type: String,
        nullable: true,
      },
      request_payload: {
        type: "jsonb",
        nullable: true,
      },
      response_payload: {
        type: "jsonb",
        nullable: true,
      },
      error_message: {
        type: "text",
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

export default MarketplaceVoucherDeliveryEntity;
