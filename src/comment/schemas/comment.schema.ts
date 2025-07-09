import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Profile } from '../../profile/schemas/profile.schema'; // Adjust path if needed
import { Post } from '../../post/schemas/post.schema'; // Adjust path if needed

export type CommentDocument = Comment & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Comment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true,
  })
  post: Post;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Profile', required: true })
  author: Profile;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Profile' }],
    default: [],
  })
  likes: MongooseSchema.Types.ObjectId[];

  @Virtual({
    get: function () {
      return this.likes?.length;
    },
  })
  likesCount: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
