import { EntityManager } from "typeorm";
import { initializeDatabase } from "../config/database";
import MarketplaceCatalogItemEntity from "../models/MarketplaceCatalogItem";
import UnitConfigEntity from "../models/UnitConfig";
import UnitMarketplacePolicyEntity from "../models/UnitMarketplacePolicy";
import UnitScoringRuleEntity, { UnitScoringRule } from "../models/UnitScoringRule";
import UnitWorkflowStepEntity, { UnitWorkflowStep } from "../models/UnitWorkflowStep";
import {
  AuthenticatedSessionContext,
  DassOffice,
  UnitMarketplacePolicyInput,
  UnitMarketplacePolicyRecord,
  UnitScoringRuleInput,
  UnitScoringRuleRecord,
  UnitSettingsRecord,
  UnitWorkflowStepInput,
  UnitWorkflowStepRecord,
  UpsertUnitSettingsInput,
} from "../types/contracts";
import { CustomError } from "../types/CustomError";
import { assertDassOffice } from "../utils/dassOffice";

const CLASSIFICATION_PATTERN = /^[A-Z]{1,3}$/;

const mapScoringRule = (rule: UnitScoringRule): UnitScoringRuleRecord => ({
  id: rule.id,
  dassOffice: rule.unidade_dass as DassOffice,
  classification: rule.classification,
  label: rule.label || rule.classification,
  description: rule.description ?? null,
  score: Number(rule.score),
  displayOrder: Number(rule.display_order ?? 0),
  active: Boolean(rule.active),
  activeFrom: rule.active_from,
  activeUntil: rule.active_until,
  metadata: rule.metadata ?? null,
});

const mapWorkflowStep = (step: UnitWorkflowStep): UnitWorkflowStepRecord => ({
  id: step.id,
  dassOffice: step.unidade_dass as DassOffice,
  stepCode: step.step_code,
  stepOrder: Number(step.step_order),
  requiredPermission: step.required_permission,
  terminalStatus: step.terminal_status ?? null,
  active: Boolean(step.active),
  metadata: step.metadata ?? null,
});

const mapMarketplacePolicy = (
  policy: any
): UnitMarketplacePolicyRecord | null =>
  policy
    ? {
        id: policy.id,
        dassOffice: policy.unidade_dass as DassOffice,
        allowRefundAfterCommit: Boolean(policy.allow_refund_after_commit),
        voucherAdapter: policy.voucher_adapter,
        active: Boolean(policy.active),
        metadata: policy.metadata ?? null,
      }
    : null;

const parseOptionalDate = (value?: string | Date | null) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new CustomError("Data inválida na configuração da unidade.", 400);
  }
  return date;
};

const normalizeClassification = (value: string) => String(value || "").trim().toUpperCase();

const validateScoringRules = (rules: UnitScoringRuleInput[]) => {
  const activeClassifications = new Set<string>();
  const activeOrders = new Set<number>();

  rules.forEach((rule, index) => {
    const classification = normalizeClassification(rule.classification);
    if (!CLASSIFICATION_PATTERN.test(classification)) {
      throw new CustomError("Classificação deve usar letras maiúsculas, como A, B, C ou D.", 400);
    }

    const score = Number(rule.score);
    if (!Number.isInteger(score) || score <= 0) {
      throw new CustomError("Pontuação da classificação deve ser inteiro positivo.", 400);
    }

    const active = rule.active ?? true;
    const displayOrder = Number(rule.displayOrder ?? index + 1);
    if (!Number.isInteger(displayOrder) || displayOrder <= 0) {
      throw new CustomError("Ordem da classificação deve ser inteiro positivo.", 400);
    }

    if (active) {
      if (activeClassifications.has(classification)) {
        throw new CustomError("Não é permitido duplicar classificação ativa na unidade.", 400);
      }
      if (activeOrders.has(displayOrder)) {
        throw new CustomError("Não é permitido duplicar ordem ativa de classificação.", 400);
      }
      activeClassifications.add(classification);
      activeOrders.add(displayOrder);
    }
  });

  if (!rules.some((rule) => rule.active ?? true)) {
    throw new CustomError("A unidade deve possuir ao menos uma classificação ativa.", 400);
  }
};

