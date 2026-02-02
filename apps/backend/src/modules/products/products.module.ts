import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../../entities/product.entity';

/**
 * Products module
 * Encapsulates all product-related functionality
 */
@Module({
  imports: [
    // Import the Product entity for this module
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export service if needed by other modules
})
export class ProductsModule {}
