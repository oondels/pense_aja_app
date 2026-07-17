import { initializeDatabase } from "../config/database";
import { AuditService } from "../services/audit.service";

const FALLBACK_ITEM_NAME = "Resgate legado migrado";

interface LegacyReward {
  id: string;
  matricula: string;
  unidade_dass: string;
  nome: string;
  premio_solicitado: string;
  pontos_premio_solicitado: string;
  usuario_entregador: string | null;
  nome_entregador: string | null;
  data_solicitacao: Date | null;
  data_entrega: Date | null;
  createdat: Date | null;
  updatedat: Date | null;
}

const normalizeName = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

const run = async () => {
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const legacyRewards = (await queryRunner.query(
      `
        SELECT
          id,
          matricula,
          unidade_dass,
          nome,
          premio_solicitado,
          pontos_premio_solicitado,
          usuario_entregador,
          nome_entregador,
          data_solicitacao,
          data_entrega,
          createdat,
          updatedat
        FROM pense_aja.pense_aja_premios
        ORDER BY id
      `
    )) as LegacyReward[];

    const catalogRows = (await queryRunner.query(
      `
        SELECT id, unidade_dass, name, points_cost, legacy_product_id
        FROM pense_aja.marketplace_catalog_items
      `
    )) as Array<{
      id: string;
      unidade_dass: string;
      name: string;
      points_cost: string;
      legacy_product_id: string | null;
    }>;

    const catalogByUnitAndName = new Map<string, typeof catalogRows>();
    for (const item of catalogRows) {
      const key = `${item.unidade_dass}:${normalizeName(item.name)}`;
      const current = catalogByUnitAndName.get(key) ?? [];
      current.push(item);
      catalogByUnitAndName.set(key, current);
    }

    const fallbackByUnit = new Map<string, string>();
    let createdRequests = 0;
    let skippedRequests = 0;
    let createdFallbackItems = 0;

    const getFallbackCatalogItemId = async (dassOffice: string) => {
      const cached = fallbackByUnit.get(dassOffice);
      if (cached) {
        return cached;
      }

      const existing = (await queryRunner.query(
        `
          SELECT id
          FROM pense_aja.marketplace_catalog_items
          WHERE unidade_dass = $1
            AND name = $2
          LIMIT 1
        `,
        [dassOffice, FALLBACK_ITEM_NAME]
      )) as Array<{ id: string }>;

      if (existing.length) {
        fallbackByUnit.set(dassOffice, existing[0].id);
        return existing[0].id;
      }

      const inserted = (await queryRunner.query(
        `
          INSERT INTO pense_aja.marketplace_catalog_items (
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
          VALUES (
            $1,
            $2,
            NULL,
            0,
            'physical',
            false,
            NULL,
            '{"source":"legacy_reward_fallback"}'::jsonb,
            NULL,
            NULL,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
          RETURNING id
        `,
        [dassOffice, FALLBACK_ITEM_NAME]
      )) as Array<{ id: string }>;

      createdFallbackItems += 1;
      fallbackByUnit.set(dassOffice, inserted[0].id);
      return inserted[0].id;
    };

    const resolveCatalogItemId = async (reward: LegacyReward) => {
      const matchKey = `${reward.unidade_dass}:${normalizeName(
        reward.premio_solicitado
      )}`;
      const nameMatches = catalogByUnitAndName.get(matchKey) ?? [];
      const samePointMatches = nameMatches.filter(
        (item) =>
          Number(item.points_cost) === Number(reward.pontos_premio_solicitado)
      );

      if (samePointMatches.length === 1) {
        return samePointMatches[0].id;
      }

      if (nameMatches.length === 1) {
        return nameMatches[0].id;
      }

      return getFallbackCatalogItemId(reward.unidade_dass);
    };

    for (const reward of legacyRewards) {
      const existing = (await queryRunner.query(
        `
          SELECT id
          FROM pense_aja.marketplace_redemption_requests
          WHERE legacy_prize_id = $1
          LIMIT 1
        `,
        [String(reward.id)]
      )) as Array<{ id: string }>;

      if (existing.length) {
        skippedRequests += 1;
        continue;
      }

      const catalogItemId = await resolveCatalogItemId(reward);
      const createdAt =
        reward.createdat ?? reward.data_solicitacao ?? new Date();
      const updatedAt = reward.updatedat ?? reward.data_entrega ?? createdAt;

      const inserted = (await queryRunner.query(
        `
          INSERT INTO pense_aja.marketplace_redemption_requests (
            matricula,
            unidade_dass,
            catalog_item_id,
            request_status,
            reserved_ledger_entry_id,
            approval_actor_registration,
            approval_actor_name,
            fulfillment_type,
            legacy_prize_id,
            createdat,
            updatedat
          )
          VALUES ($1, $2, $3, 'completed', NULL, $4, $5, 'legacy_completed', $6, $7, $8)
          RETURNING id
        `,
        [
          String(reward.matricula),
          reward.unidade_dass,
          catalogItemId,
          reward.usuario_entregador
            ? String(reward.usuario_entregador).replace(/\D/g, "") || null
            : null,
          reward.nome_entregador ?? null,
          String(reward.id),
          createdAt,
          updatedAt,
        ]
      )) as Array<{ id: string }>;

      await AuditService.recordEvent(queryRunner, {
        eventType: "marketplace.request.backfilled",
        aggregateType: "marketplace_redemption",
        aggregateId: inserted[0].id,
        dassOffice: reward.unidade_dass as any,
        actorRegistration: reward.usuario_entregador
          ? String(reward.usuario_entregador).replace(/\D/g, "") || null
          : null,
        actorRole: "backfill",
        reason: "Backfill de resgate legado para marketplace.",
        beforeState: null,
        afterState: {
          request_status: "completed",
          legacy_prize_id: String(reward.id),
          catalog_item_id: catalogItemId,
          points: Number(reward.pontos_premio_solicitado),
        },
        metadata: {
          rewardName: reward.premio_solicitado,
          collaboratorName: reward.nome,
        },
        correlationId: `legacy-marketplace-${reward.id}`,
      });

      createdRequests += 1;
    }

    const validation = (await queryRunner.query(
      `
        SELECT
          COUNT(*) FILTER (WHERE request.id IS NULL) AS missing_requests,
          COUNT(*) AS legacy_rewards
        FROM pense_aja.pense_aja_premios reward
        LEFT JOIN pense_aja.marketplace_redemption_requests request
          ON request.legacy_prize_id = reward.id
      `
    )) as Array<{ missing_requests: string; legacy_rewards: string }>;

    await queryRunner.commitTransaction();

    console.log("Backfill de marketplace concluído.");
    console.log(`Solicitações criadas: ${createdRequests}`);
    console.log(`Solicitações já existentes: ${skippedRequests}`);
    console.log(`Itens fallback criados: ${createdFallbackItems}`);
    console.table(validation);
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Erro no backfill de marketplace:", error);
    process.exit(1);
  } finally {
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }
  }
};

run().catch((error) => {
  console.error("Erro ao inicializar backfill de marketplace:", error);
  process.exit(1);
});
