import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogArticle } from '../../entities/blog-article.entity';
import { BlogArticleImage } from '../../entities/blog-article-image.entity';
import { BlogTag } from '../../entities/blog-tag.entity';
import { UploadService } from '../upload/upload.service';

/**
 * Unit tests for BlogService
 * Tests business logic in isolation by mocking repositories and dependencies
 */
describe('BlogService', () => {
  let service: BlogService;
  let articleRepository: Repository<BlogArticle>;

  const now = new Date();

  // Mock tag data
  const mockTag: BlogTag = {
    id: 'tag-1-uuid',
    name: 'Wall Hangings',
    slug: 'wall-hangings',
    articles: [],
    createdAt: now,
  };

  // Mock article image data
  const mockImage: BlogArticleImage = {
    id: 'img-1-uuid',
    url: 'http://localhost:4000/uploads/blog/test-image.jpg',
    altText: null,
    isCover: true,
    sortOrder: 0,
    articleId: 'article-1-uuid',
    article: null as any,
    createdAt: now,
  };

  // Mock article data
  const mockArticle: BlogArticle = {
    id: 'article-1-uuid',
    title: 'The Art of Wall Hanging',
    subtitle: 'Exploring techniques',
    content: '<p>This is a blog article.</p>',
    slug: 'the-art-of-wall-hanging',
    publishedAt: now,
    isPublished: true,
    sortOrder: 0,
    images: [mockImage],
    tags: [mockTag],
    createdAt: now,
    updatedAt: now,
  };

  // Mock repositories
  const mockArticleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    remove: jest.fn(),
  };

  const mockArticleImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockTagRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    remove: jest.fn(),
  };

  // Mock UploadService
  const mockUploadService = {
    ensureUploadDir: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
    deleteFiles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: getRepositoryToken(BlogArticle),
          useValue: mockArticleRepository,
        },
        {
          provide: getRepositoryToken(BlogArticleImage),
          useValue: mockArticleImageRepository,
        },
        {
          provide: getRepositoryToken(BlogTag),
          useValue: mockTagRepository,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    articleRepository = module.get<Repository<BlogArticle>>(
      getRepositoryToken(BlogArticle),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(articleRepository).toBeDefined();
  });

  // ──────────────────────────────────────────────
  // Article tests
  // ──────────────────────────────────────────────

  describe('createWithImages', () => {
    const createDto = {
      title: 'The Art of Wall Hanging',
      content: '<p>This is a blog article.</p>',
      isPublished: false,
    };

    const mockFiles: Express.Multer.File[] = [
      {
        filename: 'uuid-1.jpg',
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 12345,
      } as Express.Multer.File,
    ];

    const baseUrl = 'http://localhost:4000';

    it('should create an article with images', async () => {
      // Arrange
      mockArticleRepository.findOne
        .mockResolvedValueOnce(null) // slug uniqueness check
        .mockResolvedValueOnce(mockArticle); // findById at the end
      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockArticleImageRepository.create.mockReturnValue(mockImage);
      mockArticleImageRepository.save.mockResolvedValue([mockImage]);
      mockUploadService.ensureUploadDir.mockResolvedValue(undefined);
      mockUploadService.getFileUrl.mockReturnValue(
        'http://localhost:4000/uploads/blog/uuid-1.jpg',
      );

      // Act
      const result = await service.createWithImages(
        createDto,
        mockFiles,
        baseUrl,
      );

      // Assert
      expect(mockUploadService.ensureUploadDir).toHaveBeenCalledWith('blog');
      expect(mockArticleRepository.create).toHaveBeenCalled();
      expect(mockArticleRepository.save).toHaveBeenCalled();
      expect(mockArticleImageRepository.create).toHaveBeenCalled();
      expect(mockArticleImageRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });

    it('should create an article without images', async () => {
      // Arrange
      mockArticleRepository.findOne
        .mockResolvedValueOnce(null) // slug uniqueness check
        .mockResolvedValueOnce(mockArticle); // findById at the end
      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockUploadService.ensureUploadDir.mockResolvedValue(undefined);

      // Act
      const result = await service.createWithImages(createDto, [], baseUrl);

      // Assert
      expect(mockArticleImageRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });

    it('should throw ConflictException when slug already exists', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValueOnce(mockArticle); // slug already exists
      mockUploadService.ensureUploadDir.mockResolvedValue(undefined);

      // Act & Assert
      await expect(
        service.createWithImages(createDto, [], baseUrl),
      ).rejects.toThrow(ConflictException);
    });

    it('should clean up uploaded files on failure', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValueOnce(null); // slug uniqueness check
      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockRejectedValue(new Error('Database error'));
      mockUploadService.ensureUploadDir.mockResolvedValue(undefined);
      mockUploadService.deleteFiles.mockResolvedValue(undefined);

      // Act & Assert
      await expect(
        service.createWithImages(createDto, mockFiles, baseUrl),
      ).rejects.toThrow(BadRequestException);
      expect(mockUploadService.deleteFiles).toHaveBeenCalledWith(
        ['uuid-1.jpg'],
        'blog',
      );
    });

    it('should resolve tags when tagIds are provided', async () => {
      // Arrange
      const dtoWithTags = { ...createDto, tagIds: ['tag-1-uuid'] };
      mockArticleRepository.findOne
        .mockResolvedValueOnce(null) // slug uniqueness check
        .mockResolvedValueOnce(mockArticle); // findById at the end
      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockTagRepository.findBy.mockResolvedValue([mockTag]);
      mockUploadService.ensureUploadDir.mockResolvedValue(undefined);

      // Act
      await service.createWithImages(dtoWithTags, [], baseUrl);

      // Assert
      expect(mockTagRepository.findBy).toHaveBeenCalledWith({
        id: expect.anything(),
      });
    });
  });

  describe('findPublished', () => {
    it('should return only published articles ordered by publishedAt DESC', async () => {
      // Arrange
      mockArticleRepository.find.mockResolvedValue([mockArticle]);

      // Act
      const result = await service.findPublished();

      // Assert
      expect(mockArticleRepository.find).toHaveBeenCalledWith({
        where: { isPublished: true },
        order: { publishedAt: 'DESC' },
      });
      expect(result).toEqual([mockArticle]);
    });
  });

  describe('findAll', () => {
    it('should return all articles ordered by sortOrder ASC, createdAt DESC', async () => {
      // Arrange
      mockArticleRepository.find.mockResolvedValue([mockArticle]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockArticleRepository.find).toHaveBeenCalledWith({
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      });
      expect(result).toEqual([mockArticle]);
    });
  });

  describe('findById', () => {
    it('should return an article when found', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      // Act
      const result = await service.findById(mockArticle.id);

      // Assert
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockArticle.id },
      });
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException when article not found', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      // Arrange
      const updateDto = { title: 'Updated Title' };
      const updatedArticle = { ...mockArticle, title: 'Updated Title' };
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(updatedArticle);

      // Act
      const result = await service.update(mockArticle.id, updateDto);

      // Assert
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockArticle.id },
      });
      expect(mockArticleRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should sanitize content when provided', async () => {
      // Arrange
      const updateDto = {
        content: '<p>Valid</p><script>alert("xss")</script>',
      };
      mockArticleRepository.findOne.mockResolvedValue({ ...mockArticle });
      mockArticleRepository.save.mockImplementation((article) =>
        Promise.resolve(article),
      );

      // Act
      const result = await service.update(mockArticle.id, updateDto);

      // Assert - script tags should be stripped
      expect(result.content).not.toContain('<script>');
      expect(result.content).toContain('<p>Valid</p>');
    });

    it('should resolve tags when tagIds are provided', async () => {
      // Arrange
      const updateDto = { tagIds: ['tag-1-uuid'] };
      mockArticleRepository.findOne.mockResolvedValue({ ...mockArticle });
      mockArticleRepository.save.mockImplementation((article) =>
        Promise.resolve(article),
      );
      mockTagRepository.findBy.mockResolvedValue([mockTag]);

      // Act
      await service.update(mockArticle.id, updateDto);

      // Assert
      expect(mockTagRepository.findBy).toHaveBeenCalledWith({
        id: expect.anything(),
      });
    });

    it('should throw NotFoundException when article not found', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on database error', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue({ ...mockArticle });
      mockArticleRepository.save.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(
        service.update(mockArticle.id, { title: 'Updated' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete an article and its image files', async () => {
      // Arrange
      const articleWithImages = { ...mockArticle, images: [mockImage] };
      mockArticleRepository.findOne.mockResolvedValue(articleWithImages);
      mockArticleRepository.remove.mockResolvedValue(articleWithImages);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      // Act
      await service.remove(mockArticle.id);

      // Assert
      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockArticle.id },
        relations: ['images'],
      });
      expect(mockUploadService.deleteFile).toHaveBeenCalledWith(
        'test-image.jpg',
        'blog',
      );
      expect(mockArticleRepository.remove).toHaveBeenCalledWith(
        articleWithImages,
      );
    });

    it('should delete an article with no images', async () => {
      // Arrange
      const articleNoImages = { ...mockArticle, images: [] };
      mockArticleRepository.findOne.mockResolvedValue(articleNoImages);
      mockArticleRepository.remove.mockResolvedValue(articleNoImages);

      // Act
      await service.remove(mockArticle.id);

      // Assert
      expect(mockUploadService.deleteFile).not.toHaveBeenCalled();
      expect(mockArticleRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException when article not found', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should continue deletion even if image file deletion fails', async () => {
      // Arrange
      const articleWithImages = { ...mockArticle, images: [mockImage] };
      mockArticleRepository.findOne.mockResolvedValue(articleWithImages);
      mockArticleRepository.remove.mockResolvedValue(articleWithImages);
      mockUploadService.deleteFile.mockRejectedValue(
        new Error('File not found'),
      );

      // Act
      await service.remove(mockArticle.id);

      // Assert - should still remove the article from DB
      expect(mockArticleRepository.remove).toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────
  // Image tests
  // ──────────────────────────────────────────────

  describe('addImages', () => {
    const mockFiles: Express.Multer.File[] = [
      {
        filename: 'new-image.jpg',
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 12345,
      } as Express.Multer.File,
    ];

    it('should add images to an existing article', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockUploadService.ensureUploadDir.mockResolvedValue(undefined);
      mockArticleImageRepository.find.mockResolvedValue([
        { sortOrder: 2 },
      ]);
      mockUploadService.getFileUrl.mockReturnValue(
        'http://localhost:4000/uploads/blog/new-image.jpg',
      );
      const newImage = { ...mockImage, id: 'img-2-uuid' };
      mockArticleImageRepository.create.mockReturnValue(newImage);
      mockArticleImageRepository.save.mockResolvedValue([newImage]);

      // Act
      const result = await service.addImages(
        mockArticle.id,
        mockFiles,
        'http://localhost:4000',
      );

      // Assert
      expect(mockArticleImageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          articleId: mockArticle.id,
          isCover: false,
          sortOrder: 3, // existing max (2) + 1
        }),
      );
      expect(result).toEqual([newImage]);
    });

    it('should start sortOrder at 0 when article has no existing images', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockUploadService.ensureUploadDir.mockResolvedValue(undefined);
      mockArticleImageRepository.find.mockResolvedValue([]);
      mockUploadService.getFileUrl.mockReturnValue(
        'http://localhost:4000/uploads/blog/new-image.jpg',
      );
      mockArticleImageRepository.create.mockReturnValue(mockImage);
      mockArticleImageRepository.save.mockResolvedValue([mockImage]);

      // Act
      await service.addImages(
        mockArticle.id,
        mockFiles,
        'http://localhost:4000',
      );

      // Assert
      expect(mockArticleImageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sortOrder: 0,
        }),
      );
    });

    it('should throw NotFoundException when article does not exist', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.addImages('non-existent', mockFiles, 'http://localhost:4000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateImage', () => {
    it('should update image metadata', async () => {
      // Arrange
      const updatedImage = { ...mockImage, altText: 'New alt text' };
      mockArticleImageRepository.findOne.mockResolvedValue({ ...mockImage });
      mockArticleImageRepository.save.mockResolvedValue(updatedImage);

      // Act
      const result = await service.updateImage(
        mockArticle.id,
        mockImage.id,
        { altText: 'New alt text' },
      );

      // Assert
      expect(result.altText).toBe('New alt text');
      expect(mockArticleImageRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockImage.id, articleId: mockArticle.id },
      });
    });

    it('should throw NotFoundException when image not found', async () => {
      // Arrange
      mockArticleImageRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateImage(mockArticle.id, 'non-existent', {
          altText: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeImage', () => {
    it('should remove an image and delete the physical file', async () => {
      // Arrange
      mockArticleImageRepository.findOne.mockResolvedValue(mockImage);
      mockArticleImageRepository.remove.mockResolvedValue(mockImage);
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      // Act
      await service.removeImage(mockArticle.id, mockImage.id);

      // Assert
      expect(mockUploadService.deleteFile).toHaveBeenCalledWith(
        'test-image.jpg',
        'blog',
      );
      expect(mockArticleImageRepository.remove).toHaveBeenCalledWith(
        mockImage,
      );
    });

    it('should still remove image record if file deletion fails', async () => {
      // Arrange
      mockArticleImageRepository.findOne.mockResolvedValue(mockImage);
      mockArticleImageRepository.remove.mockResolvedValue(mockImage);
      mockUploadService.deleteFile.mockRejectedValue(
        new Error('File not found'),
      );

      // Act
      await service.removeImage(mockArticle.id, mockImage.id);

      // Assert - should still remove from DB
      expect(mockArticleImageRepository.remove).toHaveBeenCalledWith(
        mockImage,
      );
    });

    it('should throw NotFoundException when image not found', async () => {
      // Arrange
      mockArticleImageRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.removeImage(mockArticle.id, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  // Tag tests
  // ──────────────────────────────────────────────

  describe('findAllTags', () => {
    it('should return all tags ordered by name ASC', async () => {
      // Arrange
      mockTagRepository.find.mockResolvedValue([mockTag]);

      // Act
      const result = await service.findAllTags();

      // Assert
      expect(mockTagRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual([mockTag]);
    });
  });

  describe('createTag', () => {
    it('should create a new tag with auto-generated slug', async () => {
      // Arrange
      mockTagRepository.findOne.mockResolvedValue(null); // no existing tag
      mockTagRepository.create.mockReturnValue(mockTag);
      mockTagRepository.save.mockResolvedValue(mockTag);

      // Act
      const result = await service.createTag({ name: 'Wall Hangings' });

      // Assert
      expect(mockTagRepository.create).toHaveBeenCalledWith({
        name: 'Wall Hangings',
        slug: 'wall-hangings',
      });
      expect(result).toEqual(mockTag);
    });

    it('should throw ConflictException when tag name already exists', async () => {
      // Arrange
      mockTagRepository.findOne.mockResolvedValue(mockTag);

      // Act & Assert
      await expect(
        service.createTag({ name: 'Wall Hangings' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateTag', () => {
    it('should update a tag and regenerate slug', async () => {
      // Arrange
      const updatedTag = {
        ...mockTag,
        name: 'Updated Tag',
        slug: 'updated-tag',
      };
      mockTagRepository.findOne.mockResolvedValue({ ...mockTag });
      mockTagRepository.save.mockResolvedValue(updatedTag);

      // Act
      const result = await service.updateTag(mockTag.id, {
        name: 'Updated Tag',
      });

      // Assert
      expect(result.name).toBe('Updated Tag');
      expect(result.slug).toBe('updated-tag');
    });

    it('should throw NotFoundException when tag not found', async () => {
      // Arrange
      mockTagRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateTag('non-existent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on database error', async () => {
      // Arrange
      mockTagRepository.findOne.mockResolvedValue({ ...mockTag });
      mockTagRepository.save.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(
        service.updateTag(mockTag.id, { name: 'Updated' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeTag', () => {
    it('should delete a tag', async () => {
      // Arrange
      mockTagRepository.findOne.mockResolvedValue(mockTag);
      mockTagRepository.remove.mockResolvedValue(mockTag);

      // Act
      await service.removeTag(mockTag.id);

      // Assert
      expect(mockTagRepository.remove).toHaveBeenCalledWith(mockTag);
    });

    it('should throw NotFoundException when tag not found', async () => {
      // Arrange
      mockTagRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removeTag('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
