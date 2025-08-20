import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "src/common/enum/user-status.enum";


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

    //update after create role entity 
    // @ManyToOne(()=> Role, (role) => role.user, {eager: true})
    // @JoinColumn({name: 'role_id'})
    // role: Role;

    @Column({ default: UserStatus.ACTIVED })
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
