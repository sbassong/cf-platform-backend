import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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

  // Link to the Profile document
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Profile' })
  profile: MongooseSchema.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
