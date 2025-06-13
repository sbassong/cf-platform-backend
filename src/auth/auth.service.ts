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
    // console.log('type of hash ', typeof hashedPassword, { hashedPassword });
    const userData = {
      ...userBody,
      password: hashedPassword,
      provider: 'credentials',
    };
    return this.userService.createIfNotExists(userData);
  }

  // ADD THIS NEW METHOD
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

  async createIfNotExists(userData: SigninUserDto): Promise<User> {
    const existing = await this.userService.findByEmail(userData.email);
    if (existing) return existing;
    const newUser = new this.userModel(userData);
    newUser.provider = 'credentials';
    return newUser.save();
  }

  async validateToken(token: string): Promise<User> {
    console.log('VALIDATE TOKEN RUNNING');
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('AUTH_SECRET'),
      });

      const email = decoded?.email;
      if (!email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Optionally can further enhance above
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

  // most likely will be handled in frontend only
  // async signout(token: string): Promise<{ message: string }> { // switch when async logic added
  // // signout(token: string): Promise<{ message: string }> {
  //   // For stateless JWTs, there's no true "logout" unless you blacklist the token.
  //   // You can optionally store the token in a blacklist (e.g., Redis or DB) if needed.
  //   try {
  //     const decoded = this.jwtService.verify<JwtPayload>(token, {
  //       secret: this.configService.get<string>('AUTH_SECRET'),
  //     });
  //     // await this.redisService.blacklistToken(token); // If using Redis
  //     // For now we just rely on frontend deleting the token

  //     return { message: 'User logged out successfully' };
  //   } catch (err) {
  //     console.error('Token validation failed:', err);
  //     throw new UnauthorizedException('Invalid or expired token');
  //   }
  // }
  // // }
}
