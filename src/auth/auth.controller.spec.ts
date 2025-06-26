// NOTE: All test should follow the AAA (Arange, Act, Assert) model
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { UserDocument } from '../user/schemas/user.schema';
import { SigninUserDto } from '../user/dto/signin-user-dto';
import { HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';

// A mock Mongoose document object that includes the toObject method
const createMockUserDoc = (mockUser: any): UserDocument => {
  return {
    ...mockUser,
    _id: new Types.ObjectId(mockUser._id),
    toObject: () => mockUser,
  } as UserDocument;
};

describe('AuthController', () => {
  let controller: AuthController;

  // Create reusable mocks for all services the controller depends on
  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    provider: jest.fn(),
    validateUserForSocialLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard('local'))
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            _id: 'mockUserId',
            email: 'test@example.com',
            profile: {
              _id: 'mockProfileId',
              displayName: 'Test User',
              username: 'testuser',
            },
            _doc: {
              // Simulate Mongoose's _doc property
              _id: 'mockUserId',
              email: 'test@example.com',
              profile: 'mockProfileId',
            },
          };
          return true;
        },
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should sign up a user and return the sanitized user object', async () => {
      // Arrange
      const signupDto: SigninUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        displayName: 'New User',
        username: 'newuser',
      };

      const createdUser = {
        _id: 'a-new-id',
        email: 'newuser@example.com',
        // Note: The service returns the user doc, which is then sanitized in the controller
        _doc: {
          _id: 'a-new-id',
          email: 'newuser@example.com',
          password: 'hashedpassword',
        },
      };
      mockAuthService.signup.mockResolvedValue(createdUser);

      // Act
      const result = await controller.signUp(signupDto);

      // Assert
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupDto);
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('_id', 'a-new-id');
    });
  });

  describe('signIn', () => {
    it('should log in a user and set the access_token cookie', () => {
      const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        _doc: { _id: 'mockUserId', email: 'test@example.com' },
      };
      const mockRequest = { user: mockUser } as any;
      const mockToken = 'mock-jwt-token';
      const mockResponse = { cookie: jest.fn() } as unknown as Response;
      mockAuthService.login.mockReturnValue(mockToken);

      const result = controller.signIn(mockRequest, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockToken,
        expect.any(Object),
      );
      expect(result).toEqual({ _id: 'mockUserId', email: 'test@example.com' });
    });
  });

  describe('provider', () => {
    it('should handle provider login and return sanitized user', async () => {
      const email = 'provider@example.com';
      const mockUser = {
        email,
        _id: 'providerId',
        _doc: { email, _id: 'providerId' },
      };
      const mockTokenPayload = { accessToken: 'provider-jwt-token' };
      const mockResponse = { cookie: jest.fn() } as unknown as Response;

      mockAuthService.validateUserForSocialLogin.mockResolvedValue(mockUser);
      mockAuthService.provider.mockResolvedValue(mockTokenPayload);

      const result = await controller.provider(email, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(result.user).toEqual({ email, _id: 'providerId' });
    });
  });

  describe('getSession', () => {
    it('should return the full user object from the request', () => {
      const mockUserPayload = {
        _id: '60d5ec49e79c9e001f7b8c8b',
        email: 'session@example.com',
        profile: {
          displayName: 'Session User',
          username: 'sessionuser',
        },
      };
      const mockUserDocument = createMockUserDoc(mockUserPayload);
      const mockRequest = { user: mockUserDocument } as any;

      const result = controller.getSession(mockRequest);

      expect(result).toEqual(mockUserPayload);
    });
  });
});
