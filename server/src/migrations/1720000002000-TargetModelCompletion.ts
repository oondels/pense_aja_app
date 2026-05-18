import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from "typeorm";

const offices = ["SEST", "VDC", "ITB", "VDC-CONF", "STJ"];

export class TargetModelCompletion1720000002000
  implements MigrationInterface
{
  name = "TargetModelCompletion1720000002000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasRefunded = await queryRunner.hasColumn(
      "pense_aja.points_balance_projection",
      "total_refunded"
    );

    if (!hasRefunded) {
      await queryRunner.addColumn(
        "pense_aja.points_balance_projection",
        new TableColumn({
          name: "total_refunded",
          type: "bigint",
          default: "0",
        })
      );
    }

    const redemptionCatalogColumn = await queryRunner.getTable(
      "pense_aja.marketplace_redemption_requests"
    );
    const catalogItemColumn = redemptionCatalogColumn?.findColumnByName(
      "catalog_item_id"
    );

    if (catalogItemColumn && catalogItemColumn.type !== "varchar") {
      await queryRunner.query(`
        ALTER TABLE pense_aja.marketplace_redemption_requests
        ALTER COLUMN catalog_item_id TYPE varchar
        USING catalog_item_id::text
      `);
    }

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "rbac_users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "matricula", type: "bigint", isUnique: true },
          { name: "nome", type: "varchar", isNullable: true },
          { name: "email", type: "varchar", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "unit_configs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "unidade_dass", type: "varchar", isUnique: true },
          { name: "active", type: "boolean", default: "true" },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "unit_scoring_rules",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "unidade_dass", type: "varchar" },
          { name: "classification", type: "varchar" },
          { name: "score", type: "bigint" },
          { name: "active", type: "boolean", default: "true" },
          { name: "active_from", type: "timestamptz", isNullable: true },
          { name: "active_until", type: "timestamptz", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.unit_scoring_rules",
      new TableIndex({
        name: "idx_unit_scoring_lookup",
        columnNames: ["unidade_dass", "classification", "active"],
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "unit_workflow_steps",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "unidade_dass", type: "varchar" },
          { name: "step_code", type: "varchar" },
          { name: "step_order", type: "int" },
          { name: "required_permission", type: "varchar" },
          { name: "terminal_status", type: "varchar", isNullable: true },
          { name: "active", type: "boolean", default: "true" },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.unit_workflow_steps",
      new TableIndex({
        name: "idx_unit_workflow_unique",
        columnNames: ["unidade_dass", "step_code"],
        isUnique: true,
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "unit_marketplace_policies",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "unidade_dass", type: "varchar", isUnique: true },
          { name: "allow_refund_after_commit", type: "boolean", default: "true" },
          { name: "voucher_adapter", type: "varchar", default: "'noop'" },
          { name: "active", type: "boolean", default: "true" },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "marketplace_catalog_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "legacy_product_id", type: "varchar", isNullable: true },
          { name: "unidade_dass", type: "varchar" },
          { name: "name", type: "varchar" },
          { name: "image_url", type: "varchar", isNullable: true },
          { name: "points_cost", type: "bigint" },
          { name: "item_type", type: "varchar", default: "'physical'" },
          { name: "active", type: "boolean", default: "true" },
          { name: "available_quantity", type: "bigint", isNullable: true },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "created_by", type: "bigint", isNullable: true },
          { name: "updated_by", type: "bigint", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.marketplace_catalog_items",
      new TableIndex({
        name: "idx_marketplace_catalog_lookup",
        columnNames: ["unidade_dass", "active", "item_type"],
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "marketplace_fulfillment_steps",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "redemption_request_id", type: "bigint" },
          { name: "step_type", type: "varchar" },
          { name: "step_status", type: "varchar" },
          { name: "actor_registration", type: "bigint", isNullable: true },
          { name: "actor_name", type: "varchar", isNullable: true },
          { name: "notes", type: "text", isNullable: true },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.marketplace_fulfillment_steps",
      new TableIndex({
        name: "idx_marketplace_fulfillment_request",
        columnNames: ["redemption_request_id", "step_type"],
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "marketplace_voucher_deliveries",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "redemption_request_id", type: "bigint" },
          { name: "adapter", type: "varchar" },
          { name: "delivery_status", type: "varchar" },
          { name: "external_reference", type: "varchar", isNullable: true },
          { name: "request_payload", type: "jsonb", isNullable: true },
          { name: "response_payload", type: "jsonb", isNullable: true },
          { name: "error_message", type: "text", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.marketplace_voucher_deliveries",
      new TableIndex({
        name: "idx_marketplace_voucher_request",
        columnNames: ["redemption_request_id", "delivery_status"],
      })
    );

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_permissions (code, nome, createdat, updatedat)
      VALUES
        ('idea.submit', 'Cadastrar ideias', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('idea.view', 'Visualizar ideias', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.request.create', 'Solicitar resgate no marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.request.approve', 'Aprovar ou rejeitar resgate no marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.fulfillment.execute', 'Executar fulfillment de marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.cancel', 'Cancelar solicitação de marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('marketplace.refund', 'Estornar resgate de marketplace', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('unit.config.manage', 'Gerenciar configurações de unidade', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_roles (code, nome, createdat, updatedat)
      VALUES
        ('idea_submitter', 'Colaborador que cadastra ideias', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('unit_admin', 'Administrador da unidade', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
          OR (roles.code = 'idea_admin' AND permissions.code IN ('idea.evaluate', 'idea.exclude', 'idea.view'))
          OR (roles.code = 'marketplace_operator' AND permissions.code IN ('marketplace.request.approve', 'marketplace.fulfillment.execute', 'marketplace.cancel'))
          OR (roles.code = 'marketplace_admin' AND permissions.code IN ('catalog.manage', 'marketplace.request.approve', 'marketplace.fulfillment.execute', 'marketplace.cancel', 'marketplace.refund'))
          OR (roles.code = 'unit_admin' AND permissions.code IN ('unit.config.manage', 'catalog.manage', 'rbac.manage'))
          OR (roles.code = 'admin_master')
        )
      WHERE NOT EXISTS (
        SELECT 1
        FROM pense_aja.rbac_role_permissions rp
        WHERE rp.role_id = roles.id
          AND rp.permission_id = permissions.id
      )
    `);

    await queryRunner.query(
      `
        INSERT INTO pense_aja.unit_configs (unidade_dass, active, metadata, createdat, updatedat)
        SELECT office, true, '{"workflow":"default"}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM unnest($1::varchar[]) AS office
        ON CONFLICT (unidade_dass) DO NOTHING
      `,
      [offices]
    );

    await queryRunner.query(
      `
        INSERT INTO pense_aja.unit_marketplace_policies (
          unidade_dass,
          allow_refund_after_commit,
          voucher_adapter,
          active,
          metadata,
          createdat,
          updatedat
        )
        SELECT office, true, 'noop', true, '{}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM unnest($1::varchar[]) AS office
        ON CONFLICT (unidade_dass) DO NOTHING
      `,
      [offices]
    );

    await queryRunner.query(`
      INSERT INTO pense_aja.unit_scoring_rules (
        unidade_dass,
        classification,
        score,
        active,
        active_from,
        active_until,
        createdat,
        updatedat
      )
      SELECT office, rule.classification, rule.score, true, CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM unnest($1::varchar[]) AS office
      CROSS JOIN (
        VALUES ('A', 3), ('B', 2), ('C', 1)
      ) AS rule(classification, score)
      WHERE NOT EXISTS (
        SELECT 1
        FROM pense_aja.unit_scoring_rules existing
        WHERE existing.unidade_dass = office
          AND existing.classification = rule.classification
          AND existing.active = true
      )
    `, [offices]);

    await queryRunner.query(`
      INSERT INTO pense_aja.unit_workflow_steps (
        unidade_dass,
        step_code,
        step_order,
        required_permission,
        terminal_status,
        active,
        metadata,
        createdat,
        updatedat
      )
      SELECT office, step.step_code, step.step_order, step.required_permission, step.terminal_status, true, '{}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM unnest($1::varchar[]) AS office
      CROSS JOIN (
        VALUES
          ('analyst_review', 1, 'idea.evaluate', NULL),
          ('manager_review', 2, 'idea.evaluate', 'concluded')
      ) AS step(step_code, step_order, required_permission, terminal_status)
      ON CONFLICT DO NOTHING
    `, [offices]);

    await queryRunner.query(`
      INSERT INTO pense_aja.marketplace_catalog_items (
        legacy_product_id,
        unidade_dass,
        name,
        image_url,
        points_cost,
        item_type,
        active,
        available_quantity,
        metadata,
        created_by,
        updated_by,
        createdat,
        updatedat
      )
      SELECT
        legacy.id::text,
        legacy.unidade_dass,
        legacy.nome,
        legacy.imagem,
        legacy.valor,
        'physical',
        true,
        NULL,
        jsonb_build_object('source', 'pense_aja_loja'),
        NULLIF(regexp_replace(COALESCE(legacy.user_create, ''), '[^0-9]', '', 'g'), '')::bigint,
        NULLIF(regexp_replace(COALESCE(legacy.updated_by, ''), '[^0-9]', '', 'g'), '')::bigint,
        COALESCE(legacy.created_at, CURRENT_TIMESTAMP),
        COALESCE(legacy.updated_at, CURRENT_TIMESTAMP)
      FROM pense_aja.pense_aja_loja legacy
      WHERE NOT EXISTS (
        SELECT 1
        FROM pense_aja.marketplace_catalog_items catalog
        WHERE catalog.legacy_product_id = legacy.id::text
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("pense_aja.marketplace_voucher_deliveries", true);
    await queryRunner.dropTable("pense_aja.marketplace_fulfillment_steps", true);
    await queryRunner.dropTable("pense_aja.marketplace_catalog_items", true);
    await queryRunner.dropTable("pense_aja.unit_marketplace_policies", true);
    await queryRunner.dropTable("pense_aja.unit_workflow_steps", true);
    await queryRunner.dropTable("pense_aja.unit_scoring_rules", true);
    await queryRunner.dropTable("pense_aja.unit_configs", true);
    await queryRunner.dropTable("pense_aja.rbac_users", true);

    const hasRefunded = await queryRunner.hasColumn(
      "pense_aja.points_balance_projection",
      "total_refunded"
    );

    if (hasRefunded) {
      await queryRunner.dropColumn(
        "pense_aja.points_balance_projection",
        "total_refunded"
      );
    }
  }
}
