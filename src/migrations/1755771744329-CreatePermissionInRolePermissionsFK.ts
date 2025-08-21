import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class CreatePermissionInRolePermissionsFK1755771744329 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const permissionInRoleTable = await queryRunner.getTable('permissions_in_roles');
        const permissionsTable = await queryRunner.getTable('permissions');

        if (!permissionInRoleTable || !permissionsTable) return;

        const exists = permissionInRoleTable.foreignKeys.find(
            (fk) => fk.name === 'FK_permissions_in_roles_permissions'
        );
        if (!exists) {
            await queryRunner.createForeignKey(
                'permissions_in_roles',
                new TableForeignKey({
                    name: 'FK_permissions_in_roles_permissions',
                    columnNames: ['permission_id'],
                    referencedTableName: 'permissions',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('permissions_in_roles', 'FK_permissions_in_roles_permissions');
    }

}
