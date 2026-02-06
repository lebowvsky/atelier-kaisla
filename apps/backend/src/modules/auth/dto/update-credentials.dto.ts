import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update Credentials DTO
 * Used for PATCH /api/auth/credentials request body validation
 * Allows updating email and/or password with current password verification
 */
export class UpdateCredentialsDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'currentPassword123',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiPropertyOptional({
    description: 'New username/email address (optional)',
    example: 'newusername@example.com',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Username cannot be empty' })
  username?: string;

  @ApiPropertyOptional({
    description: 'New password (optional, minimum 6 characters)',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword?: string;
}
