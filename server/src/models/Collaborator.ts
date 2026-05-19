import { EntitySchema } from "typeorm";

export interface Collaborator {
  matricula: string;
  nome: string | null;
  nome_setor: string | null;
  gerente: string | null;
  funcao: string | null;
}

const createCollaboratorEntity = (name: string, tableName: string) =>
  new EntitySchema<Collaborator>({
    name,
    tableName,
    schema: "colaborador",
    columns: {
      matricula: {
        type: "bigint",
        primary: true,
      },
      nome: {
        type: String,
        nullable: true,
      },
      nome_setor: {
        type: String,
        nullable: true,
      },
      gerente: {
        type: String,
        nullable: true,
      },
      funcao: {
        type: String,
        nullable: true,
      },
    },
  });

export const CollaboratorSestEntity = createCollaboratorEntity(
  "CollaboratorSest",
  "lista_funcionario"
);

export const CollaboratorVdcEntity = createCollaboratorEntity(
  "CollaboratorVdc",
  "lista_funcionario_vdc"
);

export const CollaboratorItbEntity = createCollaboratorEntity(
  "CollaboratorItb",
  "lista_funcionario_itb"
);

export const CollaboratorVdcConfEntity = createCollaboratorEntity(
  "CollaboratorVdcConf",
  "lista_funcionario_vdc_conf"
);

export const CollaboratorStjEntity = createCollaboratorEntity(
  "CollaboratorStj",
  "lista_funcionario_stj"
);
