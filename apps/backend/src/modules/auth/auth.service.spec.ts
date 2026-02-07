import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';

describe('AuthService - updateCredentials', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'admin',
    password: '$2b$10$hashedpassword',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  beforeEach(() => {
    // Reset mocks before each test to avoid state leakage
    mockUserRepository.findOne.mockReset();
    mockUserRepository.save.mockReset();
  });

  describe('updateCredentials', () => {
    it('should throw BadRequestException when no fields are provided', async () => {
      const dto: UpdateCredentialsDto = {
        currentPassword: 'password123',
      };

      await expect(service.updateCredentials(mockUser.id, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateCredentials(mockUser.id, dto)).rejects.toThrow(
        'At least one field (username or newPassword) must be provided',
      );
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const dto: UpdateCredentialsDto = {
        currentPassword: 'password123',
        newPassword: 'newPassword456',
      };

      await expect(
        service.updateCredentials('invalid-id', dto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateCredentials('invalid-id', dto),
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const dto: UpdateCredentialsDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword456',
      };

      await expect(service.updateCredentials(mockUser.id, dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.updateCredentials(mockUser.id, dto)).rejects.toThrow(
        'Current password is incorrect',
      );
    });

    it('should throw ConflictException when username is already taken', async () => {
      const existingUser: User = { ...mockUser, id: 'different-id' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call for current user
        .mockResolvedValueOnce(existingUser); // Second call for username check

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const dto: UpdateCredentialsDto = {
        currentPassword: 'password123',
        username: 'existinguser',
      };

      await expect(service.updateCredentials(mockUser.id, dto)).rejects.toThrow(
        new ConflictException('Username is already taken'),
      );
    });

    it('should successfully update password', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('$2b$10$newhashedpassword' as never);

      const updatedUser = {
        ...mockUser,
        password: '$2b$10$newhashedpassword',
      };
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const dto: UpdateCredentialsDto = {
        currentPassword: 'password123',
        newPassword: 'newPassword456',
      };

      const result = await service.updateCredentials(mockUser.id, dto);

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe(mockUser.username);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword456', 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should successfully update username', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call for current user
        .mockResolvedValueOnce(null); // Second call for username check (not taken)

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const updatedUser = {
        ...mockUser,
        username: 'newusername',
      };
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const dto: UpdateCredentialsDto = {
        currentPassword: 'password123',
        username: 'newusername',
      };

      const result = await service.updateCredentials(mockUser.id, dto);

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe('newusername');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should successfully update both username and password', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call for current user
        .mockResolvedValueOnce(null); // Second call for username check (not taken)

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('$2b$10$newhashedpassword' as never);

      const updatedUser = {
        ...mockUser,
        username: 'newusername',
        password: '$2b$10$newhashedpassword',
      };
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const dto: UpdateCredentialsDto = {
        currentPassword: 'password123',
        username: 'newusername',
        newPassword: 'newPassword456',
      };

      const result = await service.updateCredentials(mockUser.id, dto);

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe('newusername');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword456', 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('$2b$10$newhashedpassword' as never);

      const updatedUser = {
        ...mockUser,
        password: '$2b$10$newhashedpassword',
      };
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const dto: UpdateCredentialsDto = {
        currentPassword: 'password123',
        newPassword: 'newPassword456',
      };

      await service.updateCredentials(mockUser.id, dto);

      expect(hashSpy).toHaveBeenCalledWith('newPassword456', 10);
    });
  });
});
