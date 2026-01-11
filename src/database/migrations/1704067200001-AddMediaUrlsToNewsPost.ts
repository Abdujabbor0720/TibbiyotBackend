import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMediaUrlsToNewsPost1704067200001 implements MigrationInterface {
  name = 'AddMediaUrlsToNewsPost1704067200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news_posts" ADD COLUMN IF NOT EXISTS "mediaUrls" jsonb DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news_posts" DROP COLUMN IF EXISTS "mediaUrls"`,
    );
  }
}
