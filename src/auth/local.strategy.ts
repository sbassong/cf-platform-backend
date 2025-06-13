import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninUserDto } from '../user/dto/signin-user-dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // We can tell passport to use 'email' as the username field
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({ usernameField: 'email' });
  }

  /**
   * Passport automatically calls this method with the credentials from the request body.
   * This is where we plug in your existing service logic.
   */
  async validate(email: string, password_from_request: string): Promise<any> {
    const userBody: SigninUserDto = { email, password: password_from_request };

    // REUSING YOUR EXISTING CODE:
    // This calls the same signin method you already wrote in your service.
    const user = await this.authService.signin(userBody);

    if (!user) {
      // If your service throws an exception, Passport catches it.
      // If it returns null, we can throw our own.
      throw new UnauthorizedException(
        'Invalid credentials provided to strategy.',
      );
    }
    // If successful, Passport attaches the returned user to `req.user`
    return user;
  }
}
