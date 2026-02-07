import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductWithUploadDto } from './dto/create-product-with-upload.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { UploadService } from '../upload/upload.service';

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
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly uploadService: UploadService,
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
   * Create a new product with uploaded images
   */
  async createWithImages(
    createDto: CreateProductWithUploadDto,
    files: Express.Multer.File[],
    baseUrl: string,
  ): Promise<Product> {
    await this.uploadService.ensureUploadDir();

    this.logger.log(`Creating product with ${files.length} image(s)`);
    this.logger.debug(`Received DTO: ${JSON.stringify(createDto, null, 2)}`);
    this.logger.debug(
      `Uploaded files: ${files.map((f) => `${f.filename} (${f.size} bytes)`).join(', ')}`,
    );

    try {
      // Parse showOnHome flags
      const showOnHomeFlags = createDto.showOnHome || [];

      // Create the product first (without showOnHome metadata)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { showOnHome: _showOnHome, ...productData } = createDto;
      const product = this.productRepository.create(productData);
      const savedProduct = await this.productRepository.save(product);

      // Create ProductImage entities
      const productImages = files.map((file, index) => {
        const url = this.uploadService.getFileUrl(file.filename, baseUrl);
        this.logger.debug(`Generated URL for ${file.filename}: ${url}`);
        return this.productImageRepository.create({
          url,
          showOnHome: showOnHomeFlags[index] || false,
          sortOrder: index,
          productId: savedProduct.id,
        });
      });

      await this.productImageRepository.save(productImages);

      this.logger.log(
        `Product created successfully with ${files.length} image(s): ${savedProduct.id}`,
      );

      // Return product with images loaded
      return await this.findById(savedProduct.id);
    } catch (error) {
      // Clean up uploaded files if product creation fails
      const filenames = files.map((file) => file.filename);
      await this.uploadService.deleteFiles(filenames);

      this.logger.error(`Failed to create product: ${error.message}`);

      // If it's a validation error, provide more details
      if (error.response?.message) {
        throw new BadRequestException(error.response.message);
      }

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
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productImages', 'productImages');

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
   * Delete a product and clean up associated image files
   */
  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productImages'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Delete physical image files
    if (product.productImages?.length > 0) {
      for (const image of product.productImages) {
        try {
          const filename = image.url.split('/').pop();
          if (filename) {
            await this.uploadService.deleteFile(filename);
          }
        } catch (error) {
          this.logger.warn(`Failed to delete image file: ${error.message}`);
        }
      }
    }

    await this.productRepository.delete(id);
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

  /**
   * Find images flagged for home page grid display
   */
  async findHomeGridImages(): Promise<ProductImage[]> {
    return this.productImageRepository.find({
      where: { showOnHome: true },
      relations: ['product'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Update metadata (showOnHome, sortOrder) for a product image
   */
  async updateProductImage(
    imageId: string,
    dto: UpdateProductImageDto,
  ): Promise<ProductImage> {
    const image = await this.productImageRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(
        `Product image with ID "${imageId}" not found`,
      );
    }

    Object.assign(image, dto);
    return this.productImageRepository.save(image);
  }

  /**
   * Add images to an existing product
   */
  async addImagesToProduct(
    productId: string,
    files: Express.Multer.File[],
    baseUrl: string,
    showOnHomeFlags: boolean[] = [],
  ): Promise<ProductImage[]> {
    // Verify product exists
    await this.findById(productId);
    await this.uploadService.ensureUploadDir();

    // Get current max sortOrder for this product
    const existingImages = await this.productImageRepository.find({
      where: { productId },
      order: { sortOrder: 'DESC' },
      take: 1,
    });
    const startSortOrder =
      existingImages.length > 0 ? existingImages[0].sortOrder + 1 : 0;

    const productImages = files.map((file, index) => {
      const url = this.uploadService.getFileUrl(file.filename, baseUrl);
      return this.productImageRepository.create({
        url,
        showOnHome: showOnHomeFlags[index] || false,
        sortOrder: startSortOrder + index,
        productId,
      });
    });

    return this.productImageRepository.save(productImages);
  }

  /**
   * Remove a single image from a product, including the physical file
   */
  async removeProductImage(imageId: string): Promise<void> {
    const image = await this.productImageRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(
        `Product image with ID "${imageId}" not found`,
      );
    }

    // Extract filename from URL and delete the file
    try {
      const filename = image.url.split('/').pop();
      if (filename) {
        await this.uploadService.deleteFile(filename);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete image file: ${error.message}`);
    }

    await this.productImageRepository.remove(image);
  }
}
