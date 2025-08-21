import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class CreatePermissionInRoleRolesFK1755771179150 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const permissionInRoleTable = await queryRunner.getTable('permissions_in_roles');
        const rolesTable = await queryRunner.getTable('roles');

        if (!permissionInRoleTable || !rolesTable) return;

        const exists = permissionInRoleTable.foreignKeys.find(
            (fk) => fk.name === 'FK_permissions_in_roles_roles'
        );
        if (!exists) {
            await queryRunner.createForeignKey(
                'permissions_in_roles',
                new TableForeignKey({
                    name: 'FK_permissions_in_roles_roles',
                    columnNames: ['role_id'],
                    referencedTableName: 'roles',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('permissions_in_roles', 'FK_permissions_in_roles_roles');
    }

}
