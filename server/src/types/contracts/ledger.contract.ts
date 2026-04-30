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
