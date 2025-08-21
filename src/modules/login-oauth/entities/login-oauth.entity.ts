import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "src/modules/users/entities/user.entity";
import { Provider } from "src/common/enums/provider.enum";
import { AbstractEntity } from "src/common/entities/abstract.entity";

@Entity('login_oauth')
export class LoginOauth extends AbstractEntity {

  @ManyToOne(() => User, (user) => user.loginOauths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'int',
    default: Provider.SYSTEM,
  })
  provider: Provider;

  @Column({ type: 'varchar', length: 255 })
  providerUserId: string;

}
