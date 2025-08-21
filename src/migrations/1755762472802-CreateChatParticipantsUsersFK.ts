import { ChatTypes } from 'src/common/enums/chat-type.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateChatParticipantsUsersFK1755762472802
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableChatParticipant =
      await queryRunner.getTable('chat_participants');
    const tableUser = await queryRunner.getTable('users');

    if (!tableChatParticipant || !tableUser) return;

    const existsUserFK = tableUser.foreignKeys.find(
      (fk) => fk.name === 'FK_chat_participants_users',
    );

    if (!existsUserFK) {
      await queryRunner.createForeignKeys('chat_participants', [
        new TableForeignKey({
          name: 'FK_chat_participants_users',
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'chat_participants',
      'FK_chat_participants_users',
    );
  }
}
