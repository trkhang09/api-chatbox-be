import { LoginOauth } from "src/modules/login-oauth/entities/login-oauth.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { AbstractEntity } from "src/common/entities/abstract.entity";
import { UserStatus } from "src/common/enums/user-status.enum";
import { Document } from "src/modules/documents/entities/document.entity";


@Entity('users')
export class User extends AbstractEntity {

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

    @OneToMany(() => User, user => user.creator)
    createdUsers: User[]
    
    @OneToMany(() => Document, (document) => document.uploadedBy)
    documents: Document[];



    @OneToMany(() => LoginOauth, (loginOauth) => loginOauth.user)
    loginOauths: LoginOauth[];
}
