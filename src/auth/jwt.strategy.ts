// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Recommended for secrets

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Specifies how to extract the JWT from the request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // We delegate the responsibility of ensuring that a JWT has not expired to the Passport module.
      ignoreExpiration: false,

      // The secret key used to sign the token. This MUST match the secret in your auth.module.ts
      secretOrKey: configService.get<string>('AUTH_SECRET'),
    });
  }

  /**
   * This method is called after the token is successfully verified.
   * The 'payload' is the decoded JSON object from the token.
   * Whatever you return from here is attached to the Request object as `req.user`.
   */
  async validate(payload: any) {
    // Example: You might want to do a database call here to get the full user object
    return { userId: payload.sub, username: payload.username };
  }
}
