import { appDataSource } from 'src/data-source';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { RoleType } from 'src/common/constants/role-constants';
import { NotFoundException } from '@nestjs/common';
import { ISeeder } from '../main.seeder';
import seededRoles from './roles.seeder.json';
import { RoleStatus } from 'src/common/enums/role-status.enum';
import { In } from 'typeorm';

const formatName = (code: string): string => {
  return code
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export class RoleSeeder implements ISeeder {
  public async run(): Promise<void> {
    const roleRepo = appDataSource.getRepository(Role);
    const permRepo = appDataSource.getRepository(Permission);

    const allPermissions = await permRepo.find();
    if (!allPermissions.length) {
      throw new NotFoundException(
        'No permissions found in the database. Please seed permissions first.',
      );
    }

    const superAdminRole = roleRepo.create({
      name: formatName(RoleType.SUPER_ADMIN),
      code: RoleType.SUPER_ADMIN,
      permissions: allPermissions,
    });

    const userRole = roleRepo.create({
      name: formatName(RoleType.USER),
      code: RoleType.USER,
    });

    const foundRoleCodes = (
      await roleRepo.find({
        where: { code: In(seededRoles.map((r) => r.code)) },
        select: ['code'],
      })
    ).map((r) => r.code);

    const newRoles = seededRoles.filter((c) => foundRoleCodes.includes(c.code));

    const roles = newRoles.map((role) => ({
      ...role,
      name: formatName(role.code),
      status: Object.values(RoleStatus).includes(role.status)
        ? role.status
        : RoleStatus.ACTIVED,
      permissions: allPermissions.filter((p) =>
        role.permissions.includes(p.code),
      ),
    }));

    if (!(await roleRepo.exists({ where: { code: RoleType.SUPER_ADMIN } }))) {
      roles.push(superAdminRole);
    }

    if (!(await roleRepo.exists({ where: { code: RoleType.USER } }))) {
      roles.push(userRole);
    }

    await roleRepo.save(roles);
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
