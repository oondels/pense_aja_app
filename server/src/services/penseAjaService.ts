import logger from "../utils/logger";
import pool from "../config/db";
import { CustomError } from "../types/CustomError";
import { UserPenseaja } from "./UserPenseaja";

const checkDassOffice = (dassOffice: string) => {
  const allowedOffices = ["SEST", "VDC", "ITB", "VDC-CONF"];
  if (!allowedOffices.includes(dassOffice)) {
    logger.error("Pense-aja", `Unidade inválida: ${dassOffice}`);
    throw new Error(`Unidade dass Inválida: ${dassOffice}`);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
};

interface SelectFilter {
  selectedMonth?: string;
  selectedYear?: string;
}

interface PenseAjaData {
  nome: string;
  createDate: string | Date;
  situationBefore: string;
  situationNow: string;
  registration: string | number;
  perdas: Array<string>;
  userName: string;
  gerente: string;
  setor: string;
  turno: string;
  a3Mae?: string;
  valorA?: string;
  valorB?: string;
  valorAmortizado?: string;
  outrosGanhos?: string;
  ganhos?: Array<string>;
  ganhoDetalhes?: string;
  areaMelhoria: string;
}

interface EvaluationData {
  avaliacao: string;
  emEspera: boolean;
  replicavel: boolean;
  justificativa: string;
  usuario: string;
  nome: string;
  funcao: string;
  dassOffice: string;
  status: string;
  a3Mae?: string;
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
      let dbName =
        dassOffice === "SEST" ? "pense_aja" : `pense_aja_${dassOffice}`;
      const result = await client.query(
        `
        SELECT
          id,
          data_realizada,
          fabrica,
          nome,
          setor,
          gerente,
          nome_projeto,
          turno,
          situacao_anterior,
          situacao_atual,
          gerente_aprovador,
          analista_avaliador,
          status_gerente,
          status_analista,
          em_espera,
          createdat AS criado
        FROM
          pense_aja.${dbName}
        WHERE
          excluido = ''
          AND createdat >= date_trunc('month', current_date) - INTERVAL '1 month'
          AND createdat <  date_trunc('year',  current_date) + INTERVAL '1 year'
        ORDER BY
          criado DESC;
      `,
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
      });

      const filters = {
        "3": filtersData.nomes,
        "4": filtersData.setores,
        "5": filtersData.gerentes,
        "6": filtersData.projetos,
        "7": filtersData.turnos,
      };

      const dados = result.rows;
      result.rows.forEach((row) => {
        row.criado = formatDate(row.criado);
        row.turno = turnoMap[row.turno] || "Comercial";
      });

      return { dados: dados, filters: filters };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido!";

      logger.error(
        "Pense-aja",
        `Erro ao consultar registros da tabela inicial: ${errorMessage}`
      );
      throw error;
    } finally {
      await client.release();
    }
  },

  async getHistoryData(dassOffice: string, filter: SelectFilter) {
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

      let dbName =
        dassOffice === "SEST" ? "pense_aja" : `pense_aja_${dassOffice}`;

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
          (SELECT array_agg(DISTINCT gerente) FROM pense_aja.${dbName} WHERE excluido = '' AND data_realizada BETWEEN $1 AND $2)
          AS gerentes,
          (SELECT array_agg(DISTINCT nome) FROM pense_aja.${dbName} WHERE excluido = '' AND data_realizada BETWEEN $1 AND $2)
          AS nomes,
          (SELECT array_agg(DISTINCT setor) FROM pense_aja.${dbName} WHERE excluido = '' AND data_realizada BETWEEN $1 AND $2)
          AS setores,
          (SELECT array_agg(DISTINCT nome_projeto) FROM pense_aja.${dbName} WHERE excluido = '' AND data_realizada BETWEEN $1 AND $2)
          AS projetos,
          (SELECT array_agg(DISTINCT turno) FROM pense_aja.${dbName} WHERE excluido = '' AND data_realizada BETWEEN $1 AND $2)
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
      if (Object.keys(filterData).length > 0 && filterData.turnos) {
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
      const messageError =
        error instanceof Error ? error.message : "Erro desconhecido!";
      logger.error(
        "Pense-aja",
        `Erro ao consultar registros da tabela de histórico: ${messageError}`
      );

      throw error;
    }
  },

  async createPenseAja(data: PenseAjaData, dassOffice: string) {
    checkDassOffice(dassOffice);

    if (
      !data.nome ||
      !data.createDate ||
      !data.situationBefore ||
      !data.situationNow ||
      !data.registration ||
      !data.userName ||
      !data.gerente ||
      !data.setor ||
      !data.turno ||
      !data.areaMelhoria
    ) {
      throw new Error("Campos obrigatórios ausentes ou inválidos.");
    }

    if (!data.perdas) {
      data.perdas = [];
    }

    const office = dassOffice !== "SEST" ? "_" + dassOffice : "";
    const perdasLean: Record<string, string> = {
      Superprodução: "super_producao",
      Transporte: "transporte",
      Processamento: "processamento",
      Movimento: "movimento",
      Estoque: "estoque",
      Espera: "espera",
      Talento: "talento",
      Retrabalho: "retrabalho",
    };

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const perdasSelecionads = new Set(data.perdas);
      const colunasPerdas = Object.keys(perdasLean);
      // Atualiza dados de seleção
      const perdasValores = colunasPerdas.map((perda) =>
        perdasSelecionads.has(perda) ? 1 : 0
      );

      // Parâmetros
      const params = [
        data.registration,
        data.userName,
        data.turno,
        data.setor,
        data.gerente,
        data.nome,
        data.createDate,
        data.situationBefore,
        data.situationNow,
        ...perdasValores,
        data.a3Mae || "",
        JSON.stringify(data.ganhos),
        data.ganhoDetalhes || "",
        data.areaMelhoria,
      ];

      const newPenseAja = await client.query(
        `
        INSERT INTO pense_aja.pense_aja${office} (
          matricula, nome, turno, setor, gerente, nome_projeto, data_realizada,
          situacao_anterior, situacao_atual, super_producao, transporte, processamento, movimento,
          estoque, espera, talento, retrabalho,
          a3_mae, ganhos, outros_ganhos, fabrica, createdat, updatedat, lider, excluido
        ) VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW(), '', '')
        RETURNING nome, nome_projeto, ganhos;`,
        params
      );

      if (newPenseAja.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new CustomError(
          "Erro ao registrar pense aja.",
          400,
          "Erro ao inserir no banco de dados."
        );
      }

      const userManager = await UserPenseaja.getManagerByUser(data.registration, dassOffice);

      await client.query("COMMIT");
      return {pense_aja: newPenseAja.rows[0], userManager: userManager};
    } catch (error) {
      await client.query("ROLLBACK");
      const messageError =
        error instanceof Error ? error.message : "Erro desconhecido!";
      logger.error("Pense-aja", `Erro ao registrar pense aja: ${messageError}`);

      throw new CustomError("Erro ao registrar pense aja.");
    } finally {
      client.release();
    }
  },

  async getPenseAjaById(id: string, dassOffice: string) {
    checkDassOffice(dassOffice);
    const office = dassOffice !== "SEST" ? "_" + dassOffice : "";
    const client = await pool.connect();

    try {
      const data = await client.query(
        `
        SELECT  
          matricula, nome, setor, turno, gerente, data_realizada,
          situacao_anterior, situacao_atual, nome_projeto, super_producao, transporte, 
          processamento, movimento, estoque, espera, talento, retrabalho, gerente_aprovador, 
          data_aprogerente, analista_avaliador, classificacao, a3_mae, fabrica

        FROM 
          pense_aja.pense_aja${office}
        WHERE id = $1`,
        [id]
      );

      if (data.rows.length === 0) {
        throw new CustomError(
          "Pense Aja não encontrado.",
          404,
          "Pense Aja não encontrado."
        );
      }

      return data.rows[0];
    } catch (error) {
      logger.error("Pense-aja", `Erro ao consultar pense aja por ID: ${error}`);
      throw new CustomError("Erro ao consultar pense aja por ID.");
    } finally {
      await client.release();
    }
  },

  async evaluatePenseAja(id: string, evaluationData: EvaluationData) {
    checkDassOffice(evaluationData.dassOffice);
    const office =
      evaluationData.dassOffice !== "SEST"
        ? "_" + evaluationData.dassOffice
        : "";
    const client = await pool.connect();

    const checkUserRole = (role: string) => {
      return role.includes("analista")
        ? "status_analista = $1, analista_avaliador = $2, data_avaanalista = NOW(), justificativa_analista = $3, "
        : "status_gerente = $1, gerente_avaliador = $2, data_aprogerente = NOW(), justificativa_gerente = $3, ";
    };

    try {
      await client.query("BEGIN");
      const statusAvaliacao = evaluationData.status;
      const avaliador = evaluationData.usuario;
      const userRole = evaluationData.funcao.toLowerCase();

      let params: Array<string | boolean> = [];
      let query = `UPDATE pense_aja.pense_aja${office} SET `;

      query += checkUserRole(userRole);
      params.push(statusAvaliacao);
      params.push(avaliador);
      params.push(evaluationData.justificativa ?? "Sem justificativa.");

      if (statusAvaliacao === "EXCLUIR") {
        if (userRole.includes("gerente")) {
          query += `excluido = 'S', updatedat = NOW() `;
        } else {
          throw new CustomError(
            "Somente Gerentes podem excluir um registro pense e aja!",
            403,
            "Somente Gerentes podem excluir um registro pense e aja!"
          );
        }
      } else {
        query += `classificacao = $4, a3_mae = $5, em_espera = $6, replicavel = $7, updatedat = NOW() `;
        params.push(evaluationData.avaliacao);
        params.push(evaluationData.a3Mae || "");
        params.push(evaluationData.emEspera);
        params.push(evaluationData.replicavel);
      }
      query += `
      WHERE id = $${params.length + 1} 
      RETURNING id, data_realizada, fabrica, nome, matricula, setor, gerente, nome_projeto,
      turno, situacao_anterior, situacao_atual, gerente_aprovador, analista_avaliador,
      status_gerente, status_analista, em_espera, createdat AS criado;`;
      params.push(id);

      const result = await client.query(query, params);
      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new CustomError(
          "Pense Aja não encontrado.",
          404,
          "Pense Aja não encontrado."
        );
      }
      await client.query("COMMIT");

      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Pense-aja", `Erro ao avaliar pense aja: ${error}`);

      if (error instanceof CustomError) {
        throw error;
      } else {
        throw new CustomError("Erro ao avaliar pense aja.");
      }
    } finally {
      await client.release();
    }
  },
};
