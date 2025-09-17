import { appDataSource } from 'src/data-source';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { Role } from 'src/modules/roles/entities/role.entity';
import { NotFoundException } from '@nestjs/common';
import { UserStatus } from 'src/common/enums/user-status.enum';
import seededUsers from './users.factory.json';
import { In } from 'typeorm';

export class UserSeeder {
  public async run(): Promise<void> {
    const userRepo = appDataSource.getRepository(User);
    const roleRepo = appDataSource.getRepository(Role);

    const roles = await roleRepo.find();

    if (roles.length === 0) {
      throw new NotFoundException(
        'No role found in database, seed roles before running this factory',
      );
    }

    const foundUsers = await userRepo.find({
      where: { email: In(seededUsers.map((u) => u.email)) },
    });

    const users = await Promise.all(
      seededUsers.map(async (user) => {
        const existUser = foundUsers.find((u) => u.email === user.email) ?? {};

        return {
          ...existUser,
          ...user,
          password: await UsersService.generateHashPassword(user.password),
          status: Object.values(UserStatus).includes(user.status)
            ? user.status
            : UserStatus.ACTIVED,
          role: roles.find((r) => r.code === user.role),
        };
      }),
    );

    await userRepo.save(users);
  }

  public async truncate(): Promise<void> {
    await appDataSource.query(
      `TRUNCATE TABLE "chat_participants" RESTART IDENTITY CASCADE;`,
    );

    await appDataSource.query(
      `TRUNCATE TABLE "otps" RESTART IDENTITY CASCADE;`,
    );

    await appDataSource.query(
      `TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`,
    );
  }
}

(async () => {
  const seeder = new UserSeeder();
  const args = process.argv.slice(2);
  const hasTruncate = args.includes('-c');

  try {
    await appDataSource.initialize();

    if (hasTruncate) {
      await seeder.truncate();
    } else {
      await seeder.run();
    }

    await appDataSource.destroy();
    process.exit(0);
  } catch (error) {
    throw new Error(
      `Error ${hasTruncate ? 'truncate' : 'create'} users: ${error.message}`,
    );
  } finally {
    process.exit(1);
  }
})();
