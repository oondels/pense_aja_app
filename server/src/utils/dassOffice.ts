import logger from "./logger";
import { DassOffice } from "../types/contracts";

export const allowedDassOffices: DassOffice[] = [
  "SEST",
  "VDC",
  "ITB",
  "VDC-CONF",
  "STJ",
];

export const isDassOffice = (value: string): value is DassOffice =>
  allowedDassOffices.includes(value as DassOffice);

export const assertDassOffice = (dassOffice: string): DassOffice => {
  if (!isDassOffice(dassOffice)) {
    logger.error("Pense-aja", `Unidade inválida: ${dassOffice}`);
    throw new Error(`Unidade dass Inválida: ${dassOffice}`);
  }

  return dassOffice;
};
