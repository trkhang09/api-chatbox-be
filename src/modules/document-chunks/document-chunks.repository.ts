import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { DocumentChunks } from './entities/document-chunks.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class DocumentChunksRepository extends Repository<DocumentChunks> {
  constructor(
    @InjectRepository(DocumentChunks)
    private readonly documentChunksRepository: Repository<DocumentChunks>,
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
        .where('document_chunks.embedding <-> :embedding::vector < 0.7', {
          embedding: `[${embedding.join(', ')}]`,
        })
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
}
