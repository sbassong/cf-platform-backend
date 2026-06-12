import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
  } catch (e) {
    console.warn('Redis unavailable, falling back to in-memory Socket.io adapter:', (e as Error).message);
  }

  app.enableCors({
    origin: [
      process.env.DEV_FRONTEND_ORIGIN,
      process.env.FRONTEND_ORIGIN,
      process.env.EXPO_ORIGIN,
      'http://localhost:8081',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap(); // void so ts doesn't expect it to be awaited
