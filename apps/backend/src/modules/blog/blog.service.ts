import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as sanitizeHtml from 'sanitize-html';
import { BlogArticle } from '../../entities/blog-article.entity';
import { BlogArticleImage } from '../../entities/blog-article-image.entity';
import { BlogTag } from '../../entities/blog-tag.entity';
import { CreateBlogArticleWithUploadDto } from './dto/create-blog-article-with-upload.dto';
import { UpdateBlogArticleDto } from './dto/update-blog-article.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { UpdateBlogTagDto } from './dto/update-blog-tag.dto';
import { UpdateBlogArticleImageDto } from './dto/update-blog-article-image.dto';
import { UploadService } from '../upload/upload.service';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'ul',
    'ol',
    'li',
    'h2',
    'h3',
    'hr',
    'a',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['style'],
  },
  allowedStyles: {
    span: {
      color: [/.*/],
    },
  },
};

/**
 * Blog service - handles business logic for blog articles, images, and tags
 */
@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogArticle)
    private readonly articleRepository: Repository<BlogArticle>,
    @InjectRepository(BlogArticleImage)
    private readonly articleImageRepository: Repository<BlogArticleImage>,
    @InjectRepository(BlogTag)
    private readonly tagRepository: Repository<BlogTag>,
    private readonly uploadService: UploadService,
  ) {}

  // ──────────────────────────────────────────────
  // Article methods
  // ──────────────────────────────────────────────

  /**
   * Create a new blog article with uploaded images
   */
  async createWithImages(
    createDto: CreateBlogArticleWithUploadDto,
    files: Express.Multer.File[],
    baseUrl: string,
  ): Promise<BlogArticle> {
    await this.uploadService.ensureUploadDir('blog');

    this.logger.log(
      `Creating blog article with ${files ? files.length : 0} image(s)`,
    );
    this.logger.debug(`Received DTO: ${JSON.stringify(createDto, null, 2)}`);

    try {
      // Generate slug from title if not provided
      const slug = createDto.slug || this.generateSlug(createDto.title);

      // Check slug uniqueness
      const existingArticle = await this.articleRepository.findOne({
        where: { slug },
      });
      if (existingArticle) {
        throw new ConflictException(
          `Article with slug "${slug}" already exists`,
        );
      }

      // Sanitize HTML content
      const sanitizedContent = this.sanitizeContent(createDto.content);

      // Resolve tags
      let tags: BlogTag[] = [];
      if (createDto.tagIds?.length) {
        tags = await this.tagRepository.findBy({ id: In(createDto.tagIds) });
      }

      // Create article
      const { tagIds: _tagIds, ...articleData } = createDto;
      const article = this.articleRepository.create({
        ...articleData,
        slug,
        content: sanitizedContent,
        tags,
      });
      const savedArticle = await this.articleRepository.save(article);

      // Create BlogArticleImage entities
      if (files?.length) {
        const articleImages = files.map((file, index) => {
          const url = this.uploadService.getFileUrl(
            file.filename,
            baseUrl,
            'blog',
          );
          this.logger.debug(`Generated URL for ${file.filename}: ${url}`);
          return this.articleImageRepository.create({
            url,
            isCover: index === 0, // First image is the cover by default
            sortOrder: index,
            articleId: savedArticle.id,
          });
        });

        await this.articleImageRepository.save(articleImages);
      }

      this.logger.log(`Blog article created successfully: ${savedArticle.id}`);

      // Return article with images and tags loaded
      return await this.findById(savedArticle.id);
    } catch (error) {
      // Clean up uploaded files if article creation fails
      if (error instanceof ConflictException) {
        throw error;
      }

      if (files?.length) {
        const filenames = files.map((file) => file.filename);
        await this.uploadService.deleteFiles(filenames, 'blog');
      }

      this.logger.error(`Failed to create blog article: ${error.message}`);

      if (error.response?.message) {
        throw new BadRequestException(error.response.message);
      }

      throw new BadRequestException('Failed to create blog article');
    }
  }

  /**
   * Find all published articles ordered by publishedAt DESC (public)
   */
  async findPublished(): Promise<BlogArticle[]> {
    return await this.articleRepository.find({
      where: { isPublished: true },
      order: { publishedAt: 'DESC' },
    });
  }

  /**
   * Find all articles ordered by sortOrder, createdAt DESC (backoffice)
   */
  async findAll(): Promise<BlogArticle[]> {
    return await this.articleRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Find a single article by ID
   */
  async findById(id: string): Promise<BlogArticle> {
    const article = await this.articleRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Blog article with ID "${id}" not found`);
    }

    return article;
  }

  /**
   * Update a blog article
   */
  async update(
    id: string,
    updateDto: UpdateBlogArticleDto,
  ): Promise<BlogArticle> {
    const article = await this.findById(id);

    // Sanitize content if provided
    if (updateDto.content) {
      updateDto.content = this.sanitizeContent(updateDto.content);
    }

    // Resolve tags if provided
    if (updateDto.tagIds) {
      const tags = await this.tagRepository.findBy({
        id: In(updateDto.tagIds),
      });
      article.tags = tags;
    }

    // Exclude tagIds from the update data
    const { tagIds: _tagIds, ...safeUpdate } = updateDto;
    Object.assign(article, safeUpdate);

    try {
      const updated = await this.articleRepository.save(article);
      this.logger.log(`Blog article updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(
        `Failed to update blog article ${id}: ${error.message}`,
      );
      throw new BadRequestException('Failed to update blog article');
    }
  }

  /**
   * Delete a blog article and its image files
   */
  async remove(id: string): Promise<void> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!article) {
      throw new NotFoundException(`Blog article with ID "${id}" not found`);
    }

    // Delete physical image files
    if (article.images?.length > 0) {
      for (const image of article.images) {
        try {
          const filename = image.url.split('/').pop();
          if (filename) {
            await this.uploadService.deleteFile(filename, 'blog');
          }
        } catch (error) {
          this.logger.warn(`Failed to delete image file: ${error.message}`);
        }
      }
    }

    await this.articleRepository.remove(article);
    this.logger.log(`Blog article deleted successfully: ${id}`);
  }

  // ──────────────────────────────────────────────
  // Image methods
  // ──────────────────────────────────────────────

  /**
   * Add images to an existing blog article
   */
  async addImages(
    articleId: string,
    files: Express.Multer.File[],
    baseUrl: string,
  ): Promise<BlogArticleImage[]> {
    // Verify article exists
    await this.findById(articleId);
    await this.uploadService.ensureUploadDir('blog');

    // Get current max sortOrder for this article
    const existingImages = await this.articleImageRepository.find({
      where: { articleId },
      order: { sortOrder: 'DESC' },
      take: 1,
    });
    const startSortOrder =
      existingImages.length > 0 ? existingImages[0].sortOrder + 1 : 0;

    const articleImages = files.map((file, index) => {
      const url = this.uploadService.getFileUrl(file.filename, baseUrl, 'blog');
      return this.articleImageRepository.create({
        url,
        isCover: false,
        sortOrder: startSortOrder + index,
        articleId,
      });
    });

    return this.articleImageRepository.save(articleImages);
  }

  /**
   * Update image metadata (altText, isCover, sortOrder)
   */
  async updateImage(
    articleId: string,
    imageId: string,
    dto: UpdateBlogArticleImageDto,
  ): Promise<BlogArticleImage> {
    const image = await this.articleImageRepository.findOne({
      where: { id: imageId, articleId },
    });

    if (!image) {
      throw new NotFoundException(
        `Blog article image with ID "${imageId}" not found`,
      );
    }

    Object.assign(image, dto);
    return this.articleImageRepository.save(image);
  }

  /**
   * Remove a single image from a blog article, including the physical file
   */
  async removeImage(articleId: string, imageId: string): Promise<void> {
    const image = await this.articleImageRepository.findOne({
      where: { id: imageId, articleId },
    });

    if (!image) {
      throw new NotFoundException(
        `Blog article image with ID "${imageId}" not found`,
      );
    }

    // Extract filename from URL and delete the file
    try {
      const filename = image.url.split('/').pop();
      if (filename) {
        await this.uploadService.deleteFile(filename, 'blog');
      }
    } catch (error) {
      this.logger.warn(`Failed to delete image file: ${error.message}`);
    }

    await this.articleImageRepository.remove(image);
  }

  // ──────────────────────────────────────────────
  // Tag methods
  // ──────────────────────────────────────────────

  /**
   * Find all tags ordered by name
   */
  async findAllTags(): Promise<BlogTag[]> {
    return await this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Create a new tag with auto-generated slug
   */
  async createTag(createDto: CreateBlogTagDto): Promise<BlogTag> {
    const slug = this.generateSlug(createDto.name);

    // Check uniqueness
    const existing = await this.tagRepository.findOne({
      where: [{ name: createDto.name }, { slug }],
    });
    if (existing) {
      throw new ConflictException(
        `Tag with name "${createDto.name}" already exists`,
      );
    }

    const tag = this.tagRepository.create({
      name: createDto.name,
      slug,
    });

    const saved = await this.tagRepository.save(tag);
    this.logger.log(`Blog tag created successfully: ${saved.id}`);
    return saved;
  }

  /**
   * Update a tag, regenerate slug if name changed
   */
  async updateTag(id: string, updateDto: UpdateBlogTagDto): Promise<BlogTag> {
    const tag = await this.tagRepository.findOne({ where: { id } });

    if (!tag) {
      throw new NotFoundException(`Blog tag with ID "${id}" not found`);
    }

    if (updateDto.name) {
      tag.name = updateDto.name;
      tag.slug = this.generateSlug(updateDto.name);
    }

    try {
      const updated = await this.tagRepository.save(tag);
      this.logger.log(`Blog tag updated successfully: ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update blog tag ${id}: ${error.message}`);
      throw new BadRequestException('Failed to update blog tag');
    }
  }

  /**
   * Delete a tag
   */
  async removeTag(id: string): Promise<void> {
    const tag = await this.tagRepository.findOne({ where: { id } });

    if (!tag) {
      throw new NotFoundException(`Blog tag with ID "${id}" not found`);
    }

    await this.tagRepository.remove(tag);
    this.logger.log(`Blog tag deleted successfully: ${id}`);
  }

  // ──────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────

  /**
   * Sanitize HTML content to allow only safe Tiptap tags
   */
  private sanitizeContent(content: string): string {
    return sanitizeHtml(content, SANITIZE_OPTIONS);
  }

  /**
   * Generate a URL-friendly slug from a title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
