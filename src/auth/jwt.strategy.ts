import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

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
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Passport first verifies the JWT's signature and expiration, then calls this method.
   * We now fetch the user from the database to ensure they still exist.
   */
  async validate(payload: { _doc: { _id: string } }): Promise<any> {
    const userId = payload._doc._id;
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
