import { EntitySchema } from "typeorm";

export interface RbacRolePermission {
  id: number;
  role_id: string;
  permission_id: string;
  createdat: Date;
}

const RbacRolePermissionEntity = new EntitySchema<RbacRolePermission>({
  name: "RbacRolePermission",
  tableName: "rbac_role_permissions",
  schema: "pense_aja",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    role_id: {
      type: "bigint",
    },
    permission_id: {
      type: "bigint",
    },
    createdat: {
      type: "timestamptz",
    },
  },
});

export default RbacRolePermissionEntity;
