import { DassOffice } from "./common.contract";

export type LedgerEntryType =
  | "earn"
  | "reverse"
  | "reserve"
  | "commit"
  | "release"
  | "refund";

export interface UserLedgerHistoryItem {
  id: number;
  entryType: LedgerEntryType;
  amount: number;
  sourceType: string;
  sourceId: string;
  relatedEntryId: number | null;
  reason: string | null;
  correlationId: string;
  createdByRegistration: string | null;
  createdByName: string | null;
  createdAt: string | Date;
  dassOffice: DassOffice;
}

export interface CreatePointsAdjustmentInput {
  dassOffice: DassOffice;
  direction: "credit" | "debit";
  amount: number;
  reason: string;
}

export interface PointsAdjustmentResponse {
  id: number;
  registration: string;
  dassOffice: DassOffice;
  direction: "credit" | "debit";
  amount: number;
  reason: string;
  availableBalance: number;
}
