import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
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

  @Virtual({
    get: function () {
      return this.following?.length;
    },
  })
  followingCount: number;

  @Virtual({
    get: function () {
      return this.followers?.length;
    },
  })
  followersCount: number;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
