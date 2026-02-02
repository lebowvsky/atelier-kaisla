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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

/**
 * Products controller - handles HTTP requests for products
 * Implements RESTful API endpoints with proper HTTP methods and status codes
 */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product
   */
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
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
