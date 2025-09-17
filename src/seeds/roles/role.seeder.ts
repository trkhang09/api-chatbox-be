import { appDataSource } from 'src/data-source';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { RoleType } from 'src/common/constants/role-constants';
import { NotFoundException } from '@nestjs/common';
import seededRoles from './roles.seeder.json';
import { RoleStatus } from 'src/common/enums/role-status.enum';
import { In } from 'typeorm';

const formatName = (code: string): string => {
  return code
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const mappingCode = (role: { code: string } & any) => role.code;

export class RoleSeeder {
  public async run(): Promise<void> {
    const roleRepo = appDataSource.getRepository(Role);
    const permRepo = appDataSource.getRepository(Permission);

    const allPermissions = await permRepo.find();
    if (!allPermissions.length) {
      throw new NotFoundException(
        'No permissions found in the database. Please seed permissions first.',
      );
    }

    let superAdminRole = await roleRepo.findOne({
      where: { code: RoleType.SUPER_ADMIN },
    });

    if (!superAdminRole) {
      superAdminRole = roleRepo.create({
        name: formatName(RoleType.SUPER_ADMIN),
        code: RoleType.SUPER_ADMIN,
        permissions: allPermissions,
      });
    } else {
      superAdminRole.permissions = allPermissions;
    }

    const userRole = roleRepo.create({
      name: formatName(RoleType.USER),
      code: RoleType.USER,
    });

    const foundRoles = await roleRepo.find({
      where: { code: In(seededRoles.map(mappingCode)) },
      relations: ['permissions'],
    });

    const roles: Partial<Role>[] = [];

    seededRoles.forEach((role) => {
      const foundRole = foundRoles.find((r) => r.code === role.code);
      const thisPermissions = allPermissions.filter((p) =>
        role.permissions.includes(p.code),
      );

      if (foundRole && foundRole.permissions.length < role.permissions.length) {
        foundRole.permissions = thisPermissions;

        roles.push(foundRole);
      } else {
        roles.push({
          ...role,
          name: formatName(role.code),
          status: Object.values(RoleStatus).includes(role.status)
            ? role.status
            : RoleStatus.ACTIVED,
          permissions: thisPermissions,
        });
      }
    });

    if (!(await roleRepo.exists({ where: { code: RoleType.USER } }))) {
      roles.push(userRole);
    }

    roles.push(superAdminRole);

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
