import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Usuario-Id', 'X-Usuario-Hash'],
  });
  // Adapter do Socket.IO para garantir CORS/coleta de sockets no mesmo servidor
  app.useWebSocketAdapter(new IoAdapter(app));
  console.log(process.env.DATABASE_URL)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
