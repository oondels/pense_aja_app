import logger from "../utils/logger";
import { initializeDatabase } from "../config/database";
import EmailEntity from "../models/Email";
import UnidadeDassEntity from "../models/UnidadeDass";
import UsuarioEntity from "../models/Usuario";
import { CustomError } from "../types/CustomError";
import {
  DassOffice,
  UpdateUserProfileInput,
  UserEmailNotificationTarget,
  UserManagerNotificationTarget,
  UserOfficeLookupResult,
  UserProfileData,
} from "../types/contracts";

const checkDassOffice = (dassOffice: string): DassOffice => {
  const allowedOffices = ["SEST", "VDC", "ITB", "VDC-CONF", "STJ"];
  if (!allowedOffices.includes(dassOffice)) {
    logger.error("Pense-aja", `Unidade inválida: ${dassOffice}`);
    throw new Error(`Unidade dass Inválida: ${dassOffice}`);
  }

  return dassOffice as DassOffice;
};

const collaboratorTableMap: Record<DassOffice, string> = {
  SEST: "colaborador.lista_funcionario",
  VDC: "colaborador.lista_funcionario_VDC",
  ITB: "colaborador.lista_funcionario_ITB",
  "VDC-CONF": "colaborador.\"lista_funcionario_VDC-CONF\"",
  STJ: "colaborador.lista_funcionario_STJ",
};

export const UserPenseaja = {
  async getUserData(registration: number, dassOffice: DassOffice): Promise<UserProfileData> {
    const validDassOffice = checkDassOffice(dassOffice);
    try {
      const dataSource = await initializeDatabase();
      const query = await dataSource.query(
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
        FROM ${collaboratorTableMap[validDassOffice]} lf
        LEFT JOIN (
          SELECT matricula, SUM(valor) AS soma_pontos
          FROM pense_aja.pense_aja_pontos
          WHERE unidade_dass = $2
          GROUP BY matricula
        ) p ON lf.matricula = p.matricula
        LEFT JOIN (
          SELECT matricula, SUM(pontos_premio_solicitado) AS soma_premios
          FROM pense_aja.pense_aja_premios
          WHERE unidade_dass = $2
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
              AND unidade_dass = $2
              AND excluido = false
            GROUP BY classificacao
          ) sub
        ) pa ON true
        WHERE lf.matricula = $1;
        `,
        [registration, validDassOffice]
      );

      if (query.length === 0) {
        logger.error("user-pense-aja", `Usuário não encontrado: ${registration}`);
        throw new CustomError(`Usuário não encontrado: ${registration}`);
      }

      return {
        ...query[0],
        pontos: Number(query[0].pontos) || 0,
        pontos_resgatados: Number(query[0].pontos_resgatados) || 0,
      } as UserProfileData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar dados do usuario: ${errorMessage}`);
      throw error;
    }
  },

  async getManagerByUser(
    registration: string | number,
    dassOffice: DassOffice
  ): Promise<UserManagerNotificationTarget | null> {
    const validDassOffice = checkDassOffice(dassOffice);
    try {
      const dataSource = await initializeDatabase();
      const query = await dataSource.query(
        `
        SELECT lf.gerente, u.matricula, ue.email
        FROM ${collaboratorTableMap[validDassOffice]} lf
        INNER JOIN autenticacao.usuarios u ON LOWER(TRIM(lf.gerente)) = LOWER(TRIM(u.nome)) AND u.funcao = 'GERENTE'
        INNER JOIN autenticacao.emails ue ON u.matricula = ue.matricula
        WHERE lf.matricula = $1
      `,
        [registration]
      );

      return query[0] ?? null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar gerente do usuario: ${errorMessage}`);
      throw error;
    }
  },

  async getUserEmail(
    registration: string | number,
    dassOffice: DassOffice
  ): Promise<UserEmailNotificationTarget | undefined> {
    try {
      const dataSource = await initializeDatabase();
      const query = await dataSource
        .getRepository(UsuarioEntity)
        .createQueryBuilder("u")
        .innerJoin("autenticacao.emails", "ue", "u.matricula = ue.matricula")
        .select("ue.email", "email")
        .addSelect(
          "ue.authorized_notifications_apps",
          "authorized_notifications_apps"
        )
        .where("u.matricula = :registration", {
          registration: String(registration),
        })
        .andWhere("u.unidade = :dassOffice", { dassOffice })
        .andWhere(`ue.authorized_notifications_apps @> '["pense_aja"]'::jsonb`)
        .getRawOne<UserEmailNotificationTarget>();

      return query ?? undefined;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar email do usuario: ${errorMessage}`);
      throw error;
    }
  },

  async updateUserData(
    registration: string | number,
    dassOffice: DassOffice,
    formData: UpdateUserProfileInput
  ): Promise<Pick<UserProfileData, "email" | "authorized_notifications_apps">> {
    checkDassOffice(dassOffice);
    try {
      const dataSource = await initializeDatabase();
      const authorizedNotificationsApps = formData.authorized_notifications_apps.length
        ? formData.authorized_notifications_apps
        : ["null"];

      const query = await dataSource
        .createQueryBuilder()
        .update(EmailEntity)
        .set({
          email: formData.email,
          authorized_notifications_apps: authorizedNotificationsApps,
        })
        .where("matricula = :registration", {
          registration: String(registration),
        })
        .returning(["email", "authorized_notifications_apps"])
        .execute();

      if (!query.affected) {
        logger.error("user-pense-aja", `Usuário não encontrado: ${registration}`);
        throw new CustomError(`Usuário não encontrado: ${registration}`);
      }

      return query.raw[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao atualizar dados do usuario: ${errorMessage}`);
      throw error;
    }
  },

  async getUserOffice(registration: string): Promise<UserOfficeLookupResult> {
    try {
      const dataSource = await initializeDatabase();
      const firstDigit = registration.charAt(0);
      if (!firstDigit || !Number(firstDigit)) {
        throw new Error("Registro inválido. Matrícula desconhecida!");
      }
      const dasOffice = await dataSource
        .getRepository(UnidadeDassEntity)
        .createQueryBuilder("unidade")
        .select("unidade.unidade", "unidade")
        .addSelect("unidade.location", "location")
        .where(":firstDigit = ANY(unidade.key)", {
          firstDigit: Number(firstDigit),
        })
        .getRawOne<{ unidade?: DassOffice; location?: string | null }>();

      return {
        userOffice: dasOffice?.unidade ?? null,
        location: dasOffice?.location ?? null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

      logger.error("user-pense-aja", `Erro ao buscar unidade do usuario: ${errorMessage}`);
      throw error;
    }
  },
};
