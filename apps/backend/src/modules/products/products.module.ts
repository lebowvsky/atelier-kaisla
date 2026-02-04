import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../../entities/product.entity';
import { UploadModule } from '../upload/upload.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('ProductsModule');

/**
 * Products module
 * Encapsulates all product-related functionality
 */
@Module({
  imports: [
    // Import the Product entity for this module
    TypeOrmModule.forFeature([Product]),
    // Import upload module for file handling
    UploadModule,
    // Configure multer for this module
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          // Generate unique filename with original extension
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          logger.debug(
            `Saving file: ${file.originalname} as ${uniqueName} (${file.size} bytes)`,
          );
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Only allow image files
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          logger.debug(
            `File accepted: ${file.originalname} (${file.mimetype})`,
          );
          callback(null, true);
        } else {
          logger.warn(
            `File rejected: ${file.originalname} (${file.mimetype}) - Invalid mime type`,
          );
          callback(
            new Error(
              'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export service if needed by other modules
})
export class ProductsModule {}
