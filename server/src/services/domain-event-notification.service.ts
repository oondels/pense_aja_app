import logger from "../utils/logger";
import {
  DassOffice,
  EvaluatePenseAjaResult,
  MarketplaceRequestRecord,
  UserManagerNotificationTarget,
} from "../types/contracts";
import EmailEntity from "../models/Email";
import RbacRoleEntity from "../models/RbacRole";
import RbacUserUnitRoleEntity from "../models/RbacUserUnitRole";
import { initializeDatabase } from "../config/database";
import { NotificationService } from "./notification.service";
import { UserPenseaja } from "./user-penseaja.service";

interface IdeaCreatedEvent {
  type: "idea.created";
  idea: {
    id: number;
    nome: string;
    nome_projeto: string;
  };
  registration: string | number;
  dassOffice: DassOffice;
}

interface IdeaEvaluatedEvent {
  type: "idea.evaluated";
  ideaId: string;
  evaluation: EvaluatePenseAjaResult["newEvaluation"];
  role: string;
  dassOffice: DassOffice;
}

interface MarketplaceRequestCreatedEvent {
  type: "marketplace.request.created";
  request: MarketplaceRequestRecord;
  dassOffice: DassOffice;
}

interface MarketplaceRequestUpdatedEvent {
  type: "marketplace.request.updated";
  request: MarketplaceRequestRecord;
  dassOffice: DassOffice;
}

type MarketplaceOperatorNotificationTarget = {
  registration: string;
  email: string;
};

type DomainNotificationEvent =
  | IdeaCreatedEvent
  | IdeaEvaluatedEvent
  | MarketplaceRequestCreatedEvent
  | MarketplaceRequestUpdatedEvent;

interface NotificationDispatchResult {
  notificationTargetFound: boolean;
}

const appBaseUrl =
  process.env.DEV_ENV === "development"
    ? "http://localhost:5173"
    : "http://10.100.1.43:5050";

const formatUserName = (name: string) => {
  const splitedName = name.split(" ");
  return `${splitedName[0]} ${splitedName[splitedName.length - 1]}`;
};

