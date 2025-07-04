import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagingService } from './messaging.service';
import { GetUser } from '../auth/get-user-decorator';
import { UserDocument } from '../user/schemas/user.schema';

@Controller('messaging')
@UseGuards(AuthGuard('jwt'))
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  getConversations(@GetUser() user: UserDocument) {
    return this.messagingService.getConversationsForUser(
      user.profile.toString(),
    );
  }

  @Post('conversations')
  findOrCreateConversation(
    @GetUser() user: UserDocument,
    @Body('otherUserId') otherUserId: string,
  ) {
    return this.messagingService.findOrCreateConversation(
      user.profile.toString(),
      otherUserId,
    );
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') conversationId: string) {
    return this.messagingService.getMessagesForConversation(conversationId);
  }
}
