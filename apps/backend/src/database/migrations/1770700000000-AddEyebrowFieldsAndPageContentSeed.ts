import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AddEyebrowFieldsAndPageContentSeed
 *
 * Adds an `eyebrow` column (small kicker label rendered above section
 * titles on the front office) to two CMS tables:
 *  - `about_sections`
 *  - `page_content`
 *
 * Both columns are NULLABLE on purpose so existing rows remain valid
 * while editors progressively fill the labels in via the backoffice.
 *
 * The migration also:
 *  - Backfills `about_sections.eyebrow` with a default
 *    "Chapitre NN" label preserving the current display order.
 *  - Upserts the canonical eyebrow values for the home, about,
 *    wall-hanging, rugs and blog pages into `page_content`.
 *
 * The `down()` migration only drops the new columns; the seeded data
 * is intentionally not rolled back so editorial copy is preserved.
 */
export class AddEyebrowFieldsAndPageContentSeed1770700000000 implements MigrationInterface {
  name = 'AddEyebrowFieldsAndPageContentSeed1770700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === 1. Add eyebrow column to about_sections ===
    await queryRunner.query(
      `ALTER TABLE "about_sections" ADD COLUMN IF NOT EXISTS "eyebrow" character varying(255)`,
    );

    // === 2. Add eyebrow column to page_content ===
    await queryRunner.query(
      `ALTER TABLE "page_content" ADD COLUMN IF NOT EXISTS "eyebrow" character varying(255)`,
    );

    // === 3. Backfill about_sections eyebrow with "Chapitre NN" labels ===
    await queryRunner.query(
      `UPDATE "about_sections"
       SET "eyebrow" = sub.label
       FROM (
         SELECT
           id,
           'Chapitre ' || LPAD(
             ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC)::text,
             2,
             '0'
           ) AS label
         FROM "about_sections"
       ) AS sub
       WHERE "about_sections"."id" = sub.id`,
    );

    // === 4. Seed page_content eyebrows (UPSERT on (page, section)) ===
    const eyebrowSeed: Array<{
      page: string;
      section: string;
      eyebrow: string;
    }> = [
      {
        page: 'home',
        section: 'hero',
        eyebrow: 'Atelier · Tapis & tentures murales',
      },
      { page: 'home', section: 'gallery', eyebrow: 'Collection' },
      { page: 'home', section: 'intro', eyebrow: 'Notre démarche' },
      { page: 'home', section: 'social', eyebrow: 'Restons en contact' },
      { page: 'about', section: 'hero', eyebrow: 'Atelier' },
      { page: 'about', section: 'cta', eyebrow: 'Découvrir' },
      { page: 'about', section: 'social', eyebrow: 'Restons en contact' },
      { page: 'wall-hanging', section: 'header', eyebrow: 'Collection' },
      { page: 'wall-hanging', section: 'info', eyebrow: 'Why Atelier Kaisla' },
      { page: 'rugs', section: 'header', eyebrow: 'Collection' },
      { page: 'rugs', section: 'info', eyebrow: 'Why Atelier Kaisla' },
      { page: 'blog', section: 'hero', eyebrow: 'Journal' },
      { page: 'blog', section: 'articles', eyebrow: 'Lectures' },
      { page: 'blog', section: 'social', eyebrow: 'Restons en contact' },
    ];

    for (const row of eyebrowSeed) {
      await queryRunner.query(
        `INSERT INTO "page_content"
           ("id", "page", "section", "eyebrow", "is_published", "sort_order")
         VALUES
           (uuid_generate_v4(), $1, $2, $3, true, 0)
         ON CONFLICT ("page", "section")
         DO UPDATE SET "eyebrow" = EXCLUDED."eyebrow"`,
        [row.page, row.section, row.eyebrow],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "page_content" DROP COLUMN "eyebrow"`);
    await queryRunner.query(
      `ALTER TABLE "about_sections" DROP COLUMN "eyebrow"`,
    );
  }
}
