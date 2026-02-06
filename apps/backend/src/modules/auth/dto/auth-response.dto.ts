import { ApiProperty } from '@nestjs/swagger';

/**
 * User response DTO
 * Excludes sensitive fields like password
 */
export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'User role', enum: ['admin', 'editor'] })
  role: 'admin' | 'editor';
}

/**
 * Auth response DTO
 * Returned after successful login
 */
export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ description: 'User information', type: UserResponseDto })
  user: UserResponseDto;
}
