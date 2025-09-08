import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1757325842505 implements MigrationInterface {
  name = 'InitMigration1757325842505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "login_oauth" RENAME COLUMN "providerUserId" TO "provider_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME COLUMN "isRead" TO "is_read"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" RENAME COLUMN "isUsed" TO "is_used"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "document_id"`,
    );
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "process"`);
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "created_by_user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "last_modified_by_user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "documentId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ALTER COLUMN "content" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "embedding"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "embedding" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "size" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "progress" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "progress" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "size" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "embedding"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "embedding" vector`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ALTER COLUMN "content" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "documentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "last_modified_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "created_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD "process" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "document_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" RENAME COLUMN "is_used" TO "isUsed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME COLUMN "is_read" TO "isRead"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_oauth" RENAME COLUMN "provider_user_id" TO "providerUserId"`,
    );
  }
}
