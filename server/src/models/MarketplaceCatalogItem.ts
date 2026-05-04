import { EntitySchema } from "typeorm";

export interface MarketplaceCatalogItem {
  id: string;
  legacy_product_id: string | null;
  unidade_dass: string;
  name: string;
  image_url: string | null;
  points_cost: string;
  item_type: string;
  active: boolean;
  available_quantity: string | null;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  updated_by: string | null;
  createdat: Date;
  updatedat: Date;
}

const MarketplaceCatalogItemEntity =
  new EntitySchema<MarketplaceCatalogItem>({
    name: "MarketplaceCatalogItem",
    tableName: "marketplace_catalog_items",
    schema: "pense_aja",
    columns: {
      id: {
        type: "uuid",
        primary: true,
        generated: "uuid",
      },
      legacy_product_id: {
        type: String,
        nullable: true,
      },
      unidade_dass: {
        type: String,
      },
      name: {
        type: String,
      },
      image_url: {
        type: String,
        nullable: true,
      },
      points_cost: {
        type: "bigint",
      },
      item_type: {
        type: String,
        default: "physical",
      },
      active: {
        type: Boolean,
        default: true,
      },
      available_quantity: {
        type: "bigint",
        nullable: true,
      },
      metadata: {
        type: "jsonb",
        nullable: true,
      },
      created_by: {
        type: "bigint",
        nullable: true,
      },
      updated_by: {
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

export default MarketplaceCatalogItemEntity;
