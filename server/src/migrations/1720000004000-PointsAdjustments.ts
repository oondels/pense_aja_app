import { MigrationInterface, QueryRunner } from "typeorm";

export class PointsAdjustments1720000004000 implements MigrationInterface {
  name = "PointsAdjustments1720000004000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_permissions (code, nome, createdat, updatedat)
      VALUES ('points.adjust', 'Ajustar pontuação manualmente', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_role_permissions (role_id, permission_id, createdat)
      SELECT roles.id, permissions.id, CURRENT_TIMESTAMP
      FROM pense_aja.rbac_roles roles
      JOIN pense_aja.rbac_permissions permissions ON permissions.code = 'points.adjust'
      WHERE roles.code IN ('unit_admin', 'admin_master')
        AND NOT EXISTS (
          SELECT 1
          FROM pense_aja.rbac_role_permissions existing
          WHERE existing.role_id = roles.id
            AND existing.permission_id = permissions.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM pense_aja.rbac_role_permissions
      WHERE permission_id IN (
        SELECT id FROM pense_aja.rbac_permissions WHERE code = 'points.adjust'
      )
    `);
    await queryRunner.query(`
      DELETE FROM pense_aja.rbac_permissions WHERE code = 'points.adjust'
    `);
  }
}
