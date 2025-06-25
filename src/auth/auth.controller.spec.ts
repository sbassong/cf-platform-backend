import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { User } from '../user/schemas/user.schema';
import { SigninUserDto } from '../user/dto/signin-user-dto';
import { HttpStatus } from '@nestjs/common';

// Define a type for our mock user to ensure consistency
type MockUser = Partial<User> & { _id: string };

interface RequestWithUser extends Request {
  user?: any;
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // Create a reusable mock for the AuthService
  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    provider: jest.fn(),
    validateUserForSocialLogin: jest.fn(),
    signOut: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    // Create an isolated, in-memory testing module for the AuthController
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      // Override all guards used in the controller so they don't block our tests
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      // For the 'local' guard, we need to simulate it attaching a user to the request
      .overrideGuard(AuthGuard('local'))
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          // Attach a mock user to the request, which the real guard would do upon success
          req.user = {
            _id: 'mockUserId',
            email: 'test@example.com',
            name: 'Test User',
          };
          return true;
        },
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    // also get the mock service instance if we need to inspect it directly
    service = module.get<AuthService>(AuthService);
  });

  // Clear all mock history after each test to ensure isolation
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      // Arrange
      const signupDto: SigninUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };
      const expectedUser = { ...signupDto, _id: 'a-new-id' };

      // Mock the service's signup method to return the expected user
      mockAuthService.signup.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.signUp(signupDto);

      // Assert
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('signIn', () => {
    it('should log in a user and set the access_token cookie', () => {
      const mockUser: MockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockRequest = { user: mockUser } as any;
      const mockToken = 'mock-jwt-token';

      // Create a mock response object with jest functions
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      // Configure the mock service to return the token
      mockAuthService.login.mockReturnValue(mockToken);

      const result = controller.signIn(mockRequest, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockToken,
        expect.any(Object),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('provider', () => {
    it('should handle provider login, and set the cookie', async () => {
      const email = 'provider@example.com';
      const mockUser = { email, name: 'Provider User', _id: 'providerId' };
      const mockTokenPayload = { accessToken: 'provider-jwt-token' };

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      mockAuthService.validateUserForSocialLogin.mockResolvedValue(mockUser);
      mockAuthService.provider.mockResolvedValue(mockTokenPayload);

      const result = await controller.provider(email, mockResponse);

      expect(mockAuthService.validateUserForSocialLogin).toHaveBeenCalledWith(
        email,
      );
      expect(mockAuthService.provider).toHaveBeenCalledWith(email);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        mockTokenPayload.accessToken,
        expect.any(Object),
      );
      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('signOut', () => {
    it('should clear the access_token cookie', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(), // Allow chaining .status().json()
        json: jest.fn(),
      } as unknown as Response;

      controller.signOut(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.any(Object),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Signed out successfully',
      });
    });
  });

  describe('getSession', () => {
    it('should return the user from the request, without the password', () => {
      const mockUserWithPassword = {
        _id: 'sessionId',
        email: 'session@example.com',
        password: 'a-hashed-password',
        role: 'user',
      };

      const mockRequest = {
        user: { _doc: mockUserWithPassword },
      } as any;
      const expectedUser = {
        _id: 'sessionId',
        email: 'session@example.com',
        role: 'user',
      };

      const result = controller.getSession(mockRequest);

      expect(result).toEqual(expectedUser);
      expect(result).not.toHaveProperty('password');
    });
  });
});
