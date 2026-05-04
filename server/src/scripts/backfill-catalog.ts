import { initializeDatabase } from "../config/database";
import { AuditService } from "../services/audit.service";

interface LegacyCatalogItem {
  id: string;
  unidade_dass: string;
  nome: string;
  imagem: string | null;
  valor: string;
  user_create: string | null;
  updated_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

const onlyDigitsOrNull = (value?: string | null) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits || null;
};

const run = async () => {
  const dataSource = await initializeDatabase();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const legacyItems = (await queryRunner.query(
      `
        SELECT
          id,
          unidade_dass,
          nome,
          imagem,
          valor,
          user_create,
          updated_by,
          created_at,
          updated_at
        FROM pense_aja.pense_aja_loja
        ORDER BY unidade_dass, nome
      `
    )) as LegacyCatalogItem[];

    let createdItems = 0;
    let skippedItems = 0;

    for (const item of legacyItems) {
      const existing = (await queryRunner.query(
        `
          SELECT id
          FROM pense_aja.marketplace_catalog_items
          WHERE legacy_product_id = $1
          LIMIT 1
        `,
        [String(item.id)]
      )) as Array<{ id: string }>;

      if (existing.length) {
        skippedItems += 1;
        continue;
      }

      const createdAt = item.created_at ?? new Date();
      const updatedAt = item.updated_at ?? createdAt;
      const created = (await queryRunner.query(
        `
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
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            'physical',
            true,
            NULL,
            '{"source":"pense_aja_loja"}'::jsonb,
            $6,
            $7,
            $8,
            $9
          )
          RETURNING id
        `,
        [
          String(item.id),
          item.unidade_dass,
          item.nome,
          item.imagem,
          Number(item.valor),
          onlyDigitsOrNull(item.user_create),
          onlyDigitsOrNull(item.updated_by),
          createdAt,
          updatedAt,
        ]
      )) as Array<{ id: string }>;

      await AuditService.recordEvent(queryRunner, {
        eventType: "catalog.item.backfilled",
        aggregateType: "catalog_item",
        aggregateId: created[0].id,
        dassOffice: item.unidade_dass as any,
        actorRegistration: onlyDigitsOrNull(item.user_create),
        actorRole: "backfill",
        reason: "Backfill de item legado da loja.",
        beforeState: null,
        afterState: {
          legacy_product_id: String(item.id),
          name: item.nome,
          points_cost: Number(item.valor),
        },
        metadata: {
          legacyTable: "pense_aja_loja",
        },
        correlationId: `legacy-catalog-${item.id}`,
      });

      createdItems += 1;
    }

    const validation = (await queryRunner.query(
      `
        SELECT
          COUNT(*) FILTER (WHERE catalog.id IS NULL) AS missing_items,
          COUNT(*) AS legacy_items
        FROM pense_aja.pense_aja_loja legacy
        LEFT JOIN pense_aja.marketplace_catalog_items catalog
          ON catalog.legacy_product_id = legacy.id::text
      `
    )) as Array<{ missing_items: string; legacy_items: string }>;

    await queryRunner.commitTransaction();

    console.log("Backfill de catálogo concluído.");
    console.log(`Itens criados: ${createdItems}`);
    console.log(`Itens já existentes: ${skippedItems}`);
    console.table(validation);

    if (Number(validation[0]?.missing_items ?? 0) > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error("Erro no backfill de catálogo:", error);
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
  console.error("Erro ao inicializar backfill de catálogo:", error);
  process.exit(1);
});
