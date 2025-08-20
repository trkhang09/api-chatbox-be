import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "src/modules/users/entities/user.entity";
import { Provider } from "src/common/enums/provider.enum";
import { AbstractEntity } from "src/common/entities/abstract.entity";

@Entity('login_oauth')
export class LoginOauth extends AbstractEntity {

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.loginOauths, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.SYSTEM,
  })
  provider: Provider;

  @Column({ type: 'varchar', length: 255 })
  provider_user_id: string;

}
