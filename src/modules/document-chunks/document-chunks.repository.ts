import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { DocumentChunks } from './entities/document-chunks.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ResponseDocumentChunksDto } from './dtos/reponse-document-chunks.dto';

interface FindOptions {
  embedding?: number[];
  limit: number;
}

@Injectable()
export class DocumentChunksRepository extends Repository<DocumentChunks> {
  private readonly SIMILARITY_THRESHOLD = 0.7;
  constructor(
    @InjectRepository(DocumentChunks)
    private readonly documentChunksRepository: Repository<DocumentChunks>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(documentChunksRepository.target, documentChunksRepository.manager);
  }

  async findClosestByEmbedding(
    embedding: number[],
  ): Promise<DocumentChunks | null> {
    try {
      const result = await this.documentChunksRepository
        .createQueryBuilder('document_chunks')
        .select('document_chunks.content')
        .where(
          'document_chunks.embedding <-> :embedding::vector < :threshold',
          {
            embedding: `[${embedding.join(', ')}]`,
            threshold: this.SIMILARITY_THRESHOLD,
          },
        )
        .orderBy('document_chunks.embedding <-> :embedding::vector', 'ASC')
        .limit(1)
        .getOne();

      return result;
    } catch (error) {
      throw new Error(
        'Error finding closest document chunk. Detail: ' + error.message,
      );
    }
  }

  async findByEmbedding(
    options: FindOptions,
  ): Promise<ResponseDocumentChunksDto[]> {
    const values: any[] = [];
    let sql = `SELECT content FROM document_chunks`;

    if (options.embedding) {
      values.push(JSON.stringify(options.embedding));
      sql += ` ORDER BY embedding <-> $${values.length}`;
    }

    if (options.limit) {
      values.push(options.limit);
      sql += ` LIMIT $${values.length}`;
    }

    const result = await this.dataSource.query(sql, values);
    return result as ResponseDocumentChunksDto[];
  }
}
