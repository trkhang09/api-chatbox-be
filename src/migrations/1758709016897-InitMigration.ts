import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1758709016897 implements MigrationInterface {
  name = 'InitMigration1758709016897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "count_tokens_used" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "count_tokens_used"`,
    );
  }
}
