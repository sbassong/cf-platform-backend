import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // Finds or creates a 1-on-1 conversation
  async findOrCreateConversation(
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation> {
    let conversation = await this.conversationModel.findOne({
      participants: { $all: [user1Id, user2Id], $size: 2 },
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        participants: [user1Id, user2Id],
      });
      await conversation.save();
    }
    return conversation;
  }

  async createMessage(payload: {
    conversationId: string;
    senderId: string;
    content: string;
  }): Promise<Message> {
    const newMessage = new this.messageModel({
      conversation: payload.conversationId,
      sender: payload.senderId,
      content: payload.content,
    });
    const savedMessage = await newMessage.save();

    // update the conversation's lastMessage
    await this.conversationModel.findByIdAndUpdate(payload.conversationId, {
      lastMessage: savedMessage._id,
    });

    return savedMessage.populate('sender');
  }

  async getConversationsForUser(userId: string) {
    return this.conversationModel
      .find({ participants: userId })
      .populate('participants lastMessage');
  }

  async getMessagesForConversation(conversationId: string) {
    return this.messageModel
      .find({ conversation: conversationId })
      .populate('sender');
  }
}
