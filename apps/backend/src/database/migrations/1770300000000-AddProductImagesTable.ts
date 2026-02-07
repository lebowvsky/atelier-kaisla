import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductImagesTable1770300000000 implements MigrationInterface {
  name = 'AddProductImagesTable1770300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === Create product_images table ===
    await queryRunner.query(
      `CREATE TABLE "product_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" character varying(500) NOT NULL,
        "showOnHome" boolean NOT NULL DEFAULT false,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "productId" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_images_id" PRIMARY KEY ("id")
      )`,
    );

    // === Create indexes ===
    await queryRunner.query(
      `CREATE INDEX "IDX_product_images_showOnHome" ON "product_images" ("showOnHome")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_images_productId" ON "product_images" ("productId")`,
    );

    // === Add foreign key constraint ===
    await queryRunner.query(
      `ALTER TABLE "product_images"
       ADD CONSTRAINT "FK_product_images_productId"
       FOREIGN KEY ("productId") REFERENCES "products"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // === Migrate existing data from products.images to product_images ===
    await queryRunner.query(
      `INSERT INTO "product_images" ("id", "url", "showOnHome", "sortOrder", "productId", "created_at")
       SELECT
         uuid_generate_v4(),
         TRIM(unnest(string_to_array(p."images", ','))),
         false,
         0,
         p."id",
         p."created_at"
       FROM "products" p
       WHERE p."images" IS NOT NULL AND p."images" != ''`,
    );

    // === Drop the old images column from products ===
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // === Recreate the images column on products ===
    await queryRunner.query(`ALTER TABLE "products" ADD "images" text`);

    // === Migrate data back from product_images to products.images ===
    await queryRunner.query(
      `UPDATE "products" p
       SET "images" = sub.image_list
       FROM (
         SELECT "productId", string_agg("url", ',' ORDER BY "sortOrder", "created_at")
           AS image_list
         FROM "product_images"
         GROUP BY "productId"
       ) sub
       WHERE p."id" = sub."productId"`,
    );

    // === Drop foreign key, indexes, and table ===
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "FK_product_images_productId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_images_productId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_images_showOnHome"`,
    );
    await queryRunner.query(`DROP TABLE "product_images"`);
  }
}
