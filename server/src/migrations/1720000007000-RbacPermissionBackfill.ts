import { MigrationInterface, QueryRunner } from "typeorm";

export class RbacPermissionBackfill1720000007000 implements MigrationInterface {
  name = "RbacPermissionBackfill1720000007000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_permissions (code, nome, createdat, updatedat)
      VALUES
        ('idea.submit', 'Cadastrar ideias', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('idea.view', 'Visualizar ideias', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('idea.evaluate', 'Avaliar ideias', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('idea.exclude', 'Excluir ideias', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('catalog.manage', 'Gerenciar catálogo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.request.create', 'Solicitar resgate no marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.request.approve', 'Aprovar ou rejeitar resgate no marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.fulfillment.execute', 'Executar fulfillment de marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.cancel', 'Cancelar solicitação de marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.refund', 'Estornar resgate de marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('unit.config.manage', 'Gerenciar configurações de unidade', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('rbac.manage', 'Gerenciar vínculos RBAC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('reward.legacy.redeem', 'Executar resgate legado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('points.adjust', 'Ajustar pontuação manualmente', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_role_permissions (role_id, permission_id, createdat)
      SELECT roles.id, permissions.id, CURRENT_TIMESTAMP
      FROM pense_aja.rbac_roles roles
      JOIN pense_aja.rbac_permissions permissions
        ON (
          (roles.code = 'idea_submitter' AND permissions.code IN ('idea.submit', 'idea.view', 'marketplace.request.create'))
          OR (roles.code = 'idea_reviewer' AND permissions.code IN ('idea.evaluate', 'idea.view'))
          OR (roles.code = 'idea_admin' AND permissions.code IN ('idea.evaluate', 'idea.exclude', 'idea.view', 'rbac.manage'))
          OR (roles.code = 'marketplace_operator' AND permissions.code IN ('marketplace.request.approve', 'marketplace.fulfillment.execute', 'marketplace.cancel', 'reward.legacy.redeem'))
          OR (roles.code = 'marketplace_admin' AND permissions.code IN ('catalog.manage', 'marketplace.request.approve', 'marketplace.fulfillment.execute', 'marketplace.cancel', 'marketplace.refund', 'rbac.manage', 'reward.legacy.redeem'))
          OR (roles.code = 'unit_admin' AND permissions.code IN ('unit.config.manage', 'catalog.manage', 'rbac.manage', 'points.adjust'))
          OR (roles.code = 'admin_master')
        )
      WHERE NOT EXISTS (
        SELECT 1
        FROM pense_aja.rbac_role_permissions existing
        WHERE existing.role_id = roles.id
          AND existing.permission_id = permissions.id
      )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op: this migration repairs required RBAC grants and should not remove
    // permission links that may predate the repair.
  }
}
