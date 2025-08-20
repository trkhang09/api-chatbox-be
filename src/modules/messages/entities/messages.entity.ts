import { AbstractEntity } from "src/common/entities/abstract.entity";
import { MessageStatus } from "src/common/enums/message-status.enum";
import { Chat } from "src/modules/chats/entities/chat.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('messages')
export class Message extends AbstractEntity {

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'number', default: MessageStatus.SENT })
    status: MessageStatus

    @ManyToOne(() => Chat, chat => chat.messages)
    @JoinColumn({ name: 'chat_id' })
    chat: Chat
}