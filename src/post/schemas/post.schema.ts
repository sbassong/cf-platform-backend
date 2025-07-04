import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Profile, ProfileDocument } from '../../profile/schemas/profile.schema'; // Import ProfileDocument
import { GroupDocument } from '../../group/schemas/group.schema';

export type PostDocument = Post & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Post {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    index: true,
  })
  author: MongooseSchema.Types.ObjectId | ProfileDocument;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Group' })
  group?: GroupDocument; // Add the optional group reference

  @Prop({ type: String, default: undefined })
  imageUrl?: string | null;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Profile' }],
    default: [],
  })
  likes: MongooseSchema.Types.ObjectId[];

  get likesCount(): number {
    return this.likes.length;
  }

  @Prop({ default: 0 })
  commentsCount: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
