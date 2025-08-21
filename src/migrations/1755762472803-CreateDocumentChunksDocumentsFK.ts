import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateDocumentChunksDocumentsFK1755762472803
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableDocumentChunk = await queryRunner.getTable('document_chunks');
    const tableDocument = await queryRunner.getTable('documents');

    if (!tableDocumentChunk || !tableDocument) return;

    const exists = tableDocumentChunk.foreignKeys.find(
      (fk) => fk.name === 'FK_document_chunks_documents',
    );

    if (!exists) {
      await queryRunner.createForeignKey(
        'document_chunks',
        new TableForeignKey({
          name: 'FK_document_chunks_documents',
          columnNames: ['document_id'],
          referencedTableName: 'documents',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'document_chunks',
      'FK_document_chunks_documents',
    );
  }
}
