import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { SigninUserDto } from '../user/dto/signin-user-dto';

interface JwtPayload {
  email: string;
  name?: string;
  image?: string;
  provider?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async signup(userBody: SigninUserDto): Promise<User> {
    const existing = await this.userService.findByEmail(userBody.email);
    if (existing) throw new BadRequestException('Email already in use');
    const hashedPassword = await bcrypt.hash(userBody.password, 10);
    const userData = {
      ...userBody,
      password: hashedPassword,
      provider: 'credentials',
    };
    return this.userService.createIfNotExists(userData);
  }

  login(user: User) {
    const payload = { ...user, password: null };
    return this.jwtService.sign(payload);
  }

  async signin(userData: SigninUserDto): Promise<User> {
    const user = await this.userService.findByEmail(userData.email);
    if (!user)
      throw new UnauthorizedException(
        'There was an error while logging you in. Please try again.',
      );
    const isValid = await bcrypt.compare(userData.password, user.password!); // may need to revisit validating password without ! await needed for next line
    if (!isValid)
      throw new UnauthorizedException(
        'There was an error while logging you in. Please try again.',
      );
    return user;
  }

  async provider(email: string): Promise<{ accessToken: string }> {
    const user = await this.validateUserForSocialLogin(email);
    const accessToken = this.login(user);
    return { accessToken };
  }

  async validateUserForSocialLogin(email: string): Promise<User> {
    // frontend/NextAuth already verified the user with Google,
    // so we just need to find them in our database.
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        'Could not find user associated with this social account.',
      );
    }
    return user;
  }

  async createIfNotExists(userData: SigninUserDto): Promise<User> {
    const existing = await this.userService.findByEmail(userData.email);
    if (existing) return existing;
    const newUser = new this.userModel(userData);
    newUser.provider = 'credentials';
    return newUser.save();
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const email = decoded?.email;
      if (!email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (err) {
      console.error('Token validation failed:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
