import { MigrationInterface, QueryRunner } from "typeorm";

export class HideLegacyMarketplaceFallbackItems1720000008000
  implements MigrationInterface
{
  name = "HideLegacyMarketplaceFallbackItems1720000008000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE pense_aja.marketplace_catalog_items
      SET active = false,
          updatedat = CURRENT_TIMESTAMP
      WHERE metadata ->> 'source' = 'legacy_reward_fallback'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE pense_aja.marketplace_catalog_items
      SET active = true,
          updatedat = CURRENT_TIMESTAMP
      WHERE metadata ->> 'source' = 'legacy_reward_fallback'
    `);
  }
}
