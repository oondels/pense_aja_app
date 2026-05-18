import { initializeDatabase } from "../config/database";

// Backfill set-based: evita N+1 SELECT/INSERT por registro legado e mantém
// idempotência pelos índices únicos parciais de origem legada.
interface CountRow {
  total: string;
}

interface BackfillResult {
  created_ledger_entries: string;
  created_audit_events: string;
}

interface SkippedResult {
  skipped: string;
}

interface BalanceResult {
  recalculated_balances: string;
}

interface VerificationRow {
  unidade_dass: string;
  legacy_points: string;
  ledger_earned: string;
  legacy_rewards: string;
  ledger_committed: string;
  points_difference: string;
  rewards_difference: string;
}

const now = () => Date.now();
const elapsed = (startedAt: number) => `${Date.now() - startedAt}ms`;

const logStep = async <T>(label: string, action: () => Promise<T>): Promise<T> => {
  const startedAt = now();
  console.log(`${label}...`);
  try {
    return await action();
  } finally {
    console.log(`${label} concluído em ${elapsed(startedAt)}.`);
  }
};

const getSingleCount = (rows: CountRow[]) => Number(rows[0]?.total ?? 0);
const getSingleBackfillResult = (rows: BackfillResult[]) => ({
  createdLedgerEntries: Number(rows[0]?.created_ledger_entries ?? 0),
  createdAuditEvents: Number(rows[0]?.created_audit_events ?? 0),
});

