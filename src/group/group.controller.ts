import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GetUser } from '../auth/get-user-decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createGroupDto: CreateGroupDto,
    @GetUser() user: UserDocument,
  ) {
    return this.groupsService.create(createGroupDto, user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@GetUser() user: UserDocument) {
    return this.groupsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Get('/by-author/:profileId')
  findByAuthor(@Param('profileId') profileId: string) {
    return this.groupsService.findByMemberOrOwner(profileId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @GetUser() user: UserDocument,
  ) {
    return this.groupsService.update(id, updateGroupDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.groupsService.remove(id, user);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  join(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.groupsService.join(id, user);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  leave(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.groupsService.leave(id, user);
  }

  @Post('avatar-upload-url')
  @UseGuards(AuthGuard('jwt'))
  async getAvatarUploadUrl(@Body('contentType') contentType: string) {
    if (!contentType) {
      throw new BadRequestException('contentType is required.');
    }
    const key = `groups/avatars/${uuidv4()}.jpeg`;
    return this.groupsService.getUploadUrl(key, contentType);
  }

  @Post('banner-upload-url')
  @UseGuards(AuthGuard('jwt'))
  async getBannerUploadUrl(@Body('contentType') contentType: string) {
    if (!contentType) {
      throw new BadRequestException('contentType is required.');
    }
    const key = `groups/banners/${uuidv4()}.jpeg`;
    return this.groupsService.getUploadUrl(key, contentType);
  }
}
