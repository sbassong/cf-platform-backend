import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Create a persistent Express instance
const expressApp = express();
let cachedApp: any;

async function bootstrap() {
  // If the app is already initialized in this serverless instance, skip rebuilding
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    app.enableCors({
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: 'Content-Type, Authorization',
      credentials: true, // This allows the browser to send and receive cookies
    });

    app.use(cookieParser());

    // Use app.init() instead of app.listen() for serverless
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// Vercel expects a default export to handle incoming HTTP requests
export default async function handler(req: any, res: any) {
  await bootstrap();
  // Forward the Vercel request to the initialized Express app
  expressApp(req, res);
}
