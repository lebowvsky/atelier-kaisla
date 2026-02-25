import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { BlogService } from './blog.service';
import { CreateBlogArticleWithUploadDto } from './dto/create-blog-article-with-upload.dto';
import { UpdateBlogArticleDto } from './dto/update-blog-article.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { UpdateBlogTagDto } from './dto/update-blog-tag.dto';
import { UpdateBlogArticleImageDto } from './dto/update-blog-article-image.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Blog controller - handles HTTP requests for blog articles, images, and tags
 */
@ApiTags('blog')
@Controller('blog')
export class BlogController {
  private readonly logger = new Logger(BlogController.name);

  constructor(private readonly blogService: BlogService) {}

  // ──────────────────────────────────────────────
  // Tag endpoints (BEFORE :id routes to avoid conflicts)
  // ──────────────────────────────────────────────

  /**
   * Get all tags (public)
   */
  @Public()
  @Get('tags')
  @ApiOperation({ summary: 'Get all blog tags' })
  @ApiResponse({
    status: 200,
    description: 'Blog tags retrieved successfully',
  })
  async findAllTags() {
    return await this.blogService.findAllTags();
  }

  /**
   * Create a new tag (protected)
   */
  @Post('tags')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog tag' })
  @ApiResponse({
    status: 201,
    description: 'Blog tag created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Tag with this name already exists',
  })
  async createTag(@Body() createDto: CreateBlogTagDto) {
    return await this.blogService.createTag(createDto);
  }

  /**
   * Update a tag (protected)
   */
  @Patch('tags/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog tag' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Blog tag UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog tag updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog tag not found',
  })
  async updateTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBlogTagDto,
  ) {
    return await this.blogService.updateTag(id, updateDto);
  }

  /**
   * Delete a tag (protected)
   */
  @Delete('tags/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a blog tag' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Blog tag UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'Blog tag deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog tag not found',
  })
  async removeTag(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogService.removeTag(id);
  }

  // ──────────────────────────────────────────────
  // Article endpoints
  // ──────────────────────────────────────────────

  /**
   * Create a new blog article with image upload
   */
  @Post('with-upload')
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Create a new blog article with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'content'],
      properties: {
        title: {
          type: 'string',
          maxLength: 255,
          example: 'The Art of Wall Hanging',
        },
        subtitle: {
          type: 'string',
          maxLength: 255,
          example: 'Exploring techniques and traditions',
        },
        content: {
          type: 'string',
          description: 'HTML content from Tiptap editor',
          example: '<p>This is a blog article.</p>',
        },
        slug: {
          type: 'string',
          maxLength: 255,
          description:
            'URL-friendly slug (auto-generated from title if not provided)',
          example: 'the-art-of-wall-hanging',
        },
        publishedAt: {
          type: 'string',
          format: 'date-time',
          example: '2026-02-25T10:00:00.000Z',
        },
        isPublished: {
          type: 'boolean',
          default: false,
        },
        sortOrder: {
          type: 'number',
          default: 0,
          example: 1,
        },
        tagIds: {
          type: 'string',
          description: 'JSON string array of tag UUIDs',
          example: '["550e8400-e29b-41d4-a716-446655440000"]',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Article images (max 10, max 5MB each, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Blog article created successfully with uploaded images',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or file validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Article with this slug already exists',
  })
  async createWithUpload(
    @Body() createDto: CreateBlogArticleWithUploadDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ) {
    this.logger.log('POST /api/blog/with-upload - Request received');
    this.logger.debug(`Body: ${JSON.stringify(createDto, null, 2)}`);
    this.logger.debug(`Files: ${files ? files.length : 0} file(s) received`);

    const baseUrl = `${request.protocol}://${request.get('host')}`;
    this.logger.debug(`Base URL: ${baseUrl}`);

    const result = await this.blogService.createWithImages(
      createDto,
      files || [],
      baseUrl,
    );

    this.logger.log(`Blog article created successfully: ${result.id}`);
    return result;
  }

  /**
   * Get all published articles (public)
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all published blog articles (sorted by publishedAt DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Published blog articles retrieved successfully',
  })
  async findPublished() {
    return await this.blogService.findPublished();
  }

  /**
   * Get all articles including unpublished (backoffice)
   * IMPORTANT: Must be defined BEFORE :id route to avoid conflicts
   */
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all blog articles (including unpublished)',
  })
  @ApiResponse({
    status: 200,
    description: 'All blog articles retrieved successfully',
  })
  async findAll() {
    return await this.blogService.findAll();
  }

  /**
   * Get a single blog article by ID (public)
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a blog article by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Blog article UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog article found',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog article not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.blogService.findById(id);
  }

  /**
   * Update a blog article (protected)
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog article' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Blog article UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog article updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog article not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBlogArticleDto,
  ) {
    return await this.blogService.update(id, updateDto);
  }

  /**
   * Delete a blog article (protected)
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a blog article' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Blog article UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'Blog article deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog article not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogService.remove(id);
  }

  // ──────────────────────────────────────────────
  // Image endpoints
  // ──────────────────────────────────────────────

  /**
   * Add images to an existing blog article
   */
  @Post(':id/images')
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Add images to an existing blog article' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Article images (max 10, max 5MB each, JPEG/PNG/WebP)',
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
    description: 'Blog article not found',
  })
  async addImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;

    return await this.blogService.addImages(id, files, baseUrl);
  }

  /**
   * Update image metadata (altText, isCover, sortOrder)
   */
  @Patch(':id/images/:imageId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update blog article image metadata (altText, isCover, sortOrder)',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'imageId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Image metadata updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog article image not found',
  })
  async updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: UpdateBlogArticleImageDto,
  ) {
    return await this.blogService.updateImage(id, imageId, dto);
  }

  /**
   * Remove an image from a blog article
   */
  @Delete(':id/images/:imageId')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an image from a blog article' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'imageId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Image removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog article image not found',
  })
  async removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    await this.blogService.removeImage(id, imageId);
  }
}
