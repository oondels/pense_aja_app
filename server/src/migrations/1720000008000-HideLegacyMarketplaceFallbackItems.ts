// Em progresso
import { MigrationInterface, QueryRunner } from "typeorm";

export class HideLegacyMarketplaceFallbackItems1720000008000 implements MigrationInterface {
  name = "HideLegacyMarketplaceFallbackItems1720000008000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // implement migration logic here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // implement rollback logic here
  }
}