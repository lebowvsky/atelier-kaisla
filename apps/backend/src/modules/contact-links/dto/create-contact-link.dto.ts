import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactPlatform } from '../../../entities/contact-link.entity';

/**
 * DTO for creating a new contact link
 */
export class CreateContactLinkDto {
  @ApiProperty({
    description: 'Platform type',
    enum: ContactPlatform,
    example: ContactPlatform.INSTAGRAM,
  })
  @IsEnum(ContactPlatform)
  @IsNotEmpty()
  platform: ContactPlatform;

  @ApiProperty({
    description: 'URL or value (profile URL or email address)',
    maxLength: 500,
    example: 'https://instagram.com/atelier_kaisla',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Matches(/^(https?:\/\/|mailto:).+/, {
    message: 'URL must start with http://, https://, or mailto:',
  })
  url: string;

  @ApiPropertyOptional({
    description: 'Display label',
    maxLength: 255,
    example: '@atelier_kaisla',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9@_.\-\s]*$/, {
    message:
      'Label can only contain letters, numbers, @, _, ., - and spaces',
  })
  label?: string;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    default: 0,
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the link is active and visible',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
