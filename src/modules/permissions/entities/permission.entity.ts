import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity('permissions')
export class Permission extends AbstractEntity {

    @Column({ length: 255 })
    name: string;

    @Column({ length: 50 })
    code: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}
