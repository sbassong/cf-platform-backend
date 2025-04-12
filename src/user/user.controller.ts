import { Controller, Get, Post, Param, Put, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

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
  async update(@Param('id') id: string, @Body() data: any) {
    return this.userService.update(id, data);
  }

  // // Example use of dto
  // @Post('oauth')
  // async oauthUpsert(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.createIfNotExists(createUserDto);
  // }

  @Post('oauth')
  async oauthUpsert(@Body() body: CreateUserDto) {
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
