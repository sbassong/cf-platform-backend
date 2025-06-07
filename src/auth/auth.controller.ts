import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { SigninUserDto } from '../user/dto/signin-user-dto';
import { Injectable } from '@nestjs/common';

@Injectable()
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile() {
    return { message: 'Rate limited and authenticated' };
  }

  @Get('validateToken')
  @UseGuards(AuthGuard('jwt'))
  async validateToken(@Body() token: string) {
    return this.authService.validateToken(token);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Post('signup')
  async signup(@Body() userBody: SigninUserDto) {
    return this.authService.signup(userBody);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Post('signin')
  async signin(@Body() userBody: SigninUserDto) {
    return this.authService.signin(userBody);
  }

}
