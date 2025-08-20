import { DocumentChunks } from 'src/modules/document-chunks/entities/document-chunks.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

export enum DocumentStatus {
  active = 0,
  inactive = 1,
  delete = 2,
}
@Entity('documents')
export class Document {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @Column({ default: DocumentStatus.active })
  status: DocumentStatus;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }

  @JoinColumn({ name: 'uploaded_by' })
  @ManyToOne(() => User, (user) => user.documents)
  user: User;

  @OneToMany(() => DocumentChunks, (chunk) => chunk.document)
  chunks: DocumentChunks[];
  
}
