import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 255})
    name: string;

    @Column({length: 50})
    code: string;

    @ManyToMany(()=> Permission, (permission)=> permission.roles, {
        cascade: true,
    })
    @JoinTable({
        name: 'permissions_in_roles',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn:{
            name: 'permission_id',
            referencedColumnName: 'id',
        },
    })
    permissions : Permission[];
}
