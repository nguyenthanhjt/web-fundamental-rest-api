import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configureApp } from './setup-app.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  app.useBodyParser('json', { limit: '16kb' });
  configureApp(app);
  app.enableShutdownHooks();
  await app.listen(app.get(ConfigService).getOrThrow<number>('PORT'));
}

bootstrap().catch(() => {
  console.error('Không thể khởi động ứng dụng; kiểm tra cấu hình và log phía trên.');
  process.exitCode = 1;
});
