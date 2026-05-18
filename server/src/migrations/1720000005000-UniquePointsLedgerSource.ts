import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class UniquePointsLedgerSource1720000005000
  implements MigrationInterface
{
  name = "UniquePointsLedgerSource1720000005000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE pense_aja.points_ledger_entries ledger
      SET source_id = request.id::text
      FROM pense_aja.marketplace_redemption_requests request
      WHERE request.reserved_ledger_entry_id = ledger.id
        AND ledger.source_type = 'marketplace_redemption'
        AND ledger.entry_type = 'reserve'
        AND ledger.source_id LIKE 'catalog:%'
    `);

    const duplicates = (await queryRunner.query(`
      SELECT source_type, source_id, entry_type, COUNT(*) AS total
      FROM pense_aja.points_ledger_entries
      WHERE source_type = 'marketplace_redemption'
        AND entry_type IN ('reserve', 'commit', 'release', 'refund')
      GROUP BY source_type, source_id, entry_type
      HAVING COUNT(*) > 1
      UNION ALL
      SELECT source_type, source_id, NULL AS entry_type, COUNT(*) AS total
      FROM pense_aja.points_ledger_entries
      WHERE source_type IN ('legacy_points', 'legacy_reward')
      GROUP BY source_type, source_id
      HAVING COUNT(*) > 1
      LIMIT 10
    `)) as Array<{
      source_type: string;
      source_id: string;
      entry_type: string | null;
      total: string;
    }>;

    if (duplicates.length) {
      throw new Error(
        `Não foi possível criar índices únicos do ledger; existem eventos operacionais duplicados: ${JSON.stringify(
          duplicates
        )}`
      );
    }

    const table = await queryRunner.getTable("pense_aja.points_ledger_entries");
    const hasIndex = (name: string) =>
      Boolean(table?.indices.some((index) => index.name === name));

    if (hasIndex("uq_points_ledger_source")) {
      await queryRunner.dropIndex(
        "pense_aja.points_ledger_entries",
        "uq_points_ledger_source"
      );
    }

    if (!hasIndex("uq_points_ledger_marketplace_event")) {
      await queryRunner.createIndex(
        "pense_aja.points_ledger_entries",
        new TableIndex({
          name: "uq_points_ledger_marketplace_event",
          columnNames: ["source_type", "source_id", "entry_type"],
          isUnique: true,
          where:
            "source_type = 'marketplace_redemption' AND entry_type IN ('reserve', 'commit', 'release', 'refund')",
        })
      );
    }

    if (!hasIndex("uq_points_ledger_legacy_points_source")) {
      await queryRunner.createIndex(
        "pense_aja.points_ledger_entries",
        new TableIndex({
          name: "uq_points_ledger_legacy_points_source",
          columnNames: ["source_type", "source_id"],
          isUnique: true,
          where: "source_type = 'legacy_points'",
        })
      );
    }

    if (!hasIndex("uq_points_ledger_legacy_reward_source")) {
      await queryRunner.createIndex(
        "pense_aja.points_ledger_entries",
        new TableIndex({
          name: "uq_points_ledger_legacy_reward_source",
          columnNames: ["source_type", "source_id"],
          isUnique: true,
          where: "source_type = 'legacy_reward'",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("pense_aja.points_ledger_entries");
    const indexNames = [
      "uq_points_ledger_marketplace_event",
      "uq_points_ledger_legacy_points_source",
      "uq_points_ledger_legacy_reward_source",
    ];

    for (const indexName of indexNames) {
      const hasIndex = table?.indices.some((index) => index.name === indexName);
      if (hasIndex) {
        await queryRunner.dropIndex(
          "pense_aja.points_ledger_entries",
          indexName
        );
      }
    }

    const refreshedTable = await queryRunner.getTable(
      "pense_aja.points_ledger_entries"
    );
    const hasUniqueSourceIndex = refreshedTable?.indices.some(
      (index) => index.name === "uq_points_ledger_source"
    );

    if (hasUniqueSourceIndex) {
      await queryRunner.dropIndex(
        "pense_aja.points_ledger_entries",
        "uq_points_ledger_source"
      );
    }
  }
}
