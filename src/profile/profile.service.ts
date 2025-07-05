import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class ProfileService {
  private readonly s3Client: S3Client;
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async findById(id: string): Promise<Profile> {
    const profile = await this.profileModel.findById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    return profile;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileModel.findOne({ userId }).exec();
  }

  async findByUsername(username: string): Promise<Profile | null> {
    return this.profileModel
      .findOne({ username: username.toLowerCase() })
      .exec();
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const profile = await this.profileModel.findOne({
      username: username.toLowerCase(),
    });
    return !!profile;
  }

  async create(profileData: Partial<Profile>): Promise<ProfileDocument> {
    const newProfile = new this.profileModel(profileData);
    return newProfile.save();
  }

  async update(
    profileId: string,
    updates: Partial<Profile>,
    user: UserDocument,
  ): Promise<Profile | null> {
    const profileToUpdate = await this.profileModel.findById(profileId);

    if (!profileToUpdate) {
      throw new NotFoundException('Profile not found.');
    }

    if (profileToUpdate.userId.toString() !== (user._id as string).toString()) {
      throw new ForbiddenException(
        'You are not authorized to update this profile.',
      );
    }

    // Prevent username from being changed after creation.
    if (updates.username) {
      throw new BadRequestException('Username cannot be changed.');
    }

    return await this.profileModel.findByIdAndUpdate(profileId, updates, {
      new: true,
    });
  }

  /**
   * Generates a pre-signed URL for uploading a file to S3.
   * @param key - The unique key (file path) for the object in S3.
   */
  async getAvatarUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 600,
    });

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, publicUrl };
  }

  async getBannerUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 600,
    });
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, publicUrl };
  }

  /**
   * Generates a unique username from a base name (like an email prefix or display name).
   * If the base username is taken, it appends random numbers until a unique one is found.
   */
  async generateUniqueUsername(base: string): Promise<string> {
    let username = base
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '') // Sanitize
      .slice(0, 20); // Truncate

    if (username.length < 3) {
      username = `user${username}`;
    }

    let isTaken = await this.isUsernameTaken(username);
    let attempts = 0;
    while (isTaken && attempts < 5) {
      const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 rand digits
      username = `${username.slice(0, 20)}_${randomSuffix}`;
      isTaken = await this.isUsernameTaken(username);
      attempts++;
    }

    // If it's still taken after 5 attempts, use a completely random one.
    if (isTaken) {
      username = `user_${Date.now()}`;
    }

    return username;
  }

  async follow(
    profileToFollowId: string,
    userProfileId: string,
  ): Promise<Profile> {
    if (profileToFollowId === userProfileId) {
      throw new BadRequestException('You cannot follow yourself.');
    }

    // Add the user to the target profile's followers list
    await this.profileModel.updateOne(
      { _id: profileToFollowId },
      { $addToSet: { followers: userProfileId } }, // Use $addToSet to prevent duplicates
    );

    // add the target profile to the current user's following list
    const updatedProfile = await this.profileModel.findByIdAndUpdate(
      userProfileId,
      { $addToSet: { following: profileToFollowId } },
      { new: true },
    );

    if (!updatedProfile) {
      throw new NotFoundException('Profile not found.');
    }

    return updatedProfile;
  }

  async unfollow(
    profileToUnfollowId: string,
    userProfileId: string,
  ): Promise<Profile> {
    await this.profileModel.updateOne(
      { _id: profileToUnfollowId },
      { $pull: { followers: userProfileId } }, // Use $pull to remove
    );

    const updatedProfile = await this.profileModel.findByIdAndUpdate(
      userProfileId,
      { $pull: { following: profileToUnfollowId } },
      { new: true },
    );

    if (!updatedProfile) {
      throw new NotFoundException('Profile not found.');
    }

    return updatedProfile;
  }
}
