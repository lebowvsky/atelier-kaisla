import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AboutSectionsService } from './about-sections.service';
import { AboutSectionsController } from './about-sections.controller';
import { AboutSection } from '../../entities/about-section.entity';
import { UploadModule } from '../upload/upload.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('AboutSectionsModule');

/**
 * AboutSections module
 * Encapsulates all about-section-related functionality
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AboutSection]),
    UploadModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/about-sections',
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
  controllers: [AboutSectionsController],
  providers: [AboutSectionsService],
  exports: [AboutSectionsService],
})
export class AboutSectionsModule {}
