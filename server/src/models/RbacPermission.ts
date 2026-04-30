import { EntitySchema } from "typeorm";

export interface RbacPermission {
  id: number;
  code: string;
  nome: string;
  createdat: Date;
  updatedat: Date;
}

const RbacPermissionEntity = new EntitySchema<RbacPermission>({
  name: "RbacPermission",
  tableName: "rbac_permissions",
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

export default RbacPermissionEntity;
