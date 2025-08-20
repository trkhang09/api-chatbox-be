import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { RoleStatus } from 'src/common/enums/role-status.enum';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity('roles')
export class Role extends AbstractEntity {

    @Column({ length: 255 })
    name: string;

    @Column({ length: 50 })
    code: string;

    @Column({ type: 'number', default: RoleStatus.ACTIVED })
    status: RoleStatus;

    @ManyToMany(() => Permission, (permission) => permission.roles, {
        cascade: true,
    })
    @JoinTable({
        name: 'permissions_in_roles',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id',
        },
    })
    permissions: Permission[];

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
