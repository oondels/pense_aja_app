import { DassOffice } from "./common.contract";
import { UnitSettingsRecord } from "./unit-settings.contract";

export interface AuthenticatedSessionContext {
  registration: string;
  username: string;
  dassOffice: DassOffice;
  permissions: string[];
  roles: AuthenticatedRoleContext[];
  unitConfig: UnitSettingsRecord;
}

export interface SessionContextResponse {
  registration: string;
  dassOffice: DassOffice;
  permissions: string[];
  roles: AuthenticatedRoleContext[];
  unitConfig: UnitSettingsRecord;
}

export interface AuthenticatedRoleContext {
  code: string;
  nome: string;
  dassOffice: DassOffice;
}
