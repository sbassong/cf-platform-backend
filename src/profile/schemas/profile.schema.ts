import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  username: string;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  bannerUrl?: string;

  @Prop()
  bio?: string;

  @Prop()
  location?: string;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Profile' }],
    default: [],
  })
  following: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Profile' }],
    default: [],
  })
  followers: MongooseSchema.Types.ObjectId[];

  // Add virtuals for counts
  get followingCount(): number {
    return this.following.length;
  }

  get followersCount(): number {
    return this.followers.length;
  }
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
