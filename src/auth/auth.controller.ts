import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
@Controller('auth')
// @UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  @Get('profile')
  // @UseGuards(AuthGuard('jwt'))
  getProfile() {
    return { message: 'Rate limited and authenticated' };
  }
  @Post('signup')
  // signup(): Promise<string | undefined> { // for e2e testing
  signup(): Promise<User | undefined> {
    return this.authService.signup();
  }
}
