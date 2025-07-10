import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class PostsService {
  private readonly s3Client: S3Client;
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async create(
    createPostDto: CreatePostDto,
    user: UserDocument,
  ): Promise<Post> {
    const newPost = new this.postModel({
      ...createPostDto,
      author: user.profile,
    });
    return newPost.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel
      .find()
      .populate('author')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByAuthor(profileId: string): Promise<Post[]> {
    return this.postModel
      .find({ author: profileId })
      .populate('author')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).populate('author').exec();
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    user: UserDocument,
  ): Promise<Post> {
    const post = await this.findOne(id);

    const authorId = post.author.toString();

    if (authorId !== user.profile.toString()) {
      throw new ForbiddenException('You can only edit your own posts.');
    }

    if (updatePostDto.content) {
      post.content = updatePostDto.content;
    }

    if (updatePostDto.imageUrl !== undefined) {
      post.imageUrl = updatePostDto.imageUrl;
    }

    return post.save();
  }

  async remove(id: string, user: UserDocument): Promise<{ message: string }> {
    const post = await this.findOne(id);

    const authorId = post.author.toString();

    if (authorId !== user.profile.toString()) {
      throw new UnauthorizedException('You can only delete your own posts.');
    }

    await this.postModel.deleteOne({ _id: id }).exec();
    return { message: 'Post deleted successfully' };
  }

  async getPostImageUploadUrl(key: string, contentType: string) {
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

  async findByGroup(groupId: string): Promise<Post[]> {
    return this.postModel
      .find({ group: groupId })
      .populate('author', 'displayName username avatarUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(query: string): Promise<Post[]> {
    const regex = new RegExp(query, 'i');
    return this.postModel
      .find({ content: { $regex: regex } })
      .populate('author', 'displayName username avatarUrl')
      .limit(10)
      .exec();
  }
}
