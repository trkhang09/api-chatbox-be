import { appDataSource } from 'src/data-source';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { Role } from 'src/modules/roles/entities/role.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoleType } from 'src/common/constants/role-constants';
import { config } from 'dotenv';
import { UserStatus } from 'src/common/enums/user-status.enum';

config();

export class SuperAdminSeeder {
  public async run(): Promise<void> {
    const userRepo = appDataSource.getRepository(User);
    const roleRepo = appDataSource.getRepository(Role);

    const role = await roleRepo.findOne({
      where: { code: RoleType.SUPER_ADMIN },
    });

    if (!role) {
      throw new NotFoundException(
        'Role SUPPER ADMIN found in database, seed roles before running this seeder',
      );
    }

    const fullname = process.env.SUPPER_ADMIN_FULLNAME;
    const email = process.env.SUPPER_ADMIN_EMAIL;
    const password = process.env.SUPPER_ADMIN_PASSWORD;

    if (!fullname || !email || !password) {
      throw new BadRequestException(
        'Invalid data from inserting a supper admin',
      );
    }

    let supperAdmin: User | Partial<User> | null = await userRepo.findOne({
      where: { role: { code: role.code } },
    });

    if (!supperAdmin) {
      supperAdmin = {
        fullname,
        email,
        password: await UsersService.generateHashPassword(password),
        role,
      };
    } else {
      supperAdmin.fullname = fullname;
      supperAdmin.email = email;
      supperAdmin.password = await UsersService.generateHashPassword(password);
      supperAdmin.status = UserStatus.ACTIVED;
    }

    await userRepo.save(supperAdmin);
  }
}

(async () => {
  try {
    const seeder = new SuperAdminSeeder();

    await appDataSource.initialize();
    await seeder.run();
    await appDataSource.destroy();
    process.exit(0);
  } catch (error) {
    throw new Error(`Error seeding supper admin: ${error.message}`);
  } finally {
    process.exit(1);
  }
})();
