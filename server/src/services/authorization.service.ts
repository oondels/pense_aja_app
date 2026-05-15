import { EntityManager } from "typeorm";
import { initializeDatabase } from "../config/database";
import { DecodedToken } from "../middlewares/auth";
import { UnitSettingsService } from "./unit-settings.service";
import {
  AuthenticatedRoleContext,
  AuthenticatedSessionContext,
  DassOffice,
} from "../types/contracts";
import { CustomError } from "../types/CustomError";
import { assertDassOffice } from "../utils/dassOffice";

interface SessionScopeRow {
  roleCode: string;
  roleName: string;
  dassOffice: DassOffice;
  permissionCode: string | null;
}

const getSessionScopeRows = async (
  manager: EntityManager,
  registration: string,
  dassOffice: DassOffice
) =>
  manager.query(
    `
      SELECT DISTINCT
        roles.code AS "roleCode",
        roles.nome AS "roleName",
        uur.unidade_dass AS "dassOffice",
        permissions.code AS "permissionCode"
      FROM pense_aja.rbac_user_unit_roles uur
      INNER JOIN pense_aja.rbac_roles roles ON roles.id = uur.role_id
      LEFT JOIN pense_aja.rbac_role_permissions role_permissions
        ON role_permissions.role_id = roles.id
      LEFT JOIN pense_aja.rbac_permissions permissions
        ON permissions.id = role_permissions.permission_id
      WHERE uur.matricula = $1
        AND (uur.unidade_dass = $2 OR roles.code = 'admin_master')
        AND uur.active = true
        AND (uur.active_from IS NULL OR uur.active_from <= CURRENT_TIMESTAMP)
        AND (uur.active_until IS NULL OR uur.active_until >= CURRENT_TIMESTAMP)
    `,
    [registration, dassOffice]
  );

const mapSessionScope = (rows: SessionScopeRow[]) => {
  const permissions = [
    ...new Set(rows.map((row) => row.permissionCode).filter(Boolean)),
  ] as string[];
  const rolesByKey = new Map<string, AuthenticatedRoleContext>();

  rows.forEach((row) => {
    if (!row.roleCode) return;
    const key = `${row.roleCode}:${row.dassOffice}`;
    if (!rolesByKey.has(key)) {
      rolesByKey.set(key, {
        code: row.roleCode,
        nome: row.roleName,
        dassOffice: row.dassOffice,
      });
    }
  });

  return {
    permissions,
    roles: [...rolesByKey.values()],
  };
};

export const AuthorizationService = {
  async resolveSessionContext(
    identity: DecodedToken,
    dassOffice: string
  ): Promise<AuthenticatedSessionContext> {
    const validDassOffice = assertDassOffice(dassOffice);
    const registration = String(identity.matricula ?? "");
    if (!registration) {
      throw new CustomError("Matrícula do usuário autenticado não encontrada.", 401);
    }

    const dataSource = await initializeDatabase();
    const { permissions, roles } = mapSessionScope(
      (await getSessionScopeRows(
        dataSource.manager,
        registration,
        validDassOffice
      )) as SessionScopeRow[]
    );

    if (!permissions.length) {
      throw new CustomError(
        "Acesso proibido: permissões da unidade não configuradas.",
        403
      );
    }

    return {
      registration,
      username: identity.usuario,
      dassOffice: validDassOffice,
      permissions,
      roles,
      unitConfig: await UnitSettingsService.getSettings(
        validDassOffice,
        dataSource.manager,
        true
      ),
    };
  },

  assertPermission(context: AuthenticatedSessionContext, permission: string) {
    if (!context.permissions.includes(permission)) {
      throw new CustomError(
        "Acesso proibido: permissão insuficiente para executar esta ação.",
        403
      );
    }
  },

  assertAnyPermission(
    context: AuthenticatedSessionContext,
    permissions: string[]
  ) {
    if (!permissions.some((permission) => context.permissions.includes(permission))) {
      throw new CustomError(
        "Acesso proibido: permissão insuficiente para executar esta ação.",
        403
      );
    }
  },
};
