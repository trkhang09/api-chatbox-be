import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Chat } from 'src/modules/chats/entities/chat.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('messages')
export class Message extends AbstractEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_read', type: 'bool', default: false })
  isRead: boolean;

  @Exclude()
  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}
