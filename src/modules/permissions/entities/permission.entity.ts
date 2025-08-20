import { Role } from 'src/modules/roles/entities/role.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 255})
    name: string;

    @Column({length: 50})
    code: string;

    @ManyToMany(()=> Role, (role)=> role.permissions)
    roles: Role[];
}
