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

/**
 * Products controller - handles HTTP requests for products
 * Implements RESTful API endpoints with proper HTTP methods and status codes
 */
@ApiTags('products')
@Controller('products')
export class ProductsController {
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
    // Validate that at least one image is uploaded
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    // Get base URL for constructing image URLs
    const baseUrl = `${request.protocol}://${request.get('host')}`;

    // Create product with uploaded images
    return await this.productsService.createWithImages(
      createDto,
      files,
      baseUrl,
    );
  }

  /**
   * Get all products with filters and pagination
   */
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
   * Get a single product by ID
   */
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
}
