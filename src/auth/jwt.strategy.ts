import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['access_token'] || null;
  }
  return null;
};

const bearerExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

const combinedExtractor = (req: Request): string | null => {
  return cookieExtractor(req) || bearerExtractor(req as any);
};

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  profileId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: combinedExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    // Passport first verifies the JWT's signature and expiration.
    // fetch existing user object to be attached to request.
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // return user document which includes the populated profile
    return (user as any)._doc;
  }
}
