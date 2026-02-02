import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1770072119289 implements MigrationInterface {
  name = 'InitialSchema1770072119289';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."products_category_enum" AS ENUM('wall-hanging', 'rug')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('available', 'sold', 'draft')`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying(500), "category" "public"."products_category_enum" NOT NULL, "price" numeric(10,2) NOT NULL, "status" "public"."products_status_enum" NOT NULL DEFAULT 'draft', "stockQuantity" integer NOT NULL DEFAULT '0', "images" text, "dimensions" json, "materials" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3932231d2385ac248d0888d95" ON "products" ("category") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1846199852a695713b1f8f5e9a" ON "products" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8d31efd037a7a90fc8a5616df7" ON "products" ("category", "status") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8d31efd037a7a90fc8a5616df7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1846199852a695713b1f8f5e9a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3932231d2385ac248d0888d95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."products_category_enum"`);
  }
}
