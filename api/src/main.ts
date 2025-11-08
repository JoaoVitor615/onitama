import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Usuario-Id', 'X-Usuario-Hash'],
  });
  console.log(process.env.DATABASE_URL)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
