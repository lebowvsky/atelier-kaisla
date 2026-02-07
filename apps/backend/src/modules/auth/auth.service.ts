import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';

/**
 * Authentication Service
 * Handles user authentication, JWT token generation, and password validation
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials
   * @param username - Username
   * @param password - Plain text password
   * @returns User object without password if valid, null otherwise
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Login user and generate JWT token
   * @param loginDto - Login credentials
   * @returns JWT token and user information
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT payload
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User object without password
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * Hash password using bcrypt
   * Static utility method for password hashing
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Update user credentials (username and/or password)
   * @param userId - User ID from JWT token
   * @param updateCredentialsDto - Update credentials DTO
   * @returns Updated user information without password
   */
  async updateCredentials(
    userId: string,
    updateCredentialsDto: UpdateCredentialsDto,
  ): Promise<Omit<User, 'password'>> {
    const { currentPassword, username, newPassword } = updateCredentialsDto;

    // Validate at least one field is provided
    if (!username && !newPassword) {
      throw new BadRequestException(
        'At least one field (username or newPassword) must be provided',
      );
    }

    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if username is being updated and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });

      if (existingUser) {
        throw new ConflictException('Username is already taken');
      }

      user.username = username;
    }

    // Update password if provided
    if (newPassword) {
      user.password = await AuthService.hashPassword(newPassword);
    }

    // Save updated user
    const updatedUser = await this.userRepository.save(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
