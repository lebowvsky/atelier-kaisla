import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsPositive,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Dimensions DTO for product dimensions
 */
class DimensionsDto {
  @ApiProperty({ description: 'Width of the product' })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value as string))
  width: number;

  @ApiProperty({ description: 'Height of the product' })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value as string))
  height: number;

  @ApiProperty({ description: 'Unit of measurement', enum: ['cm', 'inch'] })
  @IsEnum(['cm', 'inch'])
  unit: 'cm' | 'inch';
}

/**
 * DTO for creating a new product with file upload
 * Used when creating products via multipart/form-data
 */
export class CreateProductWithUploadDto {
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
  @Transform(({ value }) => parseFloat(value as string))
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
  @Transform(({ value }) => parseInt(value as string, 10))
  stockQuantity?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions (JSON string)',
    example: '{"width": 50, "height": 70, "unit": "cm"}',
  })
  @ValidateNested()
  @Type(() => DimensionsDto)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as unknown as DimensionsDto;
      } catch {
        return value;
      }
    }
    return value;
  })
  dimensions?: DimensionsDto;

  @ApiPropertyOptional({
    description: 'Materials used',
    example: 'Cotton, wool, natural dyes',
  })
  @IsString()
  @IsOptional()
  materials?: string;
}
