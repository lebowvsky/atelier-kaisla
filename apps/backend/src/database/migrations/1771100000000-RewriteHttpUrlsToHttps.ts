import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * RewriteHttpUrlsToHttps
 *
 * Backfills image URLs stored in the database with the `https://` scheme
 * for the production API hosts. Earlier uploads were persisted with
 * `http://api.atelierkaisla.com/...` because Express did not trust the
 * Traefik reverse proxy (`request.protocol` returned `http`). Browsers
 * either flag this as mixed content (CSS `background-image`) or rely on
 * an HTTPS upgrade, both of which we want to avoid. This migration is
 * idempotent: it only matches rows whose URL still starts with `http://`
 * for the targeted hosts, so running it twice is safe.
 */
export class RewriteHttpUrlsToHttps1771100000000 implements MigrationInterface {
  name = 'RewriteHttpUrlsToHttps1771100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const apiHosts = ['api.atelierkaisla.com', 'api.lebowvsky.com'];

    for (const host of apiHosts) {
      const fromPrefix = `http://${host}`;
      const toPrefix = `https://${host}`;
      const likePattern = `http://${host}/%`;

      await queryRunner.query(
        `UPDATE page_content SET image = REPLACE(image, $1, $2) WHERE image LIKE $3`,
        [fromPrefix, toPrefix, likePattern],
      );

      await queryRunner.query(
        `UPDATE about_sections SET image = REPLACE(image, $1, $2) WHERE image LIKE $3`,
        [fromPrefix, toPrefix, likePattern],
      );

      await queryRunner.query(
        `UPDATE product_images SET url = REPLACE(url, $1, $2) WHERE url LIKE $3`,
        [fromPrefix, toPrefix, likePattern],
      );

      await queryRunner.query(
        `UPDATE blog_article_images SET url = REPLACE(url, $1, $2) WHERE url LIKE $3`,
        [fromPrefix, toPrefix, likePattern],
      );
    }
  }

  public async down(): Promise<void> {
    // No-op on rollback: re-introducing `http://` would bring back the
    // mixed-content regression the migration is meant to remove.
  }
}
