import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProfileDocument } from '../../profile/schemas/profile.schema';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Profile' }],
    required: true,
  })
  participants: ProfileDocument[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Message' })
  lastMessage?: MongooseSchema.Types.ObjectId;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
