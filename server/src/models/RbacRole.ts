import { EntitySchema } from "typeorm";

export interface RbacRole {
  id: number;
  code: string;
  nome: string;
  createdat: Date;
  updatedat: Date;
}

const RbacRoleEntity = new EntitySchema<RbacRole>({
  name: "RbacRole",
  tableName: "rbac_roles",
  schema: "pense_aja",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    code: {
      type: String,
      unique: true,
    },
    nome: {
      type: String,
    },
    createdat: {
      type: "timestamptz",
    },
    updatedat: {
      type: "timestamptz",
    },
  },
});

export default RbacRoleEntity;
