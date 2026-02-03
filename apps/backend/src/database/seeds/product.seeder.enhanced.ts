import { Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { wallHangingProducts, rugProducts } from './data/products.data';

/**
 * Enhanced Product Seeder with duplicate prevention
 *
 * Features:
 * - Prevents duplicate products based on name
 * - Updates existing products instead of creating duplicates
 * - Provides detailed logging of operations
 * - Supports both append and clean modes
 */
export class EnhancedProductSeeder {
  private readonly logger = new Logger(EnhancedProductSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Run the seeder
   * @param clean - If true, removes all existing products before seeding
   * @param preventDuplicates - If true, checks for existing products before inserting
   */
  async run(
    clean: boolean = false,
    preventDuplicates: boolean = true,
  ): Promise<void> {
    this.logger.log('Starting enhanced product seeder...');
    this.logger.log(`Clean mode: ${clean ? 'ENABLED' : 'DISABLED'}`);
    this.logger.log(
      `Duplicate prevention: ${preventDuplicates ? 'ENABLED' : 'DISABLED'}`,
    );

    const productRepository = this.dataSource.getRepository(Product);

    try {
      // Clean existing data if requested
      if (clean) {
        this.logger.log('Cleaning existing products...');
        const deleteResult = await productRepository.delete({});
        this.logger.log(
          `Removed ${deleteResult.affected || 0} existing products`,
        );
      }

      // Seed wall-hanging products
      const wallHangings = await this.seedProducts(
        productRepository,
        wallHangingProducts,
        'wall-hanging',
        preventDuplicates,
      );

      // Seed rug products
      const rugs = await this.seedProducts(
        productRepository,
        rugProducts,
        'rug',
        preventDuplicates,
      );

      // Display statistics
      const stats = await this.getStatistics(productRepository);
      this.displayStatistics(stats, wallHangings, rugs);

      this.logger.log('\n✓ Seeding completed successfully!');
    } catch (error) {
      this.logger.error(`Seeding failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Seed products from data array with duplicate prevention
   */
  private async seedProducts(
    repository: Repository<Product>,
    data: any[],
    category: string,
    preventDuplicates: boolean,
  ): Promise<{
    created: number;
    updated: number;
    skipped: number;
    total: number;
  }> {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    this.logger.log(`\nProcessing ${data.length} ${category} products...`);

    for (const item of data) {
      if (preventDuplicates) {
        // Check if product already exists by name
        const existing = await repository.findOne({
          where: { name: item.name },
        });

        if (existing) {
          // Update existing product
          const hasChanges = this.hasChanges(existing, item);

          if (hasChanges) {
            Object.assign(existing, item);
            await repository.save(existing);
            updated++;
            this.logger.log(`  ↻ Updated: "${item.name}" (${existing.id})`);
          } else {
            skipped++;
            this.logger.log(`  ⊘ Skipped: "${item.name}" (no changes)`);
          }
        } else {
          // Create new product
          const product = repository.create(item);
          await repository.save(product);
          created++;
          this.logger.log(`  + Created: "${item.name}"`);
        }
      } else {
        // No duplicate check, just insert
        const product = repository.create(item);
        await repository.save(product);
        created++;
      }
    }

    const result = {
      created,
      updated,
      skipped,
      total: created + updated,
    };

    this.logger.log(`\n${category} summary:`);
    this.logger.log(`  Created: ${created}`);
    this.logger.log(`  Updated: ${updated}`);
    this.logger.log(`  Skipped: ${skipped}`);

    return result;
  }

  /**
   * Check if there are changes between existing and new data
   */
  private hasChanges(existing: Product, newData: any): boolean {
    // Compare key fields
    const fieldsToCompare = [
      'description',
      'price',
      'status',
      'stockQuantity',
      'materials',
    ];

    for (const field of fieldsToCompare) {
      if (existing[field] !== newData[field]) {
        return true;
      }
    }

    // Compare images array
    if (
      JSON.stringify(existing.images || []) !==
      JSON.stringify(newData.images || [])
    ) {
      return true;
    }

    // Compare dimensions
    if (
      JSON.stringify(existing.dimensions || {}) !==
      JSON.stringify(newData.dimensions || {})
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get statistics about seeded products
   */
  private async getStatistics(repository: Repository<Product>): Promise<{
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

  /**
   * Display statistics in a formatted way
   */
  private displayStatistics(
    stats: any,
    wallHangingResult: any,
    rugResult: any,
  ): void {
    this.logger.log('\n========================================');
    this.logger.log('  Seeding Statistics');
    this.logger.log('========================================');
    this.logger.log('\nDatabase totals:');
    this.logger.log(`  Total products: ${stats.total}`);
    this.logger.log(`  Wall hangings: ${stats.wallHangings}`);
    this.logger.log(`  Rugs: ${stats.rugs}`);
    this.logger.log('\nBy status:');
    this.logger.log(`  Available: ${stats.available}`);
    this.logger.log(`  Sold: ${stats.sold}`);
    this.logger.log(`  Draft: ${stats.draft}`);
    this.logger.log('\nThis seeding operation:');
    this.logger.log(
      `  Created: ${wallHangingResult.created + rugResult.created}`,
    );
    this.logger.log(
      `  Updated: ${wallHangingResult.updated + rugResult.updated}`,
    );
    this.logger.log(
      `  Skipped: ${wallHangingResult.skipped + rugResult.skipped}`,
    );
    this.logger.log('========================================');
  }
}
