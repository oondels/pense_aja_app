import { EntitySchema } from "typeorm";

export interface PointsBalanceProjection {
  id: number;
  matricula: string;
  unidade_dass: string;
  total_earned: string;
  total_reserved: string;
  total_committed: string;
  total_refunded: string;
  total_reversed: string;
  available_balance: string;
  updatedat: Date;
}

const PointsBalanceProjectionEntity = new EntitySchema<PointsBalanceProjection>({
  name: "PointsBalanceProjection",
  tableName: "points_balance_projection",
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
    total_earned: {
      type: "bigint",
      default: 0,
    },
    total_reserved: {
      type: "bigint",
      default: 0,
    },
    total_committed: {
      type: "bigint",
      default: 0,
    },
    total_refunded: {
      type: "bigint",
      default: 0,
    },
    total_reversed: {
      type: "bigint",
      default: 0,
    },
    available_balance: {
      type: "bigint",
      default: 0,
    },
    updatedat: {
      type: "timestamptz",
    },
  },
});

export default PointsBalanceProjectionEntity;
