import { EntitySchema } from "typeorm";

export interface PenseAjaPontos {
  id: number;
  id_pense_aja: string | null;
  matricula: string;
  nome: string;
  valor: string;
  gerente: string;
  classificacao: string;
  createdat: Date;
  updatedat: Date;
  unidade_dass: string;
}

const PenseAjaPontosEntity = new EntitySchema<PenseAjaPontos>({
  name: "PenseAjaPontos",
  tableName: "pense_aja_pontos",
  schema: "pense_aja",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    id_pense_aja: {
      type: "bigint",
      nullable: true,
    },
    matricula: {
      type: "bigint",
    },
    nome: {
      type: String,
    },
    valor: {
      type: "bigint",
    },
    gerente: {
      type: String,
    },
    classificacao: {
      type: String,
    },
    createdat: {
      type: "timestamptz",
    },
    updatedat: {
      type: "timestamptz",
    },
    unidade_dass: {
      type: String,
      default: "SEST",
    },
  },
});

export default PenseAjaPontosEntity;
