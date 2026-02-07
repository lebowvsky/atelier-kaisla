import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersAboutSectionsContactLinks1770200000000 implements MigrationInterface {
  name = 'AddUsersAboutSectionsContactLinks1770200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === Users table ===
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'editor')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying(100) NOT NULL,
        "password" character varying(255) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'editor',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_username" ON "users" ("username")`,
    );

    // === About sections table ===
    await queryRunner.query(
      `CREATE TABLE "about_sections" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "paragraphs" jsonb NOT NULL,
        "image" character varying(500) NOT NULL,
        "image_alt" character varying(255) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_published" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_about_sections_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_about_sections_sort_order" ON "about_sections" ("sort_order")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_about_sections_is_published" ON "about_sections" ("is_published")`,
    );

    // === Contact links table ===
    await queryRunner.query(
      `CREATE TYPE "public"."contact_links_platform_enum" AS ENUM('email', 'facebook', 'instagram', 'tiktok', 'linkedin', 'pinterest', 'youtube', 'twitter', 'website', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contact_links" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "platform" "public"."contact_links_platform_enum" NOT NULL,
        "url" character varying(500) NOT NULL,
        "label" character varying(255),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_contact_links_platform_url" UNIQUE ("platform", "url"),
        CONSTRAINT "PK_contact_links_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_contact_links_is_active_sort_order" ON "contact_links" ("is_active", "sort_order")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // === Drop contact links ===
    await queryRunner.query(
      `DROP INDEX "public"."IDX_contact_links_is_active_sort_order"`,
    );
    await queryRunner.query(`DROP TABLE "contact_links"`);
    await queryRunner.query(`DROP TYPE "public"."contact_links_platform_enum"`);

    // === Drop about sections ===
    await queryRunner.query(
      `DROP INDEX "public"."IDX_about_sections_is_published"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_about_sections_sort_order"`,
    );
    await queryRunner.query(`DROP TABLE "about_sections"`);

    // === Drop users ===
    await queryRunner.query(`DROP INDEX "public"."IDX_users_username"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
