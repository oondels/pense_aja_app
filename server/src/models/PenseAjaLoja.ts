import { EntitySchema } from "typeorm";

export interface PenseAjaLoja {
  id: number;
  nome: string;
  imagem: string;
  valor: number;
  unidade_dass: string;
  user_create: string;
  created_at: Date | null;
  updated_at: Date | null;
  updated_by: string | null;
}

const PenseAjaLojaEntity = new EntitySchema<PenseAjaLoja>({
  name: "PenseAjaLoja",
  tableName: "pense_aja_loja",
  schema: "pense_aja",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    nome: {
      type: String,
    },
    imagem: {
      type: String,
    },
    valor: {
      type: Number,
    },
    unidade_dass: {
      type: String,
    },
    user_create: {
      type: String,
    },
    created_at: {
      type: "timestamptz",
      nullable: true,
    },
    updated_at: {
      type: "timestamptz",
      nullable: true,
    },
    updated_by: {
      type: String,
      nullable: true,
    },
  },
});

export default PenseAjaLojaEntity;
