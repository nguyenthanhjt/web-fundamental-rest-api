import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          if (error.value === undefined || error.value === null || error.value === '') {
            return `${error.property} is required`;
          }
          return Object.values(error.constraints ?? {})[0] ?? `${error.property} is invalid`;
        });
        return new BadRequestException(messages.join(', '));
      },
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}/api/v1`);
}

void bootstrap();
