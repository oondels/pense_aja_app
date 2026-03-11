import { EntitySchema } from "typeorm";

export interface PenseAjaDass {
  id: number;
  createdat: Date;
  updatedat: Date;
  deletedat: Date | null;
  excluido: boolean;
  matricula: string;
  unidade_dass: string;
  nome: string;
  turno: string;
  setor: string;
  lider: string;
  gerente: string;
  nome_projeto: string;
  data_realizada: Date;
  situacao_anterior: string;
  situacao_atual: string;
  super_producao: string | null;
  transporte: string | null;
  processamento: string | null;
  movimento: string | null;
  estoque: string | null;
  espera: string | null;
  talento: string | null;
  retrabalho: string | null;
  valor_a: string | null;
  valor_b: string | null;
  valor_amortizado: string | null;
  status_gerente: string | null;
  outros_ganhos: string | null;
  gerente_aprovador: string | null;
  data_aprogerente: Date | null;
  analista_avaliador: string | null;
  data_avaanalista: Date | null;
  classificacao: string | null;
  status_analista: string | null;
  justificativa_analista: string | null;
  a3_mae: string | null;
  setor_melhoria: string | null;
  em_espera: string | null;
  replicavel: string | null;
  ganhos: unknown[] | Record<string, unknown> | null;
  fabrica: string | null;
  justificativa_gerente: string | null;
}

const PenseAjaDassEntity = new EntitySchema<PenseAjaDass>({
  name: "PenseAjaDass",
  tableName: "pense_aja_dass",
  schema: "pense_aja",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    createdat: {
      type: "timestamptz",
    },
    updatedat: {
      type: "timestamptz",
    },
    deletedat: {
      type: "timestamptz",
      nullable: true,
    },
    excluido: {
      type: Boolean,
      default: false,
    },
    matricula: {
      type: "bigint",
    },
    unidade_dass: {
      type: String,
      length: 15,
      default: "SEST",
    },
    nome: {
      type: String,
      length: 200,
    },
    turno: {
      type: String,
    },
    setor: {
      type: String,
      length: 200,
    },
    lider: {
      type: String,
      length: 200,
      default: "",
    },
    gerente: {
      type: String,
      length: 200,
    },
    nome_projeto: {
      type: String,
      length: 200,
    },
    data_realizada: {
      type: "date",
    },
    situacao_anterior: {
      type: "text",
    },
    situacao_atual: {
      type: "text",
    },
    super_producao: {
      type: String,
      nullable: true,
    },
    transporte: {
      type: String,
      nullable: true,
    },
    processamento: {
      type: String,
      nullable: true,
    },
    movimento: {
      type: String,
      nullable: true,
    },
    estoque: {
      type: String,
      nullable: true,
    },
    espera: {
      type: String,
      nullable: true,
    },
    talento: {
      type: String,
      nullable: true,
    },
    retrabalho: {
      type: String,
      nullable: true,
    },
    valor_a: {
      type: "numeric",
      nullable: true,
    },
    valor_b: {
      type: "numeric",
      nullable: true,
    },
    valor_amortizado: {
      type: "numeric",
      nullable: true,
    },
    status_gerente: {
      type: String,
      nullable: true,
    },
    outros_ganhos: {
      type: "text",
      nullable: true,
    },
    gerente_aprovador: {
      type: String,
      length: 200,
      nullable: true,
    },
    data_aprogerente: {
      type: "timestamptz",
      nullable: true,
    },
    analista_avaliador: {
      type: String,
      length: 200,
      nullable: true,
    },
    data_avaanalista: {
      type: "timestamptz",
      nullable: true,
    },
    classificacao: {
      type: String,
      nullable: true,
    },
    status_analista: {
      type: String,
      nullable: true,
    },
    justificativa_analista: {
      type: "text",
      nullable: true,
    },
    a3_mae: {
      type: String,
      nullable: true,
    },
    setor_melhoria: {
      type: String,
      nullable: true,
    },
    em_espera: {
      type: String,
      default: "0",
      nullable: true,
    },
    replicavel: {
      type: String,
      default: "0",
      nullable: true,
    },
    ganhos: {
      type: "jsonb",
      nullable: true,
    },
    fabrica: {
      type: "text",
      nullable: true,
    },
    justificativa_gerente: {
      type: "text",
      nullable: true,
    },
  },
});

export default PenseAjaDassEntity;
