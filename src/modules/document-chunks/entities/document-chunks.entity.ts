import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
} from 'typeorm';
import { Document } from 'src/modules/documents/entities/document.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';

@Entity('document_chunks')
export class DocumentChunks extends AbstractEntity {
  // @Column({ name: 'chunk_index', type: 'int' })
  // chunkIndex: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  embedding: string;

  @ManyToOne(() => Document, (document) => document.chunks)
  document: Document;

  @BeforeInsert()
  @BeforeUpdate()
  beforeUpsert() {
    if (this.embedding && Array.isArray(this.embedding)) {
      this.embedding = JSON.stringify(this.embedding);
    }
  }
  @AfterInsert()
  @AfterLoad()
  @AfterUpdate()
  onLoad() {
    try {
      this.embedding = JSON.parse(this.embedding);
    } catch (e) {
      throw new Error('Failed to parse embedding JSON: ' + e.message);
    }
  }
}
