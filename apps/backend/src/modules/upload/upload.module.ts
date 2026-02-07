import { Module, Logger } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('UploadModule');

/**
 * Upload module
 * Handles file uploads with multer and provides file management services
 */
@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        storage: diskStorage({
          destination: './uploads/products',
          filename: (req, file, callback) => {
            // Generate unique filename with original extension
            const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
            logger.debug(
              `Saving file: ${file.originalname} as ${uniqueName} (${file.mimetype}, ${file.size} bytes)`,
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
    }),
  ],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
