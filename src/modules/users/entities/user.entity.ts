import { LoginOauth } from "src/modules/login-oauth/entities/login-oauth.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AbstractEntity } from "src/common/entities/abstract.entity";
import { UserStatus } from "src/common/enums/user-status.enum";
import { Role } from "src/modules/roles/entities/role.entity";

@Entity('users')
export class User extends AbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar' })
  fullname: string;

    @ManyToOne(() => Role, (role) => role.users, { eager: true, onDelete: "RESTRICT" })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({ default: UserStatus.ACTIVED })
    status: UserStatus

    @OneToMany(() => LoginOauth, (loginOauth) => loginOauth.user)
    loginOauths: LoginOauth[];
}
