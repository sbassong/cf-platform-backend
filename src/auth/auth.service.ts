import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // async validateToken(token: string): Promise<User | null> {
  //   try {
  //     const decoded = this.jwtService.verify(token, {
  //       secret: this.configService.get<string>('AUTH_SECRET'),
  //     });

  //     const email = decoded.email;
  //     if (!email) {
  //       throw new UnauthorizedException('Invalid token payload');
  //     }

  //     // // Optionally create/find user in MongoDB
  //     // let user = await this.userModel.findOne({ email });
  //     // if (!user) {
  //     //   user = await this.userModel.create({ email });
  //     // }
  //     // Optionally can further enhance above
  //     let user = await this.userModel.findOne({ email });
  //     if (!user) {
  //       user = await this.userModel.create({
  //         email,
  //         name: decoded.name,
  //         image: decoded.picture || decoded.image,
  //         provider: decoded.provider || 'credentials',
  //       });
  //     }

  //     return user;
  //   } catch (err) {
  //     console.error('Token validation failed:', err);
  //     throw new UnauthorizedException('Invalid or expired token');
  //   }
  // }

  async signup(): Promise<User | undefined> {
    // async signup(): Promise<string | undefined> { // for testing
    const userBody = {
      email: 'sam@email.com',
      name: 'sam',
    };

    try {
      let user = await this.userModel.findOne({ email: userBody.email });
      if (!user) {
        user = await this.userModel.create({
          email: userBody.email,
          name: userBody.name,
        });
      }
      // return user.email; // for e2e testing
      return user;
    } catch (error) {
      console.error(error);
    }
  }
}
