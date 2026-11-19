import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

export function configureApp(app: INestApplication): void {
  app.use(helmet());
  app.use((_request: unknown, response: { setHeader(name: string, value: string): void }, next: () => void) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true,
    transform: true, transformOptions: { enableImplicitConversion: false },
    validationError: { target: false, value: false },
  }));
}
