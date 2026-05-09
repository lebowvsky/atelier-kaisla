import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * SeedPageContentTitles
 *
 * Seeds default `title` (and `content` where applicable) values on the
 * page_content rows that are wired to dynamic sections on the public
 * site. The seed is idempotent and *non-destructive*: it only fills
 * fields that are currently NULL so any editor-authored copy in
 * production is preserved.
 *
 * Sections covered:
 *   - home/gallery, home/social
 *   - about/cta, about/social
 *   - blog/hero, blog/articles, blog/social
 *   - wall-hanging/info
 *   - rugs/info
 */
export class SeedPageContentTitles1770800000000 implements MigrationInterface {
  name = 'SeedPageContentTitles1770800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const seed: Array<{
      page: string;
      section: string;
      title: string;
      content: string | null;
    }> = [
      {
        page: 'home',
        section: 'gallery',
        title: 'Our Collection',
        content:
          'Explore our handcrafted pieces. Click on any image to view it in full size.',
      },
      {
        page: 'home',
        section: 'social',
        title: 'Suivez-nous et contactez-nous',
        content: null,
      },
      {
        page: 'about',
        section: 'cta',
        title: 'Explorez Nos Créations',
        content:
          "Chaque pièce créée à l'atelier Kaisla est unique et raconte sa propre histoire. Découvrez notre collection de tentures murales et de tapis artisanaux.",
      },
      {
        page: 'about',
        section: 'social',
        title: 'Suivez-nous et contactez-nous',
        content: null,
      },
      {
        page: 'blog',
        section: 'hero',
        title: 'Journal',
        content:
          "Inspirations, techniques et coulisses de l'atelier. Plongez dans l'univers du tissage artisanal.",
      },
      {
        page: 'blog',
        section: 'articles',
        title: 'Articles récents',
        content: null,
      },
      {
        page: 'blog',
        section: 'social',
        title: 'Suivez-nous et contactez-nous',
        content: null,
      },
      {
        page: 'wall-hanging',
        section: 'info',
        title: 'About our wall hangings',
        content: null,
      },
      {
        page: 'rugs',
        section: 'info',
        title: 'About our rugs',
        content: null,
      },
    ];

    for (const row of seed) {
      // Insert a row if one is missing (idempotent), then backfill NULL
      // copy in a single UPSERT — never overwrite existing editor copy.
      await queryRunner.query(
        `INSERT INTO "page_content"
           ("id", "page", "section", "title", "content", "is_published", "sort_order")
         VALUES
           (uuid_generate_v4(), $1, $2, $3, $4, true, 0)
         ON CONFLICT ("page", "section")
         DO UPDATE SET
           "title" = COALESCE("page_content"."title", EXCLUDED."title"),
           "content" = COALESCE("page_content"."content", EXCLUDED."content")`,
        [row.page, row.section, row.title, row.content],
      );
    }
  }

  public async down(): Promise<void> {
    // Intentionally a no-op: editorial copy is preserved on rollback.
  }
}
