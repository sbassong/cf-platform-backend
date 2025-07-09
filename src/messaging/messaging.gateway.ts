import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';

@WebSocketGateway({ cors: { origin: '*' } }) // Will revisit CORS
export class MessagingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagingService: MessagingService) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    payload: {
      conversationId: string;
      senderId: string;
      content: string;
    },
  ) {
    const message = await this.messagingService.createMessage(payload);
    // Broadcast the new message to all clients in the conversation room
    this.server.to(payload.conversationId).emit('newMessage', message);
  }
}
