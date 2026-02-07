import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadService } from '../upload/upload.service';

/**
 * Unit tests for ProductsService
 * Tests business logic in isolation by mocking repository
 */
describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  // Mock product data
  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Wall Hanging',
    description: 'Test description',
    category: 'wall-hanging',
    price: 149.99,
    status: 'available',
    stockQuantity: 1,
    productImages: [],
    dimensions: { width: 60, height: 90, unit: 'cm' },
    materials: 'Cotton',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock repository methods
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  // Mock ProductImage repository
  const mockProductImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
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
    // Create testing module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: mockProductImageRepository,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: 'Test Wall Hanging',
        description: 'Test description',
        category: 'wall-hanging',
        price: 149.99,
        status: 'available',
        stockQuantity: 1,
        materials: 'Cotton',
        dimensions: { width: 60, height: 90, unit: 'cm' },
      };

      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException on database error', async () => {
      // Arrange
      const createDto: CreateProductDto = {
        name: 'Test',
        category: 'wall-hanging',
        price: 100,
      };

      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockProduct);

      // Act
      const result = await service.findById(mockProduct.id);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      const nonExistentId = '999e4567-e89b-12d3-a456-426614174999';
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll(query);

      // Assert
      expect(result).toEqual({
        data: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'product.productImages',
        'productImages',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should apply category filter', async () => {
      // Arrange
      const query = { category: 'wall-hanging' as const, page: 1, limit: 10 };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      await service.findAll(query);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.category = :category',
        { category: 'wall-hanging' },
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const updateDto: UpdateProductDto = {
        name: 'Updated Name',
        price: 199.99,
      };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.save.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });

      // Act
      const result = await service.update(mockProduct.id, updateDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe(updateDto.name);
      expect(result.price).toBe(updateDto.price);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);
      const updateDto: UpdateProductDto = { name: 'Updated' };

      // Act & Assert
      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a product and its image files', async () => {
      // Arrange
      const productWithImages = {
        ...mockProduct,
        productImages: [
          {
            id: 'img-1',
            url: 'http://localhost:4000/uploads/products/test.jpg',
            showOnHome: false,
            sortOrder: 0,
            productId: mockProduct.id,
            createdAt: new Date(),
          },
        ],
      };
      mockRepository.findOne.mockResolvedValue(productWithImages);
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });
      mockUploadService.deleteFile.mockResolvedValue(undefined);

      // Act
      await service.remove(mockProduct.id);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
        relations: ['productImages'],
      });
      expect(mockUploadService.deleteFile).toHaveBeenCalledWith('test.jpg');
      expect(mockRepository.delete).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should return product statistics', async () => {
      // Arrange
      mockRepository.count
        .mockResolvedValueOnce(5) // total
        .mockResolvedValueOnce(3) // wall-hanging
        .mockResolvedValueOnce(2) // rug
        .mockResolvedValueOnce(4) // available
        .mockResolvedValueOnce(1) // sold
        .mockResolvedValueOnce(0); // draft

      // Act
      const result = await service.getStatistics();

      // Assert
      expect(result).toEqual({
        total: 5,
        byCategory: {
          'wall-hanging': 3,
          rug: 2,
        },
        byStatus: {
          available: 4,
          sold: 1,
          draft: 0,
        },
      });
      expect(mockRepository.count).toHaveBeenCalledTimes(6);
    });
  });

  describe('findByCategory', () => {
    it('should return products filtered by category', async () => {
      // Arrange
      const category = 'wall-hanging';
      mockRepository.find.mockResolvedValue([mockProduct]);

      // Act
      const result = await service.findByCategory(category);

      // Assert
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          category,
          status: 'available',
        },
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findHomeGridImages', () => {
    it('should return images flagged for home page', async () => {
      // Arrange
      const mockImages = [
        {
          id: 'img-1',
          url: 'http://localhost:4000/uploads/products/test.jpg',
          showOnHome: true,
          sortOrder: 0,
          productId: mockProduct.id,
          product: mockProduct,
          createdAt: new Date(),
        },
      ];
      mockProductImageRepository.find.mockResolvedValue(mockImages);

      // Act
      const result = await service.findHomeGridImages();

      // Assert
      expect(mockProductImageRepository.find).toHaveBeenCalledWith({
        where: { showOnHome: true },
        relations: ['product'],
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      });
      expect(result).toEqual(mockImages);
    });
  });

  describe('updateProductImage', () => {
    it('should update image metadata', async () => {
      // Arrange
      const mockImage = {
        id: 'img-1',
        url: 'http://localhost:4000/uploads/products/test.jpg',
        showOnHome: false,
        sortOrder: 0,
        productId: mockProduct.id,
        createdAt: new Date(),
      };
      const updatedImage = { ...mockImage, showOnHome: true };
      mockProductImageRepository.findOne.mockResolvedValue(mockImage);
      mockProductImageRepository.save.mockResolvedValue(updatedImage);

      // Act
      const result = await service.updateProductImage('img-1', {
        showOnHome: true,
      });

      // Assert
      expect(result.showOnHome).toBe(true);
    });

    it('should throw NotFoundException when image not found', async () => {
      // Arrange
      mockProductImageRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateProductImage('non-existent', { showOnHome: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
