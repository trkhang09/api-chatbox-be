import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEmbeddingColumnToVector1755745515380
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "vector"`);

    await queryRunner.query(`
        ALTER TABLE document_chunks
        ALTER COLUMN embedding
        TYPE vector(768)
        USING embedding::vector
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
