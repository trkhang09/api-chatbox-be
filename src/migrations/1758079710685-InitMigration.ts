import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1758079710685 implements MigrationInterface {
  name = 'InitMigration1758079710685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "login_oauth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "provider" integer NOT NULL DEFAULT '0', "provider_user_id" character varying(255) NOT NULL, "user_id" uuid, CONSTRAINT "PK_289912b1c2743aef9975e3f3ba6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "code" character varying(50) NOT NULL, CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(255) NOT NULL, "code" character varying(50) NOT NULL, "status" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "content" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "chat_id" uuid, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "type" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "code" character varying(50) NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "expired_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" uuid, CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "password" character varying NOT NULL, "fullname" character varying NOT NULL, "status" integer NOT NULL DEFAULT '1', "role_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "key" character varying(50) NOT NULL, "value" character varying NOT NULL, "type" character varying(50) NOT NULL DEFAULT 'string', "description" character varying NOT NULL DEFAULT '', CONSTRAINT "UQ_c8639b7626fa94ba8265628f214" UNIQUE ("key"), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "document_chunks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "content" text NOT NULL, "embedding" text NOT NULL, "document_id" uuid, CONSTRAINT "PK_7f9060084e9b872dbb567193978" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by_user_id" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_modified_by_user_id" uuid, "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying(255) NOT NULL, "description" character varying NOT NULL DEFAULT '', "file_path" character varying NOT NULL, "size" integer NOT NULL DEFAULT '0', "progress" integer NOT NULL DEFAULT '0', "status" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions_in_roles" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_8d8432e8e4789c229e832099da2" PRIMARY KEY ("role_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3a25711839bc3064f8396dd393" ON "permissions_in_roles" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bdba0ff7d6a41153dd66409feb" ON "permissions_in_roles" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_participants" ("chat_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_36c99e4a017767179cc49d0ac74" PRIMARY KEY ("chat_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9946d299e9ccfbee23aa40c554" ON "chat_participants" ("chat_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b4129b3e21906ca57b503a1d83" ON "chat_participants" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "login_oauth" ADD CONSTRAINT "FK_423d5dce8f28f6a13a100c383ed" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" ADD CONSTRAINT "FK_3938bb24b38ad395af30230bded" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_b371ff8bc1e4f65fc3d01420be5" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions_in_roles" ADD CONSTRAINT "FK_3a25711839bc3064f8396dd393c" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions_in_roles" ADD CONSTRAINT "FK_bdba0ff7d6a41153dd66409febf" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_participants" ADD CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_participants" ADD CONSTRAINT "FK_b4129b3e21906ca57b503a1d834" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_participants" DROP CONSTRAINT "FK_b4129b3e21906ca57b503a1d834"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_participants" DROP CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions_in_roles" DROP CONSTRAINT "FK_bdba0ff7d6a41153dd66409febf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions_in_roles" DROP CONSTRAINT "FK_3a25711839bc3064f8396dd393c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_b371ff8bc1e4f65fc3d01420be5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otps" DROP CONSTRAINT "FK_3938bb24b38ad395af30230bded"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_oauth" DROP CONSTRAINT "FK_423d5dce8f28f6a13a100c383ed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b4129b3e21906ca57b503a1d83"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9946d299e9ccfbee23aa40c554"`,
    );
    await queryRunner.query(`DROP TABLE "chat_participants"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bdba0ff7d6a41153dd66409feb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3a25711839bc3064f8396dd393"`,
    );
    await queryRunner.query(`DROP TABLE "permissions_in_roles"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "document_chunks"`);
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "otps"`);
    await queryRunner.query(`DROP TABLE "chats"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "login_oauth"`);
  }
}
