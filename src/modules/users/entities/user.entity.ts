import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum UserStatus {
    actived = 0,
    blocked = 1,
    deleted = 2
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'varchar' })
    fullname: string;

    @Column({ name: 'role_id', type: 'uuid' })
    roleId: string;

    @Column({ default: UserStatus.actived })
    status: UserStatus

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

    @Column({ name: 'created_by', type: 'uuid' })
    createdBy: string;

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
    }

    @ManyToOne(() => User, user => user.createdUsers)
    creator?: User

    @OneToMany(() => User, user=> user.creator)
    createdUsers: User[]
}
