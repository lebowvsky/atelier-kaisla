import { Controller, Post, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Authentication Controller
 * Handles login and user profile endpoints
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint
   * Public route - does not require authentication
   */
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Get current user profile
   * Protected route - requires JWT authentication
   */
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  getProfile(@Request() req) {
    // req.user is set by JwtStrategy.validate()
    return {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    };
  }

  /**
   * Update user credentials (username and/or password)
   * Protected route - requires JWT authentication
   */
  @Patch('credentials')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user credentials (username and/or password)' })
  @ApiResponse({
    status: 200,
    description: 'Credentials updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - at least one field must be provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - current password is incorrect or invalid token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - username already taken',
  })
  async updateCredentials(
    @Request() req,
    @Body() updateCredentialsDto: UpdateCredentialsDto,
  ) {
    return this.authService.updateCredentials(req.user.id, updateCredentialsDto);
  }
}
