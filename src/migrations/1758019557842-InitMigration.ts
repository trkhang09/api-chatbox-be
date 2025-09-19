import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1758019557842 implements MigrationInterface {
  name = 'InitMigration1758019557842';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP CONSTRAINT "document_chunks_document_id_fkey"`,
    );
    await queryRunner.query(`DROP INDEX "public"."ix_document_chunks_id"`);
    await queryRunner.query(`DROP INDEX "public"."ix_documents_id"`);
    await queryRunner.query(
      `ALTER TABLE "login_oauth" RENAME COLUMN "providerUserId" TO "provider_user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "isRead"`);
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "document_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "updated_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP COLUMN "updated_by_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "documentId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "is_read" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "is_read" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" ALTER COLUMN "is_used" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "count_tokens_used" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "content" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "embedding"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "embedding" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "size" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "progress" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "progress" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT '1'`,
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
      `ALTER TABLE "documents" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "progress" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "progress" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "size" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "embedding"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "embedding" vector`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "content" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "count_tokens_used" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" ALTER COLUMN "is_used" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "is_read" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "is_read" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP COLUMN "documentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD "updated_by_user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "updated_by_user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD "document_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD "isRead" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_oauth" RENAME COLUMN "provider_user_id" TO "providerUserId"`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_documents_id" ON "documents" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_document_chunks_id" ON "document_chunks" ("id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
