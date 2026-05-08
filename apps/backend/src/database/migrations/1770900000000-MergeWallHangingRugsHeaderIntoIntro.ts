import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MergeWallHangingRugsHeaderIntoIntro
 *
 * On the public site, the `wall-hanging` and `rugs` pages render a single
 * "page header" block (eyebrow + title + description). Splitting that into
 * two backoffice rows (`header` and `intro`) was an oversight from the
 * eyebrow rollout — editors expect to manage the whole block from one entry.
 *
 * This migration consolidates the two rows by:
 *   1. Copying the `header.eyebrow` onto `intro.eyebrow` whenever the
 *      latter is empty (preserves any editor-authored value).
 *   2. Deleting the now-redundant `header` rows for both pages.
 *
 * Down() recreates `header` rows with their canonical eyebrow seed so the
 * schema can roll back without surprising editors.
 */
export class MergeWallHangingRugsHeaderIntoIntro1770900000000 implements MigrationInterface {
  name = 'MergeWallHangingRugsHeaderIntoIntro1770900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Copy header.eyebrow → intro.eyebrow when intro is empty
    await queryRunner.query(
      `UPDATE "page_content" AS i
       SET "eyebrow" = h."eyebrow"
       FROM "page_content" AS h
       WHERE i."page" = h."page"
         AND i."section" = 'intro'
         AND h."section" = 'header'
         AND i."page" IN ('wall-hanging', 'rugs')
         AND (i."eyebrow" IS NULL OR i."eyebrow" = '')`,
    );

    // 2. Drop the redundant header rows
    await queryRunner.query(
      `DELETE FROM "page_content"
       WHERE "page" IN ('wall-hanging', 'rugs')
         AND "section" = 'header'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rows: Array<{ page: string; eyebrow: string }> = [
      { page: 'wall-hanging', eyebrow: 'Collection' },
      { page: 'rugs', eyebrow: 'Collection' },
    ];

    for (const row of rows) {
      await queryRunner.query(
        `INSERT INTO "page_content"
           ("id", "page", "section", "eyebrow", "is_published", "sort_order")
         VALUES
           (uuid_generate_v4(), $1, 'header', $2, true, 0)
         ON CONFLICT ("page", "section") DO NOTHING`,
        [row.page, row.eyebrow],
      );
    }
  }
}
