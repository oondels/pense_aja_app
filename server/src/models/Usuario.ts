import { EntitySchema } from "typeorm";

export interface Usuario {
  id: number;
  createdat: Date | null;
  updatedat: Date | null;
  codigo_barras: string;
  matricula: string;
  nome: string | null;
  usuario: string | null;
  senha: string | null;
  funcao: string | null;
  setor: string | null;
  teste_calce: number | null;
  pense_aja: number | null;
  season: number | null;
  ambulatorio: number | null;
  limpeza: number | null;
  telas: number | null;
  unidade: string | null;
  nivel: string | null;
  pe_confirmado: number | null;
  rfid: string | null;
}

const UsuarioEntity = new EntitySchema<Usuario>({
  name: "Usuario",
  tableName: "usuarios",
  schema: "autenticacao",
  columns: {
    id: {
      type: "bigint",
      primary: true,
      generated: true,
    },
    createdat: {
      type: "timestamptz",
      nullable: true,
    },
    updatedat: {
      type: "timestamptz",
      nullable: true,
    },
    codigo_barras: {
      type: "bigint",
      unique: true,
    },
    matricula: {
      type: "bigint",
      unique: true,
    },
    nome: {
      type: String,
      nullable: true,
    },
    usuario: {
      type: String,
      nullable: true,
    },
    senha: {
      type: String,
      nullable: true,
      select: false,
    },
    funcao: {
      type: String,
      nullable: true,
    },
    setor: {
      type: String,
      nullable: true,
    },
    teste_calce: {
      type: Number,
      nullable: true,
    },
    pense_aja: {
      type: Number,
      nullable: true,
    },
    season: {
      type: Number,
      nullable: true,
    },
    ambulatorio: {
      type: Number,
      nullable: true,
    },
    limpeza: {
      type: Number,
      nullable: true,
    },
    telas: {
      type: Number,
      nullable: true,
    },
    unidade: {
      type: String,
      nullable: true,
    },
    nivel: {
      type: String,
      nullable: true,
    },
    pe_confirmado: {
      type: Number,
      nullable: true,
    },
    rfid: {
      type: "bigint",
      nullable: true,
    },
  },
});

export default UsuarioEntity;
