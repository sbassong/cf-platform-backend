import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Post, PostDocument } from '../post/schemas/post.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    user: UserDocument,
  ): Promise<Comment> {
    const newComment = new this.commentModel({
      ...createCommentDto,
      author: user.profile,
      post: postId,
    });
    // Atomically increment the commentsCount on the parent post
    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });
    return newComment.save();
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ post: postId })
      .populate('author')
      .sort({ createdAt: 'asc' })
      .exec();
  }
}
