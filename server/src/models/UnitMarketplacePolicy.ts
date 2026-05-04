import { EntitySchema } from "typeorm";

export interface UnitMarketplacePolicy {
  id: string;
  unidade_dass: string;
  allow_refund_after_commit: boolean;
  voucher_adapter: string;
  active: boolean;
  metadata: Record<string, unknown> | null;
  createdat: Date;
  updatedat: Date;
}

const UnitMarketplacePolicyEntity = new EntitySchema<UnitMarketplacePolicy>({
  name: "UnitMarketplacePolicy",
  tableName: "unit_marketplace_policies",
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
    allow_refund_after_commit: {
      type: Boolean,
      default: true,
    },
    voucher_adapter: {
      type: String,
      default: "noop",
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

export default UnitMarketplacePolicyEntity;
