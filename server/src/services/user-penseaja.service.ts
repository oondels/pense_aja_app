import logger from "../utils/logger";
import { initializeDatabase } from "../config/database";
import {
  Collaborator,
  CollaboratorItbEntity,
  CollaboratorSestEntity,
  CollaboratorStjEntity,
  CollaboratorVdcConfEntity,
  CollaboratorVdcEntity,
} from "../models/Collaborator";
import EmailEntity from "../models/Email";
import PenseAjaDassEntity from "../models/PenseAjaDass";
import PointsBalanceProjectionEntity from "../models/PointsBalanceProjection";
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
import { assertDassOffice } from "../utils/dassOffice";

const collaboratorEntityMap = {
  SEST: CollaboratorSestEntity,
  VDC: CollaboratorVdcEntity,
  ITB: CollaboratorItbEntity,
  "VDC-CONF": CollaboratorVdcConfEntity,
  STJ: CollaboratorStjEntity,
};

const normalizeName = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const hasPenseAjaNotificationEnabled = (apps?: string[] | null) =>
  Array.isArray(apps) && apps.includes("pense_aja");

export const UserPenseaja = {
  async getUserData(registration: number, dassOffice: DassOffice): Promise<UserProfileData> {
    const validDassOffice = assertDassOffice(dassOffice);
    try {
      const dataSource = await initializeDatabase();
      const collaborator = await dataSource
        .getRepository<Collaborator>(collaboratorEntityMap[validDassOffice])
        .findOne({
          where: { matricula: String(registration) },
        });

      const projection = await dataSource
        .getRepository(PointsBalanceProjectionEntity)
        .findOne({
          where: {
            matricula: String(registration),
            unidade_dass: validDassOffice,
          },
        });

      if (!collaborator) {
        logger.error("user-pense-aja", `Usuário não encontrado: ${registration}`);
        throw new CustomError(`Usuário não encontrado: ${registration}`);
      }

      const email = await dataSource.getRepository(EmailEntity).findOne({
        where: {
          matricula: String(registration),
          unidade_dass: validDassOffice,
        },
      });

      const ideas = await dataSource.getRepository(PenseAjaDassEntity).find({
        select: ["classificacao"],
        where: {
          matricula: String(registration),
          unidade_dass: validDassOffice,
          excluido: false,
        },
      });
      const classificacoes = ideas.reduce<Record<string, number>>(
        (acc, idea) => {
          const key = idea.classificacao ?? "Não classificado";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        },
        {}
      );

      const pontos = projection
        ? Number(projection.total_earned) - Number(projection.total_reversed)
        : 0;
      const pontosResgatados = projection
        ? Math.max(
            0,
            Number(projection.total_committed) -
              Number(projection.total_refunded ?? 0)
          )
        : 0;
      const pontosReservados = projection
        ? Number(projection.total_reserved) || 0
        : 0;
      const pontosEstornados = projection
        ? Number(projection.total_refunded ?? 0) || 0
        : 0;
      const saldoDisponivel = projection
        ? Number(projection.available_balance) || 0
        : pontos - pontosResgatados;

      return {
        nome: collaborator.nome ?? "",
        setor: collaborator.nome_setor ?? "",
        gerente: collaborator.gerente ?? "",
        funcao: collaborator.funcao ?? "",
        matricula: Number(collaborator.matricula),
        email: email?.email ?? "",
        authorized_notifications_apps:
          email?.authorized_notifications_apps ?? ["null"],
        classificacoes_pense_aja: classificacoes,
        pontos,
        pontos_resgatados: pontosResgatados,
        pontos_reservados: pontosReservados,
        pontos_estornados: pontosEstornados,
        saldo_disponivel: saldoDisponivel,
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
    const validDassOffice = assertDassOffice(dassOffice);
    try {
      const dataSource = await initializeDatabase();
      const collaborator = await dataSource
        .getRepository<Collaborator>(collaboratorEntityMap[validDassOffice])
        .findOne({
          where: { matricula: String(registration) },
        });

      if (!collaborator?.gerente) {
        return null;
      }

      const managers = await dataSource.getRepository(UsuarioEntity).find({
        where: { funcao: "GERENTE" },
      });
      const manager = managers.find(
        (user) => normalizeName(user.nome) === normalizeName(collaborator.gerente)
      );

      if (!manager) {
        return null;
      }

      const email = await dataSource.getRepository(EmailEntity).findOne({
        where: {
          matricula: String(manager.matricula),
        },
      });

      if (!email?.email) {
        return null;
      }

      return {
        gerente: collaborator.gerente,
        matricula: Number(manager.matricula),
        email: email.email,
      };
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
    const validDassOffice = assertDassOffice(dassOffice);
    try {
      const dataSource = await initializeDatabase();
      const user = await dataSource.getRepository(UsuarioEntity).findOne({
        where: {
          matricula: String(registration),
          unidade: validDassOffice,
        },
      });

      if (!user) {
        return undefined;
      }

      const email = await dataSource.getRepository(EmailEntity).findOne({
        where: {
          matricula: String(registration),
          unidade_dass: validDassOffice,
        },
      });

      if (
        !email?.email ||
        !hasPenseAjaNotificationEnabled(email.authorized_notifications_apps)
      ) {
        return undefined;
      }

      return {
        email: email.email,
        authorized_notifications_apps: email.authorized_notifications_apps ?? [],
      };
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
    assertDassOffice(dassOffice);
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
