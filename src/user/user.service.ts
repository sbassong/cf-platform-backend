import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { OauthUserDto } from './dto/oauth-user-dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createIfNotExists(userData: OauthUserDto): Promise<User> {
    const existing = await this.findByEmail(userData.email);
    if (existing) return existing;
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async listAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
