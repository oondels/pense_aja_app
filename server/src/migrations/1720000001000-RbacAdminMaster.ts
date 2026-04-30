import { MigrationInterface, QueryRunner } from "typeorm";

export class RbacAdminMaster1720000001000 implements MigrationInterface {
  name = "RbacAdminMaster1720000001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_roles (code, nome, createdat, updatedat)
      VALUES ('admin_master', 'Administrador mestre RBAC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_permissions (code, nome, createdat, updatedat)
      VALUES ('rbac.manage', 'Gerenciar vínculos RBAC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_role_permissions (role_id, permission_id, createdat)
      SELECT roles.id, permissions.id, CURRENT_TIMESTAMP
      FROM pense_aja.rbac_roles roles
      JOIN pense_aja.rbac_permissions permissions
        ON roles.code = 'admin_master'
       AND permissions.code = 'rbac.manage'
      WHERE NOT EXISTS (
        SELECT 1
        FROM pense_aja.rbac_role_permissions rp
        WHERE rp.role_id = roles.id
          AND rp.permission_id = permissions.id
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM pense_aja.rbac_role_permissions
      WHERE role_id IN (
        SELECT id FROM pense_aja.rbac_roles WHERE code = 'admin_master'
      )
      AND permission_id IN (
        SELECT id FROM pense_aja.rbac_permissions WHERE code = 'rbac.manage'
      )
    `);

    await queryRunner.query(`
      DELETE FROM pense_aja.rbac_permissions
      WHERE code = 'rbac.manage'
    `);

    await queryRunner.query(`
      DELETE FROM pense_aja.rbac_roles
      WHERE code = 'admin_master'
    `);
  }
}
