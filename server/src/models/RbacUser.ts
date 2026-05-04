import { EntitySchema } from "typeorm";

export interface RbacUser {
  id: string;
  matricula: string;
  nome: string | null;
  email: string | null;
  createdat: Date;
  updatedat: Date;
}

const RbacUserEntity = new EntitySchema<RbacUser>({
  name: "RbacUser",
  tableName: "rbac_users",
  schema: "pense_aja",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    matricula: {
      type: "bigint",
      unique: true,
    },
    nome: {
      type: String,
      nullable: true,
    },
    email: {
      type: String,
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

export default RbacUserEntity;
