import crypto from "crypto";
import { EntityManager } from "typeorm";
import { initializeDatabase } from "../config/database";
import { DecodedToken } from "../middlewares/auth";
import RbacSessionSnapshotEntity from "../models/RbacSessionSnapshot";
import { UnitSettingsService } from "./unit-settings.service";
import {
  AuthenticatedSessionContext,
  DassOffice,
} from "../types/contracts";
import { CustomError } from "../types/CustomError";
import { assertDassOffice } from "../utils/dassOffice";

const SNAPSHOT_TTL_MS = 5 * 60 * 1000;

const buildSessionKey = (
  token: string | undefined,
  registration: string,
  dassOffice: DassOffice
) =>
  crypto
    .createHash("sha256")
    .update(`${token ?? "no-token"}:${registration}:${dassOffice}`)
    .digest("hex");

const mapPermissions = (rows: Array<{ code: string }>) =>
  rows.map((row) => row.code).filter(Boolean);

const getPermissionRows = async (
  manager: EntityManager,
  registration: string,
  dassOffice: DassOffice
) =>
  manager.query(
    `
      SELECT DISTINCT permissions.code
      FROM pense_aja.rbac_user_unit_roles uur
      INNER JOIN pense_aja.rbac_roles roles ON roles.id = uur.role_id
      INNER JOIN pense_aja.rbac_role_permissions role_permissions
        ON role_permissions.role_id = roles.id
      INNER JOIN pense_aja.rbac_permissions permissions
        ON permissions.id = role_permissions.permission_id
      WHERE uur.matricula = $1
        AND uur.unidade_dass = $2
        AND uur.active = true
        AND (uur.active_from IS NULL OR uur.active_from <= CURRENT_TIMESTAMP)
        AND (uur.active_until IS NULL OR uur.active_until >= CURRENT_TIMESTAMP)
    `,
    [registration, dassOffice]
  );

export const AuthorizationService = {
  buildSessionKey,

  async resolveSessionContext(
    identity: DecodedToken,
    dassOffice: string,
    token?: string
  ): Promise<AuthenticatedSessionContext> {
    const validDassOffice = assertDassOffice(dassOffice);
    const registration = String(identity.matricula ?? "");
    if (!registration) {
      throw new CustomError("Matrícula do usuário autenticado não encontrada.", 401);
    }

    const sessionKey = buildSessionKey(token, registration, validDassOffice);
    const dataSource = await initializeDatabase();
    const snapshotRepository = dataSource.getRepository(RbacSessionSnapshotEntity);
    const now = new Date();

    const existingSnapshot = await snapshotRepository.findOne({
      where: {
        session_key: sessionKey,
      },
    });

    if (existingSnapshot && existingSnapshot.expires_at > now) {
      const permissions = Array.isArray(existingSnapshot.permissions)
        ? existingSnapshot.permissions
        : [];

      if (!permissions.length) {
        throw new CustomError(
          "Acesso proibido: permissões da unidade não configuradas.",
          403
        );
      }

      return {
        sessionKey,
        registration,
        username: identity.usuario,
        dassOffice: validDassOffice,
        permissions,
        unitConfig: await UnitSettingsService.getSettings(
          validDassOffice,
          dataSource.manager,
          true
        ),
        snapshotVersion: Number(existingSnapshot.version),
        snapshotExpiresAt: existingSnapshot.expires_at,
      };
    }

    const permissions = mapPermissions(
      (await getPermissionRows(
        dataSource.manager,
        registration,
        validDassOffice
      )) as Array<{ code: string }>
    );

    if (!permissions.length) {
      throw new CustomError(
        "Acesso proibido: permissões da unidade não configuradas.",
        403
      );
    }

    const expiresAt = new Date(now.getTime() + SNAPSHOT_TTL_MS);

    if (existingSnapshot) {
      await snapshotRepository.update(
        { id: existingSnapshot.id },
        {
          permissions,
          version: Number(existingSnapshot.version) + 1,
          expires_at: expiresAt,
          updatedat: now,
        }
      );
    } else {
      await snapshotRepository.save(
        snapshotRepository.create({
          session_key: sessionKey,
          matricula: registration,
          unidade_dass: validDassOffice,
          permissions,
          version: 1,
          expires_at: expiresAt,
          createdat: now,
          updatedat: now,
        })
      );
    }

    const version = existingSnapshot ? Number(existingSnapshot.version) + 1 : 1;

    return {
      sessionKey,
      registration,
      username: identity.usuario,
      dassOffice: validDassOffice,
      permissions,
      unitConfig: await UnitSettingsService.getSettings(
        validDassOffice,
        dataSource.manager,
        true
      ),
      snapshotVersion: version,
      snapshotExpiresAt: expiresAt,
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
