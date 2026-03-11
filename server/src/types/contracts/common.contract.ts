export type DassOffice = "SEST" | "VDC" | "ITB" | "VDC-CONF" | "STJ";

export type QueryValue = string | number | boolean | Date | null;

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface AuthenticatedUserIdentity {
  usuario: string;
  funcao: string;
}
