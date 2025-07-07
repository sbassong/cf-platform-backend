import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagingService } from './messaging.service';
import { GetUser } from '../auth/get-user-decorator';
import { UserDocument } from '../user/schemas/user.schema';

@Controller('messaging')
@UseGuards(AuthGuard('jwt'))
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('conversations')
  findOrCreateConversation(
    @GetUser() user: UserDocument,
    @Body('otherUserId') otherUserId: string,
  ) {
    const userProfileId = (user.profile as any)._id.toString();
    return this.messagingService.findOrCreateConversation(
      userProfileId,
      otherUserId,
    );
  }

  @Get('conversations')
  getConversations(@GetUser() user: UserDocument) {
    const userProfileId = (user.profile as any)._id.toString();
    return this.messagingService.getConversationsForUser(userProfileId);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') conversationId: string) {
    return this.messagingService.getMessagesForConversation(conversationId);
  }
}
