import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  constructor(
    private configService: ConfigService<{ REDIS_URL: string }, true>, // infers the var will be string
  ) {}

  onModuleInit() {
    this.client = new Redis(this.configService.get('REDIS_URL'));
  }

  getClient(): Redis {
    return this.client;
  }
}
