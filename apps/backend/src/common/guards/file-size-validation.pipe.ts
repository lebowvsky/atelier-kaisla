import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe to validate uploaded files
 * Checks file size, count, and type
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize = 5 * 1024 * 1024; // 5MB
  private readonly maxFiles = 5;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }

    if (files.length > this.maxFiles) {
      throw new BadRequestException(
        `Maximum ${this.maxFiles} files allowed, received ${files.length}`,
      );
    }

    for (const file of files) {
      // Validate file size
      if (file.size > this.maxSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum size of 5MB`,
        );
      }

      // Validate mime type
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File ${file.originalname} has invalid type. Only JPEG, PNG, and WebP are allowed`,
        );
      }

      // Validate file extension matches mime type
      const extension = file.originalname.split('.').pop()?.toLowerCase();
      const isValidExtension =
        (file.mimetype === 'image/jpeg' &&
          (extension === 'jpg' || extension === 'jpeg')) ||
        (file.mimetype === 'image/png' && extension === 'png') ||
        (file.mimetype === 'image/webp' && extension === 'webp');

      if (!isValidExtension) {
        throw new BadRequestException(
          `File ${file.originalname} has mismatched extension and mime type`,
        );
      }
    }

    return files;
  }
}
