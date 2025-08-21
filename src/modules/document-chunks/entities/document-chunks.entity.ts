import { Column, Entity, ManyToOne } from 'typeorm';
import { Document } from 'src/modules/documents/entities/document.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';

@Entity('document_chunks')
export class DocumentChunks extends AbstractEntity {
  @Column({ name: 'chunk_index', type: 'int' })
  chunkIndex: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  embedding: string;

  @ManyToOne(() => Document, (document) => document.chunks)
  document: Document;
}
