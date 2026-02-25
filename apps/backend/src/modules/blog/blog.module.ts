import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogArticle } from '../../entities/blog-article.entity';
import { BlogArticleImage } from '../../entities/blog-article-image.entity';
import { BlogTag } from '../../entities/blog-tag.entity';
import { UploadModule } from '../upload/upload.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('BlogModule');

/**
 * Blog module
 * Encapsulates all blog-related functionality (articles, images, tags)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([BlogArticle, BlogArticleImage, BlogTag]),
    UploadModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/blog',
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
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
