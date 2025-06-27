import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SigninUserDto } from '../user/dto/signin-user-dto';
import { Response, Request } from 'express';
import { UserDocument } from '../user/schemas/user.schema';

interface RequestWithUser extends Request {
  user?: UserDocument;
}

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() userBody: SigninUserDto) {
    const user = await this.authService.signup(userBody);
    // Return a sanitized user object upon successful signup
    const { password, ...result } = (user as any)._doc;
    return result;
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  signIn(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }
    const accessToken = this.authService.login(req.user);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 3600 * 24 * 1000 * 7, // 7 days
    });

    return req.user;
  }

  @Post('provider')
  async provider(
    @Body('email') email: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
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
      maxAge: 3600 * 24 * 1000 * 7,
    });

    const { password, ...sanitizedUser } = (user as any)._doc;
    return { user: sanitizedUser };
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
    // The sanitized user object from the JwtStrategy already has the profile populated
    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }

    return req.user as object;
  }
}
