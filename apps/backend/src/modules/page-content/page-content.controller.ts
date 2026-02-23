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
  UploadedFile,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { PageContentService } from './page-content.service';
import { CreatePageContentDto } from './dto/create-page-content.dto';
import { CreatePageContentWithUploadDto } from './dto/create-page-content-with-upload.dto';
import { UpdatePageContentDto } from './dto/update-page-content.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * PageContent controller - handles HTTP requests for CMS page content
 */
@ApiTags('page-content')
@Controller('page-content')
export class PageContentController {
  private readonly logger = new Logger(PageContentController.name);

  constructor(private readonly pageContentService: PageContentService) {}

  /**
   * Get all entries including unpublished (backoffice)
   * Declared BEFORE parametric routes to avoid conflicts
   */
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all page content entries (including unpublished)',
  })
  @ApiResponse({
    status: 200,
    description: 'All page content entries retrieved successfully',
  })
  async findAll() {
    return await this.pageContentService.findAll();
  }

  /**
   * Create a new page content entry with image upload
   * Declared BEFORE parametric routes to avoid conflicts
   */
  @Post('with-upload')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Create a new page content entry with image upload',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['page', 'section'],
      properties: {
        page: {
          type: 'string',
          maxLength: 100,
          example: 'home',
        },
        section: {
          type: 'string',
          maxLength: 100,
          example: 'hero',
        },
        title: {
          type: 'string',
          maxLength: 255,
          example: 'Handcrafted Wall Art & Rugs',
        },
        content: {
          type: 'string',
          example: 'Discover our unique collection.',
        },
        imageAlt: {
          type: 'string',
          maxLength: 255,
          example: 'Hero background image',
        },
        metadata: {
          type: 'string',
          description: 'JSON string of extra data',
          example: '{"buttonText": "Explore"}',
        },
        sortOrder: {
          type: 'number',
          default: 0,
          example: 0,
        },
        isPublished: {
          type: 'boolean',
          default: true,
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Content image (max 5MB, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Page content created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or file validation failed',
  })
  async createWithUpload(
    @Body() createDto: CreatePageContentWithUploadDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    this.logger.log('POST /api/page-content/with-upload - Request received');

    if (!file) {
      throw new BadRequestException('Image is required');
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;

    const result = await this.pageContentService.createWithImage(
      createDto,
      file,
      baseUrl,
    );

    this.logger.log(`Page content created successfully: ${result.id}`);
    return result;
  }

  /**
   * Create a new page content entry (JSON, no image upload)
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new page content entry (JSON)' })
  @ApiResponse({
    status: 201,
    description: 'Page content created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() createDto: CreatePageContentDto) {
    return await this.pageContentService.create(createDto);
  }

  /**
   * Get all published sections for a page (public)
   */
  @Public()
  @Get(':page')
  @ApiOperation({
    summary: 'Get all published content for a page',
  })
  @ApiParam({
    name: 'page',
    type: 'string',
    description: 'Page identifier (e.g., "home", "wall-hanging")',
  })
  @ApiResponse({
    status: 200,
    description: 'Published page content retrieved successfully',
  })
  async findByPage(@Param('page') page: string) {
    return await this.pageContentService.findPublishedByPage(page);
  }

  /**
   * Get a specific published section (public)
   */
  @Public()
  @Get(':page/:section')
  @ApiOperation({
    summary: 'Get a specific published section of a page',
  })
  @ApiParam({
    name: 'page',
    type: 'string',
    description: 'Page identifier (e.g., "home")',
  })
  @ApiParam({
    name: 'section',
    type: 'string',
    description: 'Section identifier (e.g., "hero")',
  })
  @ApiResponse({
    status: 200,
    description: 'Page content section found',
  })
  @ApiResponse({
    status: 404,
    description: 'Page content section not found',
  })
  async findByPageAndSection(
    @Param('page') page: string,
    @Param('section') section: string,
  ) {
    return await this.pageContentService.findByPageAndSection(page, section);
  }

  /**
   * Update a page content entry's text fields
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a page content entry' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Page content UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Page content updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Page content not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePageContentDto,
  ) {
    return await this.pageContentService.update(id, updateDto);
  }

  /**
   * Replace a page content entry's image
   */
  @Patch(':id/image')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Replace a page content image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Page content UUID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'New content image (max 5MB, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Page content image updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Page content not found',
  })
  async updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;

    return await this.pageContentService.updateImage(id, file, baseUrl);
  }

  /**
   * Delete a page content entry and its image
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a page content entry' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Page content UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'Page content deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Page content not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.pageContentService.remove(id);
  }
}
