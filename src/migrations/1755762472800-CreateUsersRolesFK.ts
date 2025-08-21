import { UserStatus } from 'src/common/enums/user-status.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUsersRolesFK1755762472800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableUser = await queryRunner.getTable('users');
    const tableRole = await queryRunner.getTable('roles');
    const exists =
      tableUser &&
      tableRole &&
      tableUser.foreignKeys.find((fk) => fk.name === 'FK_users_roles');

    if (!exists) {
      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          name: 'FK_users_roles',
          columnNames: ['role_id'],
          referencedTableName: 'roles',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'FK_users_roles');
  }
}
