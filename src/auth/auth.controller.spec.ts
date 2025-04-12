import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth.module';
import { AppModule } from '../app.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';

// NEED TO FIGURE OUT MODULE IMPORTS FOR THIS SPEC TO RUN
// THIS WHOLE FILE NEEDS A LOOKAT
describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [JwtModule, AuthModule, AppModule, ConfigModule, RedisModule],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('signup', () => {
    it('should return user with email and name properties', () => {
      expect(typeof authController.signup()).toBe('object');
    });
  });
});
