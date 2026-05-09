import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as sanitizeHtml from 'sanitize-html';
import { PageContent } from '../../entities/page-content.entity';
import { PageContentBlock } from '../../entities/page-content-block.entity';
import { CreatePageContentDto } from './dto/create-page-content.dto';
import { CreatePageContentWithUploadDto } from './dto/create-page-content-with-upload.dto';
import { UpdatePageContentDto } from './dto/update-page-content.dto';
import { PageContentBlockDto } from './dto/page-content-block.dto';
import { UploadService } from '../upload/upload.service';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'hr'],
  allowedAttributes: {},
};

/**
 * PageContent service - handles business logic for CMS page content
 */
@Injectable()
export class PageContentService {
  private readonly logger = new Logger(PageContentService.name);

  constructor(
    @InjectRepository(PageContent)
    private readonly pageContentRepository: Repository<PageContent>,
    @InjectRepository(PageContentBlock)
    private readonly pageContentBlockRepository: Repository<PageContentBlock>,
    private readonly dataSource: DataSource,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Sanitize HTML content to allow only safe TipTap tags
   */
  private sanitizeContent(content?: string): string | undefined {
    if (!content) return content;
    return sanitizeHtml(content, SANITIZE_OPTIONS);
  }

  /**
   * Build child block entities from incoming DTOs, normalizing sortOrder.
   */
  private buildBlocks(
    blockDtos: PageContentBlockDto[] | undefined,
  ): PageContentBlock[] {
    if (!blockDtos || blockDtos.length === 0) {
      return [];
    }

    return blockDtos.map((dto, index) => {
      const block = this.pageContentBlockRepository.create({
        title: dto.title,
        description: dto.description,
        sortOrder: dto.sortOrder ?? index,
      });
      return block;
    });
  }

  /**
   * Create a new page content entry with uploaded image
   */
  async createWithImage(
    createDto: CreatePageContentWithUploadDto,
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<PageContent> {
    await this.uploadService.ensureUploadDir('page-content');

    this.logger.log('Creating page content with image');
    this.logger.debug(`Received DTO: ${JSON.stringify(createDto, null, 2)}`);
    this.logger.debug(`Uploaded file: ${file.filename} (${file.size} bytes)`);

    try {
      const imageUrl = this.uploadService.getFileUrl(
        file.filename,
        baseUrl,
        'page-content',
      );

      const { blocks: blockDtos, ...rest } = createDto;
      const contentData = {
        ...rest,
        content: this.sanitizeContent(createDto.content),
        image: imageUrl,
      };

      const entry = this.pageContentRepository.create(contentData);
      entry.blocks = this.buildBlocks(blockDtos);

      const saved = await this.pageContentRepository.save(entry);

      this.logger.log(`Page content created successfully: ${saved.id}`);
      return await this.findById(saved.id);
    } catch (error) {
      // Clean up uploaded file if creation fails
      await this.uploadService
        .deleteFile(file.filename, 'page-content')
        .catch((err) => {
          this.logger.warn(`Failed to clean up file: ${err.message}`);
        });

      this.logger.error(`Failed to create page content: ${error.message}`);
      throw new BadRequestException('Failed to create page content');
    }
  }

  /**
   * Create a new page content entry (JSON, no upload)
   */
  async create(createDto: CreatePageContentDto): Promise<PageContent> {
    this.logger.log('Creating page content');
    this.logger.debug(`Received DTO: ${JSON.stringify(createDto, null, 2)}`);

    try {
      const { blocks: blockDtos, ...rest } = createDto;
      const entry = this.pageContentRepository.create({
        ...rest,
        content: this.sanitizeContent(createDto.content),
      });
      entry.blocks = this.buildBlocks(blockDtos);

      const saved = await this.pageContentRepository.save(entry);

      this.logger.log(`Page content created successfully: ${saved.id}`);
      return await this.findById(saved.id);
    } catch (error) {
      this.logger.error(`Failed to create page content: ${error.message}`);
      throw new BadRequestException('Failed to create page content');
    }
  }

  /**
   * Find all published sections for a given page (public)
   */
  async findPublishedByPage(page: string): Promise<PageContent[]> {
    return await this.pageContentRepository.find({
      where: { page, isPublished: true },
      relations: { blocks: true },
      order: {
        sortOrder: 'ASC',
        blocks: { sortOrder: 'ASC' },
      },
    });
  }

  /**
   * Find a specific published section by page and section key (public)
   */
  async findByPageAndSection(
    page: string,
    section: string,
  ): Promise<PageContent> {
    const entry = await this.pageContentRepository.findOne({
      where: { page, section, isPublished: true },
      relations: { blocks: true },
      order: {
        blocks: { sortOrder: 'ASC' },
      },
    });

    if (!entry) {
      throw new NotFoundException(
        `Page content "${page}/${section}" not found`,
      );
    }

    return entry;
  }

  /**
   * Find all entries (backoffice), sorted by page then sortOrder
   */
  async findAll(): Promise<PageContent[]> {
    return await this.pageContentRepository.find({
      relations: { blocks: true },
      order: {
        page: 'ASC',
        sortOrder: 'ASC',
        blocks: { sortOrder: 'ASC' },
      },
    });
  }

  /**
   * Find a single entry by ID (internal/backoffice)
   */
  async findById(id: string): Promise<PageContent> {
    const entry = await this.pageContentRepository.findOne({
      where: { id },
      relations: { blocks: true },
      order: {
        blocks: { sortOrder: 'ASC' },
      },
    });

    if (!entry) {
      throw new NotFoundException(`Page content with ID "${id}" not found`);
    }

    return entry;
  }

  /**
   * Update a page content entry's text fields.
   * If `blocks` is provided in the DTO (even an empty array), all existing
   * child blocks are replaced atomically with the new ones.
   */
  async update(
    id: string,
    updateDto: UpdatePageContentDto,
  ): Promise<PageContent> {
    const entry = await this.findById(id);

    // Exclude image and blocks from the simple field assignment
    const {
      image: _image,
      blocks: blockDtos,
      ...safeUpdate
    } = updateDto as UpdatePageContentDto & { image?: string };

    if (safeUpdate.content) {
      safeUpdate.content = this.sanitizeContent(safeUpdate.content);
    }
    Object.assign(entry, safeUpdate);

    const blocksProvided = blockDtos !== undefined;

    try {
      await this.dataSource.transaction(async (manager) => {
        // Persist scalar field changes first
        await manager.save(PageContent, entry);

        if (blocksProvided) {
          // Replace strategy: drop all existing children, insert the new set
          await manager.delete(PageContentBlock, { pageContentId: id });

          const newBlocks = (blockDtos ?? []).map((dto, index) =>
            manager.create(PageContentBlock, {
              pageContentId: id,
              title: dto.title,
              description: dto.description,
              sortOrder: dto.sortOrder ?? index,
            }),
          );

          if (newBlocks.length > 0) {
            await manager.save(PageContentBlock, newBlocks);
          }
        }
      });

      this.logger.log(`Page content updated successfully: ${id}`);
      return await this.findById(id);
    } catch (error) {
      this.logger.error(
        `Failed to update page content ${id}: ${error.message}`,
      );
      throw new BadRequestException('Failed to update page content');
    }
  }

  /**
   * Replace a page content entry's image
   */
  async updateImage(
    id: string,
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<PageContent> {
    const entry = await this.findById(id);

    await this.uploadService.ensureUploadDir('page-content');

    // Delete old image if exists
    if (entry.image) {
      const oldFilename = this.extractFilename(entry.image);
      if (oldFilename) {
        await this.uploadService
          .deleteFile(oldFilename, 'page-content')
          .catch((err) => {
            this.logger.warn(`Failed to delete old image: ${err.message}`);
          });
      }
    }

    // Set new image URL
    entry.image = this.uploadService.getFileUrl(
      file.filename,
      baseUrl,
      'page-content',
    );

    const updated = await this.pageContentRepository.save(entry);
    this.logger.log(`Page content image updated: ${id}`);
    return updated;
  }

  /**
   * Delete a page content entry and its image file
   */
  async remove(id: string): Promise<void> {
    const entry = await this.findById(id);

    // Delete image file if exists
    if (entry.image) {
      const filename = this.extractFilename(entry.image);
      if (filename) {
        await this.uploadService
          .deleteFile(filename, 'page-content')
          .catch((err) => {
            this.logger.warn(
              `Failed to delete image for page content ${id}: ${err.message}`,
            );
          });
      }
    }

    await this.pageContentRepository.remove(entry);
    this.logger.log(`Page content deleted successfully: ${id}`);
  }

  /**
   * Extract filename from a full image URL
   */
  private extractFilename(imageUrl: string): string | null {
    try {
      const parts = imageUrl.split('/');
      return parts[parts.length - 1] || null;
    } catch {
      return null;
    }
  }
}
