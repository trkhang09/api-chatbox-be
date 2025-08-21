import { ChatTypes } from 'src/common/enums/chat-type.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateChatParticipantsChatsFK1755762472801
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableChatParticipant =
      await queryRunner.getTable('chat_participants');
    const tableChat = await queryRunner.getTable('chats');

    if (!tableChatParticipant || !tableChat) return;

    const existsChatFK = tableChatParticipant.foreignKeys.find(
      (fk) => fk.name === 'FK_chat_participants_chats',
    );

    if (!existsChatFK) {
      await queryRunner.createForeignKeys('chat_participants', [
        new TableForeignKey({
          name: 'FK_chat_participants_chats',
          columnNames: ['chat_id'],
          referencedTableName: 'chats',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'chat_participants',
      'FK_chat_participants_chats',
    );
  }
}
