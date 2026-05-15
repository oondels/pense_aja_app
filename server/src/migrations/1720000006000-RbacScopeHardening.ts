import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class RbacScopeHardening1720000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_role_permissions (role_id, permission_id, createdat)
      SELECT roles.id, permissions.id, CURRENT_TIMESTAMP
      FROM pense_aja.rbac_roles roles
      JOIN pense_aja.rbac_permissions permissions ON permissions.code = 'rbac.manage'
      WHERE roles.code IN ('idea_admin', 'marketplace_admin')
        AND NOT EXISTS (
          SELECT 1
          FROM pense_aja.rbac_role_permissions existing
          WHERE existing.role_id = roles.id
            AND existing.permission_id = permissions.id
        )
    `);

    await queryRunner.dropTable("pense_aja.rbac_session_snapshots", true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "rbac_session_snapshots",
        schema: "pense_aja",
        columns: [
          { name: "id", type: "bigint", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "session_key", type: "varchar", isUnique: true },
          { name: "matricula", type: "bigint" },
          { name: "unidade_dass", type: "varchar" },
          { name: "permissions", type: "jsonb" },
          { name: "version", type: "integer", default: 1 },
          { name: "expires_at", type: "timestamptz" },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.rbac_session_snapshots",
      new TableIndex({
        name: "idx_rbac_session_lookup",
        columnNames: ["session_key", "matricula", "unidade_dass"],
      })
    );

    await queryRunner.query(`
      DELETE FROM pense_aja.rbac_role_permissions
      WHERE role_id IN (
        SELECT id FROM pense_aja.rbac_roles WHERE code IN ('idea_admin', 'marketplace_admin')
      )
      AND permission_id = (
        SELECT id FROM pense_aja.rbac_permissions WHERE code = 'rbac.manage'
      )
    `);
  }
}
