import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SigninUserDto } from '../user/dto/signin-user-dto';
import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

// Extend Express Request interface to include 'user'
interface RequestWithUser extends Request {
  user?: any;
}

@Injectable()
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // @InjectModel(User.name) private userModel: Model<UserDocument>,
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

  @UseGuards(AuthGuard('jwt'))
  @Post('signup')
  async signup(@Body() userBody: SigninUserDto) {
    return this.authService.signup(userBody);
  }

  // // @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('local'))
  @Post('signin')
  async signin(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    // At this point, the LocalStrategy has ALREADY validated the user.
    // The user object is now available on `req.user`.
    const accessToken = await this.authService.login(req.user);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600000, // 1 hour
    });

    return req.user as object;
  }

  @Post('signout')
  signOut(@Res({ passthrough: true }) response: Response) {
    // Clear the cookie by setting an expired date
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    response.status(HttpStatus.OK).json({ message: 'Signed out successfully' });
  }
}
