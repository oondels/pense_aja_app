import { DassOffice } from "./common.contract";

export interface RbacRoleRecord {
  id: number;
  code: string;
  nome: string;
}

export interface RbacAssignmentRecord {
  id: number;
  registration: string;
  dassOffice: DassOffice;
  roleId: number;
  roleCode: string;
  roleName: string;
  active: boolean;
  activeFrom: string | Date | null;
  activeUntil: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateRbacAssignmentInput {
  registration: string;
  dassOffice: DassOffice;
  roleCode?: string;
  roleCodes?: string[];
  active?: boolean;
  activeFrom?: string | Date | null;
  activeUntil?: string | Date | null;
}

export interface UpdateRbacAssignmentInput {
  roleCode?: string;
  active?: boolean;
  activeFrom?: string | Date | null;
  activeUntil?: string | Date | null;
}

export interface RbacAssignmentFilters {
  registration?: string;
  dassOffice?: string;
  roleCode?: string;
  active?: string;
  search?: string;
}
