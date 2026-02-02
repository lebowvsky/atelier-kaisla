import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

/**
 * Product service - handles business logic for products
 * Follows NestJS best practices with proper error handling and logging
 */
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new product
   */
  async create(createDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(createDto);
      const saved = await this.productRepository.save(product);

      this.logger.log(`Product created successfully: ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw new BadRequestException('Failed to create product');
    }
  }

  /**
   * Find all products with optional filters and pagination
   */
  async findAll(query: ProductQueryDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { category, status, search, page = 1, limit = 10 } = query;

    // Build query
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply filters
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by creation date (newest first)
    queryBuilder.orderBy('product.createdAt', 'DESC');

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    this.logger.log(
      `Found ${data.length} products (page ${page}/${totalPages})`,
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find products by category (public endpoint)
   */
  async findByCategory(category: 'wall-hanging' | 'rug'): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        category,
        status: 'available', // Only show available products
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find a product by ID
   */
  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  /**
   * Update a product
   */
  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    // Merge updates
    Object.assign(product, updateDto);

    try {
      const updated = await this.productRepository.save(product);
      this.logger.log(`Product updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update product ${id}: ${error.message}`);
      throw new BadRequestException('Failed to update product');
    }
  }

  /**
   * Delete a product
   */
  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    this.logger.log(`Product deleted successfully: ${id}`);
  }

  /**
   * Get products count by category
   */
  async getStatistics(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const [total, wallHangings, rugs, available, sold, draft] =
      await Promise.all([
        this.productRepository.count(),
        this.productRepository.count({
          where: { category: 'wall-hanging' },
        }),
        this.productRepository.count({ where: { category: 'rug' } }),
        this.productRepository.count({ where: { status: 'available' } }),
        this.productRepository.count({ where: { status: 'sold' } }),
        this.productRepository.count({ where: { status: 'draft' } }),
      ]);

    return {
      total,
      byCategory: {
        'wall-hanging': wallHangings,
        rug: rugs,
      },
      byStatus: {
        available,
        sold,
        draft,
      },
    };
  }
}
