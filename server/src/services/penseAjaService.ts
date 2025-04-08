import logger from "../utils/logger";
import pool from "../config/db";

const checkDassOffice = (dassOffice: string) => {
  const allowedOffices = ["SEST", "VDC", "ITB", "VDC-CONF"];
  if (!allowedOffices.includes(dassOffice)) {
    logger.error("Pense-aja", `Unidade inválida: ${dassOffice}`);
    throw new Error(`Unidade dass Inválida: ${dassOffice}`);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
}

interface selectFilter {
  selectedMonth?: string;
  selectedYear?: string;
}

interface penseAjaData {
  nome: string;
  createDate: string | Date;
  situationBefore: string;
  situationNow: string;
  registration: string | number;
  dassOffice: string;
  perdas?: Array<string>;
}

const turnoMap: Record<string, string> = {
  A: "1° Turno",
  B: "2° Turno",
  C: "3° Turno",
};

export const PenseAjaService = {
  async getCurrentMonthData(dassOffice: string) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();

    let lastMonthIndex: number;
    let lastMonthYear: number;
    if (currentMonthIndex === 0) {
      lastMonthIndex = 11;
      lastMonthYear = currentYear - 1;
    } else {
      lastMonthIndex = currentMonthIndex - 1;
      lastMonthYear = currentYear;
    }

    let penseAjaDay = 28;
    let startDate = new Date(lastMonthYear, lastMonthIndex, penseAjaDay);
    let endDate = new Date(currentYear, currentMonthIndex, penseAjaDay);

    checkDassOffice(dassOffice);
    const client = await pool.connect();
    try {
      let dbName = dassOffice === "SEST" ? "pense_aja" : `pense_aja_${dassOffice}`;
      const result = await client.query(
        `
        SELECT
          id, data_realizada, fabrica, nome, setor, gerente,
          nome_projeto, turno, situacao_anterior, situacao_atual,
          gerente_aprovador, analista_avaliador, status_gerente,
          status_analista, em_espera, createdat as criado
        FROM pense_aja.${dbName}
        WHERE excluido = '' AND
        createdat BETWEEN $1 AND $2
        ORDER BY createdat DESC
      `,
        [startDate, endDate]
      );

      const filterQuery = await client.query(
        `
        SELECT
        (SELECT array_agg(DISTINCT gerente) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
        AS gerentes,
        (SELECT array_agg(DISTINCT nome) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
        AS nomes,
        (SELECT array_agg(DISTINCT setor) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
        AS setores,
        (SELECT array_agg(DISTINCT nome_projeto) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
        AS projetos,
        (SELECT array_agg(DISTINCT turno) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
        AS turnos
      `,
        [startDate, endDate]
      );

      if (filterQuery.rows.length === 0 || result.rows.length === 0) {
        return { dados: [], filters: {} };
      }

      const filtersData = filterQuery.rows[0];
      filtersData.turnos = filtersData.turnos.map((filter: string) => {
        return turnoMap[filter] || "Comercial";
      })

      const filters = {
        "3": filtersData.nomes,
        "4": filtersData.setores,
        "5": filtersData.gerentes,
        "6": filtersData.projetos,
        "7": filtersData.turnos,
      }

      const dados = result.rows;
      result.rows.forEach((row) => {
        row.criado = formatDate(row.criado);
        row.turno = turnoMap[row.turno] || "Comercial";
      });

      return { dados: dados, filters: filters };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido!";

      logger.error("Pense-aja", `Erro ao consultar registros da tabela inicial: ${errorMessage}`);
      throw error;
    } finally {
      await client.release();
    }
  },

  async getHistoryData(dassOffice: string, filter: selectFilter) {
    checkDassOffice(dassOffice);

    const client = await pool.connect();
    try {
      const selectedYear = Number(filter.selectedYear);
      const selectedMonth = Number(filter.selectedMonth);
      let firstYear: number;
      let firstMonth: number;

      if (selectedMonth === 0) {
        firstMonth = 11;
        firstYear = selectedYear - 1;
      } else {
        firstMonth = selectedMonth - 1;
        firstYear = selectedYear;
      }

      const firstDate = new Date(firstYear, firstMonth, 28);
      const lastDate = new Date(selectedYear, selectedMonth, 28);

      let dbName = dassOffice === "SEST" ? "pense_aja" : `pense_aja_${dassOffice}`;

      const historyQuery = await client.query(
        `
        SELECT
          id, data_realizada, fabrica, nome, setor, gerente,
          nome_projeto, turno, situacao_anterior, situacao_atual,
          gerente_aprovador, analista_avaliador, status_gerente,
          status_analista, em_espera, data_realizada as criado
        FROM pense_aja.${dbName}
        WHERE excluido = '' AND
        data_realizada BETWEEN $1 AND $2
        ORDER BY data_realizada DESC
      `,
        [firstDate, lastDate]
      );

      const filterQuery = await client.query(
        `
        SELECT
          (SELECT array_agg(DISTINCT gerente) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
          AS gerentes,
          (SELECT array_agg(DISTINCT nome) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
          AS nomes,
          (SELECT array_agg(DISTINCT setor) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
          AS setores,
          (SELECT array_agg(DISTINCT nome_projeto) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
          AS projetos,
          (SELECT array_agg(DISTINCT turno) FROM pense_aja.${dbName} WHERE excluido = '' AND createdat BETWEEN $1 AND $2)
          AS turnos
      `,
        [firstDate, lastDate]
      );

      if (filterQuery.rows.length === 0 || historyQuery.rows.length === 0) {
        return { dados: [], filters: {} };
      }

      const filterData = filterQuery.rows[0] || {};
      const history = historyQuery.rows || [];

      // Atualizar referencia de turno
      if (Object.keys(filterData).length > 0) {
        filterData.turnos = filterData.turnos.map((turno: string) => {
          return turnoMap[turno] || "Comercial";
        });
      }

      const result = {
        dados: history,
        filters: {
          "3": filterData.nomes,
          "4": filterData.setores,
          "5": filterData.gerentes,
          "6": filterData.projetos,
          "7": filterData.turnos,
        },
      };

      return result;
    } catch (error) {
      const messageError = error instanceof Error ? error.message : "Erro desconhecido!";
      logger.error("Pense-aja", `Erro ao consultar registros da tabela de histórico: ${messageError}`);
      throw error;
    }
  },

  async createPenseAja(data: penseAjaData){}
};
