import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1757669836462 implements MigrationInterface {
  name = 'InitMigration1757669836462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "key" character varying(255) NOT NULL, "value" character varying(255) NOT NULL, "type" character varying(255) NOT NULL DEFAULT 'string', "description" character varying(255) NOT NULL DEFAULT '', CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "settings"`);
  }
}
