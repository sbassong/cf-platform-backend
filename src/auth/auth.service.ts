import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { User, UserDocument } from '../user/schemas/user.schema';
import {Profile, ProfileDocument } from '../profile/schemas/profile.schema'
import { Model } from 'mongoose';
import { SigninUserDto } from '../user/dto/signin-user-dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Connection, Schema as MongooseSchema } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
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

  async changePassword(
    user: UserDocument,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const fullUser = await this.userService.findById(user?._id as string);

    // 1. Verify the current password is correct
    const isMatch = bcrypt.compare(
      currentPassword,
      fullUser?.password as string,
    );
    if (!isMatch) {
      throw new BadRequestException('Your current password is not correct.');
    }

    // 2. Hash the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update the user document
    await this.userModel.updateOne(
      { _id: user._id },
      { password: hashedPassword },
    );

    return { message: 'Password changed successfully.' };
  }
}
