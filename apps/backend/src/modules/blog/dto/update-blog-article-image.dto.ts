import {
  IsOptional,
  IsBoolean,
  IsInt,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO for updating blog article image metadata
 */
export class UpdateBlogArticleImageDto {
  @ApiPropertyOptional({ description: 'Image alt text', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @ApiPropertyOptional({ description: 'Whether this image is the cover image' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value as boolean;
  })
  isCover?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value as string, 10))
  sortOrder?: number;
}