const validateWorkflowSteps = (steps: UnitWorkflowStepInput[]) => {
  const codes = new Set<string>();
  const orders = new Set<number>();

  steps.forEach((step) => {
    if (!step.stepCode?.trim()) {
      throw new CustomError("Código da etapa de workflow é obrigatório.", 400);
    }
    if (!step.requiredPermission?.trim()) {
      throw new CustomError("Permissão da etapa de workflow é obrigatória.", 400);
    }
    if (!Number.isInteger(Number(step.stepOrder)) || Number(step.stepOrder) <= 0) {
      throw new CustomError("Ordem da etapa de workflow deve ser inteiro positivo.", 400);
    }

    const code = step.stepCode.trim();
    if (codes.has(code)) {
      throw new CustomError("Não é permitido duplicar código de etapa na unidade.", 400);
    }
    if (orders.has(Number(step.stepOrder))) {
      throw new CustomError("Não é permitido duplicar ordem de etapa na unidade.", 400);
    }
    codes.add(code);
    orders.add(Number(step.stepOrder));
  });
};

const isRuleEffective = (rule: UnitScoringRule, now = new Date()) =>
  rule.active &&
  (!rule.active_from || rule.active_from <= now) &&
  (!rule.active_until || rule.active_until >= now);

export const UnitSettingsService = {
  async getSettings(
    dassOffice: string,
    manager?: EntityManager,
    effectiveOnly = false
  ): Promise<UnitSettingsRecord> {
    const validDassOffice = assertDassOffice(dassOffice);
    const dataSource = manager ? null : await initializeDatabase();
    const entityManager = manager ?? dataSource!.manager;

    const [config, scoringRules, workflowSteps, marketplacePolicy] =
      await Promise.all([
        entityManager.getRepository(UnitConfigEntity).findOne({
          where: { unidade_dass: validDassOffice },
        }),
        entityManager.getRepository(UnitScoringRuleEntity).find({
          where: { unidade_dass: validDassOffice },
          order: { display_order: "ASC", classification: "ASC" } as any,
        }),
        entityManager.getRepository(UnitWorkflowStepEntity).find({
          where: { unidade_dass: validDassOffice },
          order: { step_order: "ASC" },
        }),
        entityManager.getRepository(UnitMarketplacePolicyEntity).findOne({
          where: { unidade_dass: validDassOffice },
        }),
      ]);

    const now = new Date();
    const filteredScoringRules = effectiveOnly
      ? scoringRules.filter((rule) => isRuleEffective(rule, now))
      : scoringRules;
    const filteredWorkflowSteps = effectiveOnly
      ? workflowSteps.filter((step) => step.active)
      : workflowSteps;

    return {
      dassOffice: validDassOffice,
      active: config?.active ?? true,
      metadata: config?.metadata ?? null,
      scoringRules: filteredScoringRules.map(mapScoringRule),
      workflowSteps: filteredWorkflowSteps.map(mapWorkflowStep),
      marketplacePolicy: mapMarketplacePolicy(marketplacePolicy),
    };
  },

  async getScoringRule(
    manager: EntityManager,
    dassOffice: DassOffice,
    classification: string
  ): Promise<UnitScoringRuleRecord | null> {
    const settings = await this.getSettings(dassOffice, manager, true);
    return (
      settings.scoringRules.find(
        (rule) => rule.classification === normalizeClassification(classification)
      ) ?? null
    );
  },

  async upsertSettings(
    dassOffice: string,
    input: UpsertUnitSettingsInput,
    actor: AuthenticatedSessionContext
  ): Promise<UnitSettingsRecord> {
    const validDassOffice = assertDassOffice(dassOffice);
    if (actor.dassOffice !== validDassOffice) {
      throw new CustomError("Configuração deve pertencer à unidade da sessão.", 403);
    }

    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const now = new Date();

      const configRepository = queryRunner.manager.getRepository(UnitConfigEntity);
      const existingConfig = await configRepository.findOne({
        where: { unidade_dass: validDassOffice },
      });

      if (existingConfig) {
	        await configRepository.update(
	          { id: existingConfig.id },
	          {
	            active: input.active ?? existingConfig.active,
	            metadata: input.metadata === undefined ? existingConfig.metadata : input.metadata,
	            updatedat: now,
	          } as any
	        );
      } else {
        await configRepository.save(
          configRepository.create({
            unidade_dass: validDassOffice,
            active: input.active ?? true,
            metadata: input.metadata ?? null,
            createdat: now,
            updatedat: now,
          })
        );
      }

      if (input.scoringRules) {
        validateScoringRules(input.scoringRules);
        const repository = queryRunner.manager.getRepository(UnitScoringRuleEntity);
        const keepIds = input.scoringRules.filter((rule) => rule.id).map((rule) => rule.id!);

        const existingRules = await repository.find({
          where: { unidade_dass: validDassOffice },
        });
        await Promise.all(
          existingRules
            .filter((rule) => !keepIds.includes(rule.id))
            .map((rule) => repository.update({ id: rule.id }, { active: false, updatedat: now }))
        );

        for (const [index, rule] of input.scoringRules.entries()) {
          const payload = {
            unidade_dass: validDassOffice,
            classification: normalizeClassification(rule.classification),
            label: rule.label?.trim() || normalizeClassification(rule.classification),
            description: rule.description ?? null,
            score: String(Number(rule.score)),
            display_order: Number(rule.displayOrder ?? index + 1),
            active: rule.active ?? true,
            active_from: parseOptionalDate(rule.activeFrom) ?? null,
            active_until: parseOptionalDate(rule.activeUntil) ?? null,
            metadata: rule.metadata ?? null,
            updatedat: now,
          };

	          if (rule.id) {
	            await repository.update({ id: rule.id, unidade_dass: validDassOffice }, payload as any);
	          } else {
            await repository.save(repository.create({ ...payload, createdat: now }));
          }
        }
      }

      if (input.workflowSteps) {
        validateWorkflowSteps(input.workflowSteps);
        const repository = queryRunner.manager.getRepository(UnitWorkflowStepEntity);
        const keepIds = input.workflowSteps.filter((step) => step.id).map((step) => step.id!);
        const existingSteps = await repository.find({
          where: { unidade_dass: validDassOffice },
        });
        await Promise.all(
          existingSteps
            .filter((step) => !keepIds.includes(step.id))
            .map((step) => repository.update({ id: step.id }, { active: false, updatedat: now }))
        );

        for (const step of input.workflowSteps) {
          const payload = {
            unidade_dass: validDassOffice,
            step_code: step.stepCode.trim(),
            step_order: Number(step.stepOrder),
            required_permission: step.requiredPermission.trim(),
            terminal_status: step.terminalStatus || null,
            active: step.active ?? true,
            metadata: step.metadata ?? null,
            updatedat: now,
          };

	          if (step.id) {
	            await repository.update({ id: step.id, unidade_dass: validDassOffice }, payload as any);
	          } else {
            await repository.save(repository.create({ ...payload, createdat: now }));
          }
        }
      }

      if (input.marketplacePolicy !== undefined) {
        await this.upsertMarketplacePolicy(
          queryRunner.manager,
          validDassOffice,
          input.marketplacePolicy,
          now
        );
      }

      await queryRunner.commitTransaction();
      return this.getSettings(validDassOffice);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  },

  async upsertMarketplacePolicy(
    manager: EntityManager,
    dassOffice: DassOffice,
    input: UnitMarketplacePolicyInput | null,
    now: Date
  ) {
    if (input === null) return;
    const repository = manager.getRepository(UnitMarketplacePolicyEntity);
    const existing = await repository.findOne({ where: { unidade_dass: dassOffice } });
    const payload = {
      unidade_dass: dassOffice,
      allow_refund_after_commit: input?.allowRefundAfterCommit ?? true,
      voucher_adapter: input?.voucherAdapter || "noop",
      active: input?.active ?? true,
      metadata: input?.metadata ?? null,
      updatedat: now,
    };

    if (existing) {
      await repository.update(
        { id: existing.id },
        {
          allow_refund_after_commit:
            input?.allowRefundAfterCommit ?? existing.allow_refund_after_commit,
          voucher_adapter: input?.voucherAdapter || existing.voucher_adapter,
          active: input?.active ?? existing.active,
	          metadata: input?.metadata === undefined ? existing.metadata : input.metadata,
	          updatedat: now,
	        } as any
	      );
      return;
    }

    await repository.save(repository.create({ ...payload, createdat: now }));
  },

  async listCatalogSummary(dassOffice: string) {
    const validDassOffice = assertDassOffice(dassOffice);
    const dataSource = await initializeDatabase();
    return dataSource.getRepository(MarketplaceCatalogItemEntity).count({
      where: { unidade_dass: validDassOffice },
    });
  },
};
