import { QueryRunner } from "typeorm";
import UnitWorkflowStepEntity, {
  UnitWorkflowStep,
} from "../models/UnitWorkflowStep";
import { DassOffice } from "../types/contracts";
import { CustomError } from "../types/CustomError";

export type EvaluationReviewSlot = "analista" | "gerente";

export interface EvaluationWorkflowDecision {
  stepCode: string;
  requiredPermission: string;
  reviewSlot: EvaluationReviewSlot;
  terminalStatus: string | null;
}

const hasPermission = (permissions: string[] | undefined, permission: string) =>
  Array.isArray(permissions) && permissions.includes(permission);

const getMetadataReviewSlot = (
  metadata: UnitWorkflowStep["metadata"]
): EvaluationReviewSlot | null => {
  const reviewSlot =
    metadata && typeof metadata === "object"
      ? (metadata.reviewSlot as unknown)
      : undefined;

  if (reviewSlot === "gerente" || reviewSlot === "manager") {
    return "gerente";
  }

  if (reviewSlot === "analista" || reviewSlot === "analyst") {
    return "analista";
  }

  return null;
};

const inferReviewSlot = (
  step: Pick<UnitWorkflowStep, "step_code" | "metadata">,
  index: number
): EvaluationReviewSlot => {
  const metadataSlot = getMetadataReviewSlot(step.metadata);
  if (metadataSlot) {
    return metadataSlot;
  }

  const stepCode = step.step_code.toLowerCase();
  if (stepCode.includes("manager") || stepCode.includes("gerente")) {
    return "gerente";
  }

  if (stepCode.includes("analyst") || stepCode.includes("analista")) {
    return "analista";
  }

  return index === 0 ? "analista" : "gerente";
};

const toDecision = (
  step: UnitWorkflowStep,
  index: number
): EvaluationWorkflowDecision => ({
  stepCode: step.step_code,
  requiredPermission: step.required_permission,
  reviewSlot: inferReviewSlot(step, index),
  terminalStatus: step.terminal_status,
});

const defaultDecision = (
  permissions: string[] | undefined
): EvaluationWorkflowDecision => ({
  stepCode: hasPermission(permissions, "idea.exclude")
    ? "manager_review"
    : "analyst_review",
  requiredPermission: "idea.evaluate",
  reviewSlot: hasPermission(permissions, "idea.exclude") ? "gerente" : "analista",
  terminalStatus: hasPermission(permissions, "idea.exclude") ? "concluded" : null,
});

export const EvaluationWorkflowService = {
  async resolveDecision(
    queryRunner: QueryRunner,
    dassOffice: DassOffice,
    permissions: string[] | undefined
  ): Promise<EvaluationWorkflowDecision> {
    if (!hasPermission(permissions, "idea.evaluate")) {
      throw new CustomError(
        "Acesso proibido: permissão insuficiente para avaliar ideias.",
        403
      );
    }

    const steps = await queryRunner.manager
      .getRepository(UnitWorkflowStepEntity)
      .find({
        where: {
          unidade_dass: dassOffice,
          active: true,
        },
        order: {
          step_order: "ASC",
        },
      });

    if (!steps.length) {
      return defaultDecision(permissions);
    }

    const decisions = steps.map(toDecision);
    const eligibleDecisions = decisions.filter((decision) =>
      hasPermission(permissions, decision.requiredPermission)
    );

    if (!eligibleDecisions.length) {
      throw new CustomError(
        "Acesso proibido: permissão insuficiente para avaliar ideias.",
        403
      );
    }

    const preferredSlot = hasPermission(permissions, "idea.exclude")
      ? "gerente"
      : "analista";
    return (
      eligibleDecisions.find(
        (decision) => decision.reviewSlot === preferredSlot
      ) ?? eligibleDecisions[0]
    );
  },
};
