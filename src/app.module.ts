import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// needed to parseInt the env vars into constants to use them without ts throwing error
const rateTtl = parseInt(process.env.RATE_LIMIT_TTL!, 10);
const rateLimit = parseInt(process.env.RATE_LIMIT_MAX!, 10);

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!), // eslint-disable-line 
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: rateTtl,
          limit: rateLimit,
        },
      ],
    }),
    RedisModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
