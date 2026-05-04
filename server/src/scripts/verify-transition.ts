import { initializeDatabase } from "../config/database";

interface CheckResult {
  check_name: string;
  failures: string;
}

const run = async () => {
  const dataSource = await initializeDatabase();

  try {
    const checks = (await dataSource.query(
      `
        WITH
        missing_catalog AS (
          SELECT COUNT(*) AS failures
          FROM pense_aja.pense_aja_loja legacy
          LEFT JOIN pense_aja.marketplace_catalog_items catalog
            ON catalog.legacy_product_id = legacy.id::text
          WHERE catalog.id IS NULL
        ),
        duplicate_catalog AS (
          SELECT COUNT(*) AS failures
          FROM (
            SELECT legacy_product_id
            FROM pense_aja.marketplace_catalog_items
            WHERE legacy_product_id IS NOT NULL
            GROUP BY legacy_product_id
            HAVING COUNT(*) > 1
          ) duplicated
        ),
        missing_legacy_points AS (
          SELECT COUNT(*) AS failures
          FROM pense_aja.pense_aja_pontos points
          LEFT JOIN pense_aja.points_ledger_entries ledger
            ON ledger.source_type = 'legacy_points'
           AND ledger.source_id = points.id::text
          WHERE ledger.id IS NULL
        ),
        missing_legacy_rewards_ledger AS (
          SELECT COUNT(*) AS failures
          FROM pense_aja.pense_aja_premios reward
          LEFT JOIN pense_aja.points_ledger_entries ledger
            ON ledger.source_type = 'legacy_reward'
           AND ledger.source_id = reward.id::text
          WHERE ledger.id IS NULL
        ),
        missing_legacy_rewards_marketplace AS (
          SELECT COUNT(*) AS failures
          FROM pense_aja.pense_aja_premios reward
          LEFT JOIN pense_aja.marketplace_redemption_requests request
            ON request.legacy_prize_id = reward.id
          WHERE request.id IS NULL
        ),
        duplicate_legacy_rewards_marketplace AS (
          SELECT COUNT(*) AS failures
          FROM (
            SELECT legacy_prize_id
            FROM pense_aja.marketplace_redemption_requests
            WHERE legacy_prize_id IS NOT NULL
            GROUP BY legacy_prize_id
            HAVING COUNT(*) > 1
          ) duplicated
        ),
        projection_divergences AS (
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
          SELECT COUNT(*) AS failures
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
        )
        SELECT 'missing_catalog' AS check_name, failures FROM missing_catalog
        UNION ALL SELECT 'duplicate_catalog', failures FROM duplicate_catalog
        UNION ALL SELECT 'missing_legacy_points_ledger', failures FROM missing_legacy_points
        UNION ALL SELECT 'missing_legacy_rewards_ledger', failures FROM missing_legacy_rewards_ledger
        UNION ALL SELECT 'missing_legacy_rewards_marketplace', failures FROM missing_legacy_rewards_marketplace
        UNION ALL SELECT 'duplicate_legacy_rewards_marketplace', failures FROM duplicate_legacy_rewards_marketplace
        UNION ALL SELECT 'projection_divergences', failures FROM projection_divergences
        ORDER BY check_name
      `
    )) as CheckResult[];

    console.table(checks);

    const totalFailures = checks.reduce(
      (total, check) => total + Number(check.failures),
      0
    );

    if (totalFailures > 0) {
      console.error(`Verificação falhou. Divergências: ${totalFailures}`);
      process.exit(1);
    }

    console.log("Verificação de transição concluída sem divergências.");
  } catch (error) {
    console.error("Erro ao verificar transição:", error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

run().catch((error) => {
  console.error("Erro ao inicializar verificação de transição:", error);
  process.exit(1);
});
