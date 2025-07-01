import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from '../auth/get-user-decorator';
import { UserDocument } from '../user/schemas/user.schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createPostDto: CreatePostDto, @GetUser() user: UserDocument) {
    return this.postsService.create(createPostDto, user);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('/by-author/:profileId')
  findByAuthor(@Param('profileId') profileId: string) {
    return this.postsService.findByAuthor(profileId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body('content') content: string,
    @GetUser() user: UserDocument,
  ) {
    return this.postsService.update(id, content, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.postsService.remove(id, user);
  }
}
