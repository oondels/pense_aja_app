import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class UniquePointsLedgerSource1720000005000
  implements MigrationInterface
{
  name = "UniquePointsLedgerSource1720000005000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const duplicates = (await queryRunner.query(`
      SELECT source_type, source_id, COUNT(*) AS total
      FROM pense_aja.points_ledger_entries
      GROUP BY source_type, source_id
      HAVING COUNT(*) > 1
      LIMIT 10
    `)) as Array<{ source_type: string; source_id: string; total: string }>;

    if (duplicates.length) {
      throw new Error(
        `Não foi possível criar índice único uq_points_ledger_source; existem fontes duplicadas no ledger: ${JSON.stringify(
          duplicates
        )}`
      );
    }

    const table = await queryRunner.getTable("pense_aja.points_ledger_entries");
    const hasUniqueSourceIndex = table?.indices.some(
      (index) => index.name === "uq_points_ledger_source"
    );

    if (!hasUniqueSourceIndex) {
      await queryRunner.createIndex(
        "pense_aja.points_ledger_entries",
        new TableIndex({
          name: "uq_points_ledger_source",
          columnNames: ["source_type", "source_id"],
          isUnique: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("pense_aja.points_ledger_entries");
    const hasUniqueSourceIndex = table?.indices.some(
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
