import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogTables1770500000000 implements MigrationInterface {
  name = 'AddBlogTables1770500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === Create blog_tags table ===
    await queryRunner.query(
      `CREATE TABLE "blog_tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(100) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_tags_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_tags_name" UNIQUE ("name"),
        CONSTRAINT "UQ_blog_tags_slug" UNIQUE ("slug")
      )`,
    );

    // === Create blog_articles table ===
    await queryRunner.query(
      `CREATE TABLE "blog_articles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "subtitle" character varying(255),
        "content" text NOT NULL,
        "slug" character varying(255) NOT NULL,
        "published_at" TIMESTAMP,
        "is_published" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_articles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_articles_slug" UNIQUE ("slug")
      )`,
    );

    // === Create blog_article_images table ===
    await queryRunner.query(
      `CREATE TABLE "blog_article_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" character varying(500) NOT NULL,
        "alt_text" character varying(255),
        "is_cover" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "article_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_article_images_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_blog_article_images_article" FOREIGN KEY ("article_id") REFERENCES "blog_articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );

    // === Create blog_articles_tags join table ===
    await queryRunner.query(
      `CREATE TABLE "blog_articles_tags" (
        "article_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_blog_articles_tags" PRIMARY KEY ("article_id", "tag_id"),
        CONSTRAINT "FK_blog_articles_tags_article" FOREIGN KEY ("article_id") REFERENCES "blog_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_blog_articles_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    );

    // === Create indexes ===
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_tags_name" ON "blog_tags" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_tags_slug" ON "blog_tags" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_articles_slug" ON "blog_articles" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_articles_is_published" ON "blog_articles" ("is_published")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_articles_sort_order" ON "blog_articles" ("sort_order")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_articles_published_at" ON "blog_articles" ("published_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_article_images_article_id" ON "blog_article_images" ("article_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_article_images_is_cover" ON "blog_article_images" ("is_cover")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_articles_tags_article_id" ON "blog_articles_tags" ("article_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_articles_tags_tag_id" ON "blog_articles_tags" ("tag_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "public"."IDX_blog_articles_tags_tag_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_blog_articles_tags_article_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_blog_article_images_is_cover"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_blog_article_images_article_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_blog_articles_published_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_blog_articles_sort_order"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_blog_articles_is_published"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_blog_articles_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_blog_tags_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_blog_tags_name"`);

    // Drop tables in reverse order (respecting FK constraints)
    await queryRunner.query(`DROP TABLE "blog_articles_tags"`);
    await queryRunner.query(`DROP TABLE "blog_article_images"`);
    await queryRunner.query(`DROP TABLE "blog_articles"`);
    await queryRunner.query(`DROP TABLE "blog_tags"`);
  }
}
