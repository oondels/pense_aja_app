import { DassOffice } from "./common.contract";

export interface UnitScoringRuleRecord {
  id: string;
  dassOffice: DassOffice;
  classification: string;
  label: string;
  description: string | null;
  score: number;
  displayOrder: number;
  active: boolean;
  activeFrom: string | Date | null;
  activeUntil: string | Date | null;
  metadata: Record<string, unknown> | null;
}

export interface UnitWorkflowStepRecord {
  id: string;
  dassOffice: DassOffice;
  stepCode: string;
  stepOrder: number;
  requiredPermission: string;
  terminalStatus: string | null;
  active: boolean;
  metadata: Record<string, unknown> | null;
}

export interface UnitMarketplacePolicyRecord {
  id: string;
  dassOffice: DassOffice;
  allowRefundAfterCommit: boolean;
  voucherAdapter: string;
  active: boolean;
  metadata: Record<string, unknown> | null;
}

export interface UnitSettingsRecord {
  dassOffice: DassOffice;
  active: boolean;
  metadata: Record<string, unknown> | null;
  scoringRules: UnitScoringRuleRecord[];
  workflowSteps: UnitWorkflowStepRecord[];
  marketplacePolicy: UnitMarketplacePolicyRecord | null;
}

export interface UnitScoringRuleInput {
  id?: string;
  classification: string;
  label?: string;
  description?: string | null;
  score: number;
  displayOrder?: number;
  active?: boolean;
  activeFrom?: string | Date | null;
  activeUntil?: string | Date | null;
  metadata?: Record<string, unknown> | null;
}

export interface UnitWorkflowStepInput {
  id?: string;
  stepCode: string;
  stepOrder: number;
  requiredPermission: string;
  terminalStatus?: string | null;
  active?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface UnitMarketplacePolicyInput {
  allowRefundAfterCommit?: boolean;
  voucherAdapter?: string;
  active?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface UpsertUnitSettingsInput {
  active?: boolean;
  metadata?: Record<string, unknown> | null;
  scoringRules?: UnitScoringRuleInput[];
  workflowSteps?: UnitWorkflowStepInput[];
  marketplacePolicy?: UnitMarketplacePolicyInput | null;
}
