import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutSection } from '../../entities/about-section.entity';
import { CreateAboutSectionWithUploadDto } from './dto/create-about-section-with-upload.dto';
import { UpdateAboutSectionDto } from './dto/update-about-section.dto';
import { UploadService } from '../upload/upload.service';

/**
 * AboutSections service - handles business logic for about page sections
 */
@Injectable()
export class AboutSectionsService {
  private readonly logger = new Logger(AboutSectionsService.name);

  constructor(
    @InjectRepository(AboutSection)
    private readonly aboutSectionRepository: Repository<AboutSection>,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Create a new about section with uploaded image
   */
  async createWithImage(
    createDto: CreateAboutSectionWithUploadDto,
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<AboutSection> {
    await this.uploadService.ensureUploadDir('about-sections');

    this.logger.log('Creating about section with image');
    this.logger.debug(`Received DTO: ${JSON.stringify(createDto, null, 2)}`);
    this.logger.debug(`Uploaded file: ${file.filename} (${file.size} bytes)`);

    try {
      const imageUrl = this.uploadService.getFileUrl(
        file.filename,
        baseUrl,
        'about-sections',
      );

      const sectionData = {
        ...createDto,
        image: imageUrl,
      };

      const section = this.aboutSectionRepository.create(sectionData);
      const saved = await this.aboutSectionRepository.save(section);

      this.logger.log(`About section created successfully: ${saved.id}`);
      return saved;
    } catch (error) {
      // Clean up uploaded file if creation fails
      await this.uploadService
        .deleteFile(file.filename, 'about-sections')
        .catch((err) => {
          this.logger.warn(`Failed to clean up file: ${err.message}`);
        });

      this.logger.error(`Failed to create about section: ${error.message}`);
      throw new BadRequestException('Failed to create about section');
    }
  }

  /**
   * Find all published sections ordered by sortOrder (public)
   */
  async findPublished(): Promise<AboutSection[]> {
    return await this.aboutSectionRepository.find({
      where: { isPublished: true },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * Find all sections ordered by sortOrder (backoffice)
   */
  async findAll(): Promise<AboutSection[]> {
    return await this.aboutSectionRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * Find a published section by ID (public)
   */
  async findPublishedById(id: string): Promise<AboutSection> {
    const section = await this.aboutSectionRepository.findOne({
      where: { id, isPublished: true },
    });

    if (!section) {
      throw new NotFoundException(`About section with ID "${id}" not found`);
    }

    return section;
  }

  /**
   * Find a section by ID (any status, for internal/backoffice use)
   */
  async findById(id: string): Promise<AboutSection> {
    const section = await this.aboutSectionRepository.findOne({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException(`About section with ID "${id}" not found`);
    }

    return section;
  }

  /**
   * Update a section's text fields
   */
  async update(
    id: string,
    updateDto: UpdateAboutSectionDto,
  ): Promise<AboutSection> {
    const section = await this.findById(id);

    // Exclude image field - image updates go through updateImage
    const { image, ...safeUpdate } = updateDto as UpdateAboutSectionDto & {
      image?: string;
    };
    Object.assign(section, safeUpdate);

    try {
      const updated = await this.aboutSectionRepository.save(section);
      this.logger.log(`About section updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(
        `Failed to update about section ${id}: ${error.message}`,
      );
      throw new BadRequestException('Failed to update about section');
    }
  }

  /**
   * Replace a section's image
   */
  async updateImage(
    id: string,
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<AboutSection> {
    const section = await this.findById(id);

    await this.uploadService.ensureUploadDir('about-sections');

    // Delete old image
    const oldFilename = this.extractFilename(section.image);
    if (oldFilename) {
      await this.uploadService
        .deleteFile(oldFilename, 'about-sections')
        .catch((err) => {
          this.logger.warn(`Failed to delete old image: ${err.message}`);
        });
    }

    // Set new image URL
    section.image = this.uploadService.getFileUrl(
      file.filename,
      baseUrl,
      'about-sections',
    );

    const updated = await this.aboutSectionRepository.save(section);
    this.logger.log(`About section image updated: ${id}`);
    return updated;
  }

  /**
   * Delete a section and its image file
   */
  async remove(id: string): Promise<void> {
    const section = await this.findById(id);

    // Delete image file
    const filename = this.extractFilename(section.image);
    if (filename) {
      await this.uploadService
        .deleteFile(filename, 'about-sections')
        .catch((err) => {
          this.logger.warn(
            `Failed to delete image for section ${id}: ${err.message}`,
          );
        });
    }

    await this.aboutSectionRepository.remove(section);
    this.logger.log(`About section deleted successfully: ${id}`);
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
