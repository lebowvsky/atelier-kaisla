import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new page content entry (JSON format)
 */
export class CreatePageContentDto {
  @ApiProperty({
    description: 'Page identifier',
    maxLength: 100,
    example: 'home',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  page: string;

  @ApiProperty({
    description: 'Section identifier within the page',
    maxLength: 100,
    example: 'hero',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  section: string;

  @ApiPropertyOptional({
    description: 'Section title',
    maxLength: 255,
    example: 'Handcrafted Wall Art & Rugs',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Section text content',
    example: 'Discover our unique collection of handmade pieces.',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Image URL',
    maxLength: 500,
    example: 'https://example.com/hero.jpg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({
    description: 'Image alt text',
    maxLength: 255,
    example: 'Hero background image',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageAlt?: string;

  @ApiPropertyOptional({
    description: 'Extra metadata (JSON object)',
    example: { buttonText: 'Explore', buttonLink: '/wall-hanging' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    default: 0,
    example: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the content is published',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
