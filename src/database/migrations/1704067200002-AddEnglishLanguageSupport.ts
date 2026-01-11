import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnglishLanguageSupport1704067200002 implements MigrationInterface {
  name = 'AddEnglishLanguageSupport1704067200002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add English title and body columns to news_posts table
    await queryRunner.query(`
      ALTER TABLE "news_posts" 
      ADD COLUMN IF NOT EXISTS "titleEn" text,
      ADD COLUMN IF NOT EXISTS "bodyEn" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove English columns from news_posts table
    await queryRunner.query(`
      ALTER TABLE "news_posts" 
      DROP COLUMN IF EXISTS "titleEn",
      DROP COLUMN IF EXISTS "bodyEn"
    `);
  }
}
