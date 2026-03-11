import { EntitySchema } from "typeorm";

export interface PenseAjaPremios {
  id: number;
  unidade_dass: string;
  matricula: string;
  nome: string;
  premio_solicitado: string;
  pontos_premio_solicitado: string;
  data_solicitacao: Date;
  usuario_entregador: string;
  nome_entregador: string;
  data_entrega: Date;
  createdat: Date;
  updatedat: Date;
}

const PenseAjaPremiosEntity = new EntitySchema<PenseAjaPremios>({
  name: "PenseAjaPremios",
  tableName: "pense_aja_premios",
  schema: "pense_aja",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    unidade_dass: {
      type: String,
      length: 10,
      default: "SEST",
    },
    matricula: {
      type: "bigint",
    },
    nome: {
      type: String,
    },
    premio_solicitado: {
      type: String,
    },
    pontos_premio_solicitado: {
      type: "bigint",
    },
    data_solicitacao: {
      type: "timestamptz",
    },
    usuario_entregador: {
      type: String,
    },
    nome_entregador: {
      type: String,
    },
    data_entrega: {
      type: "timestamptz",
    },
    createdat: {
      type: "timestamptz",
    },
    updatedat: {
      type: "timestamptz",
    },
  },
});

export default PenseAjaPremiosEntity;
