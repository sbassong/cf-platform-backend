import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // import configModule to maintain contect because it is used elsewhere.
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
