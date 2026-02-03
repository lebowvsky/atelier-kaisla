import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
  },
}));

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFileUrl', () => {
    it('should return correct file URL', () => {
      const filename = 'test-image.jpg';
      const baseUrl = 'http://localhost:4000';
      const expectedUrl = `${baseUrl}/uploads/products/${filename}`;

      const result = service.getFileUrl(filename, baseUrl);

      expect(result).toBe(expectedUrl);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const filename = 'test-image.jpg';
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await expect(service.deleteFile(filename)).resolves.not.toThrow();
      expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining(filename));
    });

    it('should throw NotFoundException when file does not exist', async () => {
      const filename = 'non-existent.jpg';
      (fs.unlink as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      await expect(service.deleteFile(filename)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error for other file system errors', async () => {
      const filename = 'test-image.jpg';
      const error = new Error('Permission denied');
      (fs.unlink as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteFile(filename)).rejects.toThrow(error);
    });
  });

  describe('deleteFiles', () => {
    it('should delete multiple files successfully', async () => {
      const filenames = ['image1.jpg', 'image2.png', 'image3.webp'];
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await expect(service.deleteFiles(filenames)).resolves.not.toThrow();
      expect(fs.unlink).toHaveBeenCalledTimes(3);
    });

    it('should continue deleting even if some files fail', async () => {
      const filenames = ['image1.jpg', 'non-existent.jpg', 'image3.jpg'];
      (fs.unlink as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce({ code: 'ENOENT' })
        .mockResolvedValueOnce(undefined);

      await expect(service.deleteFiles(filenames)).resolves.not.toThrow();
      expect(fs.unlink).toHaveBeenCalledTimes(3);
    });
  });

  describe('ensureUploadDir', () => {
    it('should not create directory if it exists', async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      await service.ensureUploadDir();

      expect(fs.access).toHaveBeenCalled();
      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('should create directory if it does not exist', async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error('Not found'));
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.ensureUploadDir();

      expect(fs.access).toHaveBeenCalled();
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ recursive: true }),
      );
    });
  });
});
