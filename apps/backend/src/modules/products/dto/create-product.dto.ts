import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsPositive,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Dimensions DTO for product dimensions
 */
class DimensionsDto {
  @ApiProperty({ description: 'Width of the product' })
  @IsNumber()
  @IsPositive()
  width: number;

  @ApiProperty({ description: 'Height of the product' })
  @IsNumber()
  @IsPositive()
  height: number;

  @ApiProperty({ description: 'Unit of measurement', enum: ['cm', 'inch'] })
  @IsEnum(['cm', 'inch'])
  unit: 'cm' | 'inch';
}

/**
 * DTO for creating a new product
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    maxLength: 255,
    example: 'Handwoven Wall Hanging',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    maxLength: 500,
    example: 'Beautiful handwoven wall hanging made with natural fibers',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Product category',
    enum: ['wall-hanging', 'rug'],
    example: 'wall-hanging',
  })
  @IsEnum(['wall-hanging', 'rug'])
  @IsNotEmpty()
  category: 'wall-hanging' | 'rug';

  @ApiProperty({
    description: 'Product price in euros',
    example: 149.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiPropertyOptional({
    description: 'Product status',
    enum: ['available', 'sold', 'draft'],
    default: 'draft',
  })
  @IsEnum(['available', 'sold', 'draft'])
  @IsOptional()
  status?: 'available' | 'sold' | 'draft';

  @ApiPropertyOptional({
    description: 'Stock quantity',
    default: 0,
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: 'Product dimensions',
    type: DimensionsDto,
  })
  @ValidateNested()
  @Type(() => DimensionsDto)
  @IsOptional()
  dimensions?: DimensionsDto;

  @ApiPropertyOptional({
    description: 'Materials used',
    example: 'Cotton, wool, natural dyes',
  })
  @IsString()
  @IsOptional()
  materials?: string;
}
