import { Column, Entity, ManyToOne } from "typeorm";
import { Document } from "src/modules/documents/entities/document.entity";
import { AbstractEntity } from "src/common/entities/abstract.entity";

@Entity('document_chunks')
export class DocumentChunks extends AbstractEntity {

  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;
  
  @Column({ name: 'chunk_index', type: 'int' })
  chunkIndex: number;

  @Column({ type: 'text' })
  content: string;

  //have problem and fixed at last commit
  @Column(<any>'vector', {length: 768 })
  embedding: number[];

  @ManyToOne(() => Document, (document) => document.chunks)
  document: Document;

}

