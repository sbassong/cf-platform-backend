import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  ClientSession,
  Connection,
  Schema as MongooseSchema,
} from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { OauthUserDto } from './dto/oauth-user-dto';
import { ProfileService } from '../profile/profile.service';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly profileService: ProfileService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('profile');
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  async create(
    userData: Partial<User>,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const newUser = new this.userModel(userData);
    return newUser.save({ session });
  }

  async createIfNotExists(oauthUserDto: OauthUserDto): Promise<UserDocument> {
    const existingUser = await this.findByEmail(oauthUserDto.email);
    if (existingUser) return existingUser;

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const newUser = await this.create(
        {
          email: oauthUserDto.email,
          provider: oauthUserDto.provider as 'google' | 'credentials',
          providerId: oauthUserDto.providerId,
          emailVerified: true,
        },
        session,
      );

      const baseUsername = oauthUserDto.email.split('@')[0];
      const uniqueUsername =
        await this.profileService.generateUniqueUsername(baseUsername);

      const newProfile = await this.profileService.create({
        displayName: oauthUserDto.name || uniqueUsername,
        username: uniqueUsername,
        avatarUrl: oauthUserDto.avatarUrl,
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

  async update(
    id: string,
    updates: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async listAll(): Promise<User[]> {
    return this.userModel.find().populate('profile').exec();
  }
}
