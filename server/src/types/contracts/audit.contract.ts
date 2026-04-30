import { DassOffice } from "./common.contract";

export interface AuditTimelineItem {
  id: number;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  dassOffice: DassOffice;
  actorRegistration: string | null;
  actorRole: string | null;
  reason: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  correlationId: string;
  createdAt: string | Date;
}
