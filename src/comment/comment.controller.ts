import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetUser } from '../auth/get-user-decorator';
import { UserDocument } from '../user/schemas/user.schema';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: UserDocument,
  ) {
    return this.commentsService.create(postId, createCommentDto, user);
  }

  @Get()
  findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId);
  }
}
