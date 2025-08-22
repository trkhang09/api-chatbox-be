import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEmbeddingColumnToVector1755830637178
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "vector"`);

    await queryRunner.query(`
        ALTER TABLE document_chunks
        ALTER COLUMN embedding
        TYPE vector(1536)
        USING embedding::vector
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
