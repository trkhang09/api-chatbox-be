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

    const allPermissions = await permRepo.find();
    if (!allPermissions.length) {
      throw new NotFoundException(
        'No permissions found in the database. Please seed permissions first.',
      );
    }

    const adminPermissions = allPermissions.filter((p) =>
      p.name.startsWith('Order'),
    );
    const userPermissions = allPermissions.filter((p) =>
      p.name.startsWith('User'),
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

    const userRole = roleRepo.create({
      name: formatName(RoleType.USER),
      code: RoleType.USER,
      permissions: userPermissions,
    });

    await roleRepo.save(adminRole);
    await roleRepo.save(superAdminRole);
    await roleRepo.save(userRole);
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
