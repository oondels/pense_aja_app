import { EntityManager } from "typeorm";
import { initializeDatabase } from "../config/database";
import { DecodedToken } from "../middlewares/auth";
import RbacRoleEntity from "../models/RbacRole";
import RbacUserUnitRoleEntity from "../models/RbacUserUnitRole";
import UsuarioEntity from "../models/Usuario";
import {
  CreateRbacAssignmentInput,
  DassOffice,
  RbacAssignmentFilters,
  RbacAssignmentRecord,
  RbacRoleRecord,
  UpdateRbacAssignmentInput,
} from "../types/contracts";
import { CustomError } from "../types/CustomError";
import { assertDassOffice } from "../utils/dassOffice";

const MANAGEABLE_ROLES_BY_ADMIN_ROLE: Record<string, string[]> = {
  admin_master: [
    "admin_master",
    "unit_admin",
    "idea_admin",
    "idea_reviewer",
    "idea_submitter",
    "marketplace_admin",
    "marketplace_operator",
  ],
  unit_admin: [
    "idea_admin",
    "idea_reviewer",
    "idea_submitter",
    "marketplace_admin",
    "marketplace_operator",
  ],
  idea_admin: ["idea_submitter"],
  marketplace_admin: ["marketplace_operator"],
};

interface RbacAdminScope {
  actorRegistration: string;
  isMaster: boolean;
  rolesByOffice: Map<DassOffice, Set<string>>;
}

interface AssignmentEntityWithRole {
  id: number;
  matricula: string;
  unidade_dass: DassOffice;
  role_id: string;
  role_code: string;
}

const mapAssignmentRow = (
  row: Record<string, unknown>
): RbacAssignmentRecord => ({
  id: Number(row.id),
  registration: String(row.registration),
  userName: (row.userName as string | null) ?? null,
  dassOffice: row.dassOffice as DassOffice,
  roleId: Number(row.roleId),
  roleCode: String(row.roleCode),
  roleName: String(row.roleName),
  active: Boolean(row.active),
  activeFrom: (row.activeFrom as string | Date | null) ?? null,
  activeUntil: (row.activeUntil as string | Date | null) ?? null,
  createdAt: row.createdAt as string | Date,
  updatedAt: row.updatedAt as string | Date,
});

const parseOptionalDate = (value?: string | Date | null) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new CustomError("Data inválida para vínculo RBAC.", 400);
  }

  return date;
};

const normalizeRoleCodes = (input: CreateRbacAssignmentInput) => {
  const roleCodes = Array.isArray(input.roleCodes)
    ? input.roleCodes
    : input.roleCode
      ? [input.roleCode]
      : [];

  return [...new Set(roleCodes.map((roleCode) => String(roleCode).trim()).filter(Boolean))];
};

const normalizeUpdateRoleCodes = (input: UpdateRbacAssignmentInput) => {
  if (Array.isArray(input.roleCodes)) {
    return [
      ...new Set(
        input.roleCodes.map((roleCode) => String(roleCode).trim()).filter(Boolean)
      ),
    ];
  }

  return input.roleCode ? [String(input.roleCode).trim()].filter(Boolean) : [];
};

const getAllowedRolesForOffice = (scope: RbacAdminScope, dassOffice: DassOffice) => {
  if (scope.isMaster) {
    return new Set(MANAGEABLE_ROLES_BY_ADMIN_ROLE.admin_master);
  }

  return scope.rolesByOffice.get(dassOffice) ?? new Set<string>();
};

const canManageRole = (
  scope: RbacAdminScope,
  dassOffice: DassOffice,
  roleCode: string
) => {
  if (scope.isMaster) {
    return true;
  }

  return getAllowedRolesForOffice(scope, dassOffice).has(roleCode);
};

const assertCanManageRole = (
  scope: RbacAdminScope,
  dassOffice: DassOffice,
  roleCode: string
) => {
  if (!canManageRole(scope, dassOffice, roleCode)) {
    throw new CustomError(
      "Acesso proibido: papel fora do escopo administrativo do usuário.",
      403
    );
  }
};

const assertHasAdminScope = (scope: RbacAdminScope) => {
  if (!scope.isMaster && scope.rolesByOffice.size === 0) {
    throw new CustomError(
      "Acesso proibido: usuário sem escopo administrativo RBAC.",
      403
    );
  }
};

const findAssignmentEntityWithRole = async (
  manager: EntityManager,
  id: string
): Promise<AssignmentEntityWithRole> => {
  const row = await manager.query(
    `
      SELECT
        assignment.id,
        assignment.matricula,
        assignment.unidade_dass,
        assignment.role_id,
        role.code AS role_code
      FROM pense_aja.rbac_user_unit_roles assignment
      INNER JOIN pense_aja.rbac_roles role ON role.id = assignment.role_id
      WHERE assignment.id = $1
    `,
    [Number(id)]
  );

  if (!row?.[0]) {
    throw new CustomError("Vínculo RBAC não encontrado.", 404);
  }

  return row[0] as AssignmentEntityWithRole;
};

