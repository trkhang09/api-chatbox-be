import { LoginOauth } from 'src/modules/login-oauth/entities/login-oauth.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Chat } from 'src/modules/chats/entities/chat.entity';
import { Otp } from 'src/modules/otp/entities/otp.entity';

@Entity('users')
export class User extends AbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column({ type: 'varchar' })
  fullname: string;

  @ManyToOne(() => Role, (role) => role.users, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'int', default: UserStatus.ACTIVED })
  status: UserStatus;

  @OneToMany(() => LoginOauth, (loginOauth) => loginOauth.user)
  loginOauths: LoginOauth[];

  @ManyToMany(() => Chat, (chat) => chat.users)
  chats: Chat[];

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @Column({ type: 'int', default: 0 })
  count_tokens_used: number;
}
