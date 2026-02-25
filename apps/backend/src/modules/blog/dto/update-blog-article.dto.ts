import { PartialType } from '@nestjs/swagger';
import { CreateBlogArticleDto } from './create-blog-article.dto';

/**
 * DTO for updating an existing blog article
 * All fields from CreateBlogArticleDto are optional
 */
export class UpdateBlogArticleDto extends PartialType(CreateBlogArticleDto) {}
