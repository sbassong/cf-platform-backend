import { Controller, Get, Post, Param, Put, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { OauthUserDto } from './dto/oauth-user-dto';
import { User } from './schemas/user.schema';

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
}
