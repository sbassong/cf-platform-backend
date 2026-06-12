import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.DEV_FRONTEND_ORIGIN, process.env.FRONTEND_ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // This allows the browser to send and receive cookies
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap(); // void so ts doesn't expect it to be awaited
