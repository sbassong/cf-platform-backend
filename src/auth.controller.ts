import { Controller, Get, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile() {
    return { message: 'Rate limited and authenticated' };
  }
}
