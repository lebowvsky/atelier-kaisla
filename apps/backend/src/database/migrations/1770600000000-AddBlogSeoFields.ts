import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AddBlogSeoFields
 *
 * Adds two SEO-oriented columns to the `blog_articles` table:
 *  - `excerpt`         : short editorial summary used in article lists
 *                        and as the default <meta description> source
 *  - `meta_description`: optional explicit override for the SEO meta tag
 *
 * Both columns are NULLABLE on purpose so existing articles remain valid
 * and backward-compatible until editors fill them in.
 */
export class AddBlogSeoFields1770600000000 implements MigrationInterface {
  name = 'AddBlogSeoFields1770600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_articles" ADD COLUMN "excerpt" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_articles" ADD COLUMN "meta_description" character varying(320)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_articles" DROP COLUMN "meta_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_articles" DROP COLUMN "excerpt"`,
    );
  }
}