const formatEvaluatorName = (
  evaluation: EvaluatePenseAjaResult["newEvaluation"],
  role: string
) => {
  const rawName = role.includes("gerente")
    ? evaluation.gerente_aprovador
    : evaluation.analista_avaliador;

  return (rawName ?? "")
    .split(".")
    .map(
      (part: string) =>
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join(" ");
};

const marketplaceStatusLabel: Record<string, string> = {
  pending_approval: "pendente de aprovação",
  approved: "aprovada",
  rejected: "rejeitada",
  fulfillment_in_progress: "em separação ou entrega",
  completed: "concluída",
  cancelled: "cancelada",
  refunded: "estornada",
};

const getMarketplaceItemDescription = (request: MarketplaceRequestRecord) =>
  request.catalogItemName
    ? `${request.catalogItemName} (${request.catalogItemPointsCost ?? 0} pontos)`
    : `item ${request.catalogItemId}`;

const logNotificationSideEffectError = (
  flow: string,
  error: unknown,
  metadata: Record<string, unknown>
) => {
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  logger.error(
    "Pense-aja",
    `Falha não bloqueante em notificação (${flow}): ${message} - ${JSON.stringify(
      metadata
    )}`
  );
};

const findManagerByUserSafely = async (
  registration: string | number,
  dassOffice: DassOffice
): Promise<UserManagerNotificationTarget | null> => {
  try {
    return await UserPenseaja.getManagerByUser(registration, dassOffice);
  } catch (error) {
    logNotificationSideEffectError("buscar-gerente", error, {
      registration,
      dassOffice,
    });
    return null;
  }
};

const findMarketplaceOperatorTargetsSafely = async (
  dassOffice: DassOffice
): Promise<MarketplaceOperatorNotificationTarget[]> => {
  try {
    const dataSource = await initializeDatabase();
    const rows = await dataSource
      .getRepository(RbacUserUnitRoleEntity)
      .createQueryBuilder("assignment")
      .innerJoin(
        RbacRoleEntity as any,
        "role",
        "role.id = assignment.role_id"
      )
      .innerJoin(
        EmailEntity as any,
        "email",
        "email.matricula = assignment.matricula AND email.unidade_dass = assignment.unidade_dass"
      )
      .select("assignment.matricula", "registration")
      .addSelect("email.email", "email")
      .where("assignment.unidade_dass = :dassOffice", { dassOffice })
      .andWhere("assignment.active = true")
      .andWhere("(assignment.active_from IS NULL OR assignment.active_from <= CURRENT_TIMESTAMP)")
      .andWhere("(assignment.active_until IS NULL OR assignment.active_until >= CURRENT_TIMESTAMP)")
      .andWhere("role.code IN (:...roles)", {
        roles: ["marketplace_operator", "marketplace_admin"],
      })
      .andWhere("email.email IS NOT NULL")
      .getRawMany<{ registration: string; email: string }>();

    const targets = new Map<string, MarketplaceOperatorNotificationTarget>();
    rows.forEach((row) => {
      const registration = String(row.registration);
      if (row.email && !targets.has(registration)) {
        targets.set(registration, {
          registration,
          email: row.email,
        });
      }
    });

    return [...targets.values()];
  } catch (error) {
    logNotificationSideEffectError("buscar-operadores-marketplace", error, {
      dassOffice,
    });
    return [];
  }
};

const notifyIdeaCreated = async (
  event: IdeaCreatedEvent
): Promise<NotificationDispatchResult> => {
  const manager = await findManagerByUserSafely(
    event.registration,
    event.dassOffice
  );

  if (!manager) {
    return { notificationTargetFound: false };
  }

  try {
    const notificationEnabled = await NotificationService.isNotificationEnabled(
      manager.matricula,
      event.dassOffice
    );

    if (!notificationEnabled) {
      return { notificationTargetFound: true };
    }

    await NotificationService.sendNotification({
      to: String(manager.email),
      subject: "Aplicativo Pense Aja",
      title: "Novo Pense Aja Cadastrado.",
      message: `Um novo registro de Pense Aja foi cadastrado pelo usuário ${formatUserName(
        event.idea.nome
      )}. Projeto: ${event.idea.nome_projeto}.`,
      application: "Pense e Aja",
      link: `${appBaseUrl}/pense-aja/${event.idea.id}`,
    });
  } catch (error) {
    logNotificationSideEffectError("cadastro", error, {
      ideaId: event.idea.id,
      managerRegistration: manager.matricula,
      dassOffice: event.dassOffice,
    });
  }

  return { notificationTargetFound: true };
};

const notifyIdeaEvaluated = async (
  event: IdeaEvaluatedEvent
): Promise<NotificationDispatchResult> => {
  try {
    const userEmail = await UserPenseaja.getUserEmail(
      event.evaluation.matricula,
      event.dassOffice
    );

    if (!userEmail) {
      return { notificationTargetFound: false };
    }

    const notificationEnabled = await NotificationService.isNotificationEnabled(
      event.evaluation.matricula,
      event.dassOffice
    );

    if (!notificationEnabled) {
      return { notificationTargetFound: true };
    }

    const evaluatorName = formatEvaluatorName(event.evaluation, event.role);

    await NotificationService.sendNotification({
      to: userEmail.email,
      subject: "Aplicativo Pense Aja",
      title: "Pense Aja Avaliado.",
      message: `Seu registro de Pense Aja foi avaliado${
        evaluatorName ? ` pelo usuário ${evaluatorName}` : "!"
      }.
        Abra o aplicativo e veja sua pontuação e feedbacks!`,
      application: "Pense e Aja",
      link: `${appBaseUrl}/pense-aja/${event.ideaId}`,
    });

    return { notificationTargetFound: true };
  } catch (error) {
    logNotificationSideEffectError("avaliacao", error, {
      ideaId: event.ideaId,
      registration: event.evaluation.matricula,
      dassOffice: event.dassOffice,
    });
    return { notificationTargetFound: false };
  }
};

const notifyMarketplaceRequestCreated = async (
  event: MarketplaceRequestCreatedEvent
): Promise<NotificationDispatchResult> => {
  const targets = await findMarketplaceOperatorTargetsSafely(event.dassOffice);

  if (!targets.length) {
    return { notificationTargetFound: false };
  }

  await Promise.all(
    targets.map(async (target) => {
      try {
        const notificationEnabled =
          await NotificationService.isNotificationEnabled(
            target.registration,
            event.dassOffice
          );

        if (!notificationEnabled) {
          return;
        }

        await NotificationService.sendNotification({
          to: target.email,
          subject: "Aplicativo Pense Aja",
          title: "Nova solicitação de resgate.",
          message: `Uma nova solicitação de resgate foi criada por ${
            event.request.requesterName ?? event.request.registration
          }. Brinde: ${getMarketplaceItemDescription(event.request)}.`,
          application: "Pense e Aja",
          link: `${appBaseUrl}/admin/marketplace`,
        });
      } catch (error) {
        logNotificationSideEffectError("marketplace-criacao", error, {
          requestId: event.request.id,
          targetRegistration: target.registration,
          dassOffice: event.dassOffice,
        });
      }
    })
  );

  return { notificationTargetFound: true };
};

const notifyMarketplaceRequestUpdated = async (
  event: MarketplaceRequestUpdatedEvent
): Promise<NotificationDispatchResult> => {
  try {
    const userEmail = await UserPenseaja.getUserEmail(
      event.request.registration,
      event.dassOffice
    );

    if (!userEmail) {
      return { notificationTargetFound: false };
    }

    const notificationEnabled = await NotificationService.isNotificationEnabled(
      event.request.registration,
      event.dassOffice
    );

    if (!notificationEnabled) {
      return { notificationTargetFound: true };
    }

    const statusLabel =
      marketplaceStatusLabel[event.request.requestStatus] ??
      event.request.requestStatus;

    await NotificationService.sendNotification({
      to: userEmail.email,
      subject: "Aplicativo Pense Aja",
      title: "Solicitação de resgate atualizada.",
      message: `Sua solicitação de resgate foi atualizada para ${statusLabel}. Brinde: ${getMarketplaceItemDescription(
        event.request
      )}.`,
      application: "Pense e Aja",
      link: `${appBaseUrl}/marketplace`,
    });

    return { notificationTargetFound: true };
  } catch (error) {
    logNotificationSideEffectError("marketplace-atualizacao", error, {
      requestId: event.request.id,
      registration: event.request.registration,
      dassOffice: event.dassOffice,
    });
    return { notificationTargetFound: false };
  }
};

export const DomainEventNotificationService = {
  async dispatch(
    event: DomainNotificationEvent
  ): Promise<NotificationDispatchResult> {
    if (event.type === "idea.created") {
      return notifyIdeaCreated(event);
    }

    if (event.type === "idea.evaluated") {
      return notifyIdeaEvaluated(event);
    }

    if (event.type === "marketplace.request.created") {
      return notifyMarketplaceRequestCreated(event);
    }

    return notifyMarketplaceRequestUpdated(event);
  },
};
