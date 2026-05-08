import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * CreatePageContentBlocks
 *
 * Adds the `page_content_blocks` table — a child collection of editable
 * info-blocks (title + description) attached to a PageContent section.
 * Used by the wall-hanging/info and rugs/info sections to replace the
 * previously hardcoded "info-block" markup with editor-managed copy.
 *
 * Seed: 6 default blocks (3 per page) preloaded with the exact copy
 * currently rendered on the public site, so existing pages keep the
 * same content immediately after the migration runs.
 */
export class CreatePageContentBlocks1771000000000 implements MigrationInterface {
  name = 'CreatePageContentBlocks1771000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === Create page_content_blocks table ===
    await queryRunner.query(
      `CREATE TABLE "page_content_blocks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pageContentId" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_page_content_blocks_id" PRIMARY KEY ("id")
      )`,
    );

    // === Create indexes ===
    await queryRunner.query(
      `CREATE INDEX "IDX_page_content_blocks_pageContentId"
         ON "page_content_blocks" ("pageContentId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_page_content_blocks_sortOrder"
         ON "page_content_blocks" ("sortOrder")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_page_content_blocks_pageContentId_sortOrder"
         ON "page_content_blocks" ("pageContentId", "sortOrder")`,
    );

    // === Foreign key with CASCADE delete ===
    await queryRunner.query(
      `ALTER TABLE "page_content_blocks"
         ADD CONSTRAINT "FK_page_content_blocks_pageContentId"
         FOREIGN KEY ("pageContentId") REFERENCES "page_content"("id")
         ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // === Seed: 6 default blocks (mirror current frontend copy) ===
    const seed: Array<{
      page: string;
      section: string;
      title: string;
      description: string;
      sortOrder: number;
    }> = [
      // wall-hanging / info
      {
        page: 'wall-hanging',
        section: 'info',
        title: 'Handcrafted Quality',
        description:
          'Every piece is handwoven on a traditional loom, ensuring exceptional quality and attention to detail. No two pieces are exactly alike.',
        sortOrder: 0,
      },
      {
        page: 'wall-hanging',
        section: 'info',
        title: 'Natural Materials',
        description:
          'We use only natural, sustainable materials including wool, cotton, linen, and jute. Many pieces feature plant-based natural dyes.',
        sortOrder: 1,
      },
      {
        page: 'wall-hanging',
        section: 'info',
        title: 'Made to Order',
        description:
          'Interested in a custom piece? We offer made-to-order wall hangings in your choice of colors and dimensions. Contact us to discuss your vision.',
        sortOrder: 2,
      },
      // rugs / info
      {
        page: 'rugs',
        section: 'info',
        title: 'Traditional Craftsmanship',
        description:
          'Every rug is hand-knotted using centuries-old techniques, ensuring exceptional durability and quality. Each piece takes weeks to complete and is built to last generations.',
        sortOrder: 0,
      },
      {
        page: 'rugs',
        section: 'info',
        title: 'Premium Natural Fibers',
        description:
          'We exclusively use the finest natural materials including pure new wool, organic cotton, and linen. Many rugs feature natural plant-based dyes for rich, lasting color.',
        sortOrder: 1,
      },
      {
        page: 'rugs',
        section: 'info',
        title: 'Custom Commissions',
        description:
          'Looking for a specific size or color palette? We create custom rugs tailored to your space and style preferences. Contact us to discuss your unique project.',
        sortOrder: 2,
      },
    ];

    for (const row of seed) {
      // Insert only if the parent page_content row exists AND no block with
      // the same (parent, title) already exists — keeps the seed idempotent
      // in case the migration is replayed against partially-seeded data.
      await queryRunner.query(
        `INSERT INTO "page_content_blocks"
           ("id", "pageContentId", "title", "description", "sortOrder")
         SELECT
           uuid_generate_v4(),
           pc."id",
           $3::varchar(255),
           $4::text,
           $5::integer
         FROM "page_content" pc
         WHERE pc."page" = $1::varchar
           AND pc."section" = $2::varchar
           AND NOT EXISTS (
             SELECT 1 FROM "page_content_blocks" b
             WHERE b."pageContentId" = pc."id"
               AND b."title" = $3::varchar(255)
           )`,
        [row.page, row.section, row.title, row.description, row.sortOrder],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "page_content_blocks"
         DROP CONSTRAINT "FK_page_content_blocks_pageContentId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_page_content_blocks_pageContentId_sortOrder"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_page_content_blocks_sortOrder"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_page_content_blocks_pageContentId"`,
    );
    await queryRunner.query(`DROP TABLE "page_content_blocks"`);
  }
}
