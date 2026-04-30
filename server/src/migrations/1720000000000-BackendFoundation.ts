import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from "typeorm";

export class BackendFoundation1720000000000 implements MigrationInterface {
  name = "BackendFoundation1720000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "rbac_roles",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "code", type: "varchar", isUnique: true },
          { name: "nome", type: "varchar" },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "rbac_permissions",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "code", type: "varchar", isUnique: true },
          { name: "nome", type: "varchar" },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "rbac_role_permissions",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "role_id", type: "bigint" },
          { name: "permission_id", type: "bigint" },
          { name: "createdat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.rbac_role_permissions",
      new TableIndex({
        name: "idx_rbac_role_permissions_unique",
        columnNames: ["role_id", "permission_id"],
        isUnique: true,
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "rbac_user_unit_roles",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "matricula", type: "bigint" },
          { name: "unidade_dass", type: "varchar" },
          { name: "role_id", type: "bigint" },
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
      "pense_aja.rbac_user_unit_roles",
      new TableIndex({
        name: "idx_rbac_user_unit_roles_lookup",
        columnNames: ["matricula", "unidade_dass", "role_id"],
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "rbac_session_snapshots",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "session_key", type: "varchar", isUnique: true },
          { name: "matricula", type: "bigint" },
          { name: "unidade_dass", type: "varchar" },
          { name: "permissions", type: "jsonb" },
          { name: "version", type: "int", default: "1" },
          { name: "expires_at", type: "timestamptz" },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "points_ledger_entries",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "matricula", type: "bigint" },
          { name: "unidade_dass", type: "varchar" },
          { name: "entry_type", type: "varchar" },
          { name: "amount", type: "bigint" },
          { name: "status", type: "varchar", default: "'confirmed'" },
          { name: "source_type", type: "varchar" },
          { name: "source_id", type: "varchar" },
          { name: "related_entry_id", type: "bigint", isNullable: true },
          { name: "correlation_id", type: "varchar" },
          { name: "reason", type: "text", isNullable: true },
          { name: "created_by_registration", type: "bigint", isNullable: true },
          { name: "created_by_name", type: "varchar", isNullable: true },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "createdat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.points_ledger_entries",
      new TableIndex({
        name: "idx_points_ledger_lookup",
        columnNames: ["matricula", "unidade_dass", "entry_type"],
      })
    );

    await queryRunner.createIndex(
      "pense_aja.points_ledger_entries",
      new TableIndex({
        name: "idx_points_ledger_source",
        columnNames: ["source_type", "source_id"],
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "points_balance_projection",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "matricula", type: "bigint" },
          { name: "unidade_dass", type: "varchar" },
          { name: "total_earned", type: "bigint", default: "0" },
          { name: "total_reserved", type: "bigint", default: "0" },
          { name: "total_committed", type: "bigint", default: "0" },
          { name: "total_reversed", type: "bigint", default: "0" },
          { name: "available_balance", type: "bigint", default: "0" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.points_balance_projection",
      new TableIndex({
        name: "idx_points_balance_unique",
        columnNames: ["matricula", "unidade_dass"],
        isUnique: true,
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "audit_events",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "event_type", type: "varchar" },
          { name: "aggregate_type", type: "varchar" },
          { name: "aggregate_id", type: "varchar" },
          { name: "unidade_dass", type: "varchar" },
          { name: "actor_registration", type: "bigint", isNullable: true },
          { name: "actor_role", type: "varchar", isNullable: true },
          { name: "reason", type: "text", isNullable: true },
          { name: "before_state", type: "jsonb", isNullable: true },
          { name: "after_state", type: "jsonb", isNullable: true },
          { name: "metadata", type: "jsonb", isNullable: true },
          { name: "correlation_id", type: "varchar" },
          { name: "createdat", type: "timestamptz" },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "pense_aja.audit_events",
      new TableIndex({
        name: "idx_audit_events_aggregate",
        columnNames: ["aggregate_type", "aggregate_id", "createdat"],
      })
    );

    await queryRunner.createTable(
      new Table({
        schema: "pense_aja",
        name: "marketplace_redemption_requests",
        columns: [
          { name: "id", type: "bigserial", isPrimary: true },
          { name: "matricula", type: "bigint" },
          { name: "unidade_dass", type: "varchar" },
          { name: "catalog_item_id", type: "bigint" },
          { name: "request_status", type: "varchar" },
          { name: "reserved_ledger_entry_id", type: "bigint", isNullable: true },
          { name: "approval_actor_registration", type: "bigint", isNullable: true },
          { name: "approval_actor_name", type: "varchar", isNullable: true },
          { name: "fulfillment_type", type: "varchar" },
          { name: "legacy_prize_id", type: "bigint", isNullable: true },
          { name: "createdat", type: "timestamptz" },
          { name: "updatedat", type: "timestamptz" },
        ],
      }),
      true
    );

    const now = "CURRENT_TIMESTAMP";

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_roles (code, nome, createdat, updatedat)
      VALUES
        ('idea_reviewer', 'Avaliador de ideias', ${now}, ${now}),
        ('idea_admin', 'Administrador de avaliação', ${now}, ${now}),
        ('marketplace_operator', 'Operador de marketplace', ${now}, ${now}),
        ('marketplace_admin', 'Administrador de marketplace', ${now}, ${now})
      ON CONFLICT (code) DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_permissions (code, nome, createdat, updatedat)
      VALUES
        ('idea.evaluate', 'Avaliar ideias', ${now}, ${now}),
        ('idea.exclude', 'Excluir ideias', ${now}, ${now}),
        ('catalog.manage', 'Gerenciar catálogo', ${now}, ${now}),
        ('reward.legacy.redeem', 'Executar resgate legado', ${now}, ${now})
      ON CONFLICT (code) DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO pense_aja.rbac_role_permissions (role_id, permission_id, createdat)
      SELECT roles.id, permissions.id, CURRENT_TIMESTAMP
      FROM pense_aja.rbac_roles roles
      JOIN pense_aja.rbac_permissions permissions
        ON (
          (roles.code = 'idea_reviewer' AND permissions.code = 'idea.evaluate')
          OR (roles.code = 'idea_admin' AND permissions.code IN ('idea.evaluate', 'idea.exclude'))
          OR (roles.code = 'marketplace_operator' AND permissions.code = 'reward.legacy.redeem')
          OR (roles.code = 'marketplace_admin' AND permissions.code IN ('catalog.manage', 'reward.legacy.redeem'))
        )
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("pense_aja.marketplace_redemption_requests", true);
    await queryRunner.dropTable("pense_aja.audit_events", true);
    await queryRunner.dropTable("pense_aja.points_balance_projection", true);
    await queryRunner.dropTable("pense_aja.points_ledger_entries", true);
    await queryRunner.dropTable("pense_aja.rbac_session_snapshots", true);
    await queryRunner.dropTable("pense_aja.rbac_user_unit_roles", true);
    await queryRunner.dropTable("pense_aja.rbac_role_permissions", true);
    await queryRunner.dropTable("pense_aja.rbac_permissions", true);
    await queryRunner.dropTable("pense_aja.rbac_roles", true);
  }
}
