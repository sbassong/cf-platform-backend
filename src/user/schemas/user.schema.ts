import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  NotificationSettings,
  NotificationSettingsSchema,
} from './notification-settings.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ default: 'user' })
  role: 'user' | 'moderator' | 'admin';

  @Prop()
  provider?: 'google' | 'credentials';

  @Prop()
  providerId?: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  blockedUsers: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  blockedBy: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Profile' })
  profile: MongooseSchema.Types.ObjectId;

  @Prop({ type: NotificationSettingsSchema, default: () => ({}) })
  notifications: NotificationSettings;
}

export const UserSchema = SchemaFactory.createForClass(User);
