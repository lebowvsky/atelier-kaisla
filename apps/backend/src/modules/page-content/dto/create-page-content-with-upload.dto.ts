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
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a page content entry with image upload (multipart/form-data)
 */
export class CreatePageContentWithUploadDto {
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
    description: 'Image alt text',
    maxLength: 255,
    example: 'Hero background image',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageAlt?: string;

  @ApiPropertyOptional({
    description: 'Extra metadata (JSON string)',
    example: '{"buttonText": "Explore", "buttonLink": "/wall-hanging"}',
  })
  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    default: 0,
    example: 0,
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
    description: 'Whether the content is published',
    default: true,
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
}
