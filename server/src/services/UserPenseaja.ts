import logger from "../utils/logger";
import pool from "../config/db";
import { CustomError } from "../types/CustomError";

const checkDassOffice = (dassOffice: string) => {
  const allowedOffices = ["SEST", "VDC", "ITB", "VDC-CONF"];
  if (!allowedOffices.includes(dassOffice)) {
    logger.error("Pense-aja", `Unidade inválida: ${dassOffice}`);
    throw new Error(`Unidade dass Inválida: ${dassOffice}`);
  }
};

export const UserPenseaja = {
  async getUserData(registration: number, dassOffice: string) {
    checkDassOffice(dassOffice);

    const client = await pool.connect();
    try {
      const office = dassOffice !== "SEST" ? "_" + dassOffice : "";

      const query = await client.query(
        `
        SELECT
          lf.nome,
          lf.nome_setor AS setor,
          lf.gerente,
          lf.funcao,
          COALESCE(p.soma_pontos, 0) AS pontos,
          COALESCE(pm.soma_premios, 0) AS pontos_resgatados
        FROM
          colaborador.lista_funcionario${office} lf
        LEFT JOIN (
          SELECT matricula, SUM(valor) AS soma_pontos
          FROM pense_aja.pontos${office}
          GROUP BY matricula
        ) p ON lf.matricula = p.matricula
        LEFT JOIN (
          SELECT matricula, SUM(pontos_premio_solicitado) AS soma_premios
          FROM pense_aja.premio${office}
          GROUP BY matricula
        ) pm ON lf.matricula = pm.matricula
        WHERE
          lf.matricula = $1;`,
        [registration]
      );

      if (query.rowCount === 0) {
        logger.error("user-pense-aja", `Usuário não encontrado: ${registration}`);
        throw new CustomError(`Usuário não encontrado: ${registration}`);
      }

      return query.rows[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar dados do usuario: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  },

  async getManagerByUser(registration: string | number, dassOffice: string) {
    checkDassOffice(dassOffice);

    const client = await pool.connect();
    try {
      const office = dassOffice !== "SEST" ? "_" + dassOffice : "";

      const query = await client.query(
        `
        SELECT lf.gerente, u.matricula, ue.email
        FROM colaborador.lista_funcionario${office} lf
        INNER JOIN autenticacao.usuarios u ON LOWER(TRIM(lf.gerente)) = LOWER(TRIM(u.nome)) AND u.funcao = 'GERENTE'
        INNER JOIN autenticacao.emails ue ON u.matricula = ue.matricula
        WHERE lf.matricula = $1
      `,
        [registration]
      );

      return query.rows[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar gerente do usuario: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  },

  async getUserEmail(registration: string | number, dassOffice: string) {
    const client = await pool.connect();
    try {
      const query = await client.query(`
        SELECT ue.email
        FROM autenticacao.usuarios u
        INNER JOIN autenticacao.emails ue ON u.matricula = ue.matricula
        WHERE u.matricula = $1 AND u.unidade = $2
      `, [registration, dassOffice]);
      
      return query.rows[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar email do usuario: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  }
};
