import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { Profile, ProfileDocument } from 'src/profile/schemas/profile.schema';

import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
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

  async getConversationsForUser(userId: string, user: UserDocument) {
    const blockedUserIds = user.blockedUsers || [];
    let blockedProfileIds = [];

    if (blockedUserIds.length > 0) {
      blockedProfileIds = await this.profileModel.find({
        userId: { $in: blockedUserIds },
      });
    }

    return (
      this.conversationModel
        .find({
          $and: [
            { participants: userId },
            { participants: { $nin: blockedProfileIds } },
          ],
        })
        .populate('participants', 'displayName username avatarUrl')
        // perform a nested population to get the sender of the last message
        // ensures no notifications from user's own messages
        .populate({
          path: 'lastMessage',
          populate: {
            path: 'sender',
            select: 'displayName username avatarUrl',
          },
        })
        .sort({ updatedAt: -1 })
    );
  }

  async getMessagesForConversation(conversationId: string) {
    return this.messageModel
      .find({ conversation: conversationId })
      .populate('sender');
  }

  async markConversationAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    // we want to find all messages in the conversation that the user has
    // not yet read. and add the user's ID to their 'readBy' array.
    await this.messageModel.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $nin: userId },
      },
      { $addToSet: { readBy: userId } },
    );
  }
}
