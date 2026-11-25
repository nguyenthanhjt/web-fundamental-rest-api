import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueReviewPerUserService1795469215586 implements MigrationInterface {
  name = 'AddUniqueReviewPerUserService1795469215586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const duplicates = await queryRunner.query(`
      SELECT "userId", "serviceId", COUNT(*)::int AS count
      FROM "reviews"
      GROUP BY "userId", "serviceId"
      HAVING COUNT(*) > 1
    `);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate reviews found for user/service pairs: ${JSON.stringify(duplicates)}`);
    }

    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "UQ_reviews_user_service" UNIQUE ("userId", "serviceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "UQ_reviews_user_service"`,
    );
  }
}
