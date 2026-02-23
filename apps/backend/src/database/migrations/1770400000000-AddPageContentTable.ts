import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPageContentTable1770400000000 implements MigrationInterface {
  name = 'AddPageContentTable1770400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === Create page_content table ===
    await queryRunner.query(
      `CREATE TABLE "page_content" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "page" character varying(100) NOT NULL,
        "section" character varying(100) NOT NULL,
        "title" character varying(255),
        "content" text,
        "image" character varying(500),
        "image_alt" character varying(255),
        "metadata" jsonb,
        "is_published" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_page_content_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_page_content_page_section" UNIQUE ("page", "section")
      )`,
    );

    // === Create indexes ===
    await queryRunner.query(
      `CREATE INDEX "IDX_page_content_page" ON "page_content" ("page")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_page_content_is_published" ON "page_content" ("is_published")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_page_content_sort_order" ON "page_content" ("sort_order")`,
    );

    // === Seed: home hero content ===
    await queryRunner.query(
      `INSERT INTO "page_content" ("id", "page", "section", "title", "content", "is_published", "sort_order")
       VALUES (
         uuid_generate_v4(),
         'home',
         'hero',
         'Welcome to Atelier Kaisla',
         'Handcrafted wall art and rugs, designed with passion',
         true,
         0
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_page_content_sort_order"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_page_content_is_published"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_page_content_page"`);
    await queryRunner.query(`DROP TABLE "page_content"`);
  }
}
