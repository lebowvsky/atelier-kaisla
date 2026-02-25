import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new blog tag
 */
export class CreateBlogTagDto {
  @ApiProperty({
    description: 'Tag name',
    maxLength: 100,
    example: 'Wall Hangings',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
