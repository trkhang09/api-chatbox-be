import { appDataSource } from 'src/data-source';
import { User } from 'src/modules/users/entities/user.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { Chat } from 'src/modules/chats/entities/chat.entity';
import seededConversations from './conversations.seeder.json';
import { ChatTypes } from 'src/common/enums/chat-type.enum';
import { ISeeder } from '../main.seeder';

export class ConversationSeeder implements ISeeder {
  public async run(): Promise<void> {
    const chatRepo = appDataSource.getRepository(Chat);

    const conversations = await Promise.all(
      seededConversations.map(async (conversation) => {
        const type = Object.values(ChatTypes).includes(conversation.type)
          ? conversation.type
          : ChatTypes.BOT;

        return {
          ...conversation,
          type,
          users: await this.getRandomParticipants(type),
        };
      }),
    );

    await chatRepo.save(conversations);
  }

  private async getRandomParticipants(chatType: ChatTypes): Promise<User[]> {
    const userRepo = appDataSource.getRepository(User);

    let limit: number;
    switch (chatType) {
      case ChatTypes.BOT:
        limit = 1;
        break;
      case ChatTypes.USER:
        limit = 2;
        break;
    }

    const users = await userRepo
      .createQueryBuilder('user')
      .orderBy('RANDOM()')
      .take(limit)
      .getMany();

    if (users.length < limit) {
      throw new InternalServerErrorException(
        'Not found enough users to seed conversations, seed users before running this seeder',
      );
    }

    return users;
  }
}

(async () => {
  try {
    const seeder = new ConversationSeeder();

    await appDataSource.initialize();
    await seeder.run();
    await appDataSource.destroy();
    process.exit(0);
  } catch (error) {
    throw new Error(`Error seeding conversations: ${error.message}`);
  } finally {
    process.exit(1);
  }
})();
