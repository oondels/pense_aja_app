import logger from "../utils/logger";
import pool from "../config/db";

export const UserPenseaja = {
  async getUserData(registration: number) {
    const client = await pool.connect();

    try {
      const query = await client.query(`
        SELECT
          lf.nome, lf.nome_setor, lf.gerente, lf.funcao
        FROM
          colaborador.lista_funcionario lf
        LEFT JOIN
          pense_aja.pontos p ON lf.matricula = p.matricula
        WHERE
          lf.matricula = $1;
      `, [registration]);

      return query.rows[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar dados do usuario: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  },
};
