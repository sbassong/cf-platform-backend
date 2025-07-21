import {
  Controller,
  Get,
  Post,
  Param,
  Put,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserDocument } from './schemas/user.schema';
import { OauthUserDto } from './dto/oauth-user-dto';
import { User } from './schemas/user.schema';
import { GetUser } from 'src/auth/get-user-decorator';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.listAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<User>) {
    return this.userService.update(id, data);
  }

  @Post('oauth')
  async oauthUpsert(@Body() body: OauthUserDto) {
    const { email, name, avatarUrl, provider, providerId } = body;
    return this.userService.createIfNotExists({
      email,
      name,
      avatarUrl,
      provider,
      providerId,
      emailVerified: true,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me/notifications')
  updateNotificationSettings(
    @GetUser() user: UserDocument,
    @Body() settingsDto: UpdateNotificationSettingsDto,
  ) {
    return this.userService.updateNotificationSettings(
      user?._id as string,
      settingsDto,
    );
  }

  @Post(':id/block')
  @UseGuards(AuthGuard('jwt'))
  blockUser(@Param('id') userIdToBlock: string, @GetUser() user: UserDocument) {
    return this.userService.blockUser(user._id as string, userIdToBlock);
  }

  @Post(':id/unblock')
  @UseGuards(AuthGuard('jwt'))
  unblockUser(
    @Param('id') userIdToUnblock: string,
    @GetUser() user: UserDocument,
  ) {
    return this.userService.unblockUser(user._id as string, userIdToUnblock);
  }
}
