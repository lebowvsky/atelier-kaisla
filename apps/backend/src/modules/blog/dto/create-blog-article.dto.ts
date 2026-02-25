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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new blog article (JSON format)
 */
export class CreateBlogArticleDto {
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
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    default: 0,
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Array of tag UUIDs to associate with the article',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];
}
