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
import { AboutSectionsService } from './about-sections.service';
import { UpdateAboutSectionDto } from './dto/update-about-section.dto';
import { CreateAboutSectionWithUploadDto } from './dto/create-about-section-with-upload.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * AboutSections controller - handles HTTP requests for about page sections
 */
@ApiTags('about-sections')
@Controller('about-sections')
export class AboutSectionsController {
  private readonly logger = new Logger(AboutSectionsController.name);

  constructor(private readonly aboutSectionsService: AboutSectionsService) {}

  /**
   * Create a new about section with image upload
   */
  @Post('with-upload')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new about section with image upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'paragraphs', 'imageAlt', 'image'],
      properties: {
        title: {
          type: 'string',
          maxLength: 255,
          example: 'Our Story',
        },
        paragraphs: {
          type: 'string',
          description: 'JSON string array of paragraphs',
          example: '["First paragraph.", "Second paragraph."]',
        },
        imageAlt: {
          type: 'string',
          maxLength: 255,
          example: 'Artisan working on a wall hanging',
        },
        sortOrder: {
          type: 'number',
          default: 0,
          example: 1,
        },
        isPublished: {
          type: 'boolean',
          default: false,
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Section image (max 5MB, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'About section created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or file validation failed',
  })
  async createWithUpload(
    @Body() createDto: CreateAboutSectionWithUploadDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    this.logger.log(
      'POST /api/about-sections/with-upload - Request received',
    );

    if (!file) {
      throw new BadRequestException('Image is required');
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;

    const result = await this.aboutSectionsService.createWithImage(
      createDto,
      file,
      baseUrl,
    );

    this.logger.log(`About section created successfully: ${result.id}`);
    return result;
  }

  /**
   * Get all published sections (public)
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all published about sections (sorted by sortOrder)',
  })
  @ApiResponse({
    status: 200,
    description: 'Published about sections retrieved successfully',
  })
  async findPublished() {
    return await this.aboutSectionsService.findPublished();
  }

  /**
   * Get all sections including unpublished (backoffice)
   */
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all about sections (including unpublished)' })
  @ApiResponse({
    status: 200,
    description: 'All about sections retrieved successfully',
  })
  async findAll() {
    return await this.aboutSectionsService.findAll();
  }

  /**
   * Get a single published section by ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get an about section by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'About section UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'About section found',
  })
  @ApiResponse({
    status: 404,
    description: 'About section not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.aboutSectionsService.findPublishedById(id);
  }

  /**
   * Update a section's text fields
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an about section' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'About section UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'About section updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'About section not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAboutSectionDto,
  ) {
    return await this.aboutSectionsService.update(id, updateDto);
  }

  /**
   * Replace a section's image
   */
  @Patch(':id/image')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Replace an about section image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'About section UUID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'New section image (max 5MB, JPEG/PNG/WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'About section image updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'About section not found',
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

    return await this.aboutSectionsService.updateImage(id, file, baseUrl);
  }

  /**
   * Delete a section and its image
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an about section' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'About section UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'About section deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'About section not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.aboutSectionsService.remove(id);
  }
}
