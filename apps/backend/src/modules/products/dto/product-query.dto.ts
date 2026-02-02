import { IsOptional, IsEnum, IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for querying products with filters and pagination
 */
export class ProductQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: ['wall-hanging', 'rug'],
  })
  @IsEnum(['wall-hanging', 'rug'])
  @IsOptional()
  category?: 'wall-hanging' | 'rug';

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['available', 'sold', 'draft'],
  })
  @IsEnum(['available', 'sold', 'draft'])
  @IsOptional()
  status?: 'available' | 'sold' | 'draft';

  @ApiPropertyOptional({
    description: 'Search by name (partial match)',
    example: 'wall',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number (starts at 1)',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
