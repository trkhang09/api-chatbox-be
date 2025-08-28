import { appDataSource } from 'src/data-source';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { RoleType } from 'src/common/constants/role-constants';
import { NotFoundException } from '@nestjs/common';

const formatName = (code: string): string => {
  return code
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export default class RoleSeeder {
  public async run(): Promise<void> {
    const roleRepo = appDataSource.getRepository(Role);
    const permRepo = appDataSource.getRepository(Permission);
    const adminPermissionPrefix = '';

    const allPermissions = await permRepo.find();
    if (!allPermissions.length) {
      throw new NotFoundException(
        'No permissions found in the database. Please seed permissions first.',
      );
    }

    const adminPermissions = allPermissions.filter(
      (p) => p.code.startsWith('USER_') || p.code.startsWith('DOCUMENT_'),
    );

    const superAdminRole = roleRepo.create({
      name: formatName(RoleType.SUPER_ADMIN),
      code: RoleType.SUPER_ADMIN,
      permissions: allPermissions,
    });

    const adminRole = roleRepo.create({
      name: formatName(RoleType.ADMIN),
      code: RoleType.ADMIN,
      permissions: adminPermissions,
    });

    await roleRepo.save(adminRole);
    await roleRepo.save(superAdminRole);
  }
}

(async () => {
  try {
    const seeder = new RoleSeeder();

    await appDataSource.initialize();
    await seeder.run();
    await appDataSource.destroy();
    process.exit(0);
  } catch (error) {
    throw new Error(`Error seeding roles: ${error.message}`);
  } finally {
    process.exit(1);
  }
})();
