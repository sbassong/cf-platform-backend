import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module'; // Import ProfileModule
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const rateTtl = parseInt(process.env.RATE_LIMIT_TTL || '60000', 10);
const rateLimit = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    ThrottlerModule.forRoot([
      {
        ttl: rateTtl,
        limit: rateLimit,
      },
    ]),
    AuthModule,
    UserModule,
    ProfileModule, // Add ProfileModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
