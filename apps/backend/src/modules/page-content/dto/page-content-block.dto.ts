import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for a single page content block (info-block) — title + description.
 * Used as a nested array on CreatePageContent / UpdatePageContent payloads.
 */
export class PageContentBlockDto {
  @ApiPropertyOptional({
    description: 'Block UUID (only present when updating an existing block)',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Block title',
    maxLength: 255,
    example: 'Handcrafted Quality',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Block description / body copy',
    example:
      'Every piece is handwoven on a traditional loom, ensuring exceptional quality.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Sort order within the parent section',
    default: 0,
    example: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
