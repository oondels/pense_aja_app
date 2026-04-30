import { initializeDatabase } from "../config/database";
import { LedgerService } from "../services/ledger.service";
import { AuditService } from "../services/audit.service";

const run = async () => {
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const legacyPoints = (await queryRunner.query(
      `
        SELECT id, id_pense_aja, matricula, valor, unidade_dass, nome
        FROM pense_aja.pense_aja_pontos
      `
    )) as Array<{
      id: string;
      id_pense_aja: string;
      matricula: string;
      valor: string;
      unidade_dass: string;
      nome: string;
    }>;

    const legacyRewards = (await queryRunner.query(
      `
        SELECT id, matricula, premio_solicitado, pontos_premio_solicitado, unidade_dass, nome_entregador
        FROM pense_aja.pense_aja_premios
      `
    )) as Array<{
      id: string;
      matricula: string;
      premio_solicitado: string;
      pontos_premio_solicitado: string;
      unidade_dass: string;
      nome_entregador: string | null;
    }>;

    const touchedBalances = new Set<string>();
    let createdEarnEntries = 0;
    let createdCommitEntries = 0;

    for (const point of legacyPoints) {
      const existing = await queryRunner.query(
        `
          SELECT id
          FROM pense_aja.points_ledger_entries
          WHERE source_type = 'legacy_points'
            AND source_id = $1
          LIMIT 1
        `,
        [String(point.id)]
      );

      if (existing.length) {
        continue;
      }

      await LedgerService.createEntry(queryRunner, {
        registration: String(point.matricula),
        dassOffice: point.unidade_dass as any,
        entryType: "earn",
        amount: Number(point.valor),
        sourceType: "legacy_points",
        sourceId: String(point.id),
        correlationId: `legacy-points-${point.id}`,
        reason: "Backfill de pontuação legada.",
        createdByName: point.nome,
        metadata: {
          ideaId: point.id_pense_aja,
        },
      });

      await AuditService.recordEvent(queryRunner, {
        eventType: "ledger.backfill.earn",
        aggregateType: "ledger_entry",
        aggregateId: point.id,
        dassOffice: point.unidade_dass as any,
        afterState: {
          source_type: "legacy_points",
          source_id: String(point.id),
          amount: Number(point.valor),
        },
        correlationId: `legacy-points-${point.id}`,
        metadata: { legacyIdeaId: point.id_pense_aja },
      });

      touchedBalances.add(`${point.matricula}:${point.unidade_dass}`);
      createdEarnEntries += 1;
    }

    for (const reward of legacyRewards) {
      const existing = await queryRunner.query(
        `
          SELECT id
          FROM pense_aja.points_ledger_entries
          WHERE source_type = 'legacy_reward'
            AND source_id = $1
          LIMIT 1
        `,
        [String(reward.id)]
      );

      if (existing.length) {
        continue;
      }

      await LedgerService.createEntry(queryRunner, {
        registration: String(reward.matricula),
        dassOffice: reward.unidade_dass as any,
        entryType: "commit",
        amount: Number(reward.pontos_premio_solicitado),
        sourceType: "legacy_reward",
        sourceId: String(reward.id),
        correlationId: `legacy-reward-${reward.id}`,
        reason: "Backfill de resgate legado.",
        createdByName: reward.nome_entregador ?? undefined,
        metadata: {
          rewardName: reward.premio_solicitado,
        },
      });

      await AuditService.recordEvent(queryRunner, {
        eventType: "ledger.backfill.commit",
        aggregateType: "ledger_entry",
        aggregateId: reward.id,
        dassOffice: reward.unidade_dass as any,
        afterState: {
          source_type: "legacy_reward",
          source_id: String(reward.id),
          amount: Number(reward.pontos_premio_solicitado),
        },
        correlationId: `legacy-reward-${reward.id}`,
        metadata: { rewardName: reward.premio_solicitado },
      });

      touchedBalances.add(`${reward.matricula}:${reward.unidade_dass}`);
      createdCommitEntries += 1;
    }

    for (const balanceKey of touchedBalances) {
      const [registration, dassOffice] = balanceKey.split(":");
      await LedgerService.syncBalanceProjection(
        queryRunner,
        registration,
        dassOffice as any
      );
    }

    const verification = (await queryRunner.query(
      `
        SELECT
          legacy.unidade_dass,
          legacy.legacy_points,
          COALESCE(ledger.ledger_earned, 0) AS ledger_earned,
          legacy.legacy_rewards,
          COALESCE(ledger.ledger_committed, 0) AS ledger_committed
        FROM (
          SELECT
            unidade_dass,
            COALESCE(SUM(valor), 0) AS legacy_points,
            0::bigint AS legacy_rewards
          FROM pense_aja.pense_aja_pontos
          GROUP BY unidade_dass
          UNION ALL
          SELECT
            unidade_dass,
            0::bigint AS legacy_points,
            COALESCE(SUM(pontos_premio_solicitado), 0) AS legacy_rewards
          FROM pense_aja.pense_aja_premios
          GROUP BY unidade_dass
        ) legacy
        LEFT JOIN (
          SELECT
            unidade_dass,
            COALESCE(SUM(CASE WHEN entry_type = 'earn' AND source_type = 'legacy_points' THEN amount ELSE 0 END), 0) AS ledger_earned,
            COALESCE(SUM(CASE WHEN entry_type = 'commit' AND source_type = 'legacy_reward' THEN amount ELSE 0 END), 0) AS ledger_committed
          FROM pense_aja.points_ledger_entries
          GROUP BY unidade_dass
        ) ledger ON ledger.unidade_dass = legacy.unidade_dass
      `
    )) as Array<Record<string, unknown>>;

    await queryRunner.commitTransaction();

    console.log("Backfill do ledger concluído.");
    console.log(`Entradas earn criadas: ${createdEarnEntries}`);
    console.log(`Entradas commit criadas: ${createdCommitEntries}`);
    console.log("Verifique a migração pelos totais por unidade:");
    console.table(verification);
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
  }
};

run().catch((error) => {
  console.error("Erro ao inicializar backfill do ledger:", error);
  process.exit(1);
});
