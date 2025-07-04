import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';
import { Profile } from './schemas/profile.schema';
import { GetUser } from '../auth/get-user-decorator';
import { UserDocument } from '../user/schemas/user.schema';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    return this.profileService.findByUsername(username);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.profileService.findById(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.profileService.findByUserId(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') profileId: string,
    @Body() data: Partial<Profile>,
    @GetUser() user: UserDocument,
  ) {
    return this.profileService.update(profileId, data, user);
  }

  /**
   * Generates a secure, pre-signed URL for uploading an avatar.
   * The client will receive this URL and use it to upload the file directly to S3.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('avatar-upload-url')
  async getAvatarUploadUrl(
    @GetUser() user: UserDocument,
    @Body('contentType') contentType: string,
  ) {
    if (!contentType) {
      throw new BadRequestException('contentType is required.');
    }

    const key = `avatars/${user._id}/${uuidv4()}.jpeg`;
    return this.profileService.getAvatarUploadUrl(key, contentType);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('banner-upload-url')
  async getBannerUploadUrl(
    @GetUser() user: UserDocument,
    @Body('contentType') contentType: string,
  ) {
    if (!contentType) {
      throw new BadRequestException('contentType is required.');
    }

    const key = `banners/${user._id}/${uuidv4()}.jpeg`;
    return this.profileService.getBannerUploadUrl(key, contentType);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/follow')
  async follow(@Param('id') profileId: string, @GetUser() user: UserDocument) {
    return this.profileService.follow(profileId, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/unfollow')
  async unfollow(
    @Param('id') profileId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.profileService.unfollow(profileId, user);
  }
}
