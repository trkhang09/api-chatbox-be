import { appDataSource } from 'src/data-source';
import { UserSeeder } from './users/user.seeder';
import { ConversationSeeder } from './conversations/conversation.seeder';
import { DocumentSeeder } from './documents/document.seeder';
import { PermissionSeeder } from './permissions/permission.seeder';
import { RoleSeeder } from './roles/role.seeder';

export interface ISeeder {
  run(): Promise<void>;
}

const SeederClassList: (new () => ISeeder)[] = [
  PermissionSeeder,
  RoleSeeder,
  UserSeeder,
  ConversationSeeder,
  DocumentSeeder,
];

(async () => {
  const errorMessages: string[] = [];
  await appDataSource.initialize();

  for (const SeederClass of SeederClassList) {
    try {
      await new SeederClass().run();
    } catch (error) {
      errorMessages.push(`${SeederClass.name}: ${error.message}`);
    }
  }

  await appDataSource.destroy();
  if (errorMessages.length > 0) {
    throw new Error(`Error seeding: ${errorMessages.join('\n')}`);
  }
  process.exit(0);
})();
