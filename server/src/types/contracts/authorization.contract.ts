import { DassOffice } from "./common.contract";
import { UnitSettingsRecord } from "./unit-settings.contract";

export interface AuthenticatedSessionContext {
  sessionKey: string;
  registration: string;
  username: string;
  dassOffice: DassOffice;
  permissions: string[];
  unitConfig: UnitSettingsRecord;
  snapshotVersion: number;
  snapshotExpiresAt: Date;
}

export interface SessionContextResponse {
  registration: string;
  dassOffice: DassOffice;
  permissions: string[];
  unitConfig: UnitSettingsRecord;
  snapshotVersion: number;
  snapshotExpiresAt: string;
}
