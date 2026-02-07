import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductWithUploadDto } from './dto/create-product-with-upload.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Products controller - handles HTTP requests for products
 * Implements RESTful API endpoints with proper HTTP methods and status codes
 */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product (JSON format - without file upload)
   */
  @Post()
  @ApiOperation({ summary: 'Create a new product (JSON format)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() createDto: CreateProductDto) {
    return await this.productsService.create(createDto);
  }

  /**
   * Create a new product with image upload
   */
  @Post('with-upload')
  @UseInterceptors(FilesInterceptor('images', 5)) // Max 5 images
  @ApiOperation({ summary: 'Create a new product with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'category', 'price'],
      properties: {
        name: {
          type: 'string',
          maxLength: 255,
          example: 'Handwoven Wall Hanging',
        },
        description: {
          type: 'string',
          maxLength: 500,
          example: 'Beautiful handwoven wall hanging made with natural fibers',
        },
        category: {
          type: 'string',
          enum: ['wall-hanging', 'rug'],
          example: 'wall-hanging',
        },
        price: {
          type: 'number',
          example: 149.99,
        },
        status: {
          type: 'string',
          enum: ['available', 'sold', 'draft'],
          default: 'draft',
        },
        stockQuantity: {
          type: 'number',
          default: 0,
          example: 1,
        },
        dimensions: {
          type: 'string',
          description: 'JSON string of dimensions',
          example: '{"width": 50, "height": 70, "unit": "cm"}',
        },
        materials: {
          type: 'string',
          example: 'Cotton, wool, natural dyes',
        },
        showOnHome: {
          type: 'string',
          description:
            'JSON string array of booleans indicating which images to show on home page',
          example: '[true, false, true]',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images (max 5, max 5MB each, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully with uploaded images',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or file validation failed',
  })
  @ApiResponse({
    status: 413,
    description: 'File size exceeds limit (5MB)',
  })
  async createWithUpload(
    @Body() createDto: CreateProductWithUploadDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ) {
    this.logger.log('POST /api/products/with-upload - Request received');
    this.logger.debug(`Body: ${JSON.stringify(createDto, null, 2)}`);
    this.logger.debug(`Files: ${files ? files.length : 0} file(s) received`);

    // Validate that at least one image is uploaded
    if (!files || files.length === 0) {
      this.logger.warn('Request rejected: No images uploaded');
      throw new BadRequestException('At least one image is required');
    }

    // Get base URL for constructing image URLs
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    this.logger.debug(`Base URL: ${baseUrl}`);

    // Create product with uploaded images
    const result = await this.productsService.createWithImages(
      createDto,
      files,
      baseUrl,
    );

    this.logger.log(`Product created successfully: ${result.id}`);
    return result;
  }

  /**
   * Get all products with filters and pagination
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findAll(@Query() query: ProductQueryDto) {
    return await this.productsService.findAll(query);
  }

  /**
   * Get products by category (public endpoint)
   */
  @Public()
  @Get('category/:category')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({
    name: 'category',
    enum: ['wall-hanging', 'rug'],
    description: 'Product category',
  })
  @ApiResponse({
    status: 200,
    description: 'Products found',
  })
  async findByCategory(@Param('category') category: 'wall-hanging' | 'rug') {
    return await this.productsService.findByCategory(category);
  }

  /**
   * Get product statistics
   */
  @Public()
  @Get('statistics')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics() {
    return await this.productsService.getStatistics();
  }

  /**
   * Get images flagged for home page grid
   * IMPORTANT: This route must be defined BEFORE the :id route to avoid conflicts
   */
  @Public()
  @Get('home-grid')
  @ApiOperation({ summary: 'Get images flagged for home page grid' })
  @ApiResponse({
    status: 200,
    description: 'Home grid images retrieved',
  })
  async getHomeGridImages() {
    return await this.productsService.findHomeGridImages();
  }

  /**
   * Get a single product by ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Product UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product found',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productsService.findById(id);
  }

  /**
   * Update a product
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Product UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateDto);
  }

  /**
   * Delete a product
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Product UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productsService.remove(id);
  }

  /**
   * Add images to an existing product
   */
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiOperation({ summary: 'Add images to an existing product' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        showOnHome: {
          type: 'string',
          description:
            'JSON string array of booleans indicating which images to show on home page',
          example: '[true, false]',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images (max 5, max 5MB each, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'No images provided',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async addImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
    @Body('showOnHome') showOnHomeRaw?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;
    let showOnHomeFlags: boolean[] = [];
    if (showOnHomeRaw) {
      try {
        showOnHomeFlags = JSON.parse(showOnHomeRaw);
      } catch {
        // ignore parse errors
      }
    }

    return await this.productsService.addImagesToProduct(
      id,
      files,
      baseUrl,
      showOnHomeFlags,
    );
  }

  /**
   * Update image metadata (showOnHome, sortOrder)
   */
  @Patch(':id/images/:imageId')
  @ApiOperation({ summary: 'Update image metadata (showOnHome, sortOrder)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'imageId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Image metadata updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product image not found',
  })
  async updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    return await this.productsService.updateProductImage(imageId, dto);
  }

  /**
   * Remove an image from a product
   */
  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an image from a product' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'imageId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Image removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product image not found',
  })
  async removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    await this.productsService.removeProductImage(imageId);
  }
}