const run = async () => {
  const totalStartedAt = now();
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const totalLegacyPoints = await logStep("Contagem de pontuações legadas", async () =>
      getSingleCount(
        (await queryRunner.query(`
          SELECT COUNT(*) AS total
          FROM pense_aja.pense_aja_pontos
        `)) as CountRow[]
      )
    );

    const totalLegacyRewards = await logStep("Contagem de resgates legados", async () =>
      getSingleCount(
        (await queryRunner.query(`
          SELECT COUNT(*) AS total
          FROM pense_aja.pense_aja_premios
        `)) as CountRow[]
      )
    );

    console.log(`Pontuações legadas encontradas: ${totalLegacyPoints}`);
    console.log(`Resgates legados encontrados: ${totalLegacyRewards}`);

    const invalidLegacyRows = (await queryRunner.query(`
      SELECT 'pense_aja_pontos' AS source_table, COUNT(*) AS total
      FROM pense_aja.pense_aja_pontos
      WHERE COALESCE(valor, 0) <= 0
      UNION ALL
      SELECT 'pense_aja_premios' AS source_table, COUNT(*) AS total
      FROM pense_aja.pense_aja_premios
      WHERE COALESCE(pontos_premio_solicitado, 0) <= 0
    `)) as Array<{ source_table: string; total: string }>;

    const invalidTotal = invalidLegacyRows.reduce(
      (total, row) => total + Number(row.total),
      0
    );

    if (invalidTotal > 0) {
      console.table(invalidLegacyRows);
      throw new Error(
        "Backfill abortado: existem lançamentos legados com pontuação não positiva."
      );
    }

    const earnResult = await logStep("Backfill em massa de pontuações", async () =>
      getSingleBackfillResult(
        (await queryRunner.query(`
          WITH inserted AS (
            INSERT INTO pense_aja.points_ledger_entries (
              matricula,
              unidade_dass,
              entry_type,
              amount,
              status,
              source_type,
              source_id,
              related_entry_id,
              correlation_id,
              reason,
              created_by_registration,
              created_by_name,
              metadata,
              createdat
            )
            SELECT
              points.matricula,
              points.unidade_dass,
              'earn',
              points.valor,
              'confirmed',
              'legacy_points',
              points.id::text,
              NULL,
              'legacy-points-' || points.id::text,
              'Backfill de pontuação legada.',
              NULL,
              points.nome,
              jsonb_build_object('ideaId', points.id_pense_aja),
              CURRENT_TIMESTAMP
            FROM pense_aja.pense_aja_pontos points
            ON CONFLICT DO NOTHING
            RETURNING
              id,
              unidade_dass,
              amount,
              source_id,
              correlation_id,
              metadata
          ),
          audit_insert AS (
            INSERT INTO pense_aja.audit_events (
              event_type,
              aggregate_type,
              aggregate_id,
              unidade_dass,
              actor_registration,
              actor_role,
              reason,
              before_state,
              after_state,
              metadata,
              correlation_id,
              createdat
            )
            SELECT
              'ledger.backfill.earn',
              'ledger_entry',
              inserted.source_id,
              inserted.unidade_dass,
              NULL,
              NULL,
              NULL,
              NULL,
              jsonb_build_object(
                'source_type', 'legacy_points',
                'source_id', inserted.source_id,
                'amount', inserted.amount
              ),
              jsonb_build_object('legacyIdeaId', inserted.metadata ->> 'ideaId'),
              inserted.correlation_id,
              CURRENT_TIMESTAMP
            FROM inserted
            RETURNING id
          )
          SELECT
            (SELECT COUNT(*) FROM inserted) AS created_ledger_entries,
            (SELECT COUNT(*) FROM audit_insert) AS created_audit_events
        `)) as BackfillResult[]
      )
    );

    const rewardResult = await logStep("Backfill em massa de resgates", async () =>
      getSingleBackfillResult(
        (await queryRunner.query(`
          WITH inserted AS (
            INSERT INTO pense_aja.points_ledger_entries (
              matricula,
              unidade_dass,
              entry_type,
              amount,
              status,
              source_type,
              source_id,
              related_entry_id,
              correlation_id,
              reason,
              created_by_registration,
              created_by_name,
              metadata,
              createdat
            )
            SELECT
              rewards.matricula,
              rewards.unidade_dass,
              'commit',
              rewards.pontos_premio_solicitado,
              'confirmed',
              'legacy_reward',
              rewards.id::text,
              NULL,
              'legacy-reward-' || rewards.id::text,
              'Backfill de resgate legado.',
              NULL,
              rewards.nome_entregador,
              jsonb_build_object('rewardName', rewards.premio_solicitado),
              CURRENT_TIMESTAMP
            FROM pense_aja.pense_aja_premios rewards
            ON CONFLICT DO NOTHING
            RETURNING
              id,
              unidade_dass,
              amount,
              source_id,
              correlation_id,
              metadata
          ),
          audit_insert AS (
            INSERT INTO pense_aja.audit_events (
              event_type,
              aggregate_type,
              aggregate_id,
              unidade_dass,
              actor_registration,
              actor_role,
              reason,
              before_state,
              after_state,
              metadata,
              correlation_id,
              createdat
            )
            SELECT
              'ledger.backfill.commit',
              'ledger_entry',
              inserted.source_id,
              inserted.unidade_dass,
              NULL,
              NULL,
              NULL,
              NULL,
              jsonb_build_object(
                'source_type', 'legacy_reward',
                'source_id', inserted.source_id,
                'amount', inserted.amount
              ),
              jsonb_build_object('rewardName', inserted.metadata ->> 'rewardName'),
              inserted.correlation_id,
              CURRENT_TIMESTAMP
            FROM inserted
            RETURNING id
          )
          SELECT
            (SELECT COUNT(*) FROM inserted) AS created_ledger_entries,
            (SELECT COUNT(*) FROM audit_insert) AS created_audit_events
        `)) as BackfillResult[]
      )
    );

    const skippedEarnRows = (await queryRunner.query(`
      SELECT COUNT(*) AS skipped
      FROM pense_aja.pense_aja_pontos points
      JOIN pense_aja.points_ledger_entries ledger
        ON ledger.source_type = 'legacy_points'
       AND ledger.source_id = points.id::text
    `)) as SkippedResult[];

    const skippedRewardRows = (await queryRunner.query(`
      SELECT COUNT(*) AS skipped
      FROM pense_aja.pense_aja_premios rewards
      JOIN pense_aja.points_ledger_entries ledger
        ON ledger.source_type = 'legacy_reward'
       AND ledger.source_id = rewards.id::text
    `)) as SkippedResult[];

    const skippedEarnEntries =
      Number(skippedEarnRows[0]?.skipped ?? 0) - earnResult.createdLedgerEntries;
    const skippedRewardEntries =
      Number(skippedRewardRows[0]?.skipped ?? 0) - rewardResult.createdLedgerEntries;

    const balanceResult = await logStep("Recalculo em massa de saldos", async () => {
      const rows = (await queryRunner.query(`
        WITH affected_balances AS (
          SELECT DISTINCT matricula, unidade_dass
          FROM pense_aja.pense_aja_pontos
          UNION
          SELECT DISTINCT matricula, unidade_dass
          FROM pense_aja.pense_aja_premios
        ),
        ledger AS (
          SELECT
            ledger.matricula,
            ledger.unidade_dass,
            COALESCE(SUM(CASE WHEN ledger.entry_type = 'earn' THEN ledger.amount ELSE 0 END), 0) AS total_earned,
            COALESCE(SUM(CASE WHEN ledger.entry_type = 'reverse' THEN ledger.amount ELSE 0 END), 0) AS total_reversed,
            GREATEST(
              COALESCE(SUM(CASE WHEN ledger.entry_type = 'reserve' THEN ledger.amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN ledger.entry_type = 'release' THEN ledger.amount ELSE 0 END), 0)
              - COALESCE(SUM(CASE WHEN ledger.entry_type = 'commit' THEN ledger.amount ELSE 0 END), 0),
              0
            ) AS total_reserved,
            COALESCE(SUM(CASE WHEN ledger.entry_type = 'commit' THEN ledger.amount ELSE 0 END), 0) AS total_committed,
            COALESCE(SUM(CASE WHEN ledger.entry_type = 'refund' THEN ledger.amount ELSE 0 END), 0) AS total_refunded
          FROM pense_aja.points_ledger_entries ledger
          JOIN affected_balances affected
            ON affected.matricula = ledger.matricula
           AND affected.unidade_dass = ledger.unidade_dass
          WHERE ledger.status = 'confirmed'
          GROUP BY ledger.matricula, ledger.unidade_dass
        ),
        upserted AS (
          INSERT INTO pense_aja.points_balance_projection (
            matricula,
            unidade_dass,
            total_earned,
            total_reserved,
            total_committed,
            total_refunded,
            total_reversed,
            available_balance,
            updatedat
          )
          SELECT
            ledger.matricula,
            ledger.unidade_dass,
            ledger.total_earned,
            ledger.total_reserved,
            ledger.total_committed,
            ledger.total_refunded,
            ledger.total_reversed,
            ledger.total_earned
              - ledger.total_reversed
              - ledger.total_reserved
              - ledger.total_committed
              + ledger.total_refunded,
            CURRENT_TIMESTAMP
          FROM ledger
          ON CONFLICT (matricula, unidade_dass)
          DO UPDATE SET
            total_earned = EXCLUDED.total_earned,
            total_reserved = EXCLUDED.total_reserved,
            total_committed = EXCLUDED.total_committed,
            total_refunded = EXCLUDED.total_refunded,
            total_reversed = EXCLUDED.total_reversed,
            available_balance = EXCLUDED.available_balance,
            updatedat = EXCLUDED.updatedat
          RETURNING id
        )
        SELECT COUNT(*) AS recalculated_balances
        FROM upserted
      `)) as BalanceResult[];

      return Number(rows[0]?.recalculated_balances ?? 0);
    });

    const verification = await logStep("Verificação final de totais", async () =>
      (await queryRunner.query(`
        WITH legacy_points AS (
          SELECT unidade_dass, COALESCE(SUM(valor), 0) AS legacy_points
          FROM pense_aja.pense_aja_pontos
          GROUP BY unidade_dass
        ),
        legacy_rewards AS (
          SELECT unidade_dass, COALESCE(SUM(pontos_premio_solicitado), 0) AS legacy_rewards
          FROM pense_aja.pense_aja_premios
          GROUP BY unidade_dass
        ),
        ledger AS (
          SELECT
            unidade_dass,
            COALESCE(SUM(CASE WHEN entry_type = 'earn' AND source_type = 'legacy_points' THEN amount ELSE 0 END), 0) AS ledger_earned,
            COALESCE(SUM(CASE WHEN entry_type = 'commit' AND source_type = 'legacy_reward' THEN amount ELSE 0 END), 0) AS ledger_committed
          FROM pense_aja.points_ledger_entries
          WHERE source_type IN ('legacy_points', 'legacy_reward')
          GROUP BY unidade_dass
        ),
        offices AS (
          SELECT unidade_dass FROM legacy_points
          UNION
          SELECT unidade_dass FROM legacy_rewards
          UNION
          SELECT unidade_dass FROM ledger
        )
        SELECT
          offices.unidade_dass,
          COALESCE(legacy_points.legacy_points, 0) AS legacy_points,
          COALESCE(ledger.ledger_earned, 0) AS ledger_earned,
          COALESCE(legacy_rewards.legacy_rewards, 0) AS legacy_rewards,
          COALESCE(ledger.ledger_committed, 0) AS ledger_committed,
          COALESCE(legacy_points.legacy_points, 0) - COALESCE(ledger.ledger_earned, 0) AS points_difference,
          COALESCE(legacy_rewards.legacy_rewards, 0) - COALESCE(ledger.ledger_committed, 0) AS rewards_difference
        FROM offices
        LEFT JOIN legacy_points ON legacy_points.unidade_dass = offices.unidade_dass
        LEFT JOIN legacy_rewards ON legacy_rewards.unidade_dass = offices.unidade_dass
        LEFT JOIN ledger ON ledger.unidade_dass = offices.unidade_dass
        ORDER BY offices.unidade_dass
      `)) as VerificationRow[]
    );

    const hasDivergence = verification.some(
      (row) =>
        Number(row.points_difference) !== 0 ||
        Number(row.rewards_difference) !== 0
    );

    if (hasDivergence) {
      console.table(verification);
      throw new Error("Backfill abortado: totais legados divergem do ledger.");
    }

    await queryRunner.commitTransaction();

    console.log("Backfill do ledger concluído.");
    console.log(`Entradas earn criadas: ${earnResult.createdLedgerEntries}`);
    console.log(`Entradas earn já existentes: ${skippedEarnEntries}`);
    console.log(`Auditorias earn criadas: ${earnResult.createdAuditEvents}`);
    console.log(`Entradas commit criadas: ${rewardResult.createdLedgerEntries}`);
    console.log(`Entradas commit já existentes: ${skippedRewardEntries}`);
    console.log(`Auditorias commit criadas: ${rewardResult.createdAuditEvents}`);
    console.log(`Saldos recalculados: ${balanceResult}`);
    console.log("Totais por unidade:");
    console.table(verification);
    console.log(`Duração total: ${elapsed(totalStartedAt)}.`);
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Erro no backfill do ledger:", error);
    process.exit(1);
  } finally {
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

run().catch((error) => {
  console.error("Erro ao inicializar backfill do ledger:", error);
  process.exit(1);
});
