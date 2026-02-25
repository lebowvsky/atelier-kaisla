import { PartialType } from '@nestjs/swagger';
import { CreateBlogTagDto } from './create-blog-tag.dto';

/**
 * DTO for updating an existing blog tag
 * All fields from CreateBlogTagDto are optional
 */
export class UpdateBlogTagDto extends PartialType(CreateBlogTagDto) {}
