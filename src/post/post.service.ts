import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

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

  async update(id: string, content: string, user: UserDocument): Promise<Post> {
    const post = await this.findOne(id);
    let authorId: string;
    if (
      post.author &&
      typeof post.author === 'object' &&
      '_id' in post.author &&
      post.author._id
    ) {
      authorId = (post.author._id as unknown as string).toString();
    } else if (typeof post.author === 'string') {
      authorId = post.author;
    } else {
      throw new UnauthorizedException('Unable to determine post author.');
    }
    if (authorId !== user.profile.toString()) {
      throw new UnauthorizedException('You can only update your own posts.');
    }
    post.content = content;
    return post.save();
  }

  async remove(id: string, user: UserDocument): Promise<{ message: string }> {
    const post = await this.findOne(id);
    let authorId: string;
    if (typeof post.author === 'object' && post.author !== null && '_id' in post.author && post.author._id) {
      authorId = (post.author._id as unknown as string).toString();
    } else if (typeof post.author === 'string') {
      authorId = post.author;
    } else {
      throw new UnauthorizedException('Unable to determine post author.');
    }
    if (authorId !== user.profile.toString()) {
      throw new UnauthorizedException('You can only delete your own posts.');
    }
    await this.postModel.deleteOne({ _id: id }).exec();
    // Here you would also trigger deletion of associated comments
    return { message: 'Post deleted successfully' };
  }
}
