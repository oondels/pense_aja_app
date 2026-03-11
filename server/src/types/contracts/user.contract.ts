import { DassOffice } from "./common.contract";

export type AuthorizedNotificationApp = "pense_aja" | "null" | string;

export interface UserClassifications {
  [classification: string]: number;
}

export interface UserProfileData {
  nome: string;
  setor: string;
  gerente: string;
  funcao: string;
  matricula: number;
  pontos: number;
  pontos_resgatados: number;
  classificacoes_pense_aja: UserClassifications;
  email: string;
  authorized_notifications_apps: AuthorizedNotificationApp[];
}

export interface UserManagerNotificationTarget {
  gerente: string;
  matricula: number;
  email: string;
}

export interface UserEmailNotificationTarget {
  email: string;
  authorized_notifications_apps: AuthorizedNotificationApp[];
}

export interface UpdateUserProfileInput {
  email: string;
  authorized_notifications_apps: AuthorizedNotificationApp[];
}

export interface UserOfficeLookupResult {
  userOffice: DassOffice | null;
  location: string | null;
}
