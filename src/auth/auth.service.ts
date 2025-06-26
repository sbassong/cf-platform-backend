import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  UnauthorizedException,
  // BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { User, UserDocument } from '../user/schemas/user.schema';
import { SigninUserDto } from '../user/dto/signin-user-dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Schema as MongooseSchema } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async signup(userBody: SigninUserDto): Promise<User> {
    const { email, password, displayName, username } = userBody;

    const existingEmail = await this.userService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername =
      await this.profileService.isUsernameTaken(username);
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await this.userService.create(
        {
          email,
          password: hashedPassword,
          provider: 'credentials',
        },
        session,
      );

      const newProfile = await this.profileService.create({
        displayName,
        username,
        userId: newUser._id as MongooseSchema.Types.ObjectId,
      });

      newUser.profile = newProfile._id as MongooseSchema.Types.ObjectId;
      await newUser.save({ session });

      await session.commitTransaction();
      return newUser;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  login(user: UserDocument) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      profileId: user.profile,
    };
    return this.jwtService.sign(payload);
  }

  async signin(
    userData: Pick<SigninUserDto, 'email' | 'password'>,
  ): Promise<User> {
    const user = await this.userService.findByEmail(userData.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const isValid = await bcrypt.compare(userData.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return user;
  }

  async validateUserForSocialLogin(email: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user;
  }

  async provider(email: string): Promise<{ accessToken: string }> {
    const user = await this.validateUserForSocialLogin(email);
    const accessToken = this.login(user as UserDocument);
    return { accessToken };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify<{ sub: string }>(token);
      const user = await this.userService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
