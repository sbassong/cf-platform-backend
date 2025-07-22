import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
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
  @UseGuards(AuthGuard('jwt'))
  findAll(@GetUser() user: UserDocument) {
    return this.postsService.findAll(user);
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
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: UserDocument,
  ) {
    return this.postsService.update(id, updatePostDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.postsService.remove(id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('image-upload-url')
  async getPostImageUploadUrl(
    @GetUser() user: UserDocument,
    @Body('contentType') contentType: string,
  ) {
    if (!contentType) {
      throw new BadRequestException('contentType is required.');
    }

    const key = `posts/${user._id}/${uuidv4()}.jpeg`;
    return this.postsService.getPostImageUploadUrl(key, contentType);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('by-group/:groupId')
  findByGroup(
    @Param('groupId') groupId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.postsService.findByGroup(groupId, user);
  }
}
