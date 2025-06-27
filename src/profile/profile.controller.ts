import { Controller, Get, Param, Put, Body, UseGuards } from '@nestjs/common';
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
}
