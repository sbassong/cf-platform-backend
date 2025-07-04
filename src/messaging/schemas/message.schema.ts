import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ConversationDocument } from './conversation.schema';
import { ProfileDocument } from '../../profile/schemas/profile.schema';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversation: ConversationDocument;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Profile', required: true })
  sender: ProfileDocument;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Profile' }],
    default: [],
  })
  readBy: ProfileDocument[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
