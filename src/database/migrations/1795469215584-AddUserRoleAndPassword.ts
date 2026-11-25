import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRoleAndPassword1795469215584 implements MigrationInterface {
    name = 'AddUserRoleAndPassword1795469215584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" character varying(255)`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
