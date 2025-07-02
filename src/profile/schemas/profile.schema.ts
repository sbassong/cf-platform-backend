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
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
