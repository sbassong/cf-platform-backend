import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { Profile, ProfileDocument } from 'src/profile/schemas/profile.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UserDocument } from '../user/schemas/user.schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class GroupsService {
  private readonly s3Client: S3Client;
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async create(
    createGroupDto: CreateGroupDto,
    user: UserDocument,
  ): Promise<Group> {
    const newGroup = new this.groupModel({
      ...createGroupDto,
      owner: user.profile,
      // creator is automatically the first member
      members: [user.profile],
    });
    return newGroup.save();
  }

  async findAll(user: UserDocument): Promise<Group[]> {
    const blockedUserIds = user.blockedUsers || [];
    let blockedProfileIds = [];

    if (blockedUserIds.length > 0) {
      blockedProfileIds = await this.profileModel.find({
        userId: { $in: blockedUserIds },
      });
    }

    return this.groupModel
      .find({
        owner: { $nin: blockedProfileIds },
      })
      .populate('owner', 'displayName username avatarUrl')
      .populate('members', '_id username displayName avatarUrl')
      .exec();
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel
      .findById(id)
      .populate('owner members')
      .exec();

    if (!group) {
      throw new NotFoundException(`Group with ID "${id}" not found.`);
    }

    return group;
  }

  async findByMemberOrOwner(profileId: string): Promise<Group[]> {
    return this.groupModel
      .find({
        $or: [{ owner: profileId }, { members: profileId }],
      })
      .populate('owner', 'displayName username avatarUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
    user: UserDocument,
  ): Promise<Group> {
    const group = await this.findOne(id);

    if (group.owner.toString() !== user.profile.toString()) {
      throw new ForbiddenException('You are not the owner of this group.');
    }
    Object.assign(group, updateGroupDto);
    return group.save();
  }

  async remove(id: string, user: UserDocument): Promise<{ message: string }> {
    const group = await this.findOne(id);

    if (group.owner.toString() !== user.profile.toString()) {
      throw new ForbiddenException('You are not the owner of this group.');
    }
    await this.groupModel.deleteOne({ _id: id }).exec();
    return { message: 'Group deleted successfully.' };
  }

  async join(id: string, user: UserDocument): Promise<Group> {
    const group = await this.findOne(id);
    const userProfileId = user.profile.toString();

    const isOwner = group.owner.toString() === userProfileId;
    const isMember = group.members.some(
      (member) => member.toString() === userProfileId,
    );

    if (isOwner || isMember) {
      throw new BadRequestException('You are already a member of this group.');
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(
        id,
        { $push: { members: user.profile } },
        { new: true },
      )
      .populate('owner members');

    if (!updatedGroup) {
      throw new NotFoundException(`Group with ID "${id}" not found.`);
    }

    return updatedGroup;
  }

  async leave(id: string, user: UserDocument): Promise<Group> {
    const group = await this.findOne(id);
    const userProfileId = user.profile.toString();

    if (group.owner.toString() === userProfileId) {
      throw new BadRequestException('The owner cannot leave the group.');
    }

    const memberIndex = group.members.findIndex(
      (member) => member.toString() === userProfileId,
    );

    if (memberIndex === -1) {
      throw new BadRequestException('You are not a member of this group.');
    }

    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(
        id,
        { $pull: { members: user.profile } },
        { new: true },
      )
      .populate('owner members');

    if (!updatedGroup) {
      throw new NotFoundException(`Group with ID "${id}" not found.`);
    }

    return updatedGroup;
  }

  async getUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 600,
    });
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    return { uploadUrl, publicUrl };
  }

  async search(query: string): Promise<Group[]> {
    const regex = new RegExp(query, 'i');
    return this.groupModel
      .find({
        $or: [{ name: { $regex: regex } }, { description: { $regex: regex } }],
      })
      .limit(10)
      .exec();
  }
}
