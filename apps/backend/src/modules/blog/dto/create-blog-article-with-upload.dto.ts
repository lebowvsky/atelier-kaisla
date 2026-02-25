import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsUUID,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new blog article with image upload (multipart/form-data)
 */
export class CreateBlogArticleWithUploadDto {
  @ApiProperty({
    description: 'Article title',
    maxLength: 255,
    example: 'The Art of Wall Hanging',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Article subtitle',
    maxLength: 255,
    example: 'Exploring techniques and traditions',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  subtitle?: string;

  @ApiProperty({
    description: 'Article HTML content (from Tiptap editor)',
    example: '<p>This is a blog article about wall hangings.</p>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description:
      'URL-friendly slug (auto-generated from title if not provided)',
    maxLength: 255,
    example: 'the-art-of-wall-hanging',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Publication date',
    example: '2026-02-25T10:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @ApiPropertyOptional({
    description: 'Whether the article is published',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    default: 0,
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return parseInt(value as string, 10);
  })
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'JSON string array of tag UUIDs to associate with the article',
    type: [String],
    example: '["550e8400-e29b-41d4-a716-446655440000"]',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  tagIds?: string[];
}
