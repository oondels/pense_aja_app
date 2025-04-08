import logger from "../utils/logger";
import pool from "../config/db";

const checkDassOffice = (dassOffice: string) => {
  const allowedOffices = ["SEST", "VDC", "ITB", "VDC-CONF"];
  if (!allowedOffices.includes(dassOffice)) {
    logger.error("Pense-aja", `Unidade inválida: ${dassOffice}`);
    throw new Error(`Unidade dass Inválida: ${dassOffice}`);
  }
};

export const UserPenseaja = {
  async getUserData(registration: number, dassOffice: string) {
    const client = await pool.connect();

    try {
      checkDassOffice(dassOffice);

      const query = await client.query(
        `
        SELECT
          lf.nome, lf.nome_setor, lf.gerente, lf.funcao
        FROM
          colaborador.lista_funcionario${dassOffice !== "SEST" ? "_" + dassOffice : ""} lf
        LEFT JOIN
          pense_aja.pontos p ON lf.matricula = p.matricula
        WHERE
          lf.matricula = $1;
      `,
        [registration]
      );

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
