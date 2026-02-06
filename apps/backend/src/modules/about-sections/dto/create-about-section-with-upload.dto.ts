import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating an about section with image upload (multipart/form-data)
 */
export class CreateAboutSectionWithUploadDto {
  @ApiProperty({
    description: 'Section title',
    maxLength: 255,
    example: 'Our Story',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Array of paragraph texts (JSON string)',
    type: [String],
    example: '["First paragraph.", "Second paragraph."]',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  paragraphs: string[];

  @ApiProperty({
    description: 'Image alt text',
    maxLength: 255,
    example: 'Artisan working on a wall hanging',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  imageAlt: string;

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
    description: 'Whether the section is published',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isPublished?: boolean;
}
