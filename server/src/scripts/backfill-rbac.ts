import { initializeDatabase } from "../config/database";
import { allowedDassOffices } from "../utils/dassOffice";

type SeedRoleCode =
  | "idea_reviewer"
  | "idea_admin"
  | "marketplace_operator"
  | "marketplace_admin";

const inferRoles = (funcao: string | null): SeedRoleCode[] => {
  const normalized = (funcao ?? "").toLowerCase();
  if (normalized.includes("gerente") || normalized.includes("automacao")) {
    return ["idea_admin", "marketplace_admin"];
  }

  if (normalized.includes("analista")) {
    return ["idea_reviewer", "marketplace_operator"];
  }

  return [];
};

const run = async () => {
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const roles = (await queryRunner.query(
      `
        SELECT id, code
        FROM pense_aja.rbac_roles
      `
    )) as Array<{ id: string; code: SeedRoleCode }>;
    const roleMap = new Map(roles.map((role) => [role.code, role.id]));

    const users = (await queryRunner.query(
      `
        SELECT matricula, funcao, unidade
        FROM autenticacao.usuarios
        WHERE matricula IS NOT NULL
          AND unidade IS NOT NULL
      `
    )) as Array<{
      matricula: string;
      funcao: string | null;
      unidade: string | null;
    }>;

    let insertedCount = 0;

    for (const user of users) {
      if (!user.unidade || !allowedDassOffices.includes(user.unidade as any)) {
        continue;
      }

      const rolesToAssign = inferRoles(user.funcao);
      if (!rolesToAssign.length) {
        continue;
      }

      for (const roleCode of rolesToAssign) {
        const roleId = roleMap.get(roleCode);
        if (!roleId) {
          continue;
        }

        const existing = await queryRunner.query(
          `
            SELECT id
            FROM pense_aja.rbac_user_unit_roles
            WHERE matricula = $1
              AND unidade_dass = $2
              AND role_id = $3
            LIMIT 1
          `,
          [user.matricula, user.unidade, roleId]
        );

        if (existing.length) {
          continue;
        }

        await queryRunner.query(
          `
            INSERT INTO pense_aja.rbac_user_unit_roles
              (matricula, unidade_dass, role_id, active, active_from, active_until, createdat, updatedat)
            VALUES
              ($1, $2, $3, true, CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
          [user.matricula, user.unidade, roleId]
        );
        insertedCount += 1;
      }
    }

    await queryRunner.commitTransaction();
    console.log(
      `Backfill RBAC concluído. ${insertedCount} vínculos usuário/unidade/papel inseridos.`
    );
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Erro no backfill de RBAC:", error);
    process.exit(1);
  } finally {
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }
  }
};

run().catch((error) => {
  console.error("Erro ao inicializar backfill RBAC:", error);
  process.exit(1);
});
