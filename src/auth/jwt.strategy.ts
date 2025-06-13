import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

// The cookieExtractor function remains the same
const cookieExtractor = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.cookies) {
    const cookieToken = (req.cookies as Record<string, string> | undefined)?.[
      'access_token'
    ];
    token = cookieToken !== undefined ? cookieToken : null;
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 2. Inject both ConfigService and UserService
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('AUTH_SECRET'),
    });
  }

  /**
   * Passport first verifies the JWT's signature and expiration, then calls this method.
   * We now fetch the user from the database to ensure they still exist.
   * The returned user object will be attached to the request as `req.user`.
   */
  async validate(payload: { sub: string; username: string }): Promise<any> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Return sanitized user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
