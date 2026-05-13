import { EntitySchema } from "typeorm";

export interface RbacUserUnitRole {
  id: number;
  matricula: string;
  unidade_dass: string;
  role_id: string;
  active: boolean;
  active_from: Date | null;
  active_until: Date | null;
  createdat: Date;
  updatedat: Date;
}

const RbacUserUnitRoleEntity = new EntitySchema<RbacUserUnitRole>({
  name: "RbacUserUnitRole",
  tableName: "rbac_user_unit_roles",
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
    role_id: {
      type: "bigint",
    },
    active: {
      type: Boolean,
      default: true,
    },
    active_from: {
      type: "timestamptz",
      nullable: true,
    },
    active_until: {
      type: "timestamptz",
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

export default RbacUserUnitRoleEntity;
