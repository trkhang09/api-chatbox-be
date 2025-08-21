import { AbstractEntity } from "src/common/entities/abstract.entity";
import { ChatTypes } from "src/common/enums/chat-type.enum";
import { Message } from "src/modules/messages/entities/messages.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";

@Entity('chats')
export class Chat extends AbstractEntity {

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({type: 'int', default: ChatTypes.BOT })
    type: ChatTypes;

    @OneToMany(() => Message, message => message.chat)
    messages: Message[];

    @ManyToMany(()=> User, (user) => user.chats, { cascade: true})
    @JoinTable({
        name: 'chat_participants',
        joinColumn: {
            name: 'chat_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
    })
    users: User[];
}
