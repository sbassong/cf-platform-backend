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
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';

interface RequestWithUser extends Request {
  user?: any;
}

@Injectable()
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async signUp(@Body() userBody: SigninUserDto) {
    return this.authService.signup(userBody);
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  signIn(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    // LocalStrategy has ALREADY validated user, now available on `req.user`
    const accessToken = this.authService.login(req.user);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600 * 24 * 1000 * 7, // 7 days
    });

    return req.user as object;
  }

  @Post('provider')
  async provider(
    @Body('email') email: string, // email from Auth.js
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    // Find the user that Auth.js should have already created/found
    const user = await this.authService.validateUserForSocialLogin(email);
    if (!user) {
      throw new UnauthorizedException('User not found or social login failed');
    }

    const { accessToken } = await this.authService.provider(email);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 3600 * 24 * 1000 * 7, // 7 days
    });

    return { user }; // Return the user data
  }

  @Post('signout')
  signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    response.status(HttpStatus.OK).json({ message: 'Signed out successfully' });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('session')
  getSession(@Req() req: RequestWithUser) {
    const { password, ...sanitizedUser } = req.user._doc;

    return sanitizedUser as object;
  }
}
