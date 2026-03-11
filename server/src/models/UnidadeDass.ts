import { EntitySchema } from "typeorm";

export interface UnidadeDass {
  unidade: string;
  location: string | null;
  key: number[] | null;
}

const UnidadeDassEntity = new EntitySchema<UnidadeDass>({
  name: "UnidadeDass",
  tableName: "unidades_dass",
  schema: "core",
  columns: {
    unidade: {
      type: String,
      primary: true,
    },
    location: {
      type: String,
      nullable: true,
    },
    key: {
      type: Number,
      array: true,
      nullable: true,
    },
  },
});

export default UnidadeDassEntity;
