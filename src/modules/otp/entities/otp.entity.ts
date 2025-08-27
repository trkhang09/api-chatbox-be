import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('otps')
export class Otp extends AbstractEntity {
  @Column()
  code: string;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ name: 'expired_at' })
  expiredAt: Date;

  @ManyToOne(() => User, (user) => user.otps)
  @JoinColumn({ name: 'user_id' })
  user: User;

  get minutesLeft(): number {
    const now = new Date();
    const diffMs = this.expiredAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000 / 60));
  }
}
