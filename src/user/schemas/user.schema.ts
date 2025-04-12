import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  bio: string;

  @Prop()
  location: string;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop()
  provider: 'google' | 'github' | 'credentials';

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
