import { Chat } from "src/modules/chats/entities/chat.entity";
import { User } from "src/modules/users/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum MessageStatus {
    sent = 0,
    delivered = 1,
    read = 2,
    deleted = 3
}

@Entity('messages')
export class Message {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'chat_id', type: 'uuid' })
    chatId: string;

    @Column({ name: 'creator_id', type: 'uuid' })
    creatorId: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: MessageStatus.sent })
    status: MessageStatus


    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @Column({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
    }

    @ManyToOne(() => User, user => user.messages)
    @JoinColumn({ name: 'creator_id' })
    creator: User

    @ManyToOne(() => Chat, chat => chat.messages)
    @JoinColumn({ name: 'chat_id' })
    chat: Chat


}