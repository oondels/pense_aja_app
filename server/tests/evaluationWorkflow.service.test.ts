import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import { EvaluationWorkflowService } from "../src/services/evaluation-workflow.service";
import { UnitWorkflowStep } from "../src/models/UnitWorkflowStep";

const buildStep = (
  overrides: Partial<UnitWorkflowStep>
): UnitWorkflowStep => ({
  id: "step-id",
  unidade_dass: "SEST",
  step_code: "analyst_review",
  step_order: 1,
  required_permission: "idea.evaluate",
  terminal_status: null,
  active: true,
  metadata: null,
  createdat: new Date(),
  updatedat: new Date(),
  ...overrides,
});

const buildQueryRunner = (steps: UnitWorkflowStep[]) =>
  ({
    manager: {
      getRepository: vi.fn(() => ({
        find: vi.fn().mockResolvedValue(steps),
      })),
    },
  }) as any;

describe("EvaluationWorkflowService", () => {
  it("should use configured workflow metadata to select manager slot", async () => {
    const queryRunner = buildQueryRunner([
      buildStep({
        step_code: "custom_manager_gate",
        step_order: 1,
        required_permission: "idea.exclude",
        terminal_status: "concluded",
        metadata: { reviewSlot: "manager" },
      }),
    ]);

    const decision = await EvaluationWorkflowService.resolveDecision(
      queryRunner,
      "SEST",
      ["idea.evaluate", "idea.exclude"]
    );

    expect(decision).toEqual({
      stepCode: "custom_manager_gate",
      requiredPermission: "idea.exclude",
      reviewSlot: "gerente",
      terminalStatus: "concluded",
    });
  });

  it("should fall back to analyst review when no workflow is configured", async () => {
    const queryRunner = buildQueryRunner([]);

    const decision = await EvaluationWorkflowService.resolveDecision(
      queryRunner,
      "SEST",
      ["idea.evaluate"]
    );

    expect(decision).toMatchObject({
      stepCode: "analyst_review",
      requiredPermission: "idea.evaluate",
      reviewSlot: "analista",
    });
  });

  it("should reject sessions without the required evaluation permission", async () => {
    const queryRunner = buildQueryRunner([]);

    await expect(
      EvaluationWorkflowService.resolveDecision(queryRunner, "SEST", [
        "idea.submit",
      ])
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});
