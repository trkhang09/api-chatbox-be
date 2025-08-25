import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { PermissionType } from 'src/common/constants/permission-constants';
import { appDataSource } from 'src/data-source';

const formatName = (code: string): string => {
  return code
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export default class PermissionSeeder {
  public async run(): Promise<void> {
    const repo = appDataSource.getRepository(Permission);
    const permissions = Object.values(PermissionType).map((name) => ({
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
