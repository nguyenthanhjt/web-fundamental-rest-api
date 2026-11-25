import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAuthFields1795468769360 implements MigrationInterface {
  name = 'AddUserAuthFields1795468769360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "passwordHash"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
