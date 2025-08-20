import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeUpdate,
    BeforeInsert,
} from 'typeorm';

export abstract class AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'created_at', type: 'timestamp' })
    updatedAt: Date;

}