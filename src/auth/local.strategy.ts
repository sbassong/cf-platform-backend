import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninUserDto } from '../user/dto/signin-user-dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({ usernameField: 'email' }); // use 'email' as the username field
  }

  // Passport automatically calls this method with the credentials from the request body.
  async validate(email: string, password_from_request: string): Promise<any> {
    const userBody: SigninUserDto = {
      email,
      password: password_from_request,
      displayName: '',
      username: '',
    };

    const user = await this.authService.signin(userBody);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials provided to strategy.',
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
