import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class CreateMessagesChatsFK1755770415099 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableMessages = await queryRunner.getTable('messages');
        const tableChats = await queryRunner.getTable('chats');

        if (!tableMessages || !tableChats) return;

        const exists = tableMessages.foreignKeys.find(
            (fk) => fk.name === 'FK_messages_chats',
        );

        if (!exists) {
            await queryRunner.createForeignKey(
                'messages',
                new TableForeignKey({
                    name: 'FK_messages_chats',
                    columnNames: ['chat_id'],
                    referencedTableName: 'chats',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(
            'messages',
            'FK_messages_chats',
        );
    }

}
