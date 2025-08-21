import {
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
} from 'typeorm';

export class CreateLoginOauthUsersFK1755762472804
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableLoginOauth = await queryRunner.getTable('login_oauth');
    const tableUser = await queryRunner.getTable('users');

    if (!tableLoginOauth || !tableUser) return;

    const exists = tableLoginOauth.foreignKeys.find(
      (fk) => fk.name === 'FK_login_oauth_users',
    );

    if (!exists) {
      await queryRunner.createForeignKey(
        'login_oauth',
        new TableForeignKey({
          name: 'FK_login_oauth_users',
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'login_oauth',
      'FK_login_oauth_users',
    );
  }
}
