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
      const query = await client.query(
        `
        SELECT
          lf.nome,
          lf.nome_setor AS setor,
          lf.gerente,
          lf.funcao,
          lf.matricula,
          COALESCE(p.soma_pontos, 0) AS pontos,
          COALESCE(pm.soma_premios, 0) AS pontos_resgatados,
          COALESCE(pa.classificacoes_json, '{}'::jsonb) AS classificacoes_pense_aja,
          ae.email,
          ae.authorized_notifications_apps
        FROM colaborador.lista_funcionario lf
        LEFT JOIN (
          SELECT matricula, SUM(valor) AS soma_pontos
          FROM pense_aja.pense_aja_pontos
          GROUP BY matricula
        ) p ON lf.matricula = p.matricula
        LEFT JOIN (
          SELECT matricula, SUM(pontos_premio_solicitado) AS soma_premios
          FROM pense_aja.pense_aja_premios
          GROUP BY matricula
        ) pm ON lf.matricula = pm.matricula
        LEFT JOIN (
          SELECT COALESCE(email, '') as email, matricula, authorized_notifications_apps FROM autenticacao.emails
        ) ae ON lf.matricula = ae.matricula
        LEFT JOIN LATERAL (
          SELECT jsonb_object_agg(COALESCE(classificacao, 'Não classificado'), total) AS classificacoes_json
          FROM (
            SELECT classificacao, COUNT(*) AS total
            FROM pense_aja.pense_aja_dass
            WHERE matricula = lf.matricula
            GROUP BY classificacao
          ) sub
        ) pa ON true
        WHERE lf.matricula = $1;
        `,
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

      return query?.rows[0] ?? null;
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
        SELECT ue.email, ue.authorized_notifications_apps
        FROM autenticacao.usuarios u
        INNER JOIN autenticacao.emails ue ON u.matricula = ue.matricula
        WHERE u.matricula = $1 AND u.unidade = $2 AND ue.authorized_notifications_apps @> '["pense_aja"]'::jsonb;
      `, [registration, dassOffice]);

      return query.rows[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar email do usuario: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateUserData(registration: string | number, dassOffice: string, formData: Record<string, any>) {
    checkDassOffice(dassOffice);

    const client = await pool.connect();
    try {
      if (!formData.authorized_notifications_apps.length) {
        formData.authorized_notifications_apps = JSON.stringify(['null']);
      }

      const query = await client.query(
        `
        UPDATE autenticacao.emails
        SET email = $1, authorized_notifications_apps = $2
        WHERE matricula = $3
        RETURNING email, authorized_notifications_apps;
      `,
        [formData.email, JSON.stringify(formData.authorized_notifications_apps), registration]
      );

      if (query.rowCount === 0) {
        logger.error("user-pense-aja", `Usuário não encontrado: ${registration}`);
        throw new CustomError(`Usuário não encontrado: ${registration}`);
      }

      return query.rows[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao atualizar dados do usuario: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  },

  async getUserOffice(registration: string) {
    const client = await pool.connect();
    try {
      const firstDigit = registration.charAt(0);
      if (!firstDigit || !Number(firstDigit)) {
        throw new Error("Registro inválido. Matrícula desconhecida!");
      }
      const dasOffices = await client.query("SELECT unidade, location FROM core.unidades_dass WHERE $1 = ANY (key)", [Number(firstDigit)]);

      return {userOffice: dasOffices.rows[0]?.unidade ?? null, location: dasOffices.rows[0]?.location ?? null};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar unidade do usuario: ${errorMessage}`);
      throw error;
    } finally {
      client.release();
    }
  }
};
