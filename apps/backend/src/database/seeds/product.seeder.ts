import { Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import {
  wallHangingProducts,
  rugProducts,
} from './data/products.data';

/**
 * Product Seeder
 * Seeds the database with realistic sample products for wall-hanging and rug categories
 */
export class ProductSeeder {
  private readonly logger = new Logger(ProductSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Run the seeder
   * @param clean - If true, removes all existing products before seeding
   */
  async run(clean: boolean = false): Promise<void> {
    this.logger.log('Starting product seeder...');

    const productRepository = this.dataSource.getRepository(Product);

    try {
      // Clean existing data if requested
      if (clean) {
        this.logger.log('Cleaning existing products...');
        await productRepository.clear();
        this.logger.log('All existing products removed');
      }

      // Seed wall-hanging products
      const wallHangings = await this.seedProducts(
        productRepository,
        wallHangingProducts,
      );
      this.logger.log(
        `Created ${wallHangings.length} wall-hanging products`,
      );

      // Seed rug products
      const rugs = await this.seedProducts(productRepository, rugProducts);
      this.logger.log(`Created ${rugs.length} rug products`);

      // Display statistics
      const stats = await this.getStatistics(productRepository);
      this.logger.log('\n========================================');
      this.logger.log('Seeding Statistics:');
      this.logger.log(`Total products: ${stats.total}`);
      this.logger.log(`Wall hangings: ${stats.wallHangings}`);
      this.logger.log(`Rugs: ${stats.rugs}`);
      this.logger.log(`Available: ${stats.available}`);
      this.logger.log(`Sold: ${stats.sold}`);
      this.logger.log(`Draft: ${stats.draft}`);
      this.logger.log('========================================');

      this.logger.log(
        `\nSeeding completed successfully! Total products: ${wallHangings.length + rugs.length}`,
      );
    } catch (error) {
      this.logger.error(`Seeding failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Seed products from data array
   */
  private async seedProducts(
    repository: Repository<Product>,
    data: any[],
  ): Promise<Product[]> {
    const products = repository.create(data);
    return await repository.save(products);
  }

  /**
   * Get statistics about seeded products
   */
  private async getStatistics(
    repository: Repository<Product>,
  ): Promise<{
    total: number;
    wallHangings: number;
    rugs: number;
    available: number;
    sold: number;
    draft: number;
  }> {
    const [total, wallHangings, rugs, available, sold, draft] =
      await Promise.all([
        repository.count(),
        repository.count({ where: { category: 'wall-hanging' } }),
        repository.count({ where: { category: 'rug' } }),
        repository.count({ where: { status: 'available' } }),
        repository.count({ where: { status: 'sold' } }),
        repository.count({ where: { status: 'draft' } }),
      ]);

    return {
      total,
      wallHangings,
      rugs,
      available,
      sold,
      draft,
    };
  }
}
