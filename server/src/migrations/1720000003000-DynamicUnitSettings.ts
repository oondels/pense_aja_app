import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from "typeorm";

export class DynamicUnitSettings1720000003000 implements MigrationInterface {
  name = "DynamicUnitSettings1720000003000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = "pense_aja.unit_scoring_rules";

    if (!(await queryRunner.hasColumn(table, "label"))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({ name: "label", type: "varchar", isNullable: true })
      );
    }

    if (!(await queryRunner.hasColumn(table, "description"))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({ name: "description", type: "varchar", isNullable: true })
      );
    }

    if (!(await queryRunner.hasColumn(table, "display_order"))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({ name: "display_order", type: "int", default: 0 })
      );
    }

    if (!(await queryRunner.hasColumn(table, "metadata"))) {
      await queryRunner.addColumn(
        table,
        new TableColumn({ name: "metadata", type: "jsonb", isNullable: true })
      );
    }

    await queryRunner.query(`
      UPDATE pense_aja.unit_scoring_rules
      SET
        label = COALESCE(label, classification),
        description = COALESCE(description, CASE classification
          WHEN 'A' THEN 'Avançada'
          WHEN 'B' THEN 'Intermediária'
          WHEN 'C' THEN 'Básica'
          ELSE classification
        END),
        display_order = CASE classification
          WHEN 'A' THEN 1
          WHEN 'B' THEN 2
          WHEN 'C' THEN 3
          ELSE NULLIF(display_order, 0)
        END,
        metadata = COALESCE(metadata, '{}'::jsonb)
      WHERE label IS NULL
         OR description IS NULL
         OR display_order = 0
         OR metadata IS NULL
    `);

    await queryRunner.query(`
      UPDATE pense_aja.pense_aja_dass
      SET classificacao = CASE classificacao
        WHEN '3' THEN 'A'
        WHEN '2' THEN 'B'
        WHEN '1' THEN 'C'
        ELSE classificacao
      END
      WHERE classificacao IN ('1', '2', '3')
    `);

    const scoringIndexes = await queryRunner.getTable(table);
    const hasEffectiveIndex = scoringIndexes?.indices.some(
      (index) => index.name === "idx_unit_scoring_effective"
    );

    if (!hasEffectiveIndex) {
      await queryRunner.createIndex(
        table,
        new TableIndex({
          name: "idx_unit_scoring_effective",
          columnNames: ["unidade_dass", "classification", "active", "active_from", "active_until"],
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = "pense_aja.unit_scoring_rules";
    const scoringTable = await queryRunner.getTable(table);

    if (scoringTable?.indices.some((index) => index.name === "idx_unit_scoring_effective")) {
      await queryRunner.dropIndex(table, "idx_unit_scoring_effective");
    }

    if (await queryRunner.hasColumn(table, "metadata")) {
      await queryRunner.dropColumn(table, "metadata");
    }
    if (await queryRunner.hasColumn(table, "display_order")) {
      await queryRunner.dropColumn(table, "display_order");
    }
    if (await queryRunner.hasColumn(table, "description")) {
      await queryRunner.dropColumn(table, "description");
    }
    if (await queryRunner.hasColumn(table, "label")) {
      await queryRunner.dropColumn(table, "label");
    }
  }
}
