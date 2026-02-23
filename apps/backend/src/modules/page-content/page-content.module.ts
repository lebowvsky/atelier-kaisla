import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { PageContentService } from './page-content.service';
import { PageContentController } from './page-content.controller';
import { PageContent } from '../../entities/page-content.entity';
import { UploadModule } from '../upload/upload.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('PageContentModule');

/**
 * PageContent module
 * Encapsulates all page content CMS functionality
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PageContent]),
    UploadModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/page-content',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          logger.debug(
            `Saving file: ${file.originalname} as ${uniqueName} (${file.size} bytes)`,
          );
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
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
  controllers: [PageContentController],
  providers: [PageContentService],
  exports: [PageContentService],
})
export class PageContentModule {}
