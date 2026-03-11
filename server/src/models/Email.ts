import { EntitySchema } from "typeorm";

export interface Email {
  matricula: string;
  email: string | null;
  authorized_notifications_apps: string[] | null;
  unidade_dass: string | null;
}

const EmailEntity = new EntitySchema<Email>({
  name: "Email",
  tableName: "emails",
  schema: "autenticacao",
  columns: {
    matricula: {
      type: "bigint",
      primary: true,
    },
    email: {
      type: String,
      nullable: true,
    },
    authorized_notifications_apps: {
      type: "jsonb",
      nullable: true,
    },
    unidade_dass: {
      type: String,
      nullable: true,
    },
  },
});

export default EmailEntity;
