import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', select: true })
  createdAt: Date;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId?: string;

  // like lastModifiedAt
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', select: true })
  updatedAt: Date;

  //like lastModifiedByUserId
  @Column({ name: 'last_modified_by_user_id', type: 'uuid', nullable: true })
  updatedByUserId?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    select: true,
    nullable: true,
  })
  deletedAt?: Date;
}
