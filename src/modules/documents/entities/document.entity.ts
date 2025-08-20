import {
  Column,
} from 'typeorm';
import { DocumentStatus } from 'src/common/enums/document-status.enum';
import { AbstractEntity } from 'src/common/entities/abstract.entity';

export class Document extends AbstractEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ default: DocumentStatus.ACTIVED })
  status: DocumentStatus;
}