export const RbacAdminService = {
  async resolveAdminScope(identity: DecodedToken): Promise<RbacAdminScope> {
    const registration = String(identity.matricula ?? "");
    if (!registration) {
      throw new CustomError("Matrícula do usuário autenticado não encontrada.", 401);
    }

    const dataSource = await initializeDatabase();
    const rows = (await dataSource.manager.query(
      `
        SELECT roles.code, uur.unidade_dass AS "dassOffice"
        FROM pense_aja.rbac_user_unit_roles uur
        INNER JOIN pense_aja.rbac_roles roles ON roles.id = uur.role_id
        WHERE uur.matricula = $1
          AND uur.active = true
          AND (uur.active_from IS NULL OR uur.active_from <= CURRENT_TIMESTAMP)
          AND (uur.active_until IS NULL OR uur.active_until >= CURRENT_TIMESTAMP)
      `,
      [registration]
    )) as Array<{ code: string; dassOffice: DassOffice }>;

    const scope: RbacAdminScope = {
      actorRegistration: registration,
      isMaster: rows.some((row) => row.code === "admin_master"),
      rolesByOffice: new Map(),
    };

    if (scope.isMaster) {
      return scope;
    }

    for (const row of rows) {
      const manageableRoles = MANAGEABLE_ROLES_BY_ADMIN_ROLE[row.code] ?? [];
      if (!manageableRoles.length) continue;

      const office = assertDassOffice(row.dassOffice);
      const current = scope.rolesByOffice.get(office) ?? new Set<string>();
      manageableRoles.forEach((roleCode) => current.add(roleCode));
      scope.rolesByOffice.set(office, current);
    }

    assertHasAdminScope(scope);
    return scope;
  },

  async listRoles(actor: DecodedToken): Promise<RbacRoleRecord[]> {
    const dataSource = await initializeDatabase();
    const scope = await this.resolveAdminScope(actor);

    const query = dataSource
      .getRepository(RbacRoleEntity)
      .createQueryBuilder("role")
      .select("role.id", "id")
      .addSelect("role.code", "code")
      .addSelect("role.nome", "nome")
      .orderBy("role.code", "ASC");

    if (!scope.isMaster) {
      const allowedRoles = [
        ...new Set([...scope.rolesByOffice.values()].flatMap((roles) => [...roles])),
      ];
      query.where("role.code IN (:...allowedRoles)", { allowedRoles });
    }

    const roles = await query.getRawMany<RbacRoleRecord>();

    return roles.map((role) => ({ ...role, id: Number(role.id) }));
  },

  async listAssignments(
    actor: DecodedToken,
    filters?: RbacAssignmentFilters
  ): Promise<RbacAssignmentRecord[]> {
    const dataSource = await initializeDatabase();
    const scope = await this.resolveAdminScope(actor);
    const query = dataSource
      .getRepository(RbacUserUnitRoleEntity)
      .createQueryBuilder("assignment")
      .innerJoin(
        (subQuery) =>
          subQuery
            .select("rbacRole.id", "id")
            .addSelect("rbacRole.code", "code")
            .addSelect("rbacRole.nome", "nome")
            .from(RbacRoleEntity, "rbacRole"),
        "role",
        "role.id = assignment.role_id"
      )
      .leftJoin(
        UsuarioEntity as any,
        "usuario",
        "usuario.matricula = assignment.matricula"
      )
      .select("assignment.id", "id")
      .addSelect("assignment.matricula", "registration")
      .addSelect("usuario.nome", "userName")
      .addSelect("assignment.unidade_dass", "dassOffice")
      .addSelect("assignment.role_id", "roleId")
      .addSelect("role.code", "roleCode")
      .addSelect("role.nome", "roleName")
      .addSelect("assignment.active", "active")
      .addSelect("assignment.active_from", "activeFrom")
      .addSelect("assignment.active_until", "activeUntil")
      .addSelect("assignment.createdat", "createdAt")
      .addSelect("assignment.updatedat", "updatedAt")
      .orderBy("assignment.updatedat", "DESC");

    if (!scope.isMaster) {
      const clauses: string[] = [];
      const params: Record<string, string | string[]> = {};
      [...scope.rolesByOffice.entries()].forEach(([office, roles], index) => {
        clauses.push(
          `(assignment.unidade_dass = :scopeOffice${index} AND role.code IN (:...scopeRoles${index}))`
        );
        params[`scopeOffice${index}`] = office;
        params[`scopeRoles${index}`] = [...roles];
      });
      query.andWhere(`(${clauses.join(" OR ")})`, params);
    }

    if (filters?.registration) {
      query.andWhere("assignment.matricula = :registration", {
        registration: filters.registration,
      });
    }

    if (filters?.dassOffice) {
      query.andWhere("assignment.unidade_dass = :dassOffice", {
        dassOffice: assertDassOffice(filters.dassOffice),
      });
    }

    if (filters?.roleCode) {
      query.andWhere("role.code = :roleCode", {
        roleCode: filters.roleCode,
      });
    }

    if (filters?.search) {
      query.andWhere(
        "(CAST(assignment.matricula AS TEXT) ILIKE :search OR usuario.nome ILIKE :search OR role.code ILIKE :search OR role.nome ILIKE :search OR assignment.unidade_dass ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.active === "true" || filters?.active === "false") {
      query.andWhere("assignment.active = :active", {
        active: filters.active === "true",
      });
    }

    const rows = await query.getRawMany<Record<string, unknown>>();
    return rows.map(mapAssignmentRow);
  },

  async getAssignmentById(
    actor: DecodedToken,
    id: string
  ): Promise<RbacAssignmentRecord> {
    const assignment = await this.getScopedAssignment(actor, id);
    return assignment;
  },

  async createAssignment(
    actor: DecodedToken,
    input: CreateRbacAssignmentInput
  ): Promise<RbacAssignmentRecord[]> {
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const scope = await this.resolveAdminScope(actor);
      const registration = String(input.registration);
      const dassOffice = assertDassOffice(input.dassOffice);
      const roleCodes = normalizeRoleCodes(input);

      if (!roleCodes.length) {
        throw new CustomError("Informe ao menos um papel RBAC.", 400);
      }

      roleCodes.forEach((roleCode) =>
        assertCanManageRole(scope, dassOffice, roleCode)
      );

      const existingUser = await queryRunner.manager
        .getRepository(UsuarioEntity)
        .findOne({
          where: {
            matricula: registration,
          },
        });

      if (!existingUser) {
        throw new CustomError("Usuário de autenticação não encontrado.", 404);
      }

      const roles = await queryRunner.manager
        .getRepository(RbacRoleEntity)
        .createQueryBuilder("role")
        .where("role.code IN (:...roleCodes)", { roleCodes })
        .getMany();

      if (roles.length !== roleCodes.length) {
        throw new CustomError("Papel RBAC não encontrado.", 404);
      }

      const now = new Date();
      const activeFrom = parseOptionalDate(input.activeFrom) ?? now;
      const activeUntil = parseOptionalDate(input.activeUntil) ?? null;

      for (const role of roles) {
        const duplicate = await queryRunner.manager
          .getRepository(RbacUserUnitRoleEntity)
          .findOne({
            where: {
              matricula: registration,
              unidade_dass: dassOffice,
              role_id: String(role.id),
            },
          });

        if (duplicate) {
          continue;
        }

        await queryRunner.manager.getRepository(RbacUserUnitRoleEntity).save({
          matricula: registration,
          unidade_dass: dassOffice,
          role_id: String(role.id),
          active: input.active ?? true,
          active_from: activeFrom,
          active_until: activeUntil,
          createdat: now,
          updatedat: now,
        });
      }

      await queryRunner.commitTransaction();

      const created = await this.listAssignments(actor, {
        registration,
        dassOffice,
      });

      return created.filter((item) => roleCodes.includes(item.roleCode));
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  },

  async updateAssignment(
    actor: DecodedToken,
    id: string,
    input: UpdateRbacAssignmentInput
  ): Promise<RbacAssignmentRecord | RbacAssignmentRecord[]> {
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const scope = await this.resolveAdminScope(actor);
      const current = await findAssignmentEntityWithRole(queryRunner.manager, id);
      assertCanManageRole(scope, current.unidade_dass, current.role_code);

      const activeFrom = parseOptionalDate(input.activeFrom);
      const activeUntil = parseOptionalDate(input.activeUntil);

      if (Array.isArray(input.roleCodes)) {
        const roleCodes = normalizeUpdateRoleCodes(input);
        if (!roleCodes.length) {
          throw new CustomError("Informe ao menos um papel RBAC.", 400);
        }

        roleCodes.forEach((roleCode) =>
          assertCanManageRole(scope, current.unidade_dass, roleCode)
        );

        const roles = await queryRunner.manager
          .getRepository(RbacRoleEntity)
          .createQueryBuilder("role")
          .where("role.code IN (:...roleCodes)", { roleCodes })
          .getMany();

        if (roles.length !== roleCodes.length) {
          throw new CustomError("Papel RBAC não encontrado.", 404);
        }

        const repository = queryRunner.manager.getRepository(RbacUserUnitRoleEntity);
        const now = new Date();
        for (const role of roles) {
          const existing = await repository.findOne({
            where: {
              matricula: current.matricula,
              unidade_dass: current.unidade_dass,
              role_id: String(role.id),
            },
          });

          if (existing) {
            await repository.update(
              { id: existing.id },
              {
                active: input.active ?? existing.active,
                active_from: activeFrom === undefined ? existing.active_from : activeFrom,
                active_until: activeUntil === undefined ? existing.active_until : activeUntil,
                updatedat: now,
              }
            );
            continue;
          }

          await repository.save({
            matricula: current.matricula,
            unidade_dass: current.unidade_dass,
            role_id: String(role.id),
            active: input.active ?? true,
            active_from: activeFrom === undefined ? now : activeFrom,
            active_until: activeUntil === undefined ? null : activeUntil,
            createdat: now,
            updatedat: now,
          });
        }

        await queryRunner.commitTransaction();

        const updated = await this.listAssignments(actor, {
          registration: current.matricula,
          dassOffice: current.unidade_dass,
        });

        return updated.filter((item) => roleCodes.includes(item.roleCode));
      }

      let roleId = current.role_id;
      if (input.roleCode) {
        assertCanManageRole(scope, current.unidade_dass, input.roleCode);
        const role = await queryRunner.manager
          .getRepository(RbacRoleEntity)
          .findOne({
            where: {
              code: input.roleCode,
            },
          });

        if (!role) {
          throw new CustomError("Papel RBAC não encontrado.", 404);
        }

        roleId = String(role.id);
      }

      const repository = queryRunner.manager.getRepository(RbacUserUnitRoleEntity);
      const currentEntity = await repository.findOne({
        where: {
          id: Number(id),
        },
      });

      if (!currentEntity) {
        throw new CustomError("Vínculo RBAC não encontrado.", 404);
      }

      await repository.update(
        { id: Number(id) },
        {
          role_id: roleId,
          active: input.active ?? currentEntity.active,
          active_from:
            activeFrom === undefined ? currentEntity.active_from : activeFrom,
          active_until:
            activeUntil === undefined ? currentEntity.active_until : activeUntil,
          updatedat: new Date(),
        }
      );

      await queryRunner.commitTransaction();
      return this.getAssignmentById(actor, id);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  },

  async deleteAssignment(actor: DecodedToken, id: string): Promise<void> {
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const scope = await this.resolveAdminScope(actor);
      const current = await findAssignmentEntityWithRole(queryRunner.manager, id);
      assertCanManageRole(scope, current.unidade_dass, current.role_code);

      await queryRunner.manager
        .getRepository(RbacUserUnitRoleEntity)
        .delete({ id: Number(id) });

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  },

  async getScopedAssignment(
    actor: DecodedToken,
    id: string
  ): Promise<RbacAssignmentRecord> {
    const dataSource = await initializeDatabase();
    const scope = await this.resolveAdminScope(actor);
    const row = await dataSource
      .getRepository(RbacUserUnitRoleEntity)
      .createQueryBuilder("assignment")
      .innerJoin(
        (subQuery) =>
          subQuery
            .select("rbacRole.id", "id")
            .addSelect("rbacRole.code", "code")
            .addSelect("rbacRole.nome", "nome")
            .from(RbacRoleEntity, "rbacRole"),
        "role",
        "role.id = assignment.role_id"
      )
      .leftJoin(
        UsuarioEntity as any,
        "usuario",
        "usuario.matricula = assignment.matricula"
      )
      .select("assignment.id", "id")
      .addSelect("assignment.matricula", "registration")
      .addSelect("usuario.nome", "userName")
      .addSelect("assignment.unidade_dass", "dassOffice")
      .addSelect("assignment.role_id", "roleId")
      .addSelect("role.code", "roleCode")
      .addSelect("role.nome", "roleName")
      .addSelect("assignment.active", "active")
      .addSelect("assignment.active_from", "activeFrom")
      .addSelect("assignment.active_until", "activeUntil")
      .addSelect("assignment.createdat", "createdAt")
      .addSelect("assignment.updatedat", "updatedAt")
      .where("assignment.id = :id", { id: Number(id) })
      .getRawOne<Record<string, unknown>>();

    if (!row) {
      throw new CustomError("Vínculo RBAC não encontrado.", 404);
    }

    const assignment = mapAssignmentRow(row);
    assertCanManageRole(scope, assignment.dassOffice, assignment.roleCode);
    return assignment;
  },
};
