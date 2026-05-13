import { DassOffice } from "./common.contract";

export interface AuthenticatedSessionContext {
  sessionKey: string;
  registration: string;
  username: string;
  dassOffice: DassOffice;
  permissions: string[];
  snapshotVersion: number;
  snapshotExpiresAt: Date;
}

export interface SessionContextResponse {
  registration: string;
  dassOffice: DassOffice;
  permissions: string[];
  snapshotVersion: number;
  snapshotExpiresAt: string;
}
