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

    
    @OneToMany(() => Document, (document) => document.uploadedBy)
    documents: Document[];


}
