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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ContactLinksService } from './contact-links.service';
import { CreateContactLinkDto } from './dto/create-contact-link.dto';
import { UpdateContactLinkDto } from './dto/update-contact-link.dto';
import { ContactLink } from '../../entities/contact-link.entity';
import { Public } from '../auth/decorators/public.decorator';

/**
 * ContactLinks controller - handles HTTP requests for contact and social media links
 */
@ApiTags('contact-links')
@Controller('contact-links')
export class ContactLinksController {
  constructor(private readonly contactLinksService: ContactLinksService) {}

  /**
   * Create a new contact link (authenticated)
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new contact link' })
  @ApiResponse({
    status: 201,
    description: 'Contact link created successfully',
    type: ContactLink,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() createDto: CreateContactLinkDto) {
    return await this.contactLinksService.create(createDto);
  }

  /**
   * Get all active contact links (public)
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all active contact links (sorted by sortOrder)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active contact links retrieved successfully',
    type: [ContactLink],
  })
  async findActive() {
    return await this.contactLinksService.findActive();
  }

  /**
   * Get all contact links including inactive (backoffice)
   */
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all contact links (including inactive)',
  })
  @ApiResponse({
    status: 200,
    description: 'All contact links retrieved successfully',
    type: [ContactLink],
  })
  async findAll() {
    return await this.contactLinksService.findAll();
  }

  /**
   * Get a single contact link by ID (public)
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a contact link by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Contact link UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact link found',
    type: ContactLink,
  })
  @ApiResponse({
    status: 404,
    description: 'Contact link not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.contactLinksService.findById(id);
  }

  /**
   * Update a contact link (authenticated)
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a contact link' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Contact link UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact link updated successfully',
    type: ContactLink,
  })
  @ApiResponse({
    status: 404,
    description: 'Contact link not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateContactLinkDto,
  ) {
    return await this.contactLinksService.update(id, updateDto);
  }

  /**
   * Delete a contact link (authenticated)
   */
  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a contact link' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Contact link UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'Contact link deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact link not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.contactLinksService.remove(id);
  }
}
