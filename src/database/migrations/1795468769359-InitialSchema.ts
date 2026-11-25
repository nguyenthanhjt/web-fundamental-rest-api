import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1795468769359 implements MigrationInterface {
    name = 'InitialSchema1795468769359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" character varying(36) NOT NULL, "name" character varying(120) NOT NULL, "email" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" character varying(36) NOT NULL, "name" character varying(160) NOT NULL, "capacity" integer NOT NULL, "price" numeric(12,2) NOT NULL, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" character varying(36) NOT NULL, "userId" character varying(36) NOT NULL, "serviceId" character varying(36) NOT NULL, "date" character varying(20) NOT NULL, "timeSlot" character varying(80) NOT NULL, "status" character varying(30) NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" character varying(36) NOT NULL, "userId" character varying(36) NOT NULL, "serviceId" character varying(36) NOT NULL, "rating" integer NOT NULL, "comment" text NOT NULL, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
