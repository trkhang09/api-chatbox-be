import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionType } from 'src/common/constants/permission-constants';
import { appDataSource } from 'src/data-source';
import { In } from 'typeorm';
import { ISeeder } from '../main.seeder';

const formatName = (code: string): string => {
  return code
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export class PermissionSeeder implements ISeeder {
  public async run(): Promise<void> {
    const repo = appDataSource.getRepository(Permission);

    const permissionNames = Object.values(PermissionType);

    const foundPermissions = (
      await repo.find({
        where: { code: In(permissionNames) },
        select: {
          code: true,
        },
      })
    ).map((p) => p.code);

    const newPermissions = permissionNames.filter(
      (name) => !foundPermissions.includes(name),
    );

    const permissions = newPermissions.map((name) => ({
      name: formatName(name),
      code: name,
    }));

    await repo.insert(permissions);
  }
}

(async () => {
  try {
    const seeder = new PermissionSeeder();

    await appDataSource.initialize();
    await seeder.run();
    await appDataSource.destroy();
    process.exit(0);
  } catch (error) {
    throw new Error(`Error seeding permissions: ${error.message}`);
  } finally {
    process.exit(1);
  }
})();
