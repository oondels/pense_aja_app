import { initializeDatabase } from "../config/database";
import RbacRoleEntity from "../models/RbacRole";
import RbacSessionSnapshotEntity from "../models/RbacSessionSnapshot";
import RbacUserUnitRoleEntity from "../models/RbacUserUnitRole";
import UsuarioEntity from "../models/Usuario";
import {
  CreateRbacAssignmentInput,
  DassOffice,
  RbacAssignmentRecord,
  RbacRoleRecord,
  UpdateRbacAssignmentInput,
} from "../types/contracts";
import { CustomError } from "../types/CustomError";
import { assertDassOffice } from "../utils/dassOffice";

const mapAssignmentRow = (
  row: Record<string, unknown>
): RbacAssignmentRecord => ({
  id: Number(row.id),
  registration: String(row.registration),
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

export const RbacAdminService = {
  async listRoles(): Promise<RbacRoleRecord[]> {
    const dataSource = await initializeDatabase();
    const roles = await dataSource
      .getRepository(RbacRoleEntity)
      .createQueryBuilder("role")
      .select("role.id", "id")
      .addSelect("role.code", "code")
      .addSelect("role.nome", "nome")
      .orderBy("role.code", "ASC")
      .getRawMany<RbacRoleRecord>();

    return roles.map((role) => ({ ...role, id: Number(role.id) }));
  },

  async listAssignments(filters?: {
    registration?: string;
    dassOffice?: string;
    active?: string;
  }): Promise<RbacAssignmentRecord[]> {
    const dataSource = await initializeDatabase();
    const query = dataSource
      .getRepository(RbacUserUnitRoleEntity)
      .createQueryBuilder("assignment")
      .innerJoin("pense_aja.rbac_roles", "role", "role.id = assignment.role_id")
      .select("assignment.id", "id")
      .addSelect("assignment.matricula", "registration")
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

    if (filters?.active === "true" || filters?.active === "false") {
      query.andWhere("assignment.active = :active", {
        active: filters.active === "true",
      });
    }

    const rows = await query.getRawMany<Record<string, unknown>>();
    return rows.map(mapAssignmentRow);
  },

  async getAssignmentById(id: string): Promise<RbacAssignmentRecord> {
    const dataSource = await initializeDatabase();
    const row = await dataSource
      .getRepository(RbacUserUnitRoleEntity)
      .createQueryBuilder("assignment")
      .innerJoin("pense_aja.rbac_roles", "role", "role.id = assignment.role_id")
      .select("assignment.id", "id")
      .addSelect("assignment.matricula", "registration")
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

    return mapAssignmentRow(row);
  },

  async createAssignment(
    input: CreateRbacAssignmentInput
  ): Promise<RbacAssignmentRecord> {
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const registration = String(input.registration);
      const dassOffice = assertDassOffice(input.dassOffice);

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
        throw new CustomError("Vínculo RBAC já existe para este usuário.", 409);
      }

      const now = new Date();
      await queryRunner.manager.getRepository(RbacUserUnitRoleEntity).save({
        matricula: registration,
        unidade_dass: dassOffice,
        role_id: String(role.id),
        active: input.active ?? true,
        active_from: parseOptionalDate(input.activeFrom) ?? now,
        active_until: parseOptionalDate(input.activeUntil) ?? null,
        createdat: now,
        updatedat: now,
      });

      await queryRunner.manager
        .getRepository(RbacSessionSnapshotEntity)
        .delete({
          matricula: registration,
          unidade_dass: dassOffice,
        });

      await queryRunner.commitTransaction();

      const created = await this.listAssignments({
        registration,
        dassOffice,
      });

      const match = created.find((item) => item.roleCode === input.roleCode);
      if (!match) {
        throw new CustomError("Falha ao carregar vínculo RBAC criado.", 500);
      }

      return match;
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
    id: string,
    input: UpdateRbacAssignmentInput
  ): Promise<RbacAssignmentRecord> {
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const repository = queryRunner.manager.getRepository(RbacUserUnitRoleEntity);
      const current = await repository.findOne({
        where: {
          id: Number(id),
        },
      });

      if (!current) {
        throw new CustomError("Vínculo RBAC não encontrado.", 404);
      }

      let roleId = current.role_id;
      if (input.roleCode) {
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

      await repository.update(
        { id: Number(id) },
        {
          role_id: roleId,
          active: input.active ?? current.active,
          active_from:
            parseOptionalDate(input.activeFrom) === undefined
              ? current.active_from
              : parseOptionalDate(input.activeFrom),
          active_until:
            parseOptionalDate(input.activeUntil) === undefined
              ? current.active_until
              : parseOptionalDate(input.activeUntil),
          updatedat: new Date(),
        }
      );

      await queryRunner.manager
        .getRepository(RbacSessionSnapshotEntity)
        .delete({
          matricula: current.matricula,
          unidade_dass: current.unidade_dass,
        });

      await queryRunner.commitTransaction();
      return this.getAssignmentById(id);
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

  async deleteAssignment(id: string): Promise<void> {
    const dataSource = await initializeDatabase();
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const repository = queryRunner.manager.getRepository(RbacUserUnitRoleEntity);
      const current = await repository.findOne({
        where: {
          id: Number(id),
        },
      });

      if (!current) {
        throw new CustomError("Vínculo RBAC não encontrado.", 404);
      }

      await repository.delete({ id: Number(id) });
      await queryRunner.manager
        .getRepository(RbacSessionSnapshotEntity)
        .delete({
          matricula: current.matricula,
          unidade_dass: current.unidade_dass,
        });

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
};
