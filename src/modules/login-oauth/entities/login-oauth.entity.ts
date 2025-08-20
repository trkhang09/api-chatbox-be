import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/modules/users/entities/user.entity";

export enum Provider {
    system = 0,
    google = 1,
    github = 2,
}

@Entity('login_oauth')
export class LoginOauth {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @ManyToOne(() => User, (user) => user.loginOauths, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.system,
  })
  provider: Provider;

  @Column({ type: 'varchar', length: 255 })
  provider_user_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
  
}
