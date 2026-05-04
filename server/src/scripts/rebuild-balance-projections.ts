import { initializeDatabase } from "../config/database";
import { LedgerService } from "../services/ledger.service";

const run = async () => {
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const balances = (await queryRunner.query(
      `
        SELECT DISTINCT matricula, unidade_dass
        FROM pense_aja.points_ledger_entries
        WHERE status = 'confirmed'
        ORDER BY unidade_dass, matricula
      `
    )) as Array<{ matricula: string; unidade_dass: string }>;

    for (const balance of balances) {
      await LedgerService.syncBalanceProjection(
        queryRunner,
        String(balance.matricula),
        balance.unidade_dass as any
      );
    }

    const divergences = (await queryRunner.query(
      `
        WITH ledger AS (
          SELECT
            matricula,
            unidade_dass,
            COALESCE(SUM(CASE WHEN entry_type = 'earn' THEN amount ELSE 0 END), 0) AS total_earned,
            COALESCE(SUM(CASE WHEN entry_type = 'reverse' THEN amount ELSE 0 END), 0) AS total_reversed,
            COALESCE(SUM(CASE WHEN entry_type = 'reserve' THEN amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN entry_type = 'release' THEN amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN entry_type = 'commit' THEN amount ELSE 0 END), 0) AS total_reserved,
            COALESCE(SUM(CASE WHEN entry_type = 'commit' THEN amount ELSE 0 END), 0) AS total_committed,
            COALESCE(SUM(CASE WHEN entry_type = 'refund' THEN amount ELSE 0 END), 0) AS total_refunded
          FROM pense_aja.points_ledger_entries
          WHERE status = 'confirmed'
          GROUP BY matricula, unidade_dass
        )
        SELECT COUNT(*) AS total
        FROM ledger
        LEFT JOIN pense_aja.points_balance_projection projection
          ON projection.matricula = ledger.matricula
         AND projection.unidade_dass = ledger.unidade_dass
        WHERE projection.id IS NULL
           OR projection.total_earned <> ledger.total_earned
           OR projection.total_reserved <> ledger.total_reserved
           OR projection.total_committed <> ledger.total_committed
           OR projection.total_refunded <> ledger.total_refunded
           OR projection.total_reversed <> ledger.total_reversed
           OR projection.available_balance <> (
              ledger.total_earned
              - ledger.total_reversed
              - ledger.total_reserved
              - ledger.total_committed
              + ledger.total_refunded
           )
      `
    )) as Array<{ total: string }>;

    await queryRunner.commitTransaction();

    console.log("Rebuild de projeções concluído.");
    console.log(`Projeções recalculadas: ${balances.length}`);
    console.log(`Divergências restantes: ${divergences[0]?.total ?? "0"}`);

    if (Number(divergences[0]?.total ?? 0) > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Erro ao recalcular projeções:", error);
    process.exit(1);
  } finally {
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }
  }
};

run().catch((error) => {
  console.error("Erro ao inicializar rebuild de projeções:", error);
  process.exit(1);
});
