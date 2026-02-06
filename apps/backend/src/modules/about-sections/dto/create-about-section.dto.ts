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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new about section (JSON format)
 */
export class CreateAboutSectionDto {
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
    description: 'Array of paragraph texts',
    type: [String],
    example: [
      'Founded in 2020, Atelier Kaisla creates handcrafted wall art.',
      'Each piece is unique and made with care.',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  paragraphs: string[];

  @ApiProperty({
    description: 'Image URL',
    maxLength: 500,
    example: 'https://example.com/about-image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  image: string;

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
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the section is published',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
