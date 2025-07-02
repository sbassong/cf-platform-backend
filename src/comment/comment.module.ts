import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsService } from './comment.service';
import { CommentsController } from './comment.controller';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Post, PostSchema } from '../post/schemas/post.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    AuthModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentModule {}
