import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test_secret";
});

import * as database from "../src/config/database";
import RbacRoleEntity from "../src/models/RbacRole";
import RbacUserUnitRoleEntity from "../src/models/RbacUserUnitRole";
import UsuarioEntity from "../src/models/Usuario";
import { RbacAdminService } from "../src/services/rbac-admin.service";

const ACTOR = {
  id: "1",
  usuario: "admin@grupodass.com.br",
  codbarras: "",
  rfid: "",
  matricula: "9999999",
  setor: "",
  nivel: "",
  unidade: "SEST",
  funcao: "admin",
};

const unitAdminScope = {
  actorRegistration: "9999999",
  isMaster: false,
  rolesByOffice: new Map([
    [
      "SEST",
      new Set([
        "idea_admin",
        "idea_reviewer",
        "idea_submitter",
        "marketplace_admin",
        "marketplace_operator",
      ]),
    ],
  ]),
};

const buildQueryRunner = (manager: Record<string, unknown> = {}) =>
  ({
    connect: vi.fn(),
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
    release: vi.fn(),
    isTransactionActive: true,
    isReleased: false,
    manager,
  }) as any;

describe("RbacAdminService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("blocks unit admin from creating admin_master assignments", async () => {
    const queryRunner = buildQueryRunner();
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(RbacAdminService, "resolveAdminScope").mockResolvedValue(unitAdminScope as any);

    await expect(
      RbacAdminService.createAssignment(ACTOR, {
        registration: "1234567",
        dassOffice: "SEST",
        roleCodes: ["admin_master"],
      })
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
  });

  it("creates multiple scoped assignments in one request", async () => {
    const save = vi.fn();
    const manager = {
      getRepository: vi.fn((entity) => {
        if (entity === UsuarioEntity) {
          return { findOne: vi.fn().mockResolvedValue({ matricula: "1234567" }) };
        }
        if (entity === RbacRoleEntity) {
          return {
            createQueryBuilder: vi.fn(() => ({
              where: vi.fn().mockReturnThis(),
              getMany: vi.fn().mockResolvedValue([
                { id: 1, code: "idea_submitter" },
                { id: 2, code: "marketplace_operator" },
              ]),
            })),
          };
        }
        if (entity === RbacUserUnitRoleEntity) {
          return {
            findOne: vi.fn().mockResolvedValue(null),
            save,
          };
        }
        return {};
      }),
    };
    const queryRunner = buildQueryRunner(manager);
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(RbacAdminService, "resolveAdminScope").mockResolvedValue(unitAdminScope as any);
    vi.spyOn(RbacAdminService, "listAssignments").mockResolvedValue([
      { id: 1, registration: "1234567", dassOffice: "SEST", roleId: 1, roleCode: "idea_submitter", roleName: "Submitter", active: true, activeFrom: null, activeUntil: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, registration: "1234567", dassOffice: "SEST", roleId: 2, roleCode: "marketplace_operator", roleName: "Operator", active: true, activeFrom: null, activeUntil: null, createdAt: new Date(), updatedAt: new Date() },
    ]);

    const result = await RbacAdminService.createAssignment(ACTOR, {
      registration: "1234567",
      dassOffice: "SEST",
      roleCodes: ["idea_submitter", "marketplace_operator"],
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(result.map((item) => item.roleCode)).toEqual([
      "idea_submitter",
      "marketplace_operator",
    ]);
  });

  it("blocks unit admin from deleting admin_master assignments", async () => {
    const queryRunner = buildQueryRunner({
      query: vi.fn().mockResolvedValue([
        {
          id: 10,
          matricula: "1234567",
          unidade_dass: "SEST",
          role_id: "1",
          role_code: "admin_master",
        },
      ]),
      getRepository: vi.fn(() => ({ delete: vi.fn() })),
    });
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      createQueryRunner: () => queryRunner,
    } as any);
    vi.spyOn(RbacAdminService, "resolveAdminScope").mockResolvedValue(unitAdminScope as any);

    await expect(RbacAdminService.deleteAssignment(ACTOR, "10")).rejects.toMatchObject({
      statusCode: 403,
    });

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
  });

  it("keeps unit admin list queries scoped even when another unit is requested", async () => {
    const andWhere = vi.fn().mockReturnThis();
    const queryBuilder = {
      innerJoin: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      andWhere,
      getRawMany: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(database, "initializeDatabase").mockResolvedValue({
      getRepository: () => ({
        createQueryBuilder: () => queryBuilder,
      }),
    } as any);
    vi.spyOn(RbacAdminService, "resolveAdminScope").mockResolvedValue(unitAdminScope as any);

    await RbacAdminService.listAssignments(ACTOR, { dassOffice: "VDC" });

    expect(andWhere).toHaveBeenCalledWith(
      "((assignment.unidade_dass = :scopeOffice0 AND role.code IN (:...scopeRoles0)))",
      {
        scopeOffice0: "SEST",
        scopeRoles0: [
          "idea_admin",
          "idea_reviewer",
          "idea_submitter",
          "marketplace_admin",
          "marketplace_operator",
        ],
      }
    );
    expect(andWhere).toHaveBeenCalledWith("assignment.unidade_dass = :dassOffice", {
      dassOffice: "VDC",
    });
  });
});
