import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  bio: string;

  @Prop()
  location: string;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop()
  provider: 'google' | 'facebook' | 'twitter' | 'credentials';

  @Prop()
  providerId: string;

  @Prop({ default: 'user' })
  role: 'user' | 'moderator' | 'admin';

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
